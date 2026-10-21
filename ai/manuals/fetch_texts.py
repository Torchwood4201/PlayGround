import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "index.json"
TEXT = ROOT / "text"

def md5(path):
    h = hashlib.md5()
    with path.open("rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()

def fetch(item, args):
    dest = TEXT / f"{item['id']}.txt"
    if dest.exists() and dest.stat().st_size == item["text_bytes"]:
        if not item.get("md5") or md5(dest) == item["md5"]:
            return item["id"], "skip", 0
    last = None
    for attempt in range(args.retries):
        try:
            req = urllib.request.Request(item["url"], headers={"User-Agent": "snes-manual-corpus/1.0"})
            with urllib.request.urlopen(req, timeout=args.timeout) as r:
                data = r.read()
            if item["text_bytes"] and len(data) != item["text_bytes"]:
                raise ValueError(f"size {len(data)} != {item['text_bytes']}")
            if item.get("md5") and hashlib.md5(data).hexdigest() != item["md5"]:
                raise ValueError("md5 mismatch")
            tmp = dest.with_suffix(".part")
            tmp.write_bytes(data)
            os.replace(tmp, dest)
            return item["id"], "ok", len(data)
        except Exception as e:
            last = e
            time.sleep(min(60, 2 ** attempt))
    return item["id"], f"fail: {last}", 0

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--retries", type=int, default=5)
    ap.add_argument("--timeout", type=int, default=45)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()
    data = json.loads(INDEX.read_text())
    items = data["manuals"][: args.limit or None]
    TEXT.mkdir(parents=True, exist_ok=True)
    done = failed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(fetch, item, args): item for item in items}
        for n, fut in enumerate(as_completed(futs), 1):
            mid, status, nbytes = fut.result()
            if status.startswith("fail"):
                failed += 1
                print(f"[{n}/{len(items)}] {mid}: {status}", flush=True)
            else:
                done += 1
                if n % 25 == 0 or n == len(items):
                    print(f"[{n}/{len(items)}] ok={done} fail={failed}", flush=True)
    print(f"finished ok={done} fail={failed}")
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main())
