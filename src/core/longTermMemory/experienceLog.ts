// longTermMemory/experienceLog.ts — structured experience records.
// The Memory[]conversation list (id/type/connections) with snapshot,
// backup, and consolidation behavior. Vector search over the same knowledge
// lives in longTermMemory/VectorMemory; this log is the typed projector.

import type { Memory } from '../../types';
import type { StorageProvider, StoredMemoryRecord } from './storage';

const MAX_RECORDS = 100;

export class ExperienceLog {
  private memories: Memory[] = [];
  private store: StorageProvider | null = null;
  private snapshotTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(store?: StorageProvider) {
    if (store) this.store = store;
  }

  /** Attach a persistence store; snapshots save automatically (debounced). */
  attachStore(store: StorageProvider): void {
    this.store = store;
  }

  /** Record one interaction. Returns the stored memory. */
  add(input: string, response: string): Memory {
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
    if (this.memories.length > MAX_RECORDS) {
      this.memories = this.memories.slice(-MAX_RECORDS);
    }
    this.scheduleSnapshot();
    return { ...memory };
  }

  /** Strengthen important memory connections (background consolidation). */
  consolidate(): void {
    // Find and strengthen important memory connections
    this.memories.forEach(memory => {
      if (memory.importance > 0.7) {
        memory.importance = Math.min(1, memory.importance * 1.01);
      }
    });
  }

  list(): Memory[] {
    return [...this.memories];
  }

  size(): number {
    return this.memories.length;
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
    this.memories = restored.slice(-MAX_RECORDS);
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
  async clear(): Promise<void> {
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
    this.memories = this.memories.slice(-MAX_RECORDS);
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
}
