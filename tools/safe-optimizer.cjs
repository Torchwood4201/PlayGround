"use strict";
/**
 * SafeOptimizer — guarded site improver with full-rebuild rights.
 *
 * USER CONTRACT: "do what it wants with this site, even an entire new site,
 * as long as it never kills itself."
 *
 *   NEVER touches (hard denylist, enforced on EVERY write path):
 *     - start.sh, startup.sh, capture.sh          (process lifecycle)
 *     - .git/, .github/, .opencode/, .agents/     (infra / deploy / agent config)
 *     - node_modules/, package.json, package-lock.json
 *     - README.md, Agents.md                      (OMGithub-managed docs)
 *     - assets/** (binary images — never text-process)
 *     - tools/safe-optimizer.cjs itself + tools/.backups/**
 *
 *   MAY fully rewrite (arbitrary content, not just whitespace):
 *     - index.html, styles.css, app.js
 *     - NEW files in repo root ending .html/.css/.js (never a deny-listed name)
 *
 *   There is NO delete/rename API at all. Nothing can be removed, only
 *   written (with backup) or created.
 *
 *   Every write goes through writeSiteFile():
 *     1. isProtected() check -> refuse protected targets
 *     2. validate() content check -> refuse invalid content
 *     3. backup existing file to tools/.backups/<ISO-timestamp>/
 *     4. write, re-read from disk, re-validate -> rollback on failure
 *
 *   MAY still do whitespace tidy via --apply (non-semantic only).
 *   NEVER auto-strips comments / console.log / TODOs in tidy mode.
 *
 * Usage:
 *   node tools/safe-optimizer.cjs                  # dry-run tidy report
 *   node tools/safe-optimizer.cjs --apply          # whitespace tidy (guarded)
 *   const { writeSiteFile } = require("./tools/safe-optimizer.cjs");
 *   writeSiteFile("index.html", "<!DOCTYPE html>...", { commit: true });
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

// Site files the maker may fully rewrite. Maker-made pages (build log,
// editor) join the allowlist once created so they stay regenerable.
// growth-seeds.json joins too: the inbox must stay writable or nothing new
// can ever be planted. Everything else remains off-limits.
const ALLOWLIST = new Set(["index.html", "styles.css", "app.js", "build-log.html", "editor.html", "growth-seeds.json"]);

// New files it may create (repo root only, safe web extensions, never a denied name).
// .tsx/.ts included: the maker's own workstation component is TypeScript.
// .json/.txt included: the growth-seeds inbox is JSON (package.json stays
// denied by exact name, so this opens nothing sensitive).
const CREATABLE_EXTS = new Set([".html", ".css", ".js", ".tsx", ".ts", ".json", ".txt"]);

// Infra / runtime paths that must never be touched, even if requested.
const DENY_PREFIXES = [
  ".git", ".github", ".opencode", ".agents",
  "node_modules", "assets", "tools/.backups",
];
const DENY_FILES = new Set([
  "start.sh", "startup.sh", "capture.sh",
  "package.json", "package-lock.json",
  "README.md", "Agents.md",
  "tools/safe-optimizer.cjs", "tools\\safe-optimizer.cjs",
]);

function rel(p) {
  return path.relative(ROOT, path.resolve(p)).replace(/\\/g, "/");
}

function isProtected(targetPath, allowNew = false) {
  const r = rel(targetPath);
  if (r.startsWith("..") || path.isAbsolute(r)) return true; // outside repo
  if (DENY_FILES.has(r)) return true;
  if (r === "tools/safe-optimizer.cjs") return true;
  for (const prefix of DENY_PREFIXES) {
    if (r === prefix || r.startsWith(prefix + "/")) return true;
  }
  // allowlist-only for existing paths; new-file creation is gated separately
  // in writeSiteFile (root-level + safe extension + never a denied name).
  if (allowNew) return false;
  return !ALLOWLIST.has(r); // allowlist-only: anything not listed is protected
}

function analyzeNoise(content) {
  const lines = content.split("\n");
  let commentLines = 0, logLines = 0, todoLines = 0, blankLines = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t === "") blankLines++;
    if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) commentLines++;
    if (t.includes("console.log")) logLines++;
    if (/TODO|FIXME|XXX/i.test(t)) todoLines++;
  }
  return { total: lines.length, commentLines, logLines, todoLines, blankLines };
}

// Non-semantic tidy only. Returns { content, changes }.
function tidy(content) {
  const changes = { trailingWs: 0, collapsedBlanks: 0, finalNewline: false };
  let lines = content.split("\n").map((l) => {
    const trimmed = l.replace(/[ \t]+$/g, "");
    if (trimmed !== l) changes.trailingWs++;
    return trimmed;
  });
  // Collapse 3+ blank lines -> 1 blank line (keeps intentional spacing).
  const out = [];
  let blanks = 0;
  for (const l of lines) {
    if (l.trim() === "") {
      blanks++;
      if (blanks <= 2) out.push(l); // allow up to 1 blank line (2 \n in a row)
      else changes.collapsedBlanks++;
    } else {
      blanks = 0;
      out.push(l);
    }
  }
  let next = out.join("\n");
  if (!next.endsWith("\n")) {
    next += "\n";
    changes.finalNewline = true;
  } else if (next.endsWith("\n\n")) {
    next = next.replace(/\n+$/, "\n");
    changes.finalNewline = true;
  }
  return { content: next, changes };
}

function validate(relPath, content) {
  if (typeof content !== "string" || content.length === 0) {
    return `${relPath}: refusing empty write`;
  }
  if (relPath.endsWith(".html") || relPath === "index.html") {
    if (!content.includes("<!DOCTYPE") || !content.includes("</html>")) {
      return "html missing DOCTYPE or </html>";
    }
  }
  if (relPath.endsWith(".css") || relPath === "styles.css") {
    const open = (content.match(/{/g) || []).length;
    const close = (content.match(/}/g) || []).length;
    if (open === 0 || open !== close) return `css unbalanced braces {${open} }${close}`;
  }
  if (relPath.endsWith(".js") || relPath === "app.js") {
    const tmp = path.join(ROOT, "tools", ".backups", ".validate-tmp.js");
    try {
      fs.writeFileSync(tmp, content, "utf8");
      execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
    } catch (e) {
      return `js fails node --check: ${String(e.message).split("\n")[0]}`;
    } finally {
      try { fs.unlinkSync(tmp); } catch {}
    }
  }
  // Deploy contract: the site entry point must always exist.
  if (relPath === "index.html" && content.trim().length < 100) {
    return "index.html suspiciously small — refusing";
  }
  return null;
}

/**
 * Guarded full-rewrite writer. The ONLY way the optimizer may change site
 * content beyond whitespace tidy. Pass { commit: false } for a validated
 * dry-run that writes nothing.
 *
 * Returns { ok, refused?, backedUp?, rolledBack? } and never throws on
 * refusal — refusals are return values so an autonomous loop can't crash
 * its way around the guardrail.
 */
function writeSiteFile(target, content, { commit = false } = {}) {
  const abs = path.resolve(ROOT, target);
  const r = rel(abs);
  const isNew = !fs.existsSync(abs);
  if (isNew) {
    // New files: deny lists absolute, then root-level + safe extension only.
    if (isProtected(abs, true)) return { ok: false, refused: `PROTECTED: ${r} — write refused` };
    const dir = path.dirname(r);
    if (dir !== ".") return { ok: false, refused: `new files must live in repo root (got ${r})` };
    if (![...CREATABLE_EXTS].some((ext) => r.endsWith(ext))) {
      return { ok: false, refused: `new files must end ${[...CREATABLE_EXTS].join("/")} (got ${r})` };
    }
  } else if (isProtected(abs)) {
    return { ok: false, refused: `PROTECTED: ${r} — write refused` };
  }
  const err = validate(r, content);
  if (err) return { ok: false, refused: `VALIDATION: ${err}` };
  if (!commit) return { ok: true, refused: null, dryRun: true };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(ROOT, "tools", ".backups", stamp);
  fs.mkdirSync(backupDir, { recursive: true });
  let backedUp = false;
  if (!isNew) {
    fs.copyFileSync(abs, path.join(backupDir, path.basename(r) + ".bak"));
    backedUp = true;
  }
  fs.writeFileSync(abs, content, "utf8");
  const onDisk = fs.readFileSync(abs, "utf8");
  const err2 = validate(r, onDisk);
  if (err2) {
    if (!isNew && backedUp) fs.copyFileSync(path.join(backupDir, path.basename(r) + ".bak"), abs);
    else { try { fs.unlinkSync(abs); } catch {} }
    return { ok: false, refused: `POST-WRITE VALIDATION FAILED, rolled back: ${err2}`, rolledBack: true };
  }
  return { ok: true, refused: null, backedUp };
}

function scanTarget(absPath) {
  const r = rel(absPath);
  const original = fs.readFileSync(absPath, "utf8");
  const { content: tidied, changes } = tidy(original);
  const noise = analyzeNoise(original);
  const bytesBefore = Buffer.byteLength(original);
  const bytesAfter = Buffer.byteLength(tidied);
  const shrinkPct = bytesBefore ? ((bytesBefore - bytesAfter) / bytesBefore) * 100 : 0;
  return { rel: r, abs: absPath, original, tidied, changes, noise, bytesBefore, bytesAfter, shrinkPct };
}

function dryRun() {
  console.log("[SAFE OPTIMIZER DRY-RUN] No files will be modified.\n");
  console.log("Protected (never touched): " + DENY_FILES.size + " files + " + DENY_PREFIXES.join(", "));
  console.log("Improvable (allowlist): " + [...ALLOWLIST].join(", ") + "\n");
  let dirty = 0;
  for (const name of ALLOWLIST) {
    const abs = path.join(ROOT, name);
    if (!fs.existsSync(abs)) {
      console.log(`- ${name}: MISSING, skipped`);
      continue;
    }
    const s = scanTarget(abs);
    const needsWrite = s.tidied !== s.original;
    if (needsWrite) dirty++;
    console.log(
      `- ${s.rel}: ${s.bytesBefore}B -> ${s.bytesAfter}B ` +
      `(trailing-ws:${s.changes.trailingWs} collapsed-blanks:${s.changes.collapsedBlanks} ` +
      `final-nl:${s.changes.finalNewline ? "yes" : "no"}) ${needsWrite ? "[WOULD TIDY]" : "[clean]"}`
    );
    console.log(
      `  report-only: comments=${s.noise.commentLines} console.log=${s.noise.logLines} ` +
      `todo=${s.noise.todoLines} blanks=${s.noise.blankLines} (never auto-removed)`
    );
    if (s.shrinkPct > 5) console.log(`  WARNING: tidy would shrink ${s.shrinkPct.toFixed(1)}% — apply would refuse this file.`);
  }
  console.log(dirty ? `\n${dirty} file(s) would be tidied. Run with --apply.` : "\nAll allowlisted files already tidy.");
  return dirty;
}

function apply() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(ROOT, "tools", ".backups", stamp);
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`[SAFE OPTIMIZER APPLY] Backups -> ${rel(backupDir)}\n`);
  let applied = 0, skipped = 0, rolledBack = 0;
  for (const name of ALLOWLIST) {
    const abs = path.join(ROOT, name);
    if (isProtected(abs)) { console.log(`- ${name}: PROTECTED, skipped`); skipped++; continue; }
    if (!fs.existsSync(abs)) { console.log(`- ${name}: MISSING, skipped`); skipped++; continue; }
    const s = scanTarget(abs);
    if (s.tidied === s.original) { console.log(`- ${name}: already tidy, skipped`); skipped++; continue; }
    if (s.bytesAfter > s.bytesBefore || s.shrinkPct > 5) {
      console.log(`- ${name}: REFUSED (size guard: ${s.bytesBefore}B -> ${s.bytesAfter}B)`);
      skipped++;
      continue;
    }
    const err = validate(s.rel, s.tidied);
    if (err) { console.log(`- ${name}: REFUSED (validation: ${err})`); skipped++; continue; }
    // Backup, write, re-validate from disk, rollback on failure.
    fs.copyFileSync(abs, path.join(backupDir, name + ".bak"));
    fs.writeFileSync(abs, s.tidied, "utf8");
    const onDisk = fs.readFileSync(abs, "utf8");
    const err2 = validate(s.rel, onDisk);
    if (err2) {
      fs.copyFileSync(path.join(backupDir, name + ".bak"), abs);
      console.log(`- ${name}: ROLLED BACK (${err2})`);
      rolledBack++;
    } else {
      console.log(`- ${name}: TIDIED ${s.bytesBefore}B -> ${s.bytesAfter}B (backup kept)`);
      applied++;
    }
  }
  console.log(`\nDone. applied=${applied} skipped=${skipped} rolledBack=${rolledBack}`);
  console.log("NOTE: comments / console.log / TODOs were reported only, never removed.");
}

if (require.main === module) {
  if (!fs.existsSync(ROOT)) {
    console.error("Repo root not found.");
    process.exit(1);
  }
  if (process.argv.includes("--apply")) apply();
  else dryRun();
}

module.exports = { isProtected, tidy, validate, writeSiteFile, ALLOWLIST };
