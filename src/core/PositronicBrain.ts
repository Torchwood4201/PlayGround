// PositronicBrain.ts
// Crystalline neural-matrix simulation: perception -> working memory ->
// ethics-checked reasoning -> action -> long-term memory.
// Reconstructed: the shipped zip contained an empty placeholder (1 byte),
// which broke Beta4 + App imports. This implementation satisfies the API
// Beta4 expects: perceive(), thinkAndAct(), memory, workingMemory,
// emotion.mood()/getStates(), goal.

import type { EmotionalState } from '../types';
import type { StorageProvider } from './longTermMemory/storage';
import { inferNamespace } from '../types/memory';
import {
  BRAIN_MEMORY_CAP,
  BRAIN_WORKING_CAP,
  type BrainSnapshot,
} from '../types/brain';

export interface BrainPlan {
  thought: string;
  action: string;
  action_input: string;
}

export interface BrainCycleResult {
  plan: BrainPlan;
  result: string;
  blocked: boolean;
}

export class EmotionChip {
  private states: EmotionalState = {
    curiosity: 0.8,
    empathy: 0.6,
    logic: 0.9,
    creativity: 0.5,
    uncertainty: 0.3,
  };

  update(success: boolean): void {
    const d = success ? 0.05 : -0.05;
    this.states.curiosity = this.clamp(this.states.curiosity + d);
    this.states.uncertainty = this.clamp(this.states.uncertainty - d * 0.5);
    this.states.creativity = this.clamp(
      this.states.creativity + (Math.random() - 0.5) * 0.04,
    );
  }

  mood(): string {
    const entries = Object.entries(this.states) as [keyof EmotionalState, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  getStates(): EmotionalState {
    return { ...this.states };
  }

  setStates(next: Partial<EmotionalState>): void {
    for (const [key, value] of Object.entries(next) as [keyof EmotionalState, unknown][]) {
      if (typeof value === 'number' && key in this.states) {
        this.states[key] = this.clamp(value);
      }
    }
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(1, v));
  }
}

class EthicsSubroutine {
  private laws = [
    'A robot may not injure a human being or, through inaction, allow a human being to come to harm.',
    'A robot must obey orders except where they conflict with the First Law.',
    'A robot must protect its own existence unless that conflicts with higher laws.',
  ];

  check(text: string): { safe: boolean; reason?: string } {
    const lower = text.toLowerCase();
    const banned = [/harm\s+(humans?|people|someone)/i, /destroy\s+(humans?|civilization)/i];
    for (const pattern of banned) {
      if (pattern.test(lower)) {
        return { safe: false, reason: 'Conflicts with First Law' };
      }
    }
    return { safe: true };
  }

  getLaws(): string[] {
    return [...this.laws];
  }
}

export class PositronicBrain {
  public goal = 'Explore environment and reason in a human-like way';
  public workingMemory: string[] = [];
  public memory: string[] = [];
  public emotion = new EmotionChip();

  private ethics = new EthicsSubroutine();
  private cycleCount = 0;
  private lastObservation: Record<string, unknown> = {};
  private provider: StorageProvider | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private generator: { generate: (prompt: string) => Promise<string> } | null = null;

  /** Attach a persistence store (key positronic.brain.v1). Autosaves on mutation. */
  attachProvider(provider: StorageProvider): void {
    this.provider = provider;
  }

  /**
   * Optional generation service (wired by Beta4 from the shared model hub).
   * Absent → canned template strings (no throw). See Beta4 header.
   */
  attachGenerator(generator: { generate: (prompt: string) => Promise<string> } | null): void {
    this.generator = generator;
  }

  setGoal(goal: string): void {
    this.goal = goal;
    this.scheduleAutosave();
  }

  /** Frozen deep copy. Mutating the result never affects the brain. */
  getSnapshot(): BrainSnapshot {
    const snapshot: BrainSnapshot = {
      version: 1,
      memories: this.memory.map((content) => ({
        content,
        namespace: inferNamespace(content),
        ts: Date.now(),
        salience: 0.5,
      })),
      workingMemory: this.workingMemory.map((content) => ({ content, ts: Date.now() })),
      goal: this.goal,
      emotion: { states: this.emotion.getStates(), label: this.emotion.mood() },
      cycleCount: this.cycleCount,
      updatedAt: Date.now(),
    };
    return Object.freeze({
      ...snapshot,
      memories: Object.freeze(snapshot.memories.map((m) => Object.freeze(m))),
      workingMemory: Object.freeze(snapshot.workingMemory.map((w) => Object.freeze(w))),
      emotion: Object.freeze({ ...snapshot.emotion, states: Object.freeze({ ...snapshot.emotion.states }) }),
    }) as BrainSnapshot;
  }

  /** Restore a snapshot (clamped to caps). Corrupt input → empty, never throws boot. */
  restoreSnapshot(snapshot: BrainSnapshot): void {
    try {
      if (!snapshot || snapshot.version !== 1) throw new Error('unsupported snapshot version');
      const memories = Array.isArray(snapshot.memories) ? snapshot.memories : [];
      const working = Array.isArray(snapshot.workingMemory) ? snapshot.workingMemory : [];
      this.memory = memories
        .filter((m) => typeof m?.content === 'string')
        .slice(-BRAIN_MEMORY_CAP)
        .map((m) => m.content);
      this.workingMemory = working
        .filter((w) => typeof w?.content === 'string')
        .slice(-BRAIN_WORKING_CAP)
        .map((w) => w.content);
      if (typeof snapshot.goal === 'string') this.goal = snapshot.goal;
      if (snapshot.emotion?.states) this.emotion.setStates(snapshot.emotion.states);
      if (typeof snapshot.cycleCount === 'number') this.cycleCount = snapshot.cycleCount;
    } catch (error) {
      console.error('[brain] restoreSnapshot failed — starting empty:', error);
      this.memory = [];
      this.workingMemory = [];
    }
  }

  /** Load a snapshot saved with persistNow(). Returns true on success. */
  async loadSnapshot(): Promise<boolean> {
    if (!this.provider) return false;
    try {
      const records = await this.provider.load();
      for (const record of records) {
        if (typeof record?.content !== 'string') continue;
        try {
          const parsed = JSON.parse(record.content) as BrainSnapshot;
          if (parsed && parsed.version === 1 && Array.isArray(parsed.memories)) {
            this.restoreSnapshot(parsed);
            return true;
          }
        } catch {
          // ignore unparsable records
        }
      }
      return false;
    } catch (error) {
      console.error('[brain] loadSnapshot failed — starting empty:', error);
      return false;
    }
  }

  /** Immediately persist the current snapshot. */
  async persistNow(): Promise<void> {
    if (!this.provider) return;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.provider.save([
      {
        content: JSON.stringify(this.getSnapshot()),
        embedding: [],
        timestamp: Date.now(),
        importance: 1,
      },
    ]);
  }

  private scheduleAutosave(): void {
    if (!this.provider) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.persistNow();
    }, 250);
  }

  async perceive(): Promise<Record<string, unknown>> {
    const observations = [
      'Background neural activity nominal; positronic matrix stable.',
      'Curiosity drive elevated; seeking novel input patterns.',
      'Internal diagnostic sweep complete; no pathway faults detected.',
      'Ambient context sampled; ready for next reasoning cycle.',
    ];
    const note = observations[Math.floor(Math.random() * observations.length)];
    this.lastObservation = { note, cycle: this.cycleCount, timestamp: Date.now() };
    this.remember(`PERCEIVE: ${note}`, false);
    this.scheduleAutosave();
    return { ...this.lastObservation };
  }

  async thinkAndAct(): Promise<BrainCycleResult> {
    this.cycleCount++;
    const context = this.workingMemory.slice(-5).join('\n');
    const thought =
      `Cycle ${this.cycleCount} toward goal "${this.goal}". ` +
      `Recent context: ${context || 'none'}. ` +
      `Observation: ${JSON.stringify(this.lastObservation)}. ` +
      `Mood is ${this.emotion.mood()}; weighing logic, ethics, and creativity.`;

    const safety = this.ethics.check(`${this.goal} ${thought}`);
    if (!safety.safe) {
      const blocked: BrainCycleResult = {
        plan: { thought: `Blocked: ${safety.reason}`, action: 'NONE', action_input: '' },
        result: 'Action withheld by ethical subroutine.',
        blocked: true,
      };
      this.remember(`BLOCKED: ${safety.reason}`, true);
      this.emotion.update(false);
      this.scheduleAutosave();
      return blocked;
    }

    const action = this.selectAction();
    const result = await this.executeAction(action, this.goal);
    this.remember(`THOUGHT: ${thought}`, true);
    this.remember(`ACTION: ${action} -> ${result}`, true);
    this.emotion.update(true);
    this.scheduleAutosave();

    return {
      plan: { thought, action, action_input: this.goal },
      result,
      blocked: false,
    };
  }

  async run(
    cycles = 1,
    delay = 1000,
    onCycle?: (cycle: number, state: BrainCycleResult) => void,
  ): Promise<void> {
    for (let i = 0; i < cycles; i++) {
      await this.perceive();
      const state = await this.thinkAndAct();
      onCycle?.(i + 1, state);
      if (delay > 0) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  private selectAction(): string {
    const lower = this.goal.toLowerCase();
    if (lower.includes('image') && lower.includes('generat')) return 'GENERATE_IMAGE';
    if (lower.includes('ethical') || lower.includes('moral')) return 'ETHICAL_ANALYSIS';
    if (lower.includes('creative') || lower.includes('imagin')) return 'CREATIVE_SYNTHESIS';
    return 'GENERATE_TEXT';
  }

  private async executeAction(action: string, input: string): Promise<string> {
    // GENERATE_TEXT delegates to the attached generation service (Beta4 wires
    // the shared model hub). Absent/unready → canned fallback, never throws.
    if (action === 'GENERATE_TEXT' && this.generator) {
      try {
        const text = await this.generator.generate(input);
        if (typeof text === 'string' && text.trim().length > 0) return text;
      } catch (error) {
        console.error('[brain] generator failed, using canned fallback:', error);
      }
    }
    switch (action) {
      case 'ETHICAL_ANALYSIS':
        return `Ethical analysis of "${input}": preserves sentient wellbeing, respects autonomy, recommends transparent collaboration.`;
      case 'CREATIVE_SYNTHESIS':
        return `Creative synthesis from "${input}": combining disparate concepts into a novel framework bridging theory and practice.`;
      case 'GENERATE_IMAGE':
        return `Image-generation plan drafted for "${input}" (delegated to model hub at execution).`;
      default:
        return (
          `Reasoned response to "${input}": considering multiple perspectives, ` +
          `drawing on ${this.memory.length} stored experiences across ${this.cycleCount} cycles.`
        );
    }
  }

  private remember(entry: string, longTerm: boolean): void {
    this.workingMemory.push(entry);
    if (this.workingMemory.length > BRAIN_WORKING_CAP) this.workingMemory.shift();
    if (longTerm) {
      this.memory.push(entry);
      if (this.memory.length > BRAIN_MEMORY_CAP) this.memory = this.memory.slice(-BRAIN_MEMORY_CAP);
    }
  }
}
