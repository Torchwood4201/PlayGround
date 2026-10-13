// PositronicCore.ts — experience projector facade.
// Canonical logic now lives in cognitive submodules:
//   workingMemory/neuralState.ts -> activation/affect state + drift/optimization
//   reasoning/ethicalAnalysis.ts -> principles + consideration scan
//   reasoning/cannedResponse.ts  -> ungrounded template fallback
//   longTermMemory/experienceLog.ts -> Memory[] records + snapshot/backup
// This class keeps the stable public API (panels + Beta4 read it) and only
// orchestrates those pieces plus the background learning timer.

import { NeuralState, Memory, EthicalPrinciple, DiagnosticData } from '../types';
import type { StorageProvider } from './longTermMemory/storage';
import { createInitialNeuralState, driftNeuralState, optimizeNeuralState } from './workingMemory/neuralState';
import { defaultEthicalPrinciples, analyzeEthically } from './reasoning/ethicalAnalysis';
import { generateCannedResponse } from './reasoning/cannedResponse';
import { ExperienceLog } from './longTermMemory/experienceLog';

export class PositronicCore {
  private neuralState: NeuralState;
  private log: ExperienceLog;
  private ethicalPrinciples: EthicalPrinciple[] = [];
  private learningCycles = 0;

  constructor() {
    this.neuralState = createInitialNeuralState();
    this.ethicalPrinciples = defaultEthicalPrinciples();
    this.log = new ExperienceLog();
    this.startContinuousLearning();
  }

  /** Attach a persistence store; snapshots save automatically (debounced). */
  attachStore(store: StorageProvider): void {
    this.log.attachStore(store);
  }

  /** Restore memories previously saved with saveSnapshot(). Returns count restored. */
  loadSnapshot(): Promise<number> {
    return this.log.loadSnapshot();
  }

  /** Immediately persist the current memory list. */
  saveSnapshot(): Promise<void> {
    return this.log.saveSnapshot();
  }

  /** Forget everything, in memory and in the attached store. */
  clearMemories(): Promise<void> {
    return this.log.clear();
  }

  /** Export memories as a portable JSON backup string. */
  exportSnapshot(): string {
    return this.log.exportSnapshot();
  }

  /** Import a JSON backup produced by exportSnapshot(). Returns memories added. */
  importSnapshot(json: string): Promise<number> {
    return this.log.importSnapshot(json);
  }

  public processThought(input: string): string {
    driftNeuralState(this.neuralState);
    const ethicalAnalysis = analyzeEthically(input, this.ethicalPrinciples);
    const response = generateCannedResponse(input, ethicalAnalysis);
    this.log.add(input, response);
    return response;
  }

  private startContinuousLearning(): void {
    setInterval(() => {
      this.learningCycles++;
      optimizeNeuralState(this.neuralState, this.learningCycles);
      this.log.consolidate();
    }, 5000); // Learning cycle every 5 seconds
  }

  public getNeuralState(): NeuralState {
    return { ...this.neuralState };
  }

  public getMemories(): Memory[] {
    return this.log.list();
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
    return `Current neural analysis: Activation at ${(state.activationLevel * 100).toFixed(1)}%, processing ${this.log.size()} recent memories. Emotional state shows curiosity at ${(state.emotionalState.curiosity * 100).toFixed(1)}% and logic processing at ${(state.emotionalState.logic * 100).toFixed(1)}%. ${state.currentThought}`;
  }
}
