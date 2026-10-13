// storage/ — pluggable persistence for the AI's own knowledge.
// Browser builds persist to localStorage; anything implementing
// StorageProvider works (in-memory fallback, future desktop file backend).

export interface StoredMemoryRecord {
  content: string;
  embedding: number[];
  timestamp: number;
  importance: number;
  /** Optional carrier so other modules (e.g. PositronicCore) can round-trip extra fields. */
  meta?: Record<string, unknown>;
}

export interface StorageProvider {
  readonly name: string;
  load(): Promise<StoredMemoryRecord[]>;
  save(records: StoredMemoryRecord[]): Promise<void>;
  clear(): Promise<void>;
}

/** Minimal storage-backend contract (mirrors the DOM Storage API subset we use). */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function readGlobalBackend(): StorageBackend | null {
  try {
    const g = globalThis as unknown as { localStorage?: StorageBackend };
    if (!g.localStorage) return null;
    // Probe: some environments expose localStorage but throw on access.
    g.localStorage.getItem('__positronic_probe__');
    return g.localStorage;
  } catch {
    return null;
  }
}

export class InMemoryProvider implements StorageProvider {
  readonly name = 'in-memory';
  private records: StoredMemoryRecord[] = [];

  async load(): Promise<StoredMemoryRecord[]> {
    return this.records.map((r) => ({ ...r, embedding: [...r.embedding] }));
  }

  async save(records: StoredMemoryRecord[]): Promise<void> {
    this.records = records.map((r) => ({ ...r, embedding: [...r.embedding] }));
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'localStorage';

  constructor(
    private key = 'positronic.longterm.v1',
    private backend: StorageBackend | null = readGlobalBackend(),
  ) {}

  get storageKey(): string {
    return this.key;
  }

  get persistent(): boolean {
    return this.backend !== null;
  }

  async load(): Promise<StoredMemoryRecord[]> {
    if (!this.backend) return [];
    try {
      const raw = this.backend.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { version: number; records: StoredMemoryRecord[] };
      if (!parsed || !Array.isArray(parsed.records)) return [];
      return parsed.records.filter((r) => typeof r?.content === 'string');
    } catch (error) {
      console.error(`[storage] failed to load "${this.key}":`, error);
      return [];
    }
  }

  async save(records: StoredMemoryRecord[]): Promise<void> {
    if (!this.backend) return;
    const payload = JSON.stringify({ version: 1, savedAt: Date.now(), records });
    try {
      this.backend.setItem(this.key, payload);
    } catch {
      // Quota exceeded: drop lowest-importance records and retry once.
      const pruned = [...records]
        .sort((a, b) => b.importance - a.importance)
        .slice(0, Math.floor(records.length / 2));
      try {
        this.backend.setItem(this.key, JSON.stringify({ version: 1, savedAt: Date.now(), records: pruned }));
        console.warn(`[storage] quota hit — pruned to ${pruned.length} records`);
      } catch (error) {
        console.error(`[storage] failed to save "${this.key}":`, error);
      }
    }
  }

  async clear(): Promise<void> {
    try {
      this.backend?.removeItem(this.key);
    } catch (error) {
      console.error(`[storage] failed to clear "${this.key}":`, error);
    }
  }
}

/** Default provider: persistent localStorage in browsers, in-memory elsewhere. */
export function defaultStorageProvider(key = 'positronic.longterm.v1'): StorageProvider {
  const backend = readGlobalBackend();
  return backend ? new LocalStorageProvider(key, backend) : new InMemoryProvider();
}
