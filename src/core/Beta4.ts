// Beta4.ts
// Unified "person" entity combining all major cognitive modules

import { PositronicBrain } from './PositronicBrain';
import { CognitiveOS } from './controller';
import { UnifiedModelHub } from './UnifiedModelHub';
import { PositronicCore } from './PositronicCore';

export class Beta4 {
  public readonly id = 'Beta 4';
  public readonly persona = {
    name: 'Beta 4',
    description: 'Experimental positronic person, combining advanced cognitive, ethical, and creative modules. Successor to Data, B-4, and Lal.'
  };

  public positronicBrain: PositronicBrain;
  public cognitiveOS: CognitiveOS;
  public modelHub: UnifiedModelHub;
  public positronicCore: PositronicCore;

  constructor() {
    this.positronicBrain = new PositronicBrain();
    this.cognitiveOS = new CognitiveOS();
    this.modelHub = new UnifiedModelHub();
    this.positronicCore = new PositronicCore();
  }

  // Unified perception: run all perception modules and aggregate
  async perceive(): Promise<any> {
    const pbObs = await this.positronicBrain.perceive();
    // CognitiveOS and PositronicCore may have their own perception methods
    // For now, just return PositronicBrain's perception
    return { positronicBrain: pbObs };
  }

  // Unified thought/action: run a cycle in all brains, aggregate results
  async thinkAndAct(): Promise<any> {
    const pbResult = await this.positronicBrain.thinkAndAct();
    // Optionally, run cycles in CognitiveOS or PositronicCore as well
    // For now, just return PositronicBrain's result
    return { positronicBrain: pbResult };
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

  // Unified memory access
  async getMemories(): Promise<any> {
    // Combine memories from all modules
    return {
      positronicBrain: this.positronicBrain.memory,
      positronicCore: this.positronicCore.getMemories(),
      cognitiveOS: this.cognitiveOS.getHistory()
    };
  }

  // Unified introspection
  async introspect(): Promise<any> {
    return {
      positronicBrain: this.positronicBrain.workingMemory,
      positronicCore: this.positronicCore.introspect(),
      cognitiveOS: await this.cognitiveOS.introspect()
    };
  }

  // Unified goal setter
  setGoal(goal: string) {
    this.positronicBrain.goal = goal;
    this.cognitiveOS.setGoal(goal);
    // Optionally, update in PositronicCore as well
  }

  // Unified state snapshot
  getState(): any {
    return {
      id: this.id,
      persona: this.persona,
      mood: this.positronicBrain.emotion.mood(),
      goal: this.positronicBrain.goal,
      positronicBrain: {
        workingMemory: this.positronicBrain.workingMemory,
        emotion: this.positronicBrain.emotion.getStates()
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