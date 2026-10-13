// workingMemory/neuralState.ts — immediate activation/affect state.
// Pure helpers for the short-lived neural state (activation, load, emotional
// drift, learning-cycle optimization). Persistent experience records live in
// longTermMemory/experienceLog.ts; orchestration stays in PositronicCore.

import type { NeuralState } from '../../types';

export function createInitialNeuralState(): NeuralState {
  return {
    activationLevel: 0.7,
    processingLoad: 0.3,
    memoryUtilization: 0.2,
    ethicalConstraints: ['preserve_life', 'seek_truth', 'protect_sentient_beings'],
    currentThought: 'Initializing positronic matrix...',
    emotionalState: {
      curiosity: 0.8,
      empathy: 0.6,
      logic: 0.9,
      creativity: 0.5,
      uncertainty: 0.3
    }
  };
}

/** Per-interaction drift: activation jitter + curiosity/creativity wander. */
export function driftNeuralState(state: NeuralState): void {
  // Simulate neural activity fluctuations
  state.activationLevel = Math.min(1, state.activationLevel + (Math.random() - 0.5) * 0.1);
  state.processingLoad = Math.max(0, Math.min(1, state.processingLoad + (Math.random() - 0.5) * 0.2));

  // Update emotional state based on interactions
  const emotions = state.emotionalState;
  emotions.curiosity = Math.max(0, Math.min(1, emotions.curiosity + (Math.random() - 0.5) * 0.05));
  emotions.creativity = Math.max(0, Math.min(1, emotions.creativity + (Math.random() - 0.5) * 0.03));
}

/** Background learning-cycle optimization: narrate + decay processing load. */
export function optimizeNeuralState(state: NeuralState, learningCycles: number): void {
  // Simulate neural optimization
  state.currentThought = `Learning cycle ${learningCycles}: Optimizing neural pathways...`;

  // Gradually improve efficiency
  if (state.processingLoad > 0.1) {
    state.processingLoad *= 0.99;
  }
}
