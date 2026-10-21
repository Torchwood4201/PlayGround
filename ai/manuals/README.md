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
- Each pilot keeps its own action-reward history, so manual guidance is a prior rather than a hard-coded script.
- The AI Lab shows the matched manual and each pilot's learned button scores.
- Recorded learning episodes include the manual id and both pilots' policy snapshots.
- Vision is demand-driven: standby when the AI Lab is closed, 10Hz preview when open, and 60Hz only for an external `snesboy:vision/request`; forcing a 60Hz canvas readback every field made low-end gameplay crunchy.
- `window.SNESBoyManual.current()` and `.pilots()` expose the active parsed profile and per-pilot learned state for other agents or experiments.
