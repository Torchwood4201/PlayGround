// brain.ts — snapshot contract for the Beta4 person's backend substrate.
// The brain persists like every other memory owner (StorageProvider,
// key positronic.brain.v1). Outsiders only ever see frozen copies via
// Beta4.getBrainSnapshot(); mutations go through Beta4 verbs.

import type { EmotionalState } from './index';
import type { MemoryNamespace } from './memory';

export interface BrainMemoryEntry {
  content: string;
  namespace: MemoryNamespace;
  ts: number;
  salience: number;
}

export interface BrainWorkingEntry {
  content: string;
  ts: number;
}

export interface BrainEmotionSnapshot {
  states: EmotionalState;
  label: string;
}

export interface BrainSnapshot {
  version: 1;
  memories: BrainMemoryEntry[];
  workingMemory: BrainWorkingEntry[];
  goal: string | null;
  emotion: BrainEmotionSnapshot;
  cycleCount: number;
  updatedAt: number;
  /** The person's dialogue thread, persisted as opaque payload. */
  thread?: Array<{ user: string; beta: string }>;
}

/** Caps mirror PositronicBrain's in-RAM bounds. */
export const BRAIN_MEMORY_CAP = 200;
export const BRAIN_WORKING_CAP = 10;
