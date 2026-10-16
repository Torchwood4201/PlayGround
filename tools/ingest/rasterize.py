#!/usr/bin/env python3
"""Rasterize PDF pages to PNGs for OCR. Requires pymupdf (pip install pymupdf).
Usage: rasterize.py <pdf> <outdir> [dpi] [maxpages]
Prints a JSON list of written PNG paths to stdout.
"""
import json
import os
import sys

import pymupdf


def main():
    pdf = sys.argv[1]
    outdir = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 150
    maxpages = int(sys.argv[4]) if len(sys.argv) > 4 else 20
    os.makedirs(outdir, exist_ok=True)
    doc = pymupdf.open(pdf)
    paths = []
    for i in range(min(len(doc), maxpages)):
        pix = doc[i].get_pixmap(dpi=dpi)
        dest = os.path.join(outdir, "page-%03d.png" % (i + 1))
        pix.save(dest)
        paths.append(dest)
    print(json.dumps({"pages": len(doc), "rasterized": paths}))


if __name__ == "__main__":
    main()
