import gzip
import hashlib
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source-files.xml.gz"
OUT = ROOT / "index.json"
BASE = "https://archive.org/download/snes-manual-archive/"

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "manual"

def main():
    raw = gzip.decompress(SOURCE.read_bytes())
    root = ET.fromstring(raw)
    manuals = []
    seen = {}
    for node in root.findall("file"):
        name = node.get("name", "")
        if not name.endswith("_djvu.txt"):
            continue
        title = name[:-9]
        m = re.search(r"\(([^()]*)\)\s*$", title)
        region = m.group(1).strip() if m else ""
        sid = slug(title)
        if sid in seen:
            seen[sid] += 1
            sid = f"{sid}-{seen[sid]}"
        else:
            seen[sid] = 1
        size = int(node.findtext("size") or 0)
        manuals.append({
            "id": sid,
            "title": title,
            "region": region,
            "text_file": name,
            "text_bytes": size,
            "md5": node.findtext("md5") or "",
            "sha1": node.findtext("sha1") or "",
            "url": BASE + quote(name),
        })
    manuals.sort(key=lambda x: x["title"].casefold())
    total = sum(x["text_bytes"] for x in manuals)
    data = {
        "source": "Internet Archive: snes-manual-archive",
        "source_url": "https://archive.org/details/snes-manual-archive",
        "source_files_url": "https://archive.org/download/snes-manual-archive/snes-manual-archive_files.xml",
        "source_files_sha1": hashlib.sha1(raw).hexdigest(),
        "kind": "archive.org OCR text derivative (_djvu.txt)",
        "counts": {"manuals": len(manuals), "text_bytes": total},
        "manuals": manuals,
    }
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    print(f"{len(manuals)} manuals, {total/1e6:.1f} MB OCR text -> {OUT}")

if __name__ == "__main__":
    main()
