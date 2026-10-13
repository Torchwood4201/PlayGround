// CognitiveOS.ts — backward-compatible facade.
// Canonical implementation now lives in cognitive modules:
//   perception/      -> PerceptionPlugin, WebSearchPerception, InternalStatePerception
//   workingMemory/   -> Task, TaskManager
//   longTermMemory/  -> MemoryPlugin, VectorMemory
//   reasoning/       -> ActionPlugin, RLPlugin, Guardrail, ModelHubActionPlugin
//   controller.ts    -> CognitiveOS (orchestrator + event bus)
//   feedback.ts      -> FeedbackTracker (self-calibration)
// This file re-exports the same public names so existing imports keep working.

export type { PerceptionPlugin } from './perception';
export { WebSearchPerception, InternalStatePerception } from './perception';
export type { Task } from './workingMemory';
export { TaskManager } from './workingMemory';
export type { MemoryPlugin } from './longTermMemory';
export { VectorMemory } from './longTermMemory';
export type { ActionPlugin, RLPlugin } from './reasoning';
export { Guardrail, ModelHubActionPlugin } from './reasoning';
export { CognitiveOS, EventBus } from './controller';
export { FeedbackTracker } from './feedback';
export type { FeedbackSample } from './feedback';
