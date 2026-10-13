// longTermMemory/ — knowledge base, persistent storage.
// Vector-similarity memory extracted from core/CognitiveOS.ts.
// Persists through a pluggable StorageProvider (see core/storage/).

import type { StorageProvider, StoredMemoryRecord } from '../storage';

export interface MemoryPlugin {
  add(record: string): Promise<void>;
  query(prompt: string, topK?: number): Promise<string[]>;
}

export interface VectorMemoryOptions {
  maxMemories?: number;
  /** Attached store enables load/autosave persistence. */
  store?: StorageProvider;
  autosave?: boolean;
}

interface StoredMemory {
  content: string;
  embedding: number[];
  timestamp: number;
  importance: number;
}

export class VectorMemory implements MemoryPlugin {
  private memories: StoredMemory[] = [];
  private maxMemories: number;
  private store: StorageProvider | null;
  private autosave: boolean;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: VectorMemoryOptions = {}) {
    this.maxMemories = options.maxMemories ?? 1000;
    this.store = options.store ?? null;
    this.autosave = options.autosave ?? options.store != null;
  }

  attachStore(store: StorageProvider, autosave = true): void {
    this.store = store;
    this.autosave = autosave;
  }

  /** Load persisted records into memory. Returns the number restored. */
  async loadFromStore(): Promise<number> {
    if (!this.store) return 0;
    const records = await this.store.load();
    const valid = records.filter(
      (r) => typeof r?.content === 'string' && Array.isArray(r?.embedding),
    );
    valid.sort((a, b) => b.importance - a.importance);
    this.memories = valid.slice(0, this.maxMemories).map((r) => ({
      content: r.content,
      embedding: [...r.embedding],
      timestamp: r.timestamp,
      importance: r.importance,
    }));
    return this.memories.length;
  }

  /** Immediately write current memories to the attached store. */
  async flush(): Promise<void> {
    if (!this.store) return;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    const records: StoredMemoryRecord[] = this.memories.map((m) => ({ ...m }));
    await this.store.save(records);
  }

  /** Export all memories as a portable JSON string (backup / transfer). */
  exportJSON(): string {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), records: this.memories });
  }

  /** Import a JSON blob produced by exportJSON. Returns records added. */
  async importJSON(json: string): Promise<number> {
    const parsed = JSON.parse(json) as { records?: StoredMemory[] };
    if (!parsed || !Array.isArray(parsed.records)) {
      throw new Error('Invalid memory backup: missing records array');
    }
    let added = 0;
    for (const r of parsed.records) {
      if (typeof r?.content !== 'string') continue;
      this.memories.push({
        content: r.content,
        embedding: Array.isArray(r.embedding) ? r.embedding : this.generateSimulatedEmbedding(r.content),
        timestamp: typeof r.timestamp === 'number' ? r.timestamp : Date.now(),
        importance: typeof r.importance === 'number' ? r.importance : 0.5,
      });
      added++;
    }
    this.enforceLimit();
    this.scheduleSave();
    return added;
  }

  /** Forget everything, in memory and in the attached store. */
  async clearAll(): Promise<void> {
    this.memories = [];
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.store?.clear();
  }

  async add(record: string): Promise<void> {
    const embedding = this.generateSimulatedEmbedding(record);
    const importance = this.calculateImportance(record);
    this.memories.push({ content: record, embedding, timestamp: Date.now(), importance });
    this.enforceLimit();
    this.scheduleSave();
  }

  async query(prompt: string, topK = 5): Promise<string[]> {
    if (this.memories.length === 0) return [];
    const queryEmbedding = this.generateSimulatedEmbedding(prompt);
    // Keyword overlap backs up the simulated embedding so named entities
    // (people, places, terms) reliably surface their own records.
    // Overlap dominates because the simulated embedding is noisy by design;
    // a real embedding backend would rebalance these weights.
    const queryTokens = new Set(
      prompt.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3),
    );
    const scored = this.memories.map((memory) => {
      const lower = memory.content.toLowerCase();
      let matched = 0;
      queryTokens.forEach((t) => {
        if (lower.includes(t)) matched++;
      });
      const overlap = queryTokens.size > 0 ? matched / queryTokens.size : 0;
      return {
        content: memory.content,
        score: overlap * 2.0 + this.cosineSimilarity(queryEmbedding, memory.embedding) * 0.3 + memory.importance * 0.1,
      };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.content);
  }

  getMemoryStats(): { total: number; avgImportance: number; oldestTimestamp: number } {
    if (this.memories.length === 0) {
      return { total: 0, avgImportance: 0, oldestTimestamp: Date.now() };
    }
    const avgImportance =
      this.memories.reduce((sum, m) => sum + m.importance, 0) / this.memories.length;
    return {
      total: this.memories.length,
      avgImportance,
      oldestTimestamp: Math.min(...this.memories.map((m) => m.timestamp)),
    };
  }

  private enforceLimit(): void {
    if (this.memories.length > this.maxMemories) {
      this.memories.sort((a, b) => b.importance - a.importance);
      this.memories = this.memories.slice(0, this.maxMemories);
    }
  }

  private scheduleSave(): void {
    if (!this.store || !this.autosave) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    // Debounced so rapid add() bursts (e.g. a cognitive cycle) write once.
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.flush();
    }, 500);
  }

  private generateSimulatedEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < embedding.length; i++) {
      let value = 0;
      for (const word of words) value += Math.sin(this.simpleHash(word + i.toString())) * 0.1;
      embedding[i] = words.length > 0 ? value / words.length : 0;
    }
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  private calculateImportance(record: string): number {
    let importance = 0.5;
    const keywords = [
      'error', 'success', 'learn', 'discover', 'achieve', 'fail',
      'ethical', 'decision', 'problem', 'solution', 'insight',
    ];
    const lower = record.toLowerCase();
    for (const keyword of keywords) if (lower.includes(keyword)) importance += 0.1;
    if (record.length > 100) importance += 0.1;
    if (record.length > 200) importance += 0.1;
    return Math.min(1.0, importance);
  }
}
