# SNES Manual Corpus

Source: [SNES Manual Archive](https://archive.org/details/snes-manual-archive) (863 manuals, 15,597 pages).

The Internet Archive publishes OCR text derivatives for 809 manuals as `*_djvu.txt`.
`index.json` catalogs those 809 files (19.6 MB of OCR text) with title, region, byte size,
MD5, SHA-1, and source URL. `source-files.xml.gz` is the archive file manifest.

## Status

Complete: all 809 cataloged manuals are downloaded under `text/` (21 MB on disk) and verified
against their manifest size and MD5. The archive item now exposes 863 PDFs but only 809 OCR
text derivatives; the other 54 manuals have no `_djvu.txt`, including `MechWarrior (USA).pdf`
and `Wolfenstein 3D (USA).pdf`. The earlier `snes_manual_archive` item now returns 404 for its
text derivatives, so the catalog and downloader use `snes-manual-archive` instead.

## Refresh the corpus

```sh
python3 ai/manuals/fetch_texts.py --workers 4
```

This is checkpointed: each manual is written atomically to `text/<id>.txt`, and valid existing
files are skipped on the next run. It verifies size and MD5. Re-run until it exits 0.

The 54 PDFs without `_djvu.txt` derivatives are not in `index.json`. Add them only after
they can be fetched and OCR'd separately.

## Rebuild the catalog

```sh
python3 ai/manuals/build_index.py
```

The index is generated from `source-files.xml.gz`; it does not download anything.

## Caveat

These are Internet Archive OCR derivatives, not a fresh OCR pass. Text quality varies by scan,
especially for stylized covers and tables. Page breaks are preserved in the source text.
