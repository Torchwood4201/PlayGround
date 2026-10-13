// PositronicBrain.ts
// Crystalline neural-matrix simulation: perception -> working memory ->
// ethics-checked reasoning -> action -> long-term memory.
// Reconstructed: the shipped zip contained an empty placeholder (1 byte),
// which broke Beta4 + App imports. This implementation satisfies the API
// Beta4 expects: perceive(), thinkAndAct(), memory, workingMemory,
// emotion.mood()/getStates(), goal.

import type { EmotionalState } from '../types';

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
      return blocked;
    }

    const action = this.selectAction();
    const result = this.executeAction(action, this.goal);
    this.remember(`THOUGHT: ${thought}`, true);
    this.remember(`ACTION: ${action} -> ${result}`, true);
    this.emotion.update(true);

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

  private executeAction(action: string, input: string): string {
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
    if (this.workingMemory.length > 10) this.workingMemory.shift();
    if (longTerm) {
      this.memory.push(entry);
      if (this.memory.length > 200) this.memory = this.memory.slice(-200);
    }
  }
}
