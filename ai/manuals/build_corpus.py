#!/usr/bin/env python3
"""Build a local text corpus from the Internet Archive SNES manual archive.

The 7.4 GB archive is downloaded/extracted by the caller into
.manuals-cache/. This script renders nothing when a PDF already contains
one JPEG per scanned page; it extracts those JPEGs and OCRs them. Results
are checkpointed per manual, so an interrupted run resumes.
"""
import os, re, json, subprocess, tempfile, shutil, time, unicodedata, argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
CACHE = REPO / '.manuals-cache'
PDF = CACHE / 'pdf'
META = CACHE / 'meta'
TXT = HERE / 'text'
OUT = HERE
DPI = 150
WORKERS = int(os.environ.get('OCR_WORKERS', '4'))
ARCHIVE = 'https://archive.org/details/snes_manual_archive'

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-').lower()
    return s or 'manual'

def title_region(stem):
    tags = re.findall(r'\(([^()]*)\)', stem)
    title = re.sub(r'\s*\([^()]*\)\s*', ' ', stem).strip()
    return re.sub(r'\s+', ' ', title), ', '.join(t.strip() for t in tags if t.strip()) or 'Unknown'

def page_join(pages):
    return '\n'.join('\n===== Page %d =====\n\n%s' % (i, (p or '').strip('\n'))
                     for i, p in enumerate(pages, 1)).strip() + '\n'

def pick_lang(stem):
    u = stem.upper()
    if re.search(r'\b(FRA|FAH|FRENCH)\b', u): return 'fra+eng'
    if re.search(r'\b(GER|DEU|GERMAN)\b', u): return 'deu+eng'
    if re.search(r'\b(ESP|SPA|SPANISH)\b', u): return 'spa+eng'
    if re.search(r'\b(ITA|ITALIAN)\b', u): return 'ita+eng'
    if re.search(r'\b(NL|NLD|DUTCH)\b', u): return 'nld+eng'
    if re.search(r'\b(JPN|JP|JAPANESE)\b', u): return 'jpn+eng'
    return 'eng'

def text_from_pdf(path, pages):
    try:
        r = subprocess.run(['pdftotext', '-layout', str(path), '-'], stdout=subprocess.PIPE,
                           stderr=subprocess.DEVNULL, timeout=120)
        parts = r.stdout.decode('utf8', 'replace').split('\f')
        if len(parts) > pages: parts = parts[:pages]
        return page_join(parts), ''
    except Exception as e:
        return '', 'pdftotext failed: %s' % e

def ocr_page(img, lang, idx):
    env = dict(os.environ, OMP_THREAD_LIMIT='1')
    err = ''
    for attempt in range(2):
        try:
            q = subprocess.run(['tesseract', str(img), 'stdout', '-l', lang, '--psm', '3', '--dpi', str(DPI)],
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                               timeout=240, env=env)
            if q.returncode == 0:
                return q.stdout.decode('utf8', 'replace'), ''
            err = 'tesseract exit %d' % q.returncode
        except Exception as e:
            err = str(e)
    return '[OCR FAILED page %d]\n' % idx, err

def ocr_pdf(path, pages, lang, force_render=False):
    tmp = Path(tempfile.mkdtemp(prefix='ocr_', dir=str(CACHE)))
    errs = []
    try:
        if force_render:
            rows, imgs, page_imgs = [], {}, {}
            subprocess.run(['pdftoppm', '-r', str(DPI), '-gray', '-png', str(path), str(tmp / 'r')],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)
            for p in sorted(tmp.glob('r-*.png')):
                m = re.search(r'-(\d+)\.png$', p.name)
                if m: page_imgs[int(m.group(1))] = {'w': 1, 'h': 1, 'img': p}
        else:
            info = subprocess.run(['pdfimages', '-list', str(path)], stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, timeout=120)
            rows = []
            for line in info.stdout.decode('utf8', 'replace').splitlines():
                m = re.match(r'\s*(\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\d+)\s+', line)
                if m:
                    rows.append({'page': int(m.group(1)), 'num': int(m.group(2)),
                                 'type': m.group(3), 'w': int(m.group(4)), 'h': int(m.group(5))})
            pref = tmp / 'i'
            subprocess.run(['pdfimages', '-j', str(path), str(pref)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
            imgs = {}
            for p in tmp.glob('i-*.jpg'):
                m = re.search(r'-(\d+)\.jpg$', p.name)
                if m: imgs[int(m.group(1))] = p
            page_imgs = {}
            for r in rows:
                if r['type'] != 'image' or r['num'] not in imgs: continue
                cur = page_imgs.get(r['page'])
                if not cur or r['w'] * r['h'] > cur['w'] * cur['h']:
                    page_imgs[r['page']] = {'w': r['w'], 'h': r['h'], 'img': imgs[r['num']]}
            if not page_imgs:
                subprocess.run(['pdftoppm', '-r', str(DPI), '-gray', '-png', str(path), str(tmp / 'r')],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)
                for p in sorted(tmp.glob('r-*.png')):
                    m = re.search(r'-(\d+)\.png$', p.name)
                    if m: page_imgs[int(m.group(1))] = {'w': 1, 'h': 1, 'img': p}
            texts = []
        for i in range(1, pages + 1):
            item = page_imgs.get(i)
            if not item:
                subprocess.run(['pdftoppm', '-f', str(i), '-l', str(i), '-r', str(DPI),
                                '-gray', '-png', str(path), str(tmp / ('f%d' % i))],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=300)
                fs = sorted(tmp.glob('f%d-*.png' % i))
                item = {'img': fs[0]} if fs else None
            if not item:
                texts.append('[MISSING page]')
                errs.append('missing p%d' % i)
                continue
            t, e = ocr_page(item['img'], lang, i)
            texts.append(t)
            if e: errs.append('p%d:%s' % (i, e))
        if len(texts) < pages: texts += ['[MISSING page]'] * (pages - len(texts))
        return page_join(texts), '; '.join(errs[:4])
    except Exception as e:
        return '', 'ocr failed: %s' % e
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

def process(plan):
    f = plan['file']
    lang = pick_lang(f[:-4])
    if plan.get('text_pdf'):
        body, err = text_from_pdf(PDF / f, plan['pages'])
        return plan, body, 'text', None, err
    body, err = ocr_pdf(PDF / f, plan['pages'], lang, plan.get('force_render', False))
    return plan, body, 'ocr', lang, err

def ensure_plan():
    CACHE.mkdir(parents=True, exist_ok=True)
    (CACHE / 'meta').mkdir(exist_ok=True)
    TXT.mkdir(parents=True, exist_ok=True)
    p = CACHE / 'plan.json'
    if p.exists(): return json.loads(p.read_text())
    files = sorted(x.name for x in PDF.glob('*.pdf'))
    if not files: raise SystemExit('missing PDFs in %s' % PDF)
    plans, used = [], set()
    for f in files:
        try:
            out = subprocess.check_output(['pdfinfo', str(PDF / f)], stderr=subprocess.DEVNULL, timeout=20).decode('utf8', 'replace')
            m = re.search(r'^Pages:\s+(\d+)', out, re.M)
            pages = int(m.group(1)) if m else 0
        except Exception:
            pages = 0
        title, region = title_region(f[:-4])
        base = slugify(title)
        sid, n = base, 2
        while sid in used:
            sid = '%s-%d' % (base, n)
            n += 1
        used.add(sid)
        # Text layer detection is cached in the plan, not re-run every resume.
        try:
            q = subprocess.run(['pdftotext', '-f', '1', '-l', '3', '-layout', str(PDF / f), '-'],
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=30)
            probe = re.sub(r'\s+', '', q.stdout.decode('utf8', 'replace'))
            text_pdf = len(probe) >= 200
        except Exception:
            text_pdf = False
        plans.append({'file': f, 'pages': pages, 'id': sid, 'title': title,
                      'region': region, 'text_pdf': text_pdf})
    p.write_text(json.dumps(plans, indent=1, ensure_ascii=False), encoding='utf8')
    return plans

def build_index(plans):
    manuals = []
    for plan in plans:
        mp = META / (plan['id'] + '.json')
        if not mp.exists():
            continue
        m = json.loads(mp.read_text())
        m['title'] = plan['title']
        m['region'] = plan['region']
        m['file'] = plan['file']
        m['pages'] = plan['pages']
        m['text'] = 'text/' + plan['id'] + '.txt'
        if m.get('error'):
            parts = [x for x in m['error'].split('; ') if x and x != 'rendered']
            if parts: m['error'] = '; '.join(parts)
            else: m.pop('error', None)
        manuals.append(m)
    manuals.sort(key=lambda x: x['title'].lower())
    idx = {
        'source': ARCHIVE,
        'archive_file': 'https://archive.org/compress/snes_manual_archive/formats=IMAGE%20CONTAINER%20PDF,TEXT%20PDF&file=/snes_manual_archive.zip',
        'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'count': len(manuals),
        'pages': sum(m.get('pages', 0) for m in manuals),
        'ocr_pages': sum(m.get('pages', 0) for m in manuals if m.get('method') == 'ocr'),
        'text_pages': sum(m.get('pages', 0) for m in manuals if m.get('method') == 'text'),
        'ocr_dpi': DPI,
        'manuals': manuals,
    }
    (OUT / 'index.json').write_text(json.dumps(idx, indent=1, ensure_ascii=False), encoding='utf8')
    print('INDEX manuals=%d pages=%d ocr_pages=%d text_pages=%d' % (
        idx['count'], idx['pages'], idx['ocr_pages'], idx['text_pages']), flush=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--index-only', action='store_true')
    args = ap.parse_args()
    plans = ensure_plan()
    if args.index_only:
        build_index(plans); return
    def complete(p):
        mp = META / (p['id'] + '.json')
        tp = TXT / (p['id'] + '.txt')
        if not mp.exists() or not tp.exists(): return False
        try: return bool(json.loads(mp.read_text()).get('ok'))
        except Exception: return False
    todo = [p for p in plans if not complete(p)]
    print('START manuals=%d todo=%d pages_ocr=%d workers=%d dpi=%d' % (
        len(plans), len(todo), sum(p['pages'] for p in todo if not p['text_pdf']), WORKERS, DPI), flush=True)
    t0 = time.time(); done_pages = 0; total_pages = sum(p['pages'] for p in todo)
    if todo:
        with ProcessPoolExecutor(max_workers=WORKERS) as ex:
            futs = {ex.submit(process, p): p for p in todo}
            for k, fut in enumerate(as_completed(futs), 1):
                plan, body, method, lang, err = fut.result()
                header = ('# %s\n'
                          'source: %s\n'
                          'pdf: %s\n'
                          'region: %s\n'
                          'pages: %d\n'
                          'text_method: %s\n'
                          'ocr_language: %s\n'
                          'ocr_dpi: %d\n'
                          'note: OCR text is machine-derived; verify controls against the original scan.\n\n'
                          % (plan['title'], ARCHIVE, plan['file'], plan['region'], plan['pages'],
                             method, lang or 'n/a', DPI if method == 'ocr' else 0))
                tp = TXT / (plan['id'] + '.txt')
                tp.write_text(header + body, encoding='utf8')
                meta = {'id': plan['id'], 'chars': len(re.sub(r'\s+', '', body)),
                        'method': method, 'ocr_language': lang,
                        'ocr_dpi': DPI if method == 'ocr' else None,
                        'ok': len(re.sub(r'\s+', '', body)) >= 30}
                if err: meta['error'] = err
                mp = META / (plan['id'] + '.json')
                tmp = META / (plan['id'] + '.json.tmp')
                tmp.write_text(json.dumps(meta, ensure_ascii=False), encoding='utf8')
                tmp.replace(mp)
                done_pages += plan['pages']
                elapsed = time.time() - t0
                eta = elapsed / max(1, done_pages) * (total_pages - done_pages) / 60
                print('DONE %d/%d %s pages=%d chars=%d method=%s lang=%s err=%s eta_min=%.1f' % (
                    k, len(todo), plan['file'], plan['pages'], len(body), method, lang, err, eta), flush=True)
    build_index(plans)

if __name__ == '__main__':
    main()
