// Beta4.ts — the "person" entity. The positronic brain is its backend.
//
// Division of labor (binding):
// - brain (PositronicBrain, PRIVATE) = planner / memory / affect substrate.
//   The ONLY thing the hot path (perceive/thinkAndAct) runs. Owns persistence
//   (StorageProvider, key positronic.brain.v1). No live reference ever escapes:
//   outsiders see frozen snapshots via getBrainSnapshot().
// - cognitiveOS = LOOP-ONLY autonomous loop. Beta4 may optionally drive one
//   background cycle via tick(), but perceive/thinkAndAct never call it.
// - modelHub = generation service. Wired into the brain as its generator with
//   canned-string fallback (brain works unloaded). Kept because it is USED.
// - positronicCore = experience projector for getState()/introspect() cold
//   paths (shares the app-wide instance; Beta4 never drives its pipeline).

import { PositronicBrain } from './PositronicBrain';
import { CognitiveOS } from './controller';
import { UnifiedModelHub } from './UnifiedModelHub';
import { PositronicCore } from './PositronicCore';
import { renderLateNightReply, type ScoredHit } from './reasoning/naturalVoice';
import type { StorageProvider } from './longTermMemory/storage';
import type { BrainSnapshot } from '../types/brain';

export interface Beta4Deps {
  cognitiveOS?: CognitiveOS;
  modelHub?: UnifiedModelHub;
  positronicCore?: PositronicCore;
  brain?: PositronicBrain;
  storage?: StorageProvider;
}

export class Beta4 {
  public readonly id = 'Beta 4';
  public readonly persona = {
    name: 'Beta 4',
    description: 'Experimental positronic person, combining advanced cognitive, ethical, and creative modules. Successor to Data, B-4, and Lal.'
  };

  #brain: PositronicBrain;
  public cognitiveOS: CognitiveOS;
  public modelHub: UnifiedModelHub;
  public positronicCore: PositronicCore;

  constructor(deps: Beta4Deps = {}) {
    this.#brain = deps.brain ?? new PositronicBrain();
    this.cognitiveOS = deps.cognitiveOS ?? new CognitiveOS();
    this.modelHub = deps.modelHub ?? new UnifiedModelHub();
    this.positronicCore = deps.positronicCore ?? new PositronicCore();
    // Brain delegates text generation to the shared hub; falls back silently.
    this.#brain.attachGenerator({
      generate: async (prompt: string) => {
        const result = await this.modelHub.generateText(prompt);
        return result.text ?? '';
      },
    });
    if (deps.storage) {
      this.#brain.attachProvider(deps.storage);
    }
  }

  /** Boot: attach persistence and restore the brain snapshot. Never throws. */
  async boot(storage?: StorageProvider): Promise<boolean> {
    if (storage) {
      this.#brain.attachProvider(storage);
    }
    return this.#brain.loadSnapshot();
  }

  /** Frozen copy of backend state. Mutating it never affects the brain. */
  getBrainSnapshot(): BrainSnapshot {
    return this.#brain.getSnapshot();
  }

  /** Restore backend state (clamped to caps). Used by boot/tests. */
  restoreBrain(snapshot: BrainSnapshot): void {
    this.#brain.restoreSnapshot(snapshot);
  }

  // Unified perception: run all perception modules and aggregate
  async perceive(): Promise<any> {
    const pbObs = await this.#brain.perceive();
    // CognitiveOS and PositronicCore may have their own perception methods
    // For now, just return PositronicBrain's perception
    return { positronicBrain: pbObs };
  }

  // Unified thought/action: run a cycle in all brains, aggregate results
  async thinkAndAct(): Promise<any> {
    const pbResult = await this.#brain.thinkAndAct();
    // Optionally, run cycles in CognitiveOS or PositronicCore as well
    // For now, just return PositronicBrain's result
    return { positronicBrain: pbResult };
  }

  /**
   * Talk to the person. Runs the backend (perceive → think → recall) and
   * returns ONLY natural speech. Internal plans, thoughts, actions, and
   * scores stay inside — callers never see them.
   */
  async reply(
    input: string,
    recall: (query: string) => Promise<ScoredHit[]>,
  ): Promise<{ message: string; mood: string; grounded: boolean }> {
    this.setGoal(input);
    await this.perceive();
    const outcome = await this.thinkAndAct();
    let hits: ScoredHit[] = [];
    try {
      hits = await recall(input);
    } catch {
      hits = [];
    }
    const mood = this.#brain.emotion.mood();
    const voiced = renderLateNightReply({
      userText: input,
      hits,
      mood,
      blocked: outcome.positronicBrain.blocked === true,
    });
    return { message: voiced.message, mood, grounded: voiced.grounded };
  }

  // Unified run: run N cycles in all brains
  async run(cycles: number = 1, delay: number = 1000, onCycle?: (cycle: number, state: any) => void) {
    for (let i = 0; i < cycles; i++) {
      await this.perceive();
      const state = await this.thinkAndAct();
      if (onCycle) onCycle(i + 1, state);
      await new Promise(res => setTimeout(res, delay));
    }
  }

  /**
   * LOOP-ONLY: optionally drive one autonomous background cycle.
   * Never called by perceive/thinkAndAct. Cycles are not dialog.
   */
  async tick(): Promise<{ success: boolean; summary: string; details: unknown }> {
    return this.cognitiveOS.runCycle();
  }

  // Unified memory access
  async getMemories(): Promise<any> {
    // Combine memories from all modules
    return {
      positronicBrain: [...this.getBrainSnapshot().memories.map((m) => m.content)],
      positronicCore: this.positronicCore.getMemories(),
      cognitiveOS: this.cognitiveOS.getHistory()
    };
  }

  // Unified introspection
  async introspect(): Promise<any> {
    return {
      positronicBrain: [...this.getBrainSnapshot().workingMemory.map((w) => w.content)],
      positronicCore: this.positronicCore.introspect(),
      cognitiveOS: await this.cognitiveOS.introspect()
    };
  }

  // Unified goal setter
  setGoal(goal: string) {
    this.#brain.setGoal(goal);
    this.cognitiveOS.setGoal(goal);
    // Optionally, update in PositronicCore as well
  }

  // Unified state snapshot
  getState(): any {
    const snap = this.getBrainSnapshot();
    return {
      id: this.id,
      persona: this.persona,
      mood: snap.emotion.label,
      goal: snap.goal,
      positronicBrain: {
        workingMemory: snap.workingMemory.map((w) => w.content),
        emotion: { ...snap.emotion.states }
      },
      positronicCore: {
        neuralState: this.positronicCore.getNeuralState(),
        ethicalPrinciples: this.positronicCore.getEthicalPrinciples()
      },
      cognitiveOS: {
        stats: this.cognitiveOS.getSystemStats(),
        goal: this.cognitiveOS.getCurrentGoal()
      }
    };
  }
}
