// knowledge/ — built-in seed knowledge for the AI's own memory.
// Flattens src/data/world_knowledge.json into long-term memory records.
// Seeding is idempotent: a marker record means "already stored", so
// reloads never duplicate entries.

import worldKnowledge from '../../../data/world_knowledge.json';

export const SEED_ID = 'seed-world-knowledge';
export const SEED_VERSION = '1.1';
const SEED_MARKER = `SEEDED: world_knowledge v${SEED_VERSION}`;
/** Byte size of the bundled seed file (shown in the documents list). */
export const SEED_BYTES = JSON.stringify(worldKnowledge).length;
export const SEED_SUMMARY =
  'Built-in reference across technology, empires, religions, mathematics, art, codes, music, science, philosophy, and literature.';

interface SeedTargets {
  addToLongTerm: (record: string) => Promise<void>;
  queryLongTerm?: (prompt: string, topK?: number) => Promise<string[]>;
  noteToWorking?: (note: string) => void;
}

function joinStrings(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v : typeof v === 'object' && v !== null ? joinStrings(v) : ''))
      .filter(Boolean)
      .join('; ');
  }
  return typeof value === 'string' ? value : '';
}

/** One record per named entry: `KNOWLEDGE [category] "Name" (period; region): summary | ...` */
export function flattenWorldKnowledge(): string[] {
  const kb = worldKnowledge as unknown as Record<string, unknown>;
  const records: string[] = [];
  const meta = kb.meta as Record<string, unknown> | undefined;
  if (meta) {
    const cats = Array.isArray(meta.categories) ? meta.categories.join(', ') : '';
    records.push(
      `KNOWLEDGE [overview] "${String(meta.title ?? 'World Knowledge Base')}": ${String(meta.description ?? '')} Categories: ${cats}.`,
    );
  }
  const describe = (entry: Record<string, unknown>, category: string, trail: string[]) => {
    const name = String(entry.name);
    const label = trail.length > 0 ? `${trail.join(' > ')} > ${name}` : name;
    const parts: string[] = [`KNOWLEDGE [${category}] "${label}"`];
    const context = [entry.period, entry.region].filter((v) => typeof v === 'string');
    if (context.length > 0) parts.push(`(${context.join('; ')})`);
    const summary = joinStrings(entry.summary ?? entry.description ?? entry.overview ?? entry.notes);
    if (summary) parts.push(summary);
    for (const key of [
      'significance',
      'key_inventions',
      'key_figures',
      'key_texts',
      'key_contributions',
      'key_works',
      'key_movements',
      'key_examples',
      'key_periods_figures',
      'key_concepts',
      'examples',
    ]) {
      const value = joinStrings(entry[key]);
      if (value) {
        const pretty = key.replace(/^key_/, '').replace(/_/g, ' ');
        parts.push(`${pretty}: ${value}`);
      }
    }
    let record = parts.join(' — ');
    if (record.length > 900) record = record.slice(0, 897) + '…';
    records.push(record);
  };
  const walk = (node: unknown, category: string, trail: string[]) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, category, trail);
      return;
    }
    if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>;
      if (typeof obj.name === 'string') {
        describe(obj, category, trail);
        return;
      }
      for (const [key, value] of Object.entries(obj)) {
        if (['description', 'overview', 'period', 'region'].includes(key)) continue;
        walk(value, category, [...trail, key.replace(/_/g, ' ')]);
      }
    }
  };
  for (const [category, section] of Object.entries(kb)) {
    if (category === 'meta') continue;
    walk(section, category, []);
  }
  return records;
}

/**
 * Store all seed records in long-term memory (once) and note the seeding
 * in working memory. Returns { added, skipped }.
 */
export async function seedWorldKnowledge(targets: SeedTargets): Promise<{
  added: number;
  skipped: boolean;
}> {
  if (targets.queryLongTerm) {
    const hits = await targets.queryLongTerm(SEED_MARKER, 5);
    if (hits.includes(SEED_MARKER)) {
      return { added: 0, skipped: true };
    }
  }
  const records = flattenWorldKnowledge();
  for (const record of records) {
    await targets.addToLongTerm(record);
  }
  await targets.addToLongTerm(SEED_MARKER);
  targets.noteToWorking?.(
    `SEEDED WORLD KNOWLEDGE v${SEED_VERSION}: ${records.length} entries across ${(worldKnowledge as unknown as { meta: { categories: string[] } }).meta.categories.join(', ')}.`,
  );
  return { added: records.length, skipped: false };
}
