// workingMemory/ — temporary state storage, immediate context.
// Holds the task stack (TaskManager) and a short-term rolling buffer.

import type { CognitiveTask, TaskStatus } from '../../types';

export type { CognitiveTask, TaskStatus };
export interface Task extends CognitiveTask {}

// Minimal structural contract so workingMemory does not depend on reasoning/.
export interface ActionExecutor {
  execute(action: string, params: unknown): Promise<unknown>;
}

export class WorkingMemoryBuffer {
  private buffer: string[] = [];
  constructor(private maxItems = 10) {}

  remember(text: string): void {
    this.buffer.push(text);
    if (this.buffer.length > this.maxItems) this.buffer.shift();
  }

  summary(): string {
    return this.buffer.slice(-this.maxItems).join('\n');
  }

  snapshot(): string[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

export class TaskManager {
  private stack: Task[] = [];
  private actionPlugin: ActionExecutor;

  constructor(actionPlugin: ActionExecutor) {
    this.actionPlugin = actionPlugin;
  }

  async push(goal: string, context = '', priority = 1): Promise<void> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goal,
      context,
      priority,
      created: Date.now(),
      status: 'pending',
    };
    this.stack.push(task);
    this.stack.sort((a, b) => b.priority - a.priority);
  }

  async pop(): Promise<Task | null> {
    const task = this.stack.shift();
    if (task) task.status = 'active';
    return task || null;
  }

  async decompose(goal: string): Promise<string[]> {
    const prompt = `Analyze this high-level goal and decompose it into 3-5 specific, actionable subtasks:\n\nGoal: ${goal}\n\nFormat your response as a numbered list:\n1. [First subtask]\n2. [Second subtask]\n3. [Third subtask]\netc.`;
    try {
      const response = (await this.actionPlugin.execute('GENERATE_TEXT', prompt)) as string;
      const tasks: string[] = [];
      for (const line of response.split('\n')) {
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match?.[1]) tasks.push(match[1].trim());
      }
      return tasks.length > 0 ? tasks : [goal];
    } catch (error) {
      console.error('Task decomposition failed:', error);
      return [goal];
    }
  }

  getTasks(): Task[] {
    return [...this.stack];
  }

  getActiveTask(): Task | null {
    return this.stack.find((t) => t.status === 'active') || null;
  }
}
