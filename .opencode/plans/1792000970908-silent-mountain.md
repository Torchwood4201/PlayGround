# Plan: Add "Walter's Lab" clicker game as a secret page

## Goal
Add the user's Breaking Bad clicker game to the Los Pollos Hermanos site as a **secret, unlinked page** — discoverable only via easter egg, not via nav.

## Why a separate page (not embedded in index.html)
- The game's CSS is hostile to the main site: `:root` variable overrides, `body { overflow: hidden }`, and a fixed RV-interior background would break the LPH layout if merged.
- The game's JS declares top-level `game` / `ui` globals and uses inline `onclick` handlers — a standalone page avoids all collisions with `app.js` (cart, training player, modals).
- `start.sh` serves the whole directory statically, so a new `lab.html` is live with zero config.

## Changes
1. **New `lab.html`** — the pasted markup, with:
   - `<link>` → `lab.css`, `<script>` → `lab.js` (renamed from style.css/script.js to avoid clobbering the main site files).
   - All 7 hotlinked images rewritten to vendored `images/lab/*` paths.
2. **New `lab.css`** — the pasted stylesheet, scoped: wrap every rule under `#game-container` (or prefix vars `--lab-*`) so a future merge can never leak; keep `overflow: hidden` on the game body only (separate page, so fine as-is).
3. **New `lab.js`** — the pasted game logic verbatim (verified self-contained: only touches its own element ids).
4. **`images/lab/`** — download the 7 remote assets locally:
   - Breaking-Bad logo, meth png (clicker), crystal overlay, Better-Call-Saul logo, pollos shirt logo, RV-interior background.
   - Fallbacks if any URL is dead: reuse local `images/lph.png`, `images/gusfring.png`, or `images/menu/*` equivalents, and keep the remote URL only as last resort.
5. **Secret entry — training-gated (user requirement: "watch all the training videos like a real training module"):**
   - Convert the training player (`app.js` ~lines 206–240, currently plain-iframe `src` swaps) to the **YouTube IFrame API** (`new YT.Player('trainingPlayer', …)`) so playback can be observed.
   - A lesson counts as complete only on the player's **ENDED** state for that video id (seeking to the end still fires ENDED — acceptable; merely clicking through chapters does NOT count).
   - Progress persists in `localStorage` (`lph_training_done` = JSON array of completed video ids) so reloads don't wipe it.
   - UI: each finished chapter gets a checkmark + the header shows "Training progress: N/10"; at 10/10 reveal an "Enter the Lab" button in the training section.
   - **Unlock is permanent**: once earned, the lab stays playable from that point on — the "Enter the Lab" button and all secret entries keep working on every later visit. The only reset is the user clearing browser cache/site data (which wipes the `localStorage` progress, requiring the 10 lessons again). Game progress itself (cash/product) is session-only and untouched.
   - Gate everywhere: triple-click logo / typing "blue" checks completion first — if incomplete, toast "Training incomplete: N/10 lessons" and smooth-scroll to `#training` instead of opening the lab.
   - `lab.html` carries a small inline guard: if `lph_training_done` has fewer than 10 entries, redirect to `/#training` (blocks direct-URL skips; trivially bypassable via devtools, which is fine for an easter egg).
6. **Keep main site untouched otherwise** — no emoji additions, no menu/cart changes. Game wording kept exactly as pasted ("meth/cash" etc., per user).

## Verification
- `node --check lab.js`, HTML parse of `lab.html`.
- Serve dir, `curl` 200s for `/lab.html`, `/lab.css`, `/lab.js`, and each `/images/lab/*`.
- Headless-Chrome screenshot of `/lab.html`: stats bar, clickable batch, sidebar tabs, sell button all visible; click batch → Product count increments; buy Jesse → Cook g/s rises; open devtools console → zero errors.
- Training gate test: fresh profile → secret entries route to `#training` with "N/10" toast; simulate ENDED on all 10 (or set the localStorage key) → "Enter the Lab" button appears, entries open `lab.html`; direct `/lab.html` with empty progress redirects to `/#training`.
- Main site regression: `/` still renders 74 menu cards, cart + training player work, no console errors (including YouTube API load).

## Open question for user
Keep the game's current "meth/cash" wording as-is, or retheme its labels to the restaurant (e.g. cook → "fry", dealers → "drivers") while keeping mechanics identical?
