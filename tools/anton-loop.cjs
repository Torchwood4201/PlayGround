"use strict";
/**
 * anton-loop — the maker, self-running.
 *
 * Launches SonOfAnton --commit on an interval inside a persistent session
 * (tmux, per Agents.md process lifecycle). No human types anything after launch:
 * each cycle scores the site, works the manifest through the guardrail
 * (backup + validate + rollback), appends memory, adapts, sleeps, repeats.
 *
 * Survival inheritance: the loop only ever spawns the guarded --commit path,
 * so every write obeys the same rules (site files only, runtime unreachable).
 * A crashed cycle can't kill the loop; an overrunning cycle gets killed.
 *
 *   ANTON_MINUTES=5 node tools/anton-loop.cjs     # every 5 min (default)
 *   tmux new-session -d -s anton 'node tools/anton-loop.cjs >> tools/anton-loop.log 2>&1'
 *   tmux kill-session -t anton                      # stop it
 */

const { spawn } = require("child_process");
const path = require("path");

const MINUTES = parseFloat(process.env.ANTON_MINUTES || "5");
const INTERVAL_MS = Math.max(1, MINUTES) * 60 * 1000;
const CYCLE_TIMEOUT_MS = 120 * 1000;
const MAKER = path.join(__dirname, "son-of-anton.cjs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCycle(n) {
  return new Promise((resolve) => {
    console.log(`[loop ${new Date().toISOString()}] --- self-run cycle #${n} ---`);
    const child = spawn(process.execPath, [MAKER, "--commit"], { stdio: "inherit" });
    const killer = setTimeout(() => {
      console.log(`[loop ${new Date().toISOString()}] cycle overran 120s, killing`);
      child.kill("SIGKILL");
    }, CYCLE_TIMEOUT_MS);
    child.on("error", (e) => {
      clearTimeout(killer);
      console.log(`[loop ${new Date().toISOString()}] spawn error (loop survives): ${e.message}`);
      resolve();
    });
    child.on("close", (code) => {
      clearTimeout(killer);
      console.log(`[loop ${new Date().toISOString()}] cycle done (exit ${code})`);
      resolve();
    });
  });
}

async function main() {
  console.log(`[loop ${new Date().toISOString()}] SELF-RUNNING started (every ${MINUTES} min, ${MAKER} --commit)`);
  let n = 0;
  for (;;) {
    n++;
    try {
      await runCycle(n);
    } catch (e) {
      console.log(`[loop ${new Date().toISOString()}] unexpected error (loop survives): ${e.message}`);
    }
    console.log(`[loop ${new Date().toISOString()}] sleeping ${MINUTES} min`);
    await sleep(INTERVAL_MS);
  }
}

if (require.main === module) {
  main();
}

module.exports = {};
