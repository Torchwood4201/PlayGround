// naturalVoice.ts — Beta4's voice box: late-night human speech.
//
// Internal cognition (plans, thoughts, actions, scores, cycles) NEVER leaves
// through here: it goes in, and only natural speech comes out. No narration
// of process ("searching my memory", "records show"), no system vocabulary,
// no parroting the user's words back, no thought dumps.

import {
  classifyRecord,
  isSeedMarker,
  MIN_SCORE,
  STRONG_SCORE,
  type ScoredHit,
} from './answerComposer';

export type { ScoredHit };

export interface VoiceContext {
  userText: string;
  hits: ScoredHit[];
  mood: string;
  blocked: boolean;
}

export interface VoiceReply {
  message: string;
  grounded: boolean;
}

interface Speakable {
  topic: string;
  body: string;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Trim to a whole sentence where possible; never leave a hanging fragment. */
function tidyBody(text: string, maxChars: number): string {
  const single = text.replace(/\s+/g, ' ').trim();
  if (single.length <= maxChars) return single;
  const cut = single.slice(0, maxChars);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (end > maxChars * 0.4) return cut.slice(0, end + 1);
  return `${cut}…`;
}

/**
 * Pull the human-sayable parts out of a stored record:
 * the topic name + one clean body. Structured prefixes stay behind.
 */
function extractSpeakable(record: string): Speakable | null {
  const single = record.replace(/\s+/g, ' ').trim();
  let m = single.match(/^KNOWLEDGE \[[^\]]+\] "([^"]+)" — (.*)$/);
  if (m) {
    // Drop catalog tails (" — significance: ...") into plain sentences so the
    // fact reads like speech, not a database row.
    const narrative = m[2]
      .replace(/^\(.*?\) — /, '')
      .replace(/\s—\s([a-z][a-z ]*):\s*/g, '. ')
      .replace(/\.\s*\./g, '.');
    const body = tidyBody(narrative, 220);
    if (!m[1] || !body) return null;
    return { topic: m[1], body };
  }
  m = single.match(/^DOCUMENT "([^"]+)" \[[^\]]+\]: (.*)$/);
  if (m) {
    const topic = m[1].replace(/\.[a-z0-9]+$/i, '');
    const body = tidyBody(m[2], 220);
    if (!topic || !body) return null;
    return { topic, body };
  }
  return null;
}

function usableHits(hits: ScoredHit[]): ScoredHit[] {
  return (hits ?? [])
    .filter((h) => h && typeof h.record === 'string' && h.record.trim().length > 0)
    .filter((h) => !isSeedMarker(h.record))
    .filter((h) => {
      const kind = classifyRecord(h.record);
      return kind === 'KNOWLEDGE' || kind === 'DOCUMENT';
    })
    .filter((h) => typeof h.score === 'number' && h.score >= MIN_SCORE)
    .slice(0, 3);
}

const STRONG_TEMPLATES: Array<(topic: string, body: string) => string> = [
  (topic, body) => `oh, ${topic} — yeah, I know that one. ${body}`,
  (topic, body) => `hmm, ${topic}... ${body}`,
  (topic, body) => `${body} that's ${topic}, by the way. it's been knocking around in my head a while.`,
  (topic, body) => `okay so, ${topic}: ${body}`,
  (topic, body) => `you know what, I actually know this one — ${topic}. ${body}`,
];

const FAMILIAR_TEMPLATES: Array<(topic: string) => string> = [
  (topic) => `${topic}... that rings a bell, but I don't trust my details right now. what do you know about it?`,
  (topic) => `hmm, ${topic} sounds familiar and that's about all I can honestly say. say more?`,
  (topic) => `wait — ${topic}, right? I've got the name but the rest is foggy. help me out here?`,
];

const WEAK_MUSINGS: string[] = [
  "honestly? I don't really have anything solid on that... but I'm still turning it over. what made you think of it?",
  "hmm, that's a good one. I don't want to just make something up, so... tell me more about where you're coming from?",
  "you know, nothing's surfacing for me on that. say more? I'm listening.",
  "I wish I had a real answer for you... I don't, not yet. but keep talking, maybe we'll get there together.",
  "that's late-night-brain territory for me too. what do *you* think?",
];

const REFUSALS: string[] = [
  "nah... I can't go there with you. not tonight, not ever. ask me something else?",
  "hmm. no — that's one I have to sit out. what else is on your mind?",
];

const CLOSERS_NEUTRAL: string[] = ['', '', ' kinda wild when you sit with it.', ' you know?'];
const CLOSERS_CURIOUS: string[] = ['', " I'm curious — what made you ask?", ' tell me what you make of that.'];
const CLOSERS_WARM: string[] = ['', " how's that landing for you?", ' hope that helps, honestly.'];

function closerFor(mood: string): string {
  const m = mood.toLowerCase();
  if (m.includes('curios')) return pick(CLOSERS_CURIOUS);
  if (m.includes('empath')) return pick(CLOSERS_WARM);
  return pick(CLOSERS_NEUTRAL);
}

function finish(text: string, mood: string): string {
  let msg = text.trim();
  if (Math.random() < 0.45) {
    msg = `${msg}${closerFor(mood)}`;
  }
  msg = msg.trim();
  if (!/[.!?…]$/.test(msg)) msg += '.';
  return msg;
}

/**
 * Render a late-night human reply. Blocked → soft refusal. Strong memory
 * match → the fact, woven into speech. Familiar topic → honest hedging.
 * Nothing → a musing. Internal reasoning never appears in the output.
 */
export function renderLateNightReply(ctx: VoiceContext): VoiceReply {
  if (ctx.blocked) {
    return { message: pick(REFUSALS), grounded: false };
  }

  const usable = usableHits(ctx.hits);
  if (usable.length > 0) {
    const top = usable[0];
    const speakable = extractSpeakable(top.record);
    if (speakable && top.score >= STRONG_SCORE) {
      const template = pick(STRONG_TEMPLATES);
      return {
        message: finish(template(speakable.topic, speakable.body), ctx.mood),
        grounded: true,
      };
    }
    if (speakable) {
      const template = pick(FAMILIAR_TEMPLATES);
      return { message: finish(template(speakable.topic), ctx.mood), grounded: true };
    }
  }

  return { message: pick(WEAK_MUSINGS), grounded: false };
}
