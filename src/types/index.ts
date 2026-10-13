export interface NeuralState {
  activationLevel: number;
  processingLoad: number;
  memoryUtilization: number;
  ethicalConstraints: string[];
  currentThought: string;
  emotionalState: EmotionalState;
}

export interface EmotionalState {
  curiosity: number;
  empathy: number;
  logic: number;
  creativity: number;
  uncertainty: number;
}

export interface Memory {
  id: string;
  content: string;
  type: 'experience' | 'knowledge' | 'ethical' | 'creative';
  timestamp: number;
  importance: number;
  connections: string[];
}

export interface EthicalPrinciple {
  id: string;
  name: string;
  description: string;
  priority: number;
  active: boolean;
}

export interface ConversationEntry {
  id: string;
  speaker: 'human' | 'positronic';
  message: string;
  timestamp: number;
  reasoning?: string;
  ethicalConsiderations?: string[];
}

export interface LearningModule {
  name: string;
  description: string;
  active: boolean;
  learningRate: number;
  knowledgeAcquired: number;
}

export interface DiagnosticData {
  neuralPathways: number;
  activeConnections: number;
  processingSpeed: number;
  memoryIntegrity: number;
  ethicalCompliance: number;
  creativityIndex: number;
}

// ---- Cognitive-module I/O contracts ----
// Perception output: what perception/ modules emit onto the event bus.
export interface PerceptionOutput {
  source: string;
  timestamp: number;
  data: Record<string, unknown>;
}

// Working-memory snapshot: immediate context held by workingMemory/.
export interface WorkingMemorySnapshot {
  entries: string[];
  activeGoal: string;
  updatedAt: number;
}

// Long-term memory retrieval result.
export interface MemoryRetrieval {
  query: string;
  results: string[];
  topK: number;
}

// Reasoning plan: what reasoning/ modules produce.
export interface ReasoningPlan {
  thought: string;
  action: string;
  actionInput: string;
  confidence: number;
  ethicalNotes: string[];
}

// Controller cycle result: uniform return for runCycle().
export interface CycleResult {
  success: boolean;
  summary: string;
  details: Record<string, unknown>;
}

// Inter-module event envelope for the controller event bus.
export type CognitiveEventType =
  | 'perception:update'
  | 'memory:stored'
  | 'reasoning:plan'
  | 'action:result'
  | 'feedback:score'
  | 'system:health';

export interface CognitiveEvent {
  type: CognitiveEventType;
  source: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export type CognitiveEventHandler = (event: CognitiveEvent) => void;

// Task lifecycle (single-responsibility copy; canonical def lives in workingMemory/).
export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface CognitiveTask {
  id: string;
  goal: string;
  context: string;
  priority: number;
  created: number;
  status: TaskStatus;
}
