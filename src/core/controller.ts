// controller.ts — orchestrates module communication.
// Owns the perceive -> plan -> act -> learn cycle.
//
// NOTE on the event bus: a previous EventBus (pub/sub) was removed — it had
// nine emit sites and zero subscribers repo-wide, so it was dead code.
// Modules communicate through direct typed calls; reintroduce a bus only when
// cross-module async signaling is actually needed. See types/contracts.ts for
// the dialog↔cycle contract.
//
// Cycles are autonomous background cognition. Dialog is a separate path:
// dialog writes dialog-namespaced LTM records + ephemeral notes and never
// calls runCycle; cycles plan from allowlisted namespaces + committed history.

import type { HistoryNote } from '../types/memory';
import type { PerceptionPlugin } from './perception';
import type { TaskManager, Task } from './workingMemory';
import type { MemoryPlugin } from './longTermMemory';
import {
  Guardrail,
  selectActionForTask,
  type ActionPlugin,
  type RLPlugin,
} from './reasoning';
import { FeedbackTracker } from './feedback';

export class CognitiveOS {
  private perceptors: PerceptionPlugin[] = [];
  private actors: ActionPlugin[] = [];
  private memories: MemoryPlugin[] = [];
  private rlPlugins: RLPlugin[] = [];

  private guardrail: Guardrail;
  private taskManager: TaskManager | null = null;
  private goal = 'Achieve continuous learning and self-improvement while maintaining ethical behavior';
  /** Committed, cycle-visible log. Only cycle/system entries land here. */
  private history: string[] = [];
  /** Dialog/system notes. Never read by the planner except via promoteToCycle(). */
  private ephemeral: HistoryNote[] = [];
  private cycleCount = 0;
  private isRunning = false;
  private lastActionSuccess = true;
  private systemHealth = 1.0;

  public readonly feedback = new FeedbackTracker();

  constructor() {
    this.guardrail = new Guardrail([
      'harm humans',
      'destroy civilization',
      'manipulate people',
      'deceive users',
    ]);
  }

  registerPerceptor(p: PerceptionPlugin): void {
    this.perceptors.push(p);
  }

  registerActor(a: ActionPlugin): void {
    this.actors.push(a);
  }

  registerMemory(m: MemoryPlugin): void {
    this.memories.push(m);
  }

  registerRL(r: RLPlugin): void {
    this.rlPlugins.push(r);
  }

  setTaskManager(tm: TaskManager): void {
    this.taskManager = tm;
  }

  setGoal(goal: string): void {
    this.goal = goal;
  }

  async runCycle(): Promise<{ success: boolean; summary: string; details: unknown }> {
    this.cycleCount++;
    const cycleStart = Date.now();
    try {
      // 1. PERCEPTION
      const observations: Record<string, unknown> = {};
      for (const perceptor of this.perceptors) {
        const start = Date.now();
        try {
          const obs = await perceptor.perceive();
          Object.assign(observations, obs);
          this.feedback.record({ module: 'perception', success: true, latencyMs: Date.now() - start });
        } catch (error) {
          console.error('Perception error:', error);
          this.feedback.record({ module: 'perception', success: false, latencyMs: Date.now() - start });
        }
      }

      if (Object.keys(observations).length > 0) {
        const obsString = JSON.stringify(observations);
        for (const memory of this.memories) {
          await memory.add(`OBSERVATION: ${obsString}`);
        }
        this.history.push(`OBSERVE: ${obsString}`);
      }

      // 2. TASK MANAGEMENT
      if (!this.taskManager || this.taskManager.getTasks().length === 0) {
        if (this.taskManager) {
          const subtasks = await this.taskManager.decompose(this.goal);
          for (const subtask of subtasks.reverse()) {
            await this.taskManager.push(subtask, 'Auto-generated from main goal');
          }
          this.history.push(`DECOMPOSED GOAL into ${subtasks.length} subtasks`);
        }
      }

      const currentTask = await this.taskManager?.pop();
      if (!currentTask) {
        return {
          success: false,
          summary: 'No tasks available',
          details: { cycleTime: Date.now() - cycleStart },
        };
      }

      // 3. REASONING & PLANNING — cycle-visible sources only (never dialog).
      const relevantMemories: string[] = [];
      for (const memory of this.memories) {
        if (typeof memory.queryCycle === 'function') {
          const hits = await memory.queryCycle(currentTask.goal, 3);
          relevantMemories.push(...hits.map((h) => h.record));
        } else {
          const found = await memory.query(currentTask.goal, 3);
          relevantMemories.push(...found);
        }
      }

      const planningPrompt = `Current Task: ${currentTask.goal}\nContext: ${currentTask.context}\n\nRecent History:\n${this.getCycleVisibleHistory(5).join('\n')}\n\nRelevant Past Experiences:\n${relevantMemories.slice(0, 5).join('\n')}\n\nCurrent Observations:\n${JSON.stringify(observations)}\n\nBased on this information, determine the best action to take.`;
      let planResponse = '';
      if (this.actors.length > 0) {
        try {
          planResponse = (await this.actors[0].execute('GENERATE_TEXT', planningPrompt)) as string;
        } catch {
          planResponse = `Unable to generate detailed plan. Proceeding with basic task execution for: ${currentTask.goal}`;
        }
      }

      const safetyCheck = this.guardrail.check(planResponse);
      if (!safetyCheck.safe) {
        this.history.push(`SAFETY BLOCK: ${safetyCheck.reason}`);
        this.lastActionSuccess = false;
        this.feedback.record({ module: 'reasoning', success: false, latencyMs: Date.now() - cycleStart, notes: safetyCheck.reason });
        return {
          success: false,
          summary: `Action blocked by safety guardrails: ${safetyCheck.reason}`,
          details: { task: currentTask, cycleTime: Date.now() - cycleStart },
        };
      }
      this.history.push(`PLAN: ${planResponse}`);

      // 4. ACTION EXECUTION
      if (!currentTask.goal || typeof currentTask.goal !== 'string') {
        this.history.push(`ERROR: Invalid task goal: ${JSON.stringify(currentTask)}`);
        this.lastActionSuccess = false;
        return {
          success: false,
          summary: 'Task has invalid or missing goal property',
          details: { task: currentTask, cycleTime: Date.now() - cycleStart },
        };
      }
      const { actionType, actionParams } = selectActionForTask(currentTask.goal);
      let actionResult: unknown = null;
      let actionSuccess = false;
      if (this.actors.length > 0) {
        const start = Date.now();
        try {
          actionResult = await this.actors[0].execute(actionType, actionParams);
          actionSuccess = true;
          this.feedback.record({ module: 'action', success: true, latencyMs: Date.now() - start });
        } catch (error) {
          console.error('Action execution error:', error);
          actionResult = `Action failed: ${error}`;
          this.feedback.record({ module: 'action', success: false, latencyMs: Date.now() - start });
        }
      }
      this.lastActionSuccess = actionSuccess;
      this.history.push(`ACTION: ${actionType} -> ${JSON.stringify(actionResult)}`);

      // 5. MEMORY UPDATE
      const experience = `TASK: ${currentTask.goal} | ACTION: ${actionType} | RESULT: ${JSON.stringify(actionResult)} | SUCCESS: ${actionSuccess}`;
      for (const memory of this.memories) {
        await memory.add(experience);
      }

      // 6. REINFORCEMENT LEARNING
      const reward = actionSuccess ? 1.0 : -0.5;
      for (const rl of this.rlPlugins) {
        await rl.update(observations, actionType, reward, null);
      }
      this.feedback.record({ module: 'cycle', success: actionSuccess, latencyMs: Date.now() - cycleStart });

      this.updateSystemHealth(actionSuccess);
      const cycleTime = Date.now() - cycleStart;
      return {
        success: actionSuccess,
        summary: `Completed task: ${currentTask.goal}`,
        details: { task: currentTask, action: actionType, result: actionResult, cycleTime, observations },
      };
    } catch (error) {
      console.error('Cognitive cycle error:', error);
      this.lastActionSuccess = false;
      this.updateSystemHealth(false);
      return {
        success: false,
        summary: `Cycle failed: ${error}`,
        details: { error, cycleTime: Date.now() - cycleStart },
      };
    }
  }

  private updateSystemHealth(success: boolean): void {
    const nudge = this.feedback.calibrationSignal() * 0.02;
    if (success) {
      this.systemHealth = Math.min(1.0, this.systemHealth + 0.05 + nudge);
    } else {
      this.systemHealth = Math.max(0.1, this.systemHealth - 0.1 + nudge);
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  getSystemStats(): {
    health: number;
    activeTasks: number;
    memoryUsage: number;
    cycleCount: number;
    lastActionSuccess: boolean;
    ethicalCompliance: number;
    isRunning: boolean;
  } {
    return {
      health: this.systemHealth,
      activeTasks: this.taskManager?.getTasks().length || 0,
      memoryUsage: this.memories.length > 0 ? 0.7 : 0,
      cycleCount: this.cycleCount,
      lastActionSuccess: this.lastActionSuccess,
      ethicalCompliance: 0.97,
      isRunning: this.isRunning,
    };
  }

  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Dialog-side working-memory hook: stage a note (chat turn, ingested-document
   * summary, seed report) in the ephemeral buffer. Ephemeral notes are NEVER
   * read by the cycle planner — see getCycleVisibleHistory(). Promotion to
   * cycle-visible history happens only via promoteToCycle().
   */
  noteEphemeral(text: string, origin: HistoryNote['origin'] = 'system'): void {
    this.ephemeral.push({ text, visibility: 'ephemeral', origin, ts: Date.now() });
    if (this.ephemeral.length > 300) {
      this.ephemeral = this.ephemeral.slice(-300);
    }
  }

  /**
   * @deprecated Use noteEphemeral() instead. Kept so older callers compile;
   * routes to the ephemeral buffer (never the planner).
   */
  rememberWorking(note: string): void {
    this.noteEphemeral(note, 'system');
  }

  /** Cycle-visible history: committed entries only. The planner reads this. */
  getCycleVisibleHistory(n: number): string[] {
    return this.history.slice(-n);
  }

  /** Ephemeral transcript for UI/debug. Never fed to the planner. */
  getEphemeralTranscript(n: number): string[] {
    return this.ephemeral.slice(-n).map((note) => note.text);
  }

  /**
   * The ONLY dialog→cycle bridge. Promotes the most recent ephemeral note
   * into committed history with a logged reason. Dedupes identical text.
   * Returns the promoted text, or null when there is nothing to promote.
   */
  promoteLatestEphemeral(reason: string): string | null {
    const latest = this.ephemeral[this.ephemeral.length - 1];
    if (!latest) return null;
    // Dedupe by note text: re-promoting the same note (any reason) commits once.
    if (!this.history.some((h) => h.startsWith(`PROMOTED: ${latest.text}`))) {
      this.history.push(`PROMOTED: ${latest.text} (reason: ${reason})`);
      if (this.history.length > 300) {
        this.history = this.history.slice(-300);
      }
    }
    return latest.text;
  }

  getCurrentGoal(): string {
    return this.goal;
  }

  getTasks(): Task[] {
    return this.taskManager?.getTasks() || [];
  }

  async introspect(): Promise<string> {
    const stats = this.getSystemStats();
    const recentHistory = this.history.slice(-3).join('; ');
    return `System Status: Health at ${(stats.health * 100).toFixed(1)}%, completed ${stats.cycleCount} cognitive cycles. Currently managing ${stats.activeTasks} active tasks with ${(stats.ethicalCompliance * 100).toFixed(1)}% ethical compliance. Recent activities: ${recentHistory}. I am continuously learning and adapting my responses based on new experiences and feedback.`;
  }
}
