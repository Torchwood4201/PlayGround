#!/usr/bin/env bash
# Custom capture: open CAPTURE_URL, wait for rendered content, save
# final-desktop.png and final-mobile.png into CAPTURE_DIR.
# Exit 75 = temporary navigation/browser infrastructure failure.
# Exit 1  = script usage or rendering defect. Leaves the app running.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo 'Set CAPTURE_URL.' >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo 'Set CAPTURE_DIR.' >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p node -e '
const { mkdirSync } = require("fs");
const { join } = require("path");
const { createRequire } = require("module");
const runtime = join(process.env.HOME, ".local/share/omgithub-playwright");
const require2 = createRequire(join(runtime, "package.json"));
const { chromium } = require2("playwright");
const fs = require("fs");
(async () => {
  const config = JSON.parse(fs.readFileSync(join(runtime, "linux.json"), "utf8"));
  if (process.platform === "linux") {
    try { process.env.DISPLAY ||= ":" + fs.readFileSync(join(runtime, "display"), "utf8").trim(); } catch {}
  }
  const url = process.env.CAPTURE_URL, output = process.env.CAPTURE_DIR;
  mkdirSync(output, { recursive: true });
  const transient = (e) => { throw Object.assign(e instanceof Error ? e : new Error(String(e)), { exitCode: 75 }); };
  let browser;
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch(transient);
    for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } }).catch(transient);
      page.setDefaultTimeout(30000);
      page.on("pageerror", (e) => console.error("pageerror: " + e.message));
      const response = await page.goto(url, { waitUntil: "load", timeout: 45000 }).catch(transient);
      if (!response || !response.ok()) {
        const status = response ? response.status() : 0;
        const code = !response || [408, 429, 500, 502, 503, 504].includes(status) ? 75 : 1;
        throw Object.assign(new Error("HTTP " + status + " loading preview"), { exitCode: code });
      }
      await page.locator("body").waitFor({ state: "visible" }).catch(transient);
      await page.waitForFunction(() => document.fonts.status === "loaded").catch(() => {});
      await page.waitForTimeout(1500);
      const heading = await page.locator("h1").first().textContent().catch(() => null);
      console.log("Capture " + name + ": h1=" + JSON.stringify(heading));
      if (!heading || !heading.trim()) throw Object.assign(new Error("rendered content missing: empty h1"), { exitCode: 1 });
      await page.screenshot({ path: join(output, "final-" + name + ".png"), timeout: 30000 }).catch((error) => {
        if (error.name === "TimeoutError" || !browser.isConnected()) transient(error);
        throw error;
      });
      await page.close();
    }
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exitCode = (error && error.exitCode) || 1;
  } finally {
    try { await browser?.close(); } catch (e) { console.error(e && e.message ? e.message : e); process.exitCode ||= 75; }
  }
})();
'
