# SNES Manual Corpus

Local, machine-readable text from the Internet Archive **SNES Manual Archive**:

- Source item: <https://archive.org/details/snes_manual_archive>
- Original archive: 863 PDF manuals, 15,597 pages
- `text/` contains one UTF-8 `.txt` file per manual, with page markers
- `index.json` is the catalog: id, title, region, pages, source PDF, text path, character count, extraction method, OCR language/DPI

## Extraction

- 23 PDFs already carried a text layer; their text was extracted with `pdftotext -layout`.
- 840 image-only PDFs were OCR'd with Tesseract 5 at their native 150 DPI, one process per PDF.
- OCR language is selected from the filename region tag (`FRA`, `GER`, `SPA`, `ITA`, `NL`, `JPN`, else English).
- Every page in the text files starts with `===== Page N =====`.

## Using it

```bash
# find a game
rg -i 'mortal kombat' ai/manuals/index.json

# search controls text
rg -i -n 'block|uppercut|special move' ai/manuals/text/ultimate-mortal-kombat-3-usa.txt
```

## Caveats

- OCR is machine-derived. Controls, move names, and button diagrams can be wrong; verify against the original scan before encoding a game profile.
- Some manuals are multilingual or were scanned at an angle; OCR quality varies.
- Manuals remain copyrighted by their publishers. This corpus is for local research/preservation, not redistribution.
