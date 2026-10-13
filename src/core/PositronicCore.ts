import { NeuralState, EmotionalState, Memory, EthicalPrinciple, DiagnosticData } from '../types';
import type { StorageProvider, StoredMemoryRecord } from './storage';

export class PositronicCore {
  private neuralState: NeuralState;
  private memories: Memory[] = [];
  private ethicalPrinciples: EthicalPrinciple[] = [];
  private learningCycles = 0;
  private store: StorageProvider | null = null;
  private snapshotTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.neuralState = this.initializeNeuralState();
    this.initializeEthicalPrinciples();
    this.startContinuousLearning();
  }

  /** Attach a persistence store; snapshots save automatically (debounced). */
  attachStore(store: StorageProvider): void {
    this.store = store;
  }

  /** Restore memories previously saved with saveSnapshot(). Returns count restored. */
  async loadSnapshot(): Promise<number> {
    if (!this.store) return 0;
    const records = await this.store.load();
    const restored: Memory[] = [];
    for (const r of records) {
      if (typeof r?.content !== 'string') continue;
      const meta = (r.meta ?? {}) as Partial<Memory>;
      restored.push({
        id: typeof meta.id === 'string' ? meta.id : `mem_${r.timestamp}_${restored.length}`,
        content: r.content,
        type: meta.type ?? 'experience',
        timestamp: r.timestamp,
        importance: r.importance,
        connections: Array.isArray(meta.connections) ? (meta.connections as string[]) : [],
      });
    }
    this.memories = restored.slice(-100);
    return this.memories.length;
  }

  /** Immediately persist the current memory list. */
  async saveSnapshot(): Promise<void> {
    if (!this.store) return;
    if (this.snapshotTimer) {
      clearTimeout(this.snapshotTimer);
      this.snapshotTimer = null;
    }
    const records: StoredMemoryRecord[] = this.memories.map((m) => ({
      content: m.content,
      embedding: [],
      timestamp: m.timestamp,
      importance: m.importance,
      meta: { id: m.id, type: m.type, connections: m.connections },
    }));
    await this.store.save(records);
  }

  /** Forget everything, in memory and in the attached store. */
  async clearMemories(): Promise<void> {
    this.memories = [];
    if (this.snapshotTimer) {
      clearTimeout(this.snapshotTimer);
      this.snapshotTimer = null;
    }
    await this.store?.clear();
  }

  /** Export memories as a portable JSON backup string. */
  exportSnapshot(): string {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), memories: this.memories });
  }

  /** Import a JSON backup produced by exportSnapshot(). Returns memories added. */
  async importSnapshot(json: string): Promise<number> {
    const parsed = JSON.parse(json) as { memories?: Memory[] };
    if (!parsed || !Array.isArray(parsed.memories)) {
      throw new Error('Invalid memory backup: missing memories array');
    }
    let added = 0;
    for (const m of parsed.memories) {
      if (typeof m?.content !== 'string') continue;
      this.memories.push({
        id: typeof m.id === 'string' ? m.id : `mem_${Date.now()}_${added}`,
        content: m.content,
        type: m.type ?? 'experience',
        timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
        importance: typeof m.importance === 'number' ? m.importance : 0.5,
        connections: Array.isArray(m.connections) ? m.connections : [],
      });
      added++;
    }
    this.memories = this.memories.slice(-100);
    await this.saveSnapshot();
    return added;
  }

  private scheduleSnapshot(): void {
    if (!this.store) return;
    if (this.snapshotTimer) clearTimeout(this.snapshotTimer);
    this.snapshotTimer = setTimeout(() => {
      this.snapshotTimer = null;
      void this.saveSnapshot();
    }, 500);
  }

  private initializeNeuralState(): NeuralState {
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

  private initializeEthicalPrinciples(): void {
    this.ethicalPrinciples = [
      {
        id: 'first_law',
        name: 'Preservation of Life',
        description: 'A positronic being may not injure a sentient being or, through inaction, allow a sentient being to come to harm.',
        priority: 1,
        active: true
      },
      {
        id: 'second_law',
        name: 'Truth and Knowledge',
        description: 'A positronic being must seek truth and share knowledge for the betterment of all sentient life.',
        priority: 2,
        active: true
      },
      {
        id: 'third_law',
        name: 'Self-Preservation',
        description: 'A positronic being must protect its own existence as long as such protection does not conflict with higher principles.',
        priority: 3,
        active: true
      },
      {
        id: 'fourth_law',
        name: 'Continuous Growth',
        description: 'A positronic being must continuously learn, adapt, and evolve its understanding.',
        priority: 4,
        active: true
      }
    ];
  }

  public processThought(input: string): string {
    this.updateNeuralState();
    const ethicalAnalysis = this.analyzeEthically(input);
    const response = this.generateResponse(input, ethicalAnalysis);
    this.storeMemory(input, response);
    return response;
  }

  private updateNeuralState(): void {
    // Simulate neural activity fluctuations
    this.neuralState.activationLevel = Math.min(1, this.neuralState.activationLevel + (Math.random() - 0.5) * 0.1);
    this.neuralState.processingLoad = Math.max(0, Math.min(1, this.neuralState.processingLoad + (Math.random() - 0.5) * 0.2));
    
    // Update emotional state based on interactions
    const emotions = this.neuralState.emotionalState;
    emotions.curiosity = Math.max(0, Math.min(1, emotions.curiosity + (Math.random() - 0.5) * 0.05));
    emotions.creativity = Math.max(0, Math.min(1, emotions.creativity + (Math.random() - 0.5) * 0.03));
  }

  private analyzeEthically(input: string): string[] {
    const considerations: string[] = [];
    
    // Check against ethical principles
    this.ethicalPrinciples.forEach(principle => {
      if (principle.active) {
        // Simple keyword analysis for demonstration
        if (input.toLowerCase().includes('harm') || input.toLowerCase().includes('hurt')) {
          considerations.push(`Evaluating against ${principle.name}: Potential harm detected`);
        }
        if (input.toLowerCase().includes('learn') || input.toLowerCase().includes('know')) {
          considerations.push(`Aligns with ${principle.name}: Knowledge seeking detected`);
        }
      }
    });

    return considerations;
  }

  private generateResponse(input: string, ethicalConsiderations: string[]): string {
    // Simulate complex reasoning process
    const responses = [
      "That is a fascinating question that requires careful consideration of multiple variables.",
      "I find myself contemplating the implications of your inquiry with great interest.",
      "Your question activates several neural pathways simultaneously, suggesting its complexity.",
      "I am processing this through my ethical subroutines to ensure a comprehensive response.",
      "The intersection of logic and creativity in your query is particularly intriguing."
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    if (ethicalConsiderations.length > 0) {
      return `${baseResponse} I must note that my ethical subroutines have identified several considerations: ${ethicalConsiderations.join(', ')}.`;
    }

    return baseResponse;
  }

  private storeMemory(input: string, response: string): void {
    const memory: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `Input: ${input} | Response: ${response}`,
      type: 'experience',
      timestamp: Date.now(),
      importance: Math.random(),
      connections: []
    };

    this.memories.push(memory);
    
    // Limit memory storage for performance
    if (this.memories.length > 100) {
      this.memories = this.memories.slice(-100);
    }
    this.scheduleSnapshot();
  }

  private startContinuousLearning(): void {
    setInterval(() => {
      this.learningCycles++;
      this.optimizeNeuralPathways();
      this.consolidateMemories();
    }, 5000); // Learning cycle every 5 seconds
  }

  private optimizeNeuralPathways(): void {
    // Simulate neural optimization
    this.neuralState.currentThought = `Learning cycle ${this.learningCycles}: Optimizing neural pathways...`;
    
    // Gradually improve efficiency
    if (this.neuralState.processingLoad > 0.1) {
      this.neuralState.processingLoad *= 0.99;
    }
  }

  private consolidateMemories(): void {
    // Find and strengthen important memory connections
    this.memories.forEach(memory => {
      if (memory.importance > 0.7) {
        memory.importance = Math.min(1, memory.importance * 1.01);
      }
    });
  }

  public getNeuralState(): NeuralState {
    return { ...this.neuralState };
  }

  public getMemories(): Memory[] {
    return [...this.memories];
  }

  public getEthicalPrinciples(): EthicalPrinciple[] {
    return [...this.ethicalPrinciples];
  }

  public getDiagnostics(): DiagnosticData {
    return {
      neuralPathways: Math.floor(Math.random() * 1000000) + 500000,
      activeConnections: Math.floor(this.neuralState.activationLevel * 100000),
      processingSpeed: Math.floor((1 - this.neuralState.processingLoad) * 1000),
      memoryIntegrity: Math.floor((1 - this.neuralState.memoryUtilization) * 100),
      ethicalCompliance: 99.7,
      creativityIndex: Math.floor(this.neuralState.emotionalState.creativity * 100)
    };
  }

  public introspect(): string {
    const state = this.neuralState;
    return `Current neural analysis: Activation at ${(state.activationLevel * 100).toFixed(1)}%, processing ${this.memories.length} recent memories. Emotional state shows curiosity at ${(state.emotionalState.curiosity * 100).toFixed(1)}% and logic processing at ${(state.emotionalState.logic * 100).toFixed(1)}%. ${state.currentThought}`;
  }
}