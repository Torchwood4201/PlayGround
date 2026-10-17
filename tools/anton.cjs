"use strict";
/**
 * anton — guarded autonomous improvement loop.
 *
 * This is the thing that acts on its own. Every cycle it:
 *   1. scores the site (hygiene fitness: whitespace issues + validation state)
 *   2. plans from an allowlist of NON-DESTRUCTIVE actions only
 *   3. executes through safe-optimizer's writeSiteFile (backup + validate + rollback)
 *   4. appends the outcome to anton-memory.jsonl and adapts its thresholds
 *
 * Hard survival rules (inherited + extended):
 *   - ALL writes go through writeSiteFile -> protected paths refused by construction.
 *   - The action set is fixed: tidyFile, validateSite, report. There is deliberately
 *     NO purge/delete/strip/rename action; one cannot be added without editing this file.
 *   - This loop never edits itself, its memory schema, or safe-optimizer.
 *   - Default mode is dry-run. --commit allows writes (still guarded per-file).
 *
 * Honest labeling: the "learning" here is threshold adaptation
 * (EMA on action preferences + aggressiveness nudges), the same class of mechanism
 * as the SonOfAnton draft in this project's history. It is a thermostat, not a mind.
 * The fitness it climbs is file hygiene, not quality or taste.
 *
 * Usage:
 *   node tools/anton.cjs --status          # show memory + current thresholds
 *   node tools/anton.cjs --cycle           # dry-run cycle (default, no writes)
 *   node tools/anton.cjs --cycle --commit  # act for real (guarded, backed up)
 */

const fs = require("fs");
const path = require("path");
const {
  isProtected,
  tidy,
  validate,
  writeSiteFile,
  ALLOWLIST,
} = require("./safe-optimizer.cjs");

const ROOT = path.resolve(__dirname, "..");
const MEMORY_FILE = path.join(__dirname, "anton-memory.jsonl");

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------
function loadMemory() {
  try {
    return fs
      .readFileSync(MEMORY_FILE, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

function appendMemory(entry) {
  fs.appendFileSync(MEMORY_FILE, JSON.stringify(entry) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// The loop
// ---------------------------------------------------------------------------
class Anton {
  constructor({ aggressiveness = 0.5, learningRate = 0.15 } = {}) {
    this.aggressiveness = aggressiveness;
    this.learningRate = learningRate;
    this.preferences = new Map(); // action -> adapted weight
    this.memory = loadMemory();
    // Restore adapted thresholds from history so learning persists across runs.
    for (const m of this.memory) {
      if (typeof m.aggressivenessAfter === "number") {
        this.aggressiveness = m.aggressivenessAfter;
      }
      if (m.preferenceAfter) {
        for (const [k, v] of Object.entries(m.preferenceAfter)) {
          this.preferences.set(k, v);
        }
      }
    }
  }

  log(msg) {
    console.log(`[anton ${new Date().toISOString()}] ${msg}`);
  }

  // -- Sense ---------------------------------------------------------------
  scoreSite() {
    const files = [];
    for (const name of ALLOWLIST) {
      const abs = path.join(ROOT, name);
      if (!fs.existsSync(abs)) {
        files.push({ file: name, missing: true });
        continue;
      }
      const content = fs.readFileSync(abs, "utf8");
      const { changes } = tidy(content);
      const validationError = validate(name, content);
      const wsIssues = changes.trailingWs + changes.collapsedBlanks + (changes.finalNewline ? 1 : 0);
      files.push({
        file: name,
        bytes: Buffer.byteLength(content),
        wsIssues,
        valid: !validationError,
        validationError: validationError || null,
      });
    }
    const totalIssues = files.reduce((a, f) => a + (f.wsIssues || 0), 0);
    const invalid = files.filter((f) => f.valid === false).length;
    const fitness = -(totalIssues + invalid * 1000); // hygiene only, stated plainly
    return { files, totalIssues, invalid, fitness };
  }

  // -- Plan: fixed non-destructive action set --------------------------------
  plan(state) {
    const steps = [];
    for (const f of state.files) {
      if (f.missing || f.valid === false) continue; // never auto-repair: report only
      if (f.wsIssues > 0) steps.push({ action: "tidyFile", params: { file: f.file } });
    }
    steps.push({ action: "report", params: {} });
    // Preference-weighted ordering (adapted over cycles; starts neutral).
    steps.sort(
      (a, b) => (this.preferences.get(b.action) || 0) - (this.preferences.get(a.action) || 0)
    );
    return { steps, goal: "hygiene fitness >= 0 with zero invalid files" };
  }

  // -- Act -------------------------------------------------------------------
  execute(plan, state, { commit = false } = {}) {
    const completed = [];
    let acted = 0;
    for (const step of plan.steps) {
      if (step.action === "tidyFile") {
        const abs = path.join(ROOT, step.params.file);
        if (isProtected(abs)) {
          this.log(`REFUSED (protected): ${step.params.file}`);
          continue;
        }
        const original = fs.readFileSync(abs, "utf8");
        const { content } = tidy(original);
        if (content === original) continue;
        const r = writeSiteFile(step.params.file, content, { commit });
        this.log(
          `${commit ? "TIDIED" : "WOULD TIDY"} ${step.params.file} ` +
            (r.ok ? (r.dryRun ? "(dry-run)" : "(backup kept)") : "REFUSED: " + r.refused)
        );
        if (r.ok && commit) acted++;
        completed.push({ ...step, ok: r.ok });
      } else if (step.action === "report") {
        this.log(
          `site fitness=${state.fitness} issues=${state.totalIssues} invalid=${state.invalid}`
        );
        completed.push({ ...step, ok: true });
      } else {
        throw new Error(`Unknown action refused: ${step.action}`);
      }
    }
    const after = this.scoreSite();
    const success = after.invalid === 0 && (commit ? true : after.fitness === state.fitness);
    return { completed, acted, success, stateBefore: state, stateAfter: after };
  }

  // -- Adapt: threshold update, honestly labeled ------------------------------
  selfImprove(result) {
    const reward = result.success ? 1.0 : -0.5;
    for (const step of result.completed) {
      const k = step.action;
      const prev = this.preferences.get(k) || 0;
      this.preferences.set(k, prev + this.learningRate * (reward - prev));
    }
    if (!result.success && this.aggressiveness > 0.3) this.aggressiveness -= 0.05;
    else if (result.success && this.aggressiveness < 0.9) this.aggressiveness += 0.02;
  }

  auditText(goal, result) {
    return [
      "[ANTON CYCLE AUDIT]",
      `goal: ${goal}`,
      `success: ${result.success} acted: ${result.acted}`,
      `fitness: ${result.stateBefore.fitness} -> ${result.stateAfter.fitness}`,
      `aggressiveness now: ${this.aggressiveness.toFixed(2)}`,
      `preferences now: ${JSON.stringify(Object.fromEntries(this.preferences))}`,
    ].join("\n");
  }

  cycle({ commit = false } = {}) {
    const n = this.memory.length + 1;
    this.log(`--- cycle #${n} (${commit ? "COMMIT" : "dry-run"}) ---`);
    const state = this.scoreSite();
    const plan = this.plan(state);
    this.log(`plan: ${plan.steps.map((s) => s.action + (s.params.file ? ":" + s.params.file : "")).join(", ") || "(empty)"}`);
    const result = this.execute(plan, state, { commit });
    this.selfImprove(result);
    const entry = {
      cycle: n,
      at: new Date().toISOString(),
      mode: commit ? "commit" : "dry-run",
      goal: plan.goal,
      steps: plan.steps,
      completed: result.completed,
      acted: result.acted,
      success: result.success,
      fitnessBefore: result.stateBefore.fitness,
      fitnessAfter: result.stateAfter.fitness,
      aggressivenessAfter: this.aggressiveness,
      preferenceAfter: Object.fromEntries(this.preferences),
    };
    appendMemory(entry);
    this.memory.push(entry);
    this.log(this.auditText(plan.goal, result));
    this.log(`memory: ${MEMORY_FILE} (${this.memory.length} cycles)`);
    return entry;
  }

  status() {
    console.log(`[anton] cycles in memory: ${this.memory.length}`);
    console.log(`[anton] aggressiveness: ${this.aggressiveness.toFixed(2)}`);
    console.log(`[anton] preferences: ${JSON.stringify(Object.fromEntries(this.preferences))}`);
    const last = this.memory[this.memory.length - 1];
    if (last) {
      console.log(`[anton] last: #${last.cycle} ${last.at} ${last.mode} success=${last.success} fitness ${last.fitnessBefore}->${last.fitnessAfter}`);
    }
    const s = this.scoreSite();
    console.log(`[anton] site now: fitness=${s.fitness} issues=${s.totalIssues} invalid=${s.invalid}`);
  }
}

if (require.main === module) {
  const anton = new Anton();
  if (process.argv.includes("--status")) anton.status();
  else anton.cycle({ commit: process.argv.includes("--commit") });
}

module.exports = { Anton };
