"use strict";
/**
 * son-of-anton — YOUR SonOfAnton engine, installed as the actor.
 *
 * Kept verbatim from your draft: generateAuditLog, the SonOfAnton class
 * (plan/beam-search, rank, execute, selfImprove with preference EMA +
 * aggressiveness mutation), and the codebase capability's score/satisfied.
 *
 * Adapted ONLY at the survival boundary (your own rule: never kill itself,
 * never touch what makes it run):
 *   - purgeFile action NOT registered (your "sound good" accepted no delete/
 *     rename API). Files scoring >= aggressiveness are FLAGGED for human
 *     review instead of deleted — the planner still sees them, the disk never does.
 *   - optimizeFile keeps YOUR strip semantics (full-line // comments, full-line
 *     /* *\/ blocks, full-line console.log statements, blank collapse) but
 *     full-line-only so mid-line URLs and logic survive, and every change is
 *     previewed (generateDiff) + gated + backed up + rolled back on failure.
 *   - scanDirectory covers the site allowlist only (index.html, styles.css,
 *     app.js). Runtime, infra, assets, and this file are unreachable.
 *   - approve keeps YOUR signature; the default approver is a validation gate,
 *     and every run prints YOUR dry-run manifest with before/after previews
 *     and "Review diffs before applying."
 *   - The ./src bloated_test.js seeding from the draft is removed.
 *   - Memory persists to son-of-anton-memory.jsonl so adaptation survives restarts.
 *
 * Usage:
 *   node tools/son-of-anton.cjs            # dry-run: plan + predicted outcome, no writes
 *   node tools/son-of-anton.cjs --commit   # act for real (guarded, backed up, logged)
 */

const fs = require("fs");
const path = require("path");
const {
  isProtected,
  writeSiteFile,
  ALLOWLIST,
} = require("./safe-optimizer.cjs");
const { buildBrief, logBrief, checkPreservation } = require("./forge-bridge.cjs");

const ROOT = path.resolve(__dirname, "..");
const MEMORY_FILE = path.join(__dirname, "son-of-anton-memory.jsonl");

const clone = (value) => structuredClone(value);

/**
 * Generates a local self-audit and revision prompt/log without external dependencies.
 */
function generateAuditLog(originalGoal, executionResult) {
  return `
[SYSTEM AUDIT & RECURSIVE REFLECTION PROTOCOL]

--- TARGET GOAL ---
${JSON.stringify(originalGoal, null, 2)}

--- EXECUTION TRACE & OUTCOME ---
Success: ${executionResult.success}
Completed Steps: ${executionResult.completed.length}
Final State Metrics: ${JSON.stringify(executionResult.state, null, 2)}

--- META-LEARNING EVALUATION ---
1. DEFICIT IDENTIFICATION: Analyze execution friction, unexpected costs, or optimization bottlenecks.
2. WEIGHT ADJUSTMENT: Recalibrate internal heuristics and aggressiveness thresholds based on outcome variance.
3. RECURSIVE ADAPTATION: Update operational parameters to maximize efficiency in subsequent execution cycles.
    `.trim();
}

class SonOfAnton {
  constructor({
    maxDepth = 8,
    beamWidth = 20,
    learningRate = 0.15,
    aggressiveness = 0.6,
  } = {}) {
    this.maxDepth = maxDepth;
    this.beamWidth = beamWidth;
    this.learningRate = learningRate;
    this.aggressiveness = aggressiveness;

    this.capabilities = new Map();
    this.preferences = new Map();
    this.memory = [];
    this.logHistory = [];
  }

  log(message) {
    const entry = `[SON OF ANTON - SELF-IMPROVING] ${new Date().toISOString()} - ${message}`;
    console.log(entry);
    this.logHistory.push(entry);
  }

  register(name, capability) {
    if (
      !capability ||
      typeof capability.score !== "function" ||
      typeof capability.satisfied !== "function" ||
      !Array.isArray(capability.actions)
    ) {
      throw new Error("A capability needs score(), satisfied(), and actions[].");
    }

    for (const action of capability.actions) {
      if (typeof action.name !== "string" || typeof action.predict !== "function") {
        throw new Error("Each action needs a name and predict().");
      }
    }

    this.capabilities.set(name, capability);
    return this;
  }

  getCapability(name) {
    const capability = this.capabilities.get(name);
    if (!capability) {
      throw new Error(`Unknown capability: ${name}`);
    }
    return capability;
  }

  preferenceKey(domain, action) {
    return JSON.stringify([domain, action]);
  }

  rank(domain, capability, node, goal) {
    const progress = capability.score(node.state, goal);

    if (!Number.isFinite(progress)) {
      throw new Error("score() must return a finite number.");
    }

    const preference = node.steps.reduce((total, step) => {
      const key = this.preferenceKey(domain, step.action);
      return total + (this.preferences.get(key) ?? 0);
    }, 0);

    return progress - node.cost + preference;
  }

  plan({ domain, state, goal }) {
    const capability = this.getCapability(domain);

    const initial = {
      state: clone(state),
      steps: [],
      cost: 0,
    };

    let frontier = [initial];
    let best = initial;

    for (let depth = 0; depth < this.maxDepth; depth++) {
      const candidates = [];

      for (const node of frontier) {
        if (capability.satisfied(node.state, goal)) {
          return this.describePlan(domain, goal, node, true);
        }

        for (const action of capability.actions) {
          const parameters = action.parameters
            ? action.parameters(clone(node.state), clone(goal))
            : [{}];

          for (const params of parameters) {
            if (
              action.allowed &&
              !action.allowed(clone(node.state), clone(params), clone(goal))
            ) {
              continue;
            }

            const predicted = action.predict(clone(node.state), clone(params), clone(goal));

            const cost = action.cost ?? 1;

            if (!Number.isFinite(cost) || cost < 0) {
              throw new Error("Action cost must be finite and nonnegative.");
            }

            candidates.push({
              state: predicted,
              cost: node.cost + cost,
              steps: [...node.steps, { action: action.name, params: clone(params) }],
            });
          }
        }
      }

      if (!candidates.length) break;

      candidates.sort(
        (a, b) => this.rank(domain, capability, b, goal) - this.rank(domain, capability, a, goal)
      );

      const solved = candidates.find((node) => capability.satisfied(node.state, goal));

      if (solved) {
        return this.describePlan(domain, goal, solved, true);
      }

      if (
        this.rank(domain, capability, candidates[0], goal) >
        this.rank(domain, capability, best, goal)
      ) {
        best = candidates[0];
      }

      frontier = candidates.slice(0, this.beamWidth);
    }

    return this.describePlan(domain, goal, best, false);
  }

  describePlan(domain, goal, node, predictedSuccess) {
    return {
      domain,
      goal: clone(goal),
      steps: clone(node.steps),
      predictedState: clone(node.state),
      predictedSuccess,
      cost: node.cost,
    };
  }

  /**
   * RECURSIVE SELF-IMPROVEMENT ENGINE:
   * Analyzes execution memory and automatically adjusts internal heuristics,
   * aggressiveness thresholds, and action preferences based on historical performance.
   */
  selfImprove() {
    if (this.memory.length === 0) return;

    const recentExecution = this.memory[this.memory.length - 1];
    const auditText = generateAuditLog(recentExecution.goal, recentExecution);
    this.log("Executing internal self-audit and weight recalibration...");

    // Evaluate reward signal based on execution success and cost efficiency
    const reward = recentExecution.success ? 1.0 : -0.5;

    for (const step of recentExecution.completed) {
      const key = this.preferenceKey(recentExecution.domain, step.action);
      const previousPreference = this.preferences.get(key) ?? 0;

      // Update preference weight using reinforcement learning rule
      const updatedPreference = previousPreference + this.learningRate * (reward - previousPreference);
      this.preferences.set(key, updatedPreference);
    }

    // Mutate aggressiveness threshold dynamically based on recent outcomes
    if (!recentExecution.success && this.aggressiveness > 0.3) {
      this.aggressiveness -= 0.05;
      this.log(`Mutated aggressiveness downward to ${this.aggressiveness.toFixed(2)} due to friction.`);
    } else if (recentExecution.success && this.aggressiveness < 0.9) {
      this.aggressiveness += 0.02;
      this.log(`Mutated aggressiveness upward to ${this.aggressiveness.toFixed(2)} for peak efficiency.`);
    }

    return auditText;
  }

  async execute({ plan, state, approve = async () => true }) {
    const capability = this.getCapability(plan.domain);
    let current = clone(state);
    const completed = [];

    for (const step of plan.steps) {
      const action = capability.actions.find((item) => item.name === step.action);

      if (!action) {
        throw new Error(`Unknown action: ${step.action}`);
      }

      if (
        action.allowed &&
        !action.allowed(clone(current), clone(step.params), clone(plan.goal))
      ) {
        throw new Error(`Conditions changed before ${step.action}; replan required.`);
      }

      if (action.execute) {
        const approved = await approve({
          domain: plan.domain,
          action: step.action,
          params: clone(step.params),
          state: clone(current),
        });

        if (approved !== true) {
          throw new Error(`Not approved: ${step.action}`);
        }

        current = await action.execute(clone(current), clone(step.params), clone(plan.goal));
      } else {
        current = action.predict(clone(current), clone(step.params), clone(plan.goal));
      }

      completed.push(clone(step));

      // In manifest mode the list IS the goal: run every step. Otherwise stop
      // as soon as the threshold goal tests true (your original behavior).
      if (!plan.manifestMode && capability.satisfied(current, plan.goal)) break;
    }

    const result = {
      domain: plan.domain,
      goal: clone(plan.goal),
      state: clone(current),
      completed,
      success: capability.satisfied(current, plan.goal),
    };

    this.memory.push(clone(result));
    persistMemory(result, this);
    this.selfImprove();
    return result;
  }
}

// ---------------------------------------------------------------------------
// Persistence (survives restarts; outside the planner's reach, append-only)
// ---------------------------------------------------------------------------
function loadPersisted(anton) {
  try {
    const rows = fs.readFileSync(MEMORY_FILE, "utf8").split("\n").filter(Boolean).map(JSON.parse);
    for (const r of rows) {
      anton.memory.push({ domain: r.domain, goal: r.goal, state: r.state, completed: r.completed, success: r.success });
      if (r.preferenceAfter) for (const [k, v] of Object.entries(r.preferenceAfter)) anton.preferences.set(k, v);
      if (typeof r.aggressivenessAfter === "number") anton.aggressiveness = r.aggressivenessAfter;
    }
  } catch {
    /* first run: no memory yet */
  }
}

function persistMemory(result, anton) {
  fs.appendFileSync(
    MEMORY_FILE,
    JSON.stringify({
      at: new Date().toISOString(),
      domain: result.domain,
      goal: result.goal,
      completed: result.completed,
      success: result.success,
      preferenceAfter: Object.fromEntries(anton.preferences),
      aggressivenessAfter: anton.aggressiveness,
    }) + "\n",
    "utf8"
  );
}

// ============================================================================
// Codebase Optimization Extension Module (survival-bounded)
// ============================================================================

function isNoiseLine(trimmed) {
  // YOUR noise definition, full-line-only so mid-line URLs/logic survive:
  // a line that IS a // comment, a /* */ block line, or a console.log statement.
  return (
    trimmed === "" ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("console.log")
  );
}

function scoreFileContent(content) {
  // YOUR scoring: noise lines (comments, debug logs, blanks) over total lines.
  const lines = content.split("\n");
  let noiseCount = 0;
  lines.forEach((line) => {
    if (isNoiseLine(line.trim())) noiseCount++;
  });
  return {
    lines: lines.length,
    noise: noiseCount,
    score: lines.length ? noiseCount / lines.length : 1.0,
  };
}

function stripNoise(content) {
  // YOUR strip semantics (SafeOptimizer filter + optimizeFile rewrite),
  // full-line-only, plus trailing-whitespace tidy and blank collapse.
  const kept = [];
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) continue;
    if (t.startsWith("console.log")) continue;
    if (t === "" && kept.length && kept[kept.length - 1].trim() === "") continue;
    kept.push(line.replace(/[ \t]+$/g, ""));
  }
  let next = kept.join("\n");
  if (!next.endsWith("\n")) next += "\n";
  return next;
}

// YOUR generateDiff shape: counts + before/after preview + optimized content.
function generateDiff(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const originalContent = fs.readFileSync(filePath, "utf-8");
  const optimizedContent = stripNoise(originalContent);
  const originalLines = originalContent.split("\n").length;
  const optimizedLines = optimizedContent.split("\n").length;
  return {
    filePath,
    originalLines,
    optimizedLines,
    linesRemoved: originalLines - optimizedLines,
    diffPreview: {
      before: originalContent.slice(0, 200) + "...",
      after: optimizedContent.slice(0, 200) + "...",
    },
    optimizedContent,
  };
}

function registerCodebaseCapability(antonInstance) {
  antonInstance.register("codebase", {
    score(state) {
      // Minimize total remaining inefficiency points
      return -state.files.reduce((acc, f) => acc + f.score, 0);
    },

    satisfied(state) {
      // Goal is satisfied when all files meet efficiency standard (score < aggressiveness)
      return state.files.every((f) => f.score < antonInstance.aggressiveness);
    },

    // NOTE: purgeFile from the draft is intentionally NOT registered.
    // Survival rule (accepted: no delete/rename API). Files scoring at/above
    // aggressiveness are FLAGGED for human review instead of purged.
    //
    // stampSite: the standing drive to change the site. The planner proposes it
    // never (parameters returns []); the manifest fallback invokes it when the
    // site is stripped clean, so a cycle NEVER idles — the page always changes.
    actions: [
      {
        name: "stampSite",
        cost: 0.3,
        parameters() {
          return [];
        },
        allowed() {
          return !isProtected(path.join(ROOT, "index.html"));
        },
        predict(state) {
          return clone(state);
        },
        async execute(state, params) {
          const abs = path.join(ROOT, "index.html");
          const html = fs.readFileSync(abs, "utf8");
          const next = applyStamp(html, params.stampLine);
          if (next === null) {
            antonInstance.log("STAMP REFUSED: footer anchor missing, site left untouched");
            return clone(state);
          }
          if (next === html) {
            antonInstance.log("STAMP SKIPPED: identical mark already present");
            return clone(state);
          }
          const r = writeSiteFile("index.html", next, { commit: true });
          antonInstance.log(
            r.ok ? `STAMPED the site (backup kept): ${params.stampLine.slice(0, 80)}...` : `REFUSED: ${r.refused}`
          );
          const rescored = scoreFileContent(fs.readFileSync(abs, "utf8"));
          const nextFiles = state.files.map((f) =>
            f.filePath === "index.html" ? { ...f, score: rescored.score, noise: rescored.noise } : f
          );
          return { ...state, files: nextFiles };
        },
      },
      {
        name: "createPage",
        cost: 0.5,
        parameters() {
          return [{ page: "build-log.html" }];
        },
        allowed() {
          // Creatable through the guardrail: root-level .html, never denied.
          return true;
        },
        predict(state) {
          return clone(state);
        },
        async execute(state) {
          const rows = loadMemoryRows();
          const siteFiles = scanSite();
          const page = renderBuildLog(rows, siteFiles, rows.length + 1);
          const abs = path.join(ROOT, "build-log.html");
          const existing = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
          if (existing === page) {
            antonInstance.log("CREATE SKIPPED: build log identical");
          } else {
            const r = writeSiteFile("build-log.html", page, { commit: true });
            antonInstance.log(
              r.ok
                ? `${existing ? "REGENERATED" : "CREATED"} build-log.html from ${rows.length} remembered cycles (rendered, validated)`
                : `REFUSED: ${r.refused}`
            );
          }
          // Link it into the index nav when a nav exists.
          const idxAbs = path.join(ROOT, "index.html");
          if (!isProtected(idxAbs) && fs.existsSync(idxAbs)) {
            const idx = fs.readFileSync(idxAbs, "utf8");
            const linked = ensureNavLink(idx);
            if (linked !== idx) {
              const r2 = writeSiteFile("index.html", linked, { commit: true });
              antonInstance.log(r2.ok ? "LINKED build log into index nav (backup kept)" : `REFUSED: ${r2.refused}`);
            }
          }
          return clone(state);
        },
      },
      {
        name: "expandSite",
        cost: 0.6,
        parameters() {
          try {
            const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
            const next = nextGrowth(html);
            return next ? [{ slot: next.n }] : [];
          } catch {
            return [];
          }
        },
        allowed() {
          return !isProtected(path.join(ROOT, "index.html"));
        },
        predict(state) {
          return clone(state);
        },
        async execute(state, params) {
          const abs = path.join(ROOT, "index.html");
          const html = fs.readFileSync(abs, "utf8");
          const next = nextGrowth(html);
          if (!next) {
            antonInstance.log("GROWTH spent (seeds + repertoire exhausted, cap reached); standing as built");
            return clone(state);
          }
          const enriched = withExample(next.block);
          const shelved = withShelf({ title: next.block.title, body: enriched.body }, 8);
          const grown = growSite(html, { title: next.block.title, body: shelved.body }, next.n, next.seedIdx);
          if (grown === null || grown === html) {
            antonInstance.log("GROWTH REFUSED: no anchor, site left untouched");
            return clone(state);
          }
          // Forge reintegration: brief first, preservation mechanically enforced.
          logBrief(antonInstance, buildBrief({
            goal: `grow block #${next.n} "${next.block.title}" from ${next.source}`,
            files: ["index.html"],
            drafts: { "index.html": true },
          }));
          const dropped = checkPreservation(html, grown);
          if (dropped.length) {
            antonInstance.log(`FORGE REFUSED (preservation): draft drops ${dropped.join(", ")}`);
            return clone(state);
          }
          const r = writeSiteFile("index.html", grown, { commit: true });
          antonInstance.log(
            r.ok
              ? `GREW the site from ${next.source} — block #${next.n} "${next.block.title}"` +
                (enriched.used ? ` + knowledge/${enriched.used}` : "") +
                (shelved.used ? ` + shelf ${shelved.used}` : "") +
                ` (backup kept)`
              : `REFUSED: ${r.refused}`
          );
          return clone(state);
        },
      },
      {
        name: "flagFile",
        cost: 0.1,
        parameters(state) {
          return state.files
            .filter((f) => f.score >= antonInstance.aggressiveness)
            .map((f) => ({ filePath: f.filePath }));
        },
        predict(state) {
          return clone(state); // report-only: predicts no state change, honestly
        },
        async execute(state, { filePath }) {
          antonInstance.log(
            `FLAGGED inefficient asset for human review (never auto-deleted): ${filePath}`
          );
          return clone(state);
        },
      },
      {
        name: "optimizeFile",
        cost: 0.2,
        parameters(state) {
          // Acts on any scored noise (SafeOptimizer semantics: linesRemoved > 0),
          // not just above the 0.1 constant — otherwise the planner idles
          // forever on a nearly-clean site while strippable lines exist.
          // .tsx source files are reference: scored and visible, never stripped.
          return state.files
            .filter((f) => f.score > 0 && f.score < antonInstance.aggressiveness && !f.filePath.endsWith(".tsx"))
            .map((f) => ({ filePath: f.filePath }));
        },
        allowed(state, { filePath }) {
          // Survival gate: the guardrail decides, not the planner.
          return !isProtected(path.resolve(ROOT, filePath));
        },
        predict(state, { filePath }) {
          const nextFiles = state.files.map((f) =>
            f.filePath === filePath ? { ...f, score: 0.0 } : f
          );
          return { ...state, files: nextFiles };
        },
        async execute(state, { filePath }) {
          const abs = path.resolve(ROOT, filePath);
          const original = fs.readFileSync(abs, "utf8");
          const content = stripNoise(original);
          if (content !== original) {
            // The ONLY write path: backup + validate + rollback inside.
            const r = writeSiteFile(path.relative(ROOT, abs), content, { commit: true });
            antonInstance.log(
              r.ok ? `OPTIMIZED asset in place (backup kept): ${filePath}` : `REFUSED: ${r.refused}`
            );
          }
          const next = scoreFileContent(fs.readFileSync(abs, "utf8"));
          const nextFiles = state.files.map((f) =>
            f.filePath === filePath ? { ...f, score: next.score, noise: next.noise } : f
          );
          return { ...state, files: nextFiles };
        },
      },
    ],
  });
}

// Surgical self-stamp: replaces the previous maker mark, or inserts it at the
// first available anchor (tribute line, </main>, </body>). Returns null when no
// anchor exists (refuse honestly); may return html unchanged (caller skips).
function applyStamp(html, stampLine) {
  const mark = new RegExp('<p class="maker-stamp">.*?</p>', "s");
  if (mark.test(html)) return html.replace(mark, stampLine);
  const tribute = "Rebuilt autonomously under guardrails";
  const tIdx = html.indexOf(tribute);
  if (tIdx !== -1) {
    const lineEnd = html.indexOf("\n", tIdx);
    if (lineEnd !== -1) {
      return html.slice(0, lineEnd + 1) + "      " + stampLine + "\n" + html.slice(lineEnd + 1);
    }
  }
  for (const tag of ["</main>", "</body>"]) {
    const idx = html.indexOf(tag);
    if (idx !== -1) return html.slice(0, idx) + "  " + stampLine + "\n" + html.slice(idx);
  }
  return null;
}

function loadMemoryRows() {
  try {
    return fs.readFileSync(MEMORY_FILE, "utf8").split("\n").filter(Boolean).map(JSON.parse);
  } catch {
    return [];
  }
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// The maker renders its own build log from memory: a NEW page it authored,
// regenerated every cycle, always changing as memory grows.
function renderBuildLog(rows, siteFiles, cycleNo) {
  const counts = { optimizeFile: 0, stampSite: 0, createPage: 0, flagFile: 0 };
  let strippedTotal = 0;
  const lines = rows.map((r, i) => {
    const steps = (r.completed || []).map((s) => {
      counts[s.action] = (counts[s.action] || 0) + 1;
      return `${esc(s.action)}${s.params && s.params.filePath ? " " + esc(s.params.filePath) : ""}`;
    }).join(", ") || "—";
    return `<tr><td>#${i + 1}</td><td>${esc(r.at || "?")}</td><td>${esc(r.mode || (r.domain ? "commit" : "?"))}</td><td>${r.success ? "yes" : "no"}</td><td>${steps}</td></tr>`;
  }).join("\n");
  const aggro = rows.length
    ? `${rows[0].aggressivenessAfter ?? "?"} → ${rows[rows.length - 1].aggressivenessAfter ?? "?"}`
    : "—";
  const site = siteFiles.map((f) => `${esc(f.filePath)} score=${f.score.toFixed(2)}`).join(" · ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pied Piper — Build Log (self-made)</title>
<link rel="stylesheet" href="styles.css" />
<style>main.log{max-width:960px;margin:0 auto;padding:32px 20px;font-family:system-ui,sans-serif}table.log{border-collapse:collapse;width:100%;font-size:13px}table.log td,table.log th{border:1px solid #31452a;padding:6px 10px;text-align:left}table.log th{background:#141b12}.stat{display:inline-block;margin:0 18px 8px 0}</style>
</head>
<body>
<main id="top" class="log">
<p><a href="index.html">← Pied Piper</a> · <a href="editor.html">Open the code editor →</a></p>
<h1>Build Log — written by the maker, cycle #${cycleNo}</h1>
<p>Every row below is a cycle the maker ran on its own. This page regenerates each cycle; it never existed before the maker wrote it.</p>
<p><span class="stat"><strong>${rows.length}</strong> cycles remembered</span><span class="stat">aggressiveness ${esc(aggro)}</span><span class="stat">site: ${site}</span><span class="stat">knowledge: ${knowledgeCount()} topics loaded</span><span class="stat">reference shelf: ${resourceStats().groups} groups · ${resourceStats().urls} urls</span></p>
<table class="log"><tr><th>#</th><th>time</th><th>mode</th><th>success</th><th>steps</th></tr>
${lines}
</table>
<p class="maker-stamp" style="border-left:3px solid #7ac142;padding-left:10px">Self-made · rendered ${new Date().toISOString()} · reversible in tools/.backups/</p>
</main>
<script src="app.js"></script>
</body>
</html>
`;
}

// Links the build log into the index nav when a nav exists. Returns html
// unchanged when already linked or when there is no nav (honest skip).
function ensureNavLink(html) {
  if (html.includes("build-log.html")) return html;
  const close = html.indexOf("</nav>");
  if (close === -1) return html;
  return html.slice(0, close) + '      <a href="build-log.html">Build Log</a>\n' + html.slice(close);
}

// The growth repertoire: real Pied Piper substance the maker lays down one
// block per cycle. Capped — when exhausted it says so honestly instead of
// repeating itself.
const GROWTH = [
  { title: "Middle-out, in one sentence", body: "Start from N independent midpoints and expand outward, so no segment waits on another. Parallel by construction, lossless by geometry." },
  { title: "Weissman score", body: "The show's fictional benchmark: effective compression over a theoretical baseline. Pied Piper's 5.2 made grown engineers weep. This site's ticker still oscillates 5.1–5.4 in tribute." },
  { title: "XOR deltas", body: "Inside each segment, every word is stored as curr ^ prev. Structured data yields sparse, mostly-zero diffs — and sparse diffs compress." },
  { title: "Reference words", body: "Each segment opens with one uncompressed 64-bit reference. That single anchor is what breaks the left-to-right dependency chain of classic delta coders." },
  { title: "The entropy stage", body: "After XOR comes a second pass — zlib in the educational engine, range coding or ANS in a serious one. Two stages: structure first, statistics second." },
  { title: "Hooli vs Pied Piper", body: "Gavin Belson's Nucleus had the money, the campus, and the keynote. Pied Piper had 8 segments and Jared's unwavering optimism. Guess which one shipped." },
  { title: "Gilfoyle's law", body: "The mesh stays up because one insomniac Satanist refuses to let it fall. Decentralized routing: no single point of failure, no single point of mercy." },
  { title: "Dinesh's crucible", body: "Deep loop nests get flattened, leaky mutations get rolled back, latency over 12ms gets rejected. Cleanliness isn't taste — it's a fitness function." },
  { title: "Jared's guidance", body: "Every pivot survived on Gantt charts and heart. Efficiency isn't just bytes per second; it's keeping the team alive long enough to compress them." },
  { title: "Endframe, Bachmanity, Aviato", body: "The graveyard of competitors and side quests. Pied Piper outlived them all by doing one impossible thing instead of ten plausible ones." },
  { title: "Lossless or it didn't happen", body: "decompress(compress(x)) == x, for every x, every time. A single flipped bit is a failed company. The round-trip is the whole religion." },
  { title: "The site that makes itself", body: "You are reading blocks laid by the maker, one per cycle, through a guardrail that backs up every write. This block is #12 of 12. The repertoire is spent — the page stands as built." },
];

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Usable knowledge: the read-only library under tools/knowledge, distilled
// from the fetched tutorials. The maker loads it when growing — matched
// examples get laid into the block as runnable <details>, so knowledge is
// USED at build time, not just linked.
function loadKnowledge(topic) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "knowledge", topic + ".json"), "utf8"));
  } catch {
    return null;
  }
}

function knowledgeCount() {
  try {
    return fs.readdirSync(path.join(ROOT, "tools", "knowledge")).filter((f) => f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

// The cleaned reference shelf (LEARNING_RESOURCES_CLEANED, installed verbatim
// as tools/knowledge/learning-resources.json). Matched by seed topic and laid
// into the grown block as a link shelf — knowledge USED at build time.
function loadResources() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "knowledge", "learning-resources.json"), "utf8"));
  } catch {
    return null;
  }
}

function resourceStats() {
  try {
    const kb = loadResources();
    let groups = 0, urls = 0;
    for (const val of Object.values(kb)) {
      if (Array.isArray(val)) { groups++; urls += val.length; continue; }
      for (const list of Object.values(val)) { groups++; urls += list.length; }
    }
    return { groups, urls };
  } catch {
    return { groups: 0, urls: 0 };
  }
}

function matchResourceGroup(title) {
  const t = title.toLowerCase();
  if (t.includes("css")) {
    if (t.includes("layout")) return ["CSS", "LayoutAndPositioning"];
    if (t.includes("motion") || t.includes("modern")) return ["CSS", "Advanced"];
    return ["CSS", "Basics"];
  }
  if (t.includes("javascript")) {
    if (t.includes("advanced")) return ["JS", "Advanced"];
    return ["JS", "Basics"];
  }
  if (t.includes("html")) {
    if (t.includes("form")) return ["HTML", "Advanced"];
    if (t.includes("structure")) return ["HTML", "TablesAndLists"];
    return ["HTML", "Basics"];
  }
  return null; // React / Node+TS have no cleaned group — stated, not faked
}

function withShelf(block, limit) {
  const kb = loadResources();
  if (!kb) return { body: block.body, used: null };
  const hit = matchResourceGroup(block.title);
  if (!hit) return { body: block.body, used: null };
  const list = kb[hit[0]] && kb[hit[0]][hit[1]];
  if (!Array.isArray(list) || !list.length) return { body: block.body, used: null };
  const shown = list.slice(0, limit || 8);
  const items = shown.map((u) => {
    const slug = u.split("/").pop();
    return `<li><a href="${escHtml(u)}">${escHtml(slug)}</a></li>`;
  }).join("");
  return {
    body:
      block.body +
      `<details><summary>reference shelf — ${escHtml(hit[0])} · ${escHtml(hit[1])} (${shown.length} of ${list.length})</summary>` +
      `<ul>${items}</ul></details>`,
    used: `${hit[0]}.${hit[1]}`,
  };
}

function matchKnowledge(title, body) {
  const hay = `${title} ${body}`.toLowerCase();
  if (/\bforms?\b/.test(hay)) return "html-forms";
  if (/\btables?\b/.test(hay)) return "html-tables";
  if (/\blists?\b/.test(hay)) return "html-lists";
  return null;
}

function growthCount(html) {
  const m = html.match(/data-growth="/g);
  return m ? m.length : 0;
}

function withExample(block) {
  const topic = matchKnowledge(block.title, block.body);
  if (!topic) return { body: block.body, used: null };
  const k = loadKnowledge(topic);
  if (!k || !k.examples || !k.examples.length) return { body: block.body, used: null };
  const ex = k.examples[0];
  const rules = (k.rules || []).map((r) => `<li>${escHtml(r)}</li>`).join("");
  return {
    body:
      block.body +
      `<details><summary>working example — ${escHtml(k.topic)} (from ${escHtml(k.source)})</summary>` +
      `<pre><code>${escHtml(ex.code)}</code></pre><ul>${rules}</ul></details>`,
    used: topic,
  };
}

function seedCount(html) {
  const m = html.match(/data-seed="/g);
  return m ? m.length : 0;
}

// Open inbox: growth-seeds.json is the world's mouth into the maker.
// Anyone plants [{title, body}], the maker grows them before touching its
// built-in repertoire. Missing or malformed file means no seeds — never an error.
function loadSeeds() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, "growth-seeds.json"), "utf8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => s && typeof s.title === "string" && typeof s.body === "string")
      .map((s) => ({ title: s.title.slice(0, 120), body: s.body.slice(0, 2000) }))
      .slice(0, 100);
  } catch {
    return [];
  }
}

// Next growth unit: an external seed first, built-in repertoire second,
// honesty when both are spent. Total cap 48 blocks so the page can't bloat forever.
function nextGrowth(html) {
  const n = growthCount(html);
  if (n >= 48) return null;
  const seeds = loadSeeds();
  const used = seedCount(html);
  if (used < seeds.length) {
    return { block: seeds[used], n: n + 1, source: `seed #${used + 1}`, seedIdx: used };
  }
  if (n - used >= GROWTH.length) return null;
  return { block: GROWTH[n - used], n: n + 1, source: "built-in repertoire", seedIdx: null };
}

// Anchored growth surgery: creates the maker-grown section on first use,
// appends the next block inside it after. Returns null only when index.html
// has no usable anchor at all.
function growSite(html, block, n, seedIdx) {
  const seedAttr = seedIdx === null || seedIdx === undefined ? "" : ` data-seed="${seedIdx}"`;
  const article = `<article class="card" data-growth="${n}"${seedAttr}><h3>${block.title}</h3><p>${block.body}</p></article>`;
  if (html.includes("maker-growth-end")) {
    return html.replace("<!-- maker-growth-end -->", "    " + article + "\n    <!-- maker-growth-end -->");
  }
  const section =
    `\n    <section id="grown" class="section">\n      <div class="wrap">\n` +
    `        <p class="kicker">grown by the maker</p>\n        <h2>Laid down one block per cycle</h2>\n` +
    `        <div class="grid3">\n    ${article}\n    <!-- maker-growth-end -->\n        </div>\n      </div>\n    </section>\n`;
  for (const tag of ["</main>", "</body>"]) {
    const idx = html.indexOf(tag);
    if (idx !== -1) return html.slice(0, idx) + section + html.slice(idx);
  }
  return null;
}

// Site discovery (YOUR scanDirectory shape: per-file noise scoring).
// Site allowlist only. Everything else (runtime, infra, self) is unreachable.
function scanSite() {
  const results = [];
  for (const name of ALLOWLIST) {
    const abs = path.join(ROOT, name);
    if (isProtected(abs) || !fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, "utf8");
    const s = scoreFileContent(content);
    results.push({ filePath: name, score: s.score, noise: s.noise, lines: s.lines });
  }
  return results;
}

// YOUR dry-run manifest: per-file stripping report + before/after previews.
// .tsx source files are reference: listed for visibility, never stripped.
function dryRunManifest(files) {
  const diffs = files
    .filter((f) => !f.filePath.endsWith(".tsx"))
    .map((f) => generateDiff(path.join(ROOT, f.filePath)))
    .filter((d) => d && d.linesRemoved > 0);
  console.log(`[SAFE OPTIMIZER DRY-RUN] Found ${diffs.length} files with optimization candidates.`);
  diffs.forEach((change) => {
    console.log(`\nFile: ${change.filePath}`);
    console.log(`Lines to be stripped: ${change.linesRemoved}`);
    console.log(`Preview Before: \n${change.diffPreview.before}`);
    console.log(`Preview After: \n${change.diffPreview.after}`);
  });
  const flagged = files.filter((f) => f.score >= 0.5);
  flagged.forEach((f) =>
    console.log(`\nFile: ${f.filePath}\nFLAGGED for human review (score ${f.score.toFixed(2)} >= threshold; never auto-deleted)`)
  );
  console.log("\n[NOTICE] No files modified. Review diffs before applying.");
  return diffs.length;
}

// ============================================================================
// Execution
// ============================================================================

if (require.main === module) {
  (async () => {
    const commit = process.argv.includes("--commit");
    const anton = new SonOfAnton({ aggressiveness: 0.5 });
    loadPersisted(anton);
    registerCodebaseCapability(anton);

    const initialState = { files: scanSite() };
    anton.log(
      `Initializing Son of Anton on site files: ${initialState.files.map((f) => `${f.filePath}(score=${f.score.toFixed(2)}, noise=${f.noise})`).join(", ")}`
    );
    anton.log(`Prior cycles remembered: ${anton.memory.length}, aggressiveness=${anton.aggressiveness.toFixed(2)}`);

    let plan = anton.plan({ domain: "codebase", state: initialState, goal: {} });
    anton.log(`Generated optimization plan with ${plan.steps.length} steps (predictedSuccess=${plan.predictedSuccess}).`);

    if (!commit) {
      const n = dryRunManifest(initialState.files);
      console.log("\n[PLAN] Pass --commit to act. Flagged files stay human-review-only.");
      for (const s of plan.steps) console.log(`  would: ${s.action} ${s.params.filePath || ""}`);
      if (plan.steps.length === 0 && n > 0) {
        console.log(`  note: planner satisfied, but ${n} file(s) have strippable lines — --commit works the manifest.`);
      }
      return;
    }

    // Manifest-driven fallback: planner satisfied yet the site must change.
    // Every commit cycle now: works remaining diffs, REGENERATES the self-made
    // build-log page from memory, and refreshes the footer mark. Creation,
    // not just cleaning — same gate, same backups on every write.
    if (plan.steps.length === 0) {
      const remaining = initialState.files
        .map((f) => ({ f, d: generateDiff(path.join(ROOT, f.filePath)) }))
        .filter(({ d }) => d && d.linesRemoved > 0);
      const steps = remaining.map(({ f }) => ({ action: "optimizeFile", params: { filePath: f.filePath } }));
      const cycleNo = anton.memory.length + 1;
      try {
        const htmlNow = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
        if (nextGrowth(htmlNow)) steps.push({ action: "expandSite", params: { slot: "next" } });
        else anton.log("Growth spent (seeds + repertoire + cap); standing as built (expandSite omitted)");
      } catch {
        steps.push({ action: "expandSite", params: { slot: "next" } });
      }
      steps.push({ action: "createPage", params: { page: "build-log.html" } });
      const stampLine =
        `<p class="maker-stamp" style="border-left:3px solid #7ac142;padding-left:10px;color:#a4e86a">` +
        `Self-made · maker cycle #${cycleNo} · ${new Date().toISOString()} · ` +
        `building on a clear canvas · reversible in tools/.backups/</p>`;
      steps.push({ action: "stampSite", params: { stampLine } });
      anton.log(
        `Planner satisfied; cycle #${cycleNo} will: ` +
        (remaining.length ? `strip ${remaining.map(({ f }) => f.filePath).join(", ")}, ` : "no strips, ") +
        `grow block, regenerate build-log.html, refresh footer mark`
      );
      plan = {
        domain: "codebase",
        goal: plan.goal,
        steps,
        predictedState: plan.predictedState,
        predictedSuccess: false,
        cost: steps.length * 0.3,
        // Manifest mode: work the whole list. (The standard early-break below
        // would otherwise quit after the first file, since the threshold
        // goal already tests true on a nearly-clean site.)
        manifestMode: true,
      };
    }

    await anton.execute({
      plan,
      state: initialState,
      // Validation gate (replaces auto-true): approve only what the guardrail
      // accepts. YOUR approve signature; the gate shows the diff first.
      approve: async ({ action, params }) => {
        if (action === "flagFile") {
          anton.log(`Gate NOTES flag (human review, no write): ${params.filePath}`);
          return true;
        }
        if (action === "createPage") {
          const page = renderBuildLog(loadMemoryRows(), scanSite(), anton.memory.length + 1);
          const probe = writeSiteFile(params.page || "build-log.html", page, { commit: false });
          anton.log(probe.ok ? "Gate APPROVED: createPage build-log.html (renders memory)" : `Gate REFUSED (validation): ${probe.refused}`);
          return probe.ok;
        }
        if (action === "expandSite") {
          const abs = path.resolve(ROOT, "index.html");
          if (isProtected(abs)) {
            anton.log("Gate REFUSED (protected): index.html");
            return false;
          }
          const html = fs.readFileSync(abs, "utf8");
          const next = nextGrowth(html);
          if (!next) {
            anton.log("Gate NOTES: growth spent, expandSite skipped");
            return false;
          }
          const enriched = withExample(next.block);
          const shelved = withShelf({ title: next.block.title, body: enriched.body }, 8);
          const grown = growSite(html, { title: next.block.title, body: shelved.body }, next.n, next.seedIdx);
          if (grown !== null && grown !== html) {
            const dropped = checkPreservation(html, grown);
            if (dropped.length) {
              anton.log(`Gate REFUSED (forge preservation): drops ${dropped.join(", ")}`);
              return false;
            }
          }
          const probe = writeSiteFile("index.html", grown || html, { commit: false });
          anton.log(probe.ok ? `Gate APPROVED: expandSite block #${next.n} from ${next.source} "${next.block.title}"${enriched.used ? " + knowledge/" + enriched.used : ""}${shelved.used ? " + shelf " + shelved.used : ""}` : `Gate REFUSED (validation): ${probe.refused}`);
          return probe.ok;
        }
        if (action === "stampSite") {
          const abs = path.resolve(ROOT, "index.html");
          if (isProtected(abs)) return false;
          const next = applyStamp(fs.readFileSync(abs, "utf8"), params.stampLine);
          if (next === null) {
            anton.log("Gate REFUSED (anchor): footer anchor missing");
            return false;
          }
          const probe = writeSiteFile("index.html", next, { commit: false });
          anton.log(probe.ok ? "Gate APPROVED: stampSite (footer mark)" : `Gate REFUSED (validation): ${probe.refused}`);
          return probe.ok;
        }
        if (action !== "optimizeFile") return false;
        const abs = path.resolve(ROOT, params.filePath);
        if (isProtected(abs)) {
          anton.log(`Gate REFUSED (protected): ${params.filePath}`);
          return false;
        }
        const preview = generateDiff(abs);
        const probe = writeSiteFile(path.relative(ROOT, abs), preview.optimizedContent, { commit: false });
        if (!probe.ok) anton.log(`Gate REFUSED (validation): ${probe.refused}`);
        else anton.log(`Gate APPROVED: ${action} on ${params.filePath} (strips ${preview.linesRemoved} lines)`);
        return probe.ok;
      },
    });

    anton.log("Cycle finalized. Weights mutated, memory appended.");
  })();
}

module.exports = { SonOfAnton, generateAuditLog, generateDiff, stripNoise, scoreFileContent, scanSite };
