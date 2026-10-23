# SNES Manual Corpus

Local, machine-readable text from the Internet Archive **SNES Manual Archive**:

- Source item: <https://archive.org/details/snes_manual_archive>
- 863 PDF manuals, 15,597 pages
- `text/` contains one UTF-8 `.txt` file per manual, with `===== Page N =====` markers
- `index.json` is the catalog: id, title, region, pages, source PDF, text path, character count, extraction method, OCR language/DPI
- Corpus size: 16.5 million characters, 20.9 MB of text

## Extraction

- 17 PDFs already carried a text layer (244 pages); extracted with `pdftotext -layout`.
- 846 image-only PDFs (15,353 pages) were OCR'd with Tesseract 5.
- OCR used 150 DPI pages. Scans whose pages were split into image strips were rendered whole before OCR instead of OCRing one strip.
- OCR language comes from the filename region tag (`FRA`, `GER`, `SPA`, `ITA`, `NL`, `JPN`, else English). Distribution: 836 English, 6 French, 2 Spanish, 2 Japanese.
- Results are checkpointed per manual, so an interrupted build resumes without redoing finished files.

## Rebuilding

Requires `poppler-utils`, `tesseract-ocr`, and the language packs used above.

```bash
mkdir -p .manuals-cache/pdf
curl -L --retry 8 -C - -o .manuals-cache/snes_manual_archive.zip \
  'https://archive.org/compress/snes_manual_archive/formats=IMAGE%20CONTAINER%20PDF,TEXT%20PDF&file=/snes_manual_archive.zip'
unzip -q .manuals-cache/snes_manual_archive.zip -d .manuals-cache/pdf
python3 ai/manuals/build_corpus.py
```

`.manuals-cache/` is ignored by git and can be deleted after the text corpus is generated.

## Using it

```bash
# find a game
rg -i 'mortal kombat' ai/manuals/index.json

# search controls text
rg -i -n 'block|uppercut|special move' ai/manuals/text/ultimate-mortal-kombat-3.txt
```

## Caveats

- OCR is machine-derived. Controls, move names, and button diagrams can be wrong; verify against the original scan before encoding a game profile.
- Some manuals are multilingual, low-contrast, or scanned at an angle; extraction quality varies. Sparse manuals may have under 2,000 characters.
- Manuals remain copyrighted by their publishers. This corpus is for local research/preservation, not redistribution.

## App integration

`script.js` loads `ai/manuals/index.json`, matches the current ROM filename to a manual, and parses control words into a shared prior for the autopilot:

- `jump`, `run`, `block`, and action buttons feed both P1 and P2 copilots.
- Both pilots use the same controller layout and player-specific port (P1 port 1, P2 port 2); each keeps its own timers, mode, motion history, and action-reward history. Manual guidance is a shared prior, not shared control.
- The generic matcher is filename/region-aware and is validated against the whole index: all 863 manuals resolve to the correct game, including same-title regional editions. There is no per-game manual ID table.
- The parser was validated across all 863 manuals: 863 loaded, 0 errors, 0 empty action lists. Style and kind are inferred generically from manual/title language rather than per-game overrides.
- Move extraction is best-effort. UMK3 (26 moves), the Street Fighter II family, Ballz 3D, and Mortal Kombat (1992) produce usable sequences; Killer Instinct, WWF, and Punch-Out manuals are too degraded/table-image-heavy to extract safely. Empty movebooks are intentional rather than guessed.
- The Generic profile assigns a coarse style from the manual/title and runs a matching input policy: `platformer`, `fighter`, `shooter`, `beat-em-up`, `sports`, `racing`, `puzzle`, or `adventure`. Corpus distribution: 599 platformer, 114 sports, 49 fighter, 27 beat-em-up, 23 shooter, 21 racing, 19 adventure, 11 puzzle.
- Style changes the controller loop, not just a label: shooters strafe/fire/dodge, sports sprint and pass/shoot, racing holds throttle and steers with the road, puzzle games tap cursor/rotate inputs, beat-’em-ups close and combo, adventure games use sword/shield more deliberately, fighters approach/block/strike and use manual specials.
- Special-move extraction is generic: it reads notation tables (`D,B,LP`), spelled move tables (`AWAY, TOWARDS, LOW KICK`), and prose instruction blocks. The current corpus yields 63 moves across 11 manuals; most manuals have no move table, and badly OCR'd move lists yield an empty movebook so pilots fall back to strikes.
- Menu confirmation is separate from the manual's primary gameplay button: A for most titles, B for `Super Mario All-Stars` SELECT GAME.
- A confirmed, settled screen enters PLAY even when it is static; stillness alone no longer bounces a pilot that has already played back to SEEK.
- P1 is the menu lead (grid walk + confirm); P2 is the joiner (one START), so the controllers do not fight over the same cursor. After either pilot enters gameplay, START is locked out so it cannot toggle pause.
- The AI Lab shows the matched manual and each pilot's learned button scores.
- Recorded learning episodes include the manual id and both pilots' policy snapshots.
- Vision is demand-driven: standby when the AI Lab is closed, 10Hz preview when open, and 60Hz only for an external `snesboy:vision/request`; forcing a 60Hz canvas readback every field made low-end gameplay crunchy.
- `window.SNESBoyManual.current()` and `.pilots()` expose the active parsed profile and per-pilot learned state for other agents or experiments.
