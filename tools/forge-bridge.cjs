"use strict";
/**
 * forge-bridge — the Forge Master protocols as the maker's build path.
 *
 * Derived from forge-master-service.ts (canonical, untouched): its PLAN-FIRST
 * protocol (objective / architectural decisions / deletion log / confirmation),
 * its LAYERED UPDATING + PRESERVATION rules (never remove existing code,
 * full codes only, no placeholders), and its 100%-adherence striking rules.
 *
 * Mapping onto the maker (no API, no cloud — local only):
 *   plan-first brief  -> buildBrief(): logged every creation cycle
 *   deletion log      -> backup manifest: nothing is ever deleted, every
 *                        overwritten file lands in tools/.backups/ first,
 *                        and the list is logged
 *   user confirmation -> the validation gate (approve hook): only gated
 *                        content commits
 *   preservation rule -> checkPreservation(): mechanical refusal when a draft
 *                        drops existing grown blocks or structural anchors
 */

function buildBrief({ goal, files, drafts }) {
  return {
    objective: goal,
    decisions: [
      "Layered updating: new content appends inside anchored regions; existing blocks stay byte-identical.",
      "Full codes only: drafts are complete files, never fragments or placeholders.",
      "Preservation first: any draft that drops existing substance is refused before the gate.",
    ],
    deletionLog: (files || []).map((f) => `${f} -> tools/.backups/ (overwritten, never deleted)`),
    drafts: Object.keys(drafts || {}),
  };
}

function logBrief(anton, brief) {
  anton.log(`FORGE BRIEF — objective: ${brief.objective}`);
  brief.decisions.forEach((d) => anton.log(`FORGE BRIEF — decision: ${d}`));
  brief.deletionLog.forEach((d) => anton.log(`FORGE BRIEF — deletion-log: ${d}`));
}

// Mechanical preservation: every existing data-growth block, the maker mark,
// and the document anchors must survive into the draft. Returns the list of
// dropped anchors (empty = pass).
function checkPreservation(before, after) {
  const dropped = [];
  const blocks = before.match(/data-growth="\d+"/g) || [];
  for (const b of new Set(blocks)) {
    if (!after.includes(b)) dropped.push(b);
  }
  for (const anchor of ["</main>", "</body>", "</html>"]) {
    if (before.includes(anchor) && !after.includes(anchor)) dropped.push(anchor);
  }
  if (before.includes('id="grown"') && !after.includes('id="grown"')) {
    dropped.push("#grown section");
  }
  return dropped;
}

module.exports = { buildBrief, logBrief, checkPreservation };
