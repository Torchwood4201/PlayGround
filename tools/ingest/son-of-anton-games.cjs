"use strict";

/* GameKnowledgeBase + SonOfAntonGameLearner.
 *
 * Deterministic, no-network, no-AI-service extraction: everything stored
 * comes from explicit statements in the manual text. The extractor only
 * records (button, purpose-verb) pairs when a known purpose verb appears
 * in the SAME sentence as the button mention, and only records
 * objectives/rules/strategies from sentences matching narrow patterns.
 * Anything not stated is omitted — never invented.
 *
 * Browser note: this module uses require()/fs and is intentionally
 * local-tool-only. The learned artifact it writes (ai/games-knowledge.json)
 * is what ships to the browser.
 */

const fs = require("fs");
const path = require("path");

/* Purpose verbs the extractor is allowed to attach to a button mention. */
const PURPOSE_VERBS = [
  "jump", "run", "dash", "fire", "shoot", "attack", "punch", "kick",
  "block", "shield", "pause", "start", "select", "confirm", "cancel",
  "accelerate", "brake", "steer", "fly", "swim", "climb", "duck", "crouch",
  "throw", "grab", "open", "talk", "save", "load", "reset", "spin", "roll",
  "glide", "hover", "boost", "dodge", "parry", "special", "combo", "charge"
];

/* Button mention patterns -> canonical SNES button name. */
const BUTTON_PATTERNS = [
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(A)[- ]Button/i, "A"],
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(B)[- ]Button/i, "B"],
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(X)[- ]Button/i, "X"],
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(Y)[- ]Button/i, "Y"],
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(L)[- ]Button/i, "L"],
  [/((?:press|push|hit|tap|hold)(?:ing)?[^.\n]{0,40}?\b|\b)(R)[- ]Button/i, "R"],
  [/\bSTART(?:\s+Button)?\b/i, "START"],
  [/\bSELECT(?:\s+Button)?\b/i, "SELECT"],
  [/\b(D[\s-]?Pad|Control Pad|Directional Pad|directional buttons?)\b/i, "DPAD"],
  [/\b(Up|Down|Left|Right)(?:\s+on the)?\s+(D[\s-]?Pad|Control Pad|Directional Pad)\b/i, "DPAD"]
];

const OBJECTIVE_PATTERNS = [
  /\b(objective|goal|mission|quest)\b[^.\n]{0,120}/i,
  /\b(rescue|defeat|destroy|reach|collect|find|win|survive|escape|protect)\b[^.\n]{0,120}/i
];

const RULE_PATTERNS = [
  /\b(game over|lose a life|loses a life|continue\b|1UP|extra life|time (?:is )?up|time limit|if you die|when you die)\b[^.\n]{0,140}/i
];

const STRATEGY_PATTERNS = [
  /\b(tip|hint|hint:|secret|trick|try to|remember to|be sure to|combo|strategy)\b[^.\n]{0,140}/i
];

function letterRatio(s) {
  if (!s.length) return 0;
  const letters = (s.match(/[A-Za-z]/g) || []).length;
  return letters / s.length;
}

function splitSentences(text) {
  return String(text || "")
    .replace(/([A-Za-z])-\s+(?=[A-Za-z])/g, "$1")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 400 && letterRatio(s) >= 0.5);
}

function purposesIn(sentence) {
  const lower = sentence.toLowerCase();
  const found = [];
  for (const verb of PURPOSE_VERBS) {
    const re = new RegExp("\\b" + verb + "(s|ing|ed)?\\b");
    if (re.test(lower) && found.indexOf(verb) === -1) found.push(verb);
  }
  return found;
}

/* Verbs near the button mention win: each candidate verb scores 1/(1+chars
   of distance), top scorers kept. Distant verbs from OCR column-bleed lose
   to the clause that actually describes the button. */
function purposesNear(sentence, at, before, after, cap) {
  before = before === undefined ? 60 : before;
  after = after === undefined ? 80 : after;
  cap = cap || 4;
  const lower = sentence.toLowerCase();
  const scored = [];
  for (const verb of PURPOSE_VERBS) {
    const re = new RegExp("\\b" + verb + "(s|ing|ed)?\\b", "g");
    let m;
    while ((m = re.exec(lower)) !== null) {
      if (m.index >= at - before && m.index <= at + after) {
        scored.push({ verb, score: 1 / (1 + Math.abs(m.index - at)) });
      }
    }
  }
  scored.sort((a, b) => b.score - a.score);
  const out = [];
  for (const s of scored) {
    if (out.indexOf(s.verb) === -1) out.push(s.verb);
    if (out.length >= cap) break;
  }
  return out;
}

function collectMatches(sentences, patterns, cap) {
  const out = [];
  for (const s of sentences) {
    for (const re of patterns) {
      if (re.test(s)) {
        if (out.indexOf(s) === -1) out.push(s);
        break;
      }
    }
    if (out.length >= cap) break;
  }
  return out;
}

function cleanTitle(raw) {
  return String(raw || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s*manual\s*/gi, " ")
    .replace(/\.(pdf|png|jpe?g|tiff?|webp)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

class GameKnowledgeBase {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.games = {};
    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
        if (data && typeof data === "object") {
          this.games = data.games || data;
        }
      } catch (e) {
        this.games = {};
      }
    }
  }

  get(title) {
    return this.games[title] || null;
  }

  put(entry) {
    const prev = this.games[entry.title];
    if (!prev) {
      this.games[entry.title] = entry;
      return entry;
    }
    /* Merge: union purposes per button, union capped lists, keep sources. */
    const merged = {
      title: entry.title,
      controls: Object.assign({}, prev.controls),
      objectives: prev.objectives.slice(),
      rules: prev.rules.slice(),
      strategies: prev.strategies.slice(),
      manualSources: prev.manualSources.slice()
    };
    for (const btn of Object.keys(entry.controls)) {
      const have = new Set((merged.controls[btn] && merged.controls[btn].purpose) || []);
      for (const p of entry.controls[btn].purpose) have.add(p);
      merged.controls[btn] = { purpose: Array.from(have).sort() };
    }
    for (const [key, cap] of [["objectives", 12], ["rules", 12], ["strategies", 12]]) {
      for (const line of entry[key]) {
        if (merged[key].indexOf(line) === -1 && merged[key].length < cap) merged[key].push(line);
      }
    }
    for (const s of entry.manualSources) {
      if (merged.manualSources.indexOf(s) === -1) merged.manualSources.push(s);
    }
    this.games[entry.title] = merged;
    return merged;
  }

  all() {
    return Object.keys(this.games).sort().map((k) => this.games[k]);
  }

  count() {
    return Object.keys(this.games).length;
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify({ games: this.games }, null, 1));
    return this.filePath;
  }
}

class SonOfAntonGameLearner {
  constructor(options) {
    options = options || {};
    if (!options.knowledgeBase) throw new Error("SonOfAntonGameLearner needs { knowledgeBase }.");
    this.knowledge = options.knowledgeBase;
  }

  learnFromManual({ title, manualText, manualPath }) {
    const clean = cleanTitle(title);
    if (!clean) throw new Error("learnFromManual needs a title.");
    const text = String(manualText || "");
    const sentences = splitSentences(text);

    const controls = {};
    for (const s of sentences) {
      for (const [re, btn] of BUTTON_PATTERNS) {
        const m = re.exec(s);
        if (!m) continue;
        /* Only verbs near the mention count: OCR column-bleed joins distant
           clauses into one sentence, and whole-sentence verbs cross-talk. */
        const at = m.index + m[0].length;
        const purposes = purposesNear(s, at, 60, 80, 4).filter((p) => p !== btn.toLowerCase());
        if (!purposes.length) continue; /* no stated purpose: record nothing */
        if (!controls[btn]) controls[btn] = { purpose: [] };
        for (const p of purposes) {
          if (controls[btn].purpose.indexOf(p) === -1) controls[btn].purpose.push(p);
        }
        break; /* one button per sentence to avoid cross-contamination */
      }
      if (Object.keys(controls).length >= 12) break;
    }
    for (const btn of Object.keys(controls)) {
      controls[btn].purpose.sort();
      controls[btn].purpose = controls[btn].purpose.slice(0, 5);
    }

    const entry = {
      title: clean,
      controls,
      objectives: collectMatches(sentences, OBJECTIVE_PATTERNS, 12),
      rules: collectMatches(sentences, RULE_PATTERNS, 12),
      strategies: collectMatches(sentences, STRATEGY_PATTERNS, 12),
      manualSources: manualPath ? [manualPath] : []
    };
    return this.knowledge.put(entry);
  }
}

module.exports = {
  GameKnowledgeBase,
  SonOfAntonGameLearner,
  cleanTitle,
  splitSentences,
  PURPOSE_VERBS
};
