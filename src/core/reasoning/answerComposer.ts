// answerComposer/ — deterministic grounding for chat answers.
// Template generators (UnifiedModelHub / PositronicCore) can't be prompted,
// so grounding = post-composition over scored VectorMemory hits:
// strong match -> fact leads, template discarded; weak/empty -> template kept.

import type { SourceCitation } from '../../types';

export type { SourceCitation };
export type SourceKind = SourceCitation['kind'];

export interface ScoredHit {
  record: string;
  score: number;
}

export interface GroundedAnswer {
  response: string;
  reasoning: string;
  sources: SourceCitation[];
  grounded: boolean;
}

export const SEED_MARKER_PREFIX = 'SEEDED:';
export const CONVERSATION_PREFIX = 'CONVERSATION';
export const MAX_SOURCES = 3;
export const EXCERPT_CHARS = 280;
/** Keyword overlap contributes up to 2.0, so verbatim entity matches score >= ~1.7. */
export const STRONG_SCORE = 1.5;
/** Below this, a hit is noise (e.g. gibberish matching random records) — excluded. */
export const MIN_SCORE = 0.3;

export function isSeedMarker(record: string): boolean {
  return record.trimStart().startsWith(SEED_MARKER_PREFIX);
}

export function classifyRecord(record: string): SourceKind {
  const t = record.trimStart();
  if (t.startsWith('KNOWLEDGE')) return 'KNOWLEDGE';
  if (t.startsWith('DOCUMENT')) return 'DOCUMENT';
  if (t.startsWith(CONVERSATION_PREFIX)) return 'CONVERSATION';
  return 'OTHER';
}

export function toCitation(record: string): SourceCitation {
  const kind = classifyRecord(record);
  const singleLine = record.replace(/\s+/g, ' ').trim();
  let label = singleLine.slice(0, 90);
  const m =
    singleLine.match(/^(KNOWLEDGE\s*\[[^\]]+\]\s*"[^"]+")/) ??
    singleLine.match(/^(DOCUMENT\s*"[^"]+"\s*\[[^\]]+\])/) ??
    singleLine.match(/^(KNOWLEDGE\s*\[[^\]]+\])/) ??
    singleLine.match(/^DOCUMENT\s*"[^"]+"/);
  if (m) label = m[1];
  return { kind, label, excerpt: singleLine.slice(0, EXCERPT_CHARS) };
}

/**
 * Compose a grounded answer from scored retrieval hits + a template fallback.
 * Only KNOWLEDGE/DOCUMENT records ground (marker, CONVERSATION, OBSERVATION/TASK excluded).
 */
export function composeGroundedAnswer(
  message: string,
  scored: ScoredHit[],
  baseResponse: string,
  opts?: { maxSources?: number; strongScore?: number },
): GroundedAnswer {
  const max = opts?.maxSources ?? MAX_SOURCES;
  const threshold = opts?.strongScore ?? STRONG_SCORE;
  const usable = (scored ?? [])
    .filter((h) => h && typeof h.record === 'string' && h.record.trim().length > 0)
    .filter((h) => !isSeedMarker(h.record))
    .filter((h) => typeof h.score !== 'number' || h.score >= MIN_SCORE)
    .filter((h) => {
      const k = classifyRecord(h.record);
      return k === 'KNOWLEDGE' || k === 'DOCUMENT';
    })
    .slice(0, max);

  const sources = usable.map((h) => toCitation(h.record));
  if (sources.length === 0) {
    return {
      response: baseResponse,
      reasoning: `Checked long-term memory for "${message.slice(0, 80)}": no relevant KNOWLEDGE/DOCUMENT records; template answer shown ungrounded.`,
      sources: [],
      grounded: false,
    };
  }

  const strong = usable[0].score >= threshold;
  const kCount = sources.filter((s) => s.kind === 'KNOWLEDGE').length;
  const dCount = sources.filter((s) => s.kind === 'DOCUMENT').length;
  const bullets = sources.map((s, i) => `[${i + 1}] ${s.label}: ${s.excerpt}`).join('\n');

  if (strong) {
    return {
      response: `From memory ([1] ${sources[0].label}): ${sources[0].excerpt}${
        sources.length > 1 ? `\n\nFurther context:\n${bullets.split('\n').slice(1).join('\n')}` : ''
      }`,
      reasoning: `Strong memory match (score ${usable[0].score.toFixed(2)} >= ${threshold}): answered directly from ${kCount} KNOWLEDGE + ${dCount} DOCUMENT record(s); template discarded.`,
      sources,
      grounded: true,
    };
  }

  return {
    response: `${baseResponse}\n\nGrounded in memory (${kCount} knowledge, ${dCount} document):\n${bullets}`,
    reasoning: `Retrieved ${sources.length} record(s) via vectorMemory.query (${kCount} KNOWLEDGE, ${dCount} DOCUMENT); top match "${sources[0].label}". Answer template kept, facts cited verbatim below.`,
    sources,
    grounded: false,
  };
}
