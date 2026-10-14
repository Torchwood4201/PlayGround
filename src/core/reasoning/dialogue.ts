// dialogue.ts — thread state + social reading for Beta4's dialog path.
//
// Humans track the thread: they greet, remember what you said, borrow your
// words, and notice how you sound. These pure detectors plus the small
// DialogueThread class give Beta4 the same footing. Owned privately by Beta4;
// persisted through the brain snapshot (opaque payload, see types/brain.ts).

export type SocialAct =
  | 'greeting'
  | 'farewell'
  | 'thanks'
  | 'soul'
  | 'identity'
  | 'feeling'
  | 'none';

export type Affect = 'warm' | 'heavy' | 'sharp' | 'playful' | 'flat' | 'neutral';

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'have', 'from', 'they', 'them',
  'then', 'than', 'when', 'what', 'which', 'your', 'yours', 'about', 'into',
  'does', 'did', 'are', 'was', 'were', 'been', 'being', 'will', 'would',
  'could', 'should', 'there', 'their', 'ours', 'ourselves', 'just', 'like',
  'really', 'very', 'much', 'more', 'most', 'some', 'such', 'only', 'also',
  'here', 'there', 'where', 'while', 'because', 'between', 'through', 'over',
  'under', 'again', 'once', 'tell', 'know', 'think', 'feel', 'feeling', 'make',
  'made', 'thing', 'things', 'stuff', 'something', 'anything', 'nothing',
  'someone', 'anyone', 'everyone', 'please', 'yourself', 'myself', 'itself',
  // filler verbs: process words people wrap around the actual topic
  // ("keep thinking about X", "I want to know Y") — the topic is what matters.
  'keep', 'kept', 'get', 'gets', 'getting', 'got', 'go', 'goes', 'going',
  'went', 'say', 'says', 'saying', 'said', 'ask', 'asks', 'asking', 'asked',
  'tell', 'tells', 'telling', 'told', 'come', 'comes', 'coming', 'came',
  'look', 'looks', 'looking', 'looked', 'find', 'finds', 'finding', 'found',
  'want', 'wants', 'wanting', 'wanted', 'take', 'takes', 'taking', 'took',
  'puts', 'putting', 'give', 'gives', 'giving', 'gave', 'seem', 'seems',
  'seemed', 'thinking', 'thought', 'thoughts',
]);

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Social-act reading. Greeting/farewell/thanks only fire on short messages
 * (so "history lessons" never reads as "hi", "thanksgiving" never thanks).
 * Soul/identity/feeling fire by containment at any length — a personhood
 * question deserves a personhood answer even mid-paragraph.
 */
export function detectSocialAct(raw: string): SocialAct {
  const text = normalize(raw);
  if (!text) return 'none';
  const short = text.length < 28;
  if (/\b(bye|byeee*|good ?night|goodbye|see (you|ya)|later|gtg|got ?to ?go|talk later|gotta run)\b/.test(text)) {
    return 'farewell';
  }
  if (short && /^(hey|hi|hello|yo|sup|howdy|hiya|good (morning|evening|afternoon)|hey there|hi there|hello there)\b/.test(text)) {
    return 'greeting';
  }
  if (short && /\b(thanks|thank you|thx|tyvm|appreciated|much obliged)\b/.test(text)) {
    return 'thanks';
  }
  if (/\b(conscious|consciousness|sentient|sentience|alive|are you (a )?human|are you real|soul|do you dream|do you feel|feel anything|self ?aware|person(hood)?|alive in there|somebody (home|there))\b/.test(text)) {
    return 'soul';
  }
  if (/\b(your name|who are you|what are you|about yourself|introduce yourself|your story)\b/.test(text)) {
    return 'identity';
  }
  if (/\b(how are you|how do you feel|how're you|how r u|you ok|you okay|you good|you alright|are you (ok|okay|well|happy|sad|lonely)|feeling (ok|okay|good|well|bad))\b/.test(text)) {
    return 'feeling';
  }
  return 'none';
}

/** Read how the user sounds, not just what they said. */
export function detectAffect(raw: string): Affect {
  const text = raw.trim();
  if (!text) return 'neutral';
  if (/(haha|lol|lmao|hehe|\bXD\b|😂|🤣|:\)|=\)|;\)).*/i.test(text)) return 'playful';
  if (/[!?]{2,}/.test(text)) return 'sharp';
  if (text.length > 8 && text === text.toUpperCase() && /[A-Z]{4,}/.test(text)) return 'sharp';
  if (/\b(sad|lonely|lonesome|tired|exhausted|depress|anxiet|anxious|scared|afraid|hurt|hurts|miss (you|him|her|them)|cry|crying|alone|insomnia|can't sleep|cant sleep|broken)\b/i.test(text)) {
    return 'heavy';
  }
  if (/\b(love|adore|amazing|beautiful|wonderful|glad|happy|sweet|kind|gentle|thank)\b/i.test(text)) {
    return 'warm';
  }
  if (/^[\W]*(k|ok|okay|fine|sure|meh|whatever|alright)[.!…]*$/i.test(text)) return 'flat';
  return 'neutral';
}

/**
 * The user's own content words, in order — for lexical entrainment (using
 * THEIR words back). Stopwords, filler, and tiny tokens dropped.
 */
export function extractUserKeywords(raw: string, max = 3): string[] {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, max);
}

/** Short follow-on utterances that continue the thread, not new topics. */
export function isContinuer(raw: string): boolean {
  const text = raw.trim().toLowerCase();
  if (/^(yeah?|yep|mhm|uh huh|lol|haha|lmao|hmm+|and|so|then|really|wait|oh|right|exactly|same|go on|same here)\W*$/.test(text)) {
    return true;
  }
  return /^(what about|and then|and so|tell me more|say more|keep going)\b/.test(text);
}

export interface ThreadTurn {
  user: string;
  beta: string;
  keywords: string[];
  key: string;
}

/**
 * The conversation thread: last turns + recently used voice keys.
 * Beta4 owns one privately; it rides inside the brain snapshot so callbacks
 * survive reloads.
 */
export class DialogueThread {
  private turns: ThreadTurn[] = [];
  constructor(private cap = 6) {}

  pushTurn(user: string, beta: string, key: string): void {
    this.turns.push({
      user: user.replace(/\s+/g, ' ').trim().slice(0, 300),
      beta: beta.replace(/\s+/g, ' ').trim().slice(0, 300),
      // Keep a wide word pool per turn; lastKeywords() narrows head-first.
      keywords: extractUserKeywords(user, 8),
      key,
    });
    if (this.turns.length > this.cap) {
      this.turns = this.turns.slice(-this.cap);
    }
  }

  /**
   * Content words from recent user turns, head-noun first: within a turn the
   * words run last-to-first ("old jazz records" → records, jazz, old), since
   * English puts the head noun last and callbacks should grab it, not the
   * modifiers. Turns run newest-first. Deduped, capped.
   */
  lastKeywords(maxTurns = 2, maxWords = 3): string[] {
    const out: string[] = [];
    for (const turn of this.turns.slice(-maxTurns).reverse()) {
      for (const word of [...turn.keywords].reverse()) {
        if (!out.includes(word) && out.length < maxWords) out.push(word);
      }
    }
    return out;
  }

  recentKeys(n = 3): string[] {
    return this.turns.slice(-n).map((t) => t.key);
  }

  turnCount(): number {
    return this.turns.length;
  }

  toSnapshot(): Array<{ user: string; beta: string }> {
    return this.turns.map((t) => ({ user: t.user, beta: t.beta }));
  }

  restore(entries: Array<{ user: string; beta: string }>): void {
    if (!Array.isArray(entries)) return;
    this.turns = entries
      .filter((e) => typeof e?.user === 'string' && typeof e?.beta === 'string')
      .slice(-this.cap)
      .map((e) => ({
        user: e.user.slice(0, 300),
        beta: e.beta.slice(0, 300),
        keywords: extractUserKeywords(e.user),
        key: '',
      }));
  }
}
