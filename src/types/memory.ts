// memory.ts — typed namespaces for inter-module memory contracts.
// Purpose: keep autonomous cognitive cycles free of dialog chatter while
// letting dialog ground in shared knowledge. See contracts.ts for the rules.

/** Which cognitive path owns a stored record. */
export type MemoryNamespace =
  | 'dialog' // chat turns (CONVERSATION Q:|A:) — dialog path only
  | 'knowledge' // seed entries + uploaded document chunks — both paths readable
  | 'observation' // cycle perceptions, sensor/ingest notes
  | 'task' // goals, tasks, seed/ingest operational notes
  | 'experience' // cycle outcomes, calibration results
  | 'system'; // boot + migration markers

/** Records the autonomous cycle planner is allowed to retrieve. Excludes 'dialog'. */
export const CYCLE_RETRIEVAL_ALLOWLIST: MemoryNamespace[] = [
  'knowledge',
  'observation',
  'task',
  'experience',
];

/** Visibility of a working-memory note. */
export type HistoryVisibility = 'ephemeral' | 'cycle-visible';

/** A working-memory note with explicit routing. */
export interface HistoryNote {
  text: string;
  visibility: HistoryVisibility;
  origin: 'dialog' | 'cycle' | 'system';
  ts: number;
}

/**
 * Prefix fallback so legacy records (stored before namespaces) still route
 * correctly. Pure helper — lives here so any module can classify without
 * importing the long-term store.
 */
export function inferNamespace(content: string): MemoryNamespace {
  const t = content.trimStart();
  if (t.startsWith('CONVERSATION')) return 'dialog';
  if (t.startsWith('DOCUMENT') || t.startsWith('KNOWLEDGE') || t.startsWith('SEEDED:')) return 'knowledge';
  if (t.startsWith('OBSERVATION')) return 'observation';
  if (t.startsWith('TASK:')) return 'task';
  if (t.startsWith('WORKING:')) return t.includes('CHAT') ? 'dialog' : 'task';
  return 'system';
}
