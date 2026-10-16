"use strict";

/* SNES manual ingestion pipeline.
 *
 * Two modes:
 *   1. Per-file mode (default, RECOMMENDED): --only "<title fragment>"
 *      downloads individual PDFs from archive.org (no giant ZIP) using
 *      ai/manual-index.json to resolve filenames. --limit N caps files.
 *   2. Full-ZIP mode: --zip <path-to-snes_manual_archive.zip> unpacks a
 *      pre-downloaded archive from the compress endpoint and ingests all
 *      readable manuals. The ZIP is ~8 GB; do NOT fetch it blindly.
 *
 * Text path per file: pdf-parse first; tesseract.js OCR fallback only when
 * the text yield is < 200 non-space chars. Files that still yield nothing
 * useful (< 300 chars) are skipped, never invented.
 *
 * Output: ai/games-knowledge.json — the artifact browsers actually load.
 * Work dirs stay under tools/ingest/work/ (gitignored).
 *
 *   node ingest-snes-manuals.cjs --only "mortal kombat" --limit 5
 *   node ingest-snes-manuals.cjs --only "mario" --limit 3
 *   node ingest-snes-manuals.cjs --zip ./snes_manual_archive.zip --limit 50
 */

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const axios = require("axios");
const AdmZip = require("adm-zip");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");

/* Scanned-PDF OCR needs page renders: rasterize.py (pymupdf).
 * Bound pages per manual so one booklet can't eat the whole run. */
const OCR_DPI = 150;
const OCR_MAX_PAGES = 20;

const {
  GameKnowledgeBase,
  SonOfAntonGameLearner,
  cleanTitle
} = require("./son-of-anton-games.cjs");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_WORK_DIR = path.join(__dirname, "work");
const KNOWLEDGE_PATH = path.join(REPO_ROOT, "ai", "games-knowledge.json");
const INDEX_PATH = path.join(REPO_ROOT, "ai", "manual-index.json");
const ARCHIVE_FILE_BASE = "https://archive.org/download/snes_manual_archive/";

function args() {
  const out = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "--only") out.only = raw[++i];
    else if (raw[i] === "--limit") out.limit = parseInt(raw[++i], 10);
    else if (raw[i] === "--zip") out.zip = raw[++i];
    else if (raw[i] === "--workdir") out.workdir = raw[++i];
  }
  return out;
}

function ensureDirectories(dirs) {
  for (const dir of dirs) fs.mkdirSync(dir, { recursive: true });
}

function loadIndex() {
  const data = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  return data.manuals || data.items || [];
}

function pickFiles(index, only, limit) {
  let files = index;
  if (only) {
    const q = only.toLowerCase();
    files = files.filter((m) =>
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.file && m.file.toLowerCase().includes(q))
    );
  }
  if (Number.isFinite(limit)) files = files.slice(0, limit);
  return files;
}

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return dest;
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 0
  });
  fs.writeFileSync(dest, Buffer.from(response.data));
  return dest;
}

function extractArchive(zipPath, destDir) {
  if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
    console.log("Archive already extracted.");
    return;
  }
  console.log("Extracting archive...");
  new AdmZip(zipPath).extractAllTo(destDir, true);
  console.log("Extraction complete.");
}

function findManualFiles(directory) {
  const files = [];
  (function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(pdf|png|jpg|jpeg|tiff?|webp)$/i.test(entry.name)) files.push(fullPath);
    }
  })(directory);
  return files;
}

async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  return (parsed.text || "").trim();
}

let sharedWorker = null;
async function ocrFile(filePath) {
  /* Images only: tesseract.js cannot read PDF containers, and a worker
     fault must never take down the whole ingest run. */
  if (!/\.(png|jpe?g|tiff?|bmp|webp)$/i.test(filePath)) {
    throw new Error("OCR supports image files only, skipping PDF container");
  }
  if (!sharedWorker) sharedWorker = await createWorker("eng");
  const result = await sharedWorker.recognize(filePath);
  return (result.data.text || "").trim();
}

function isUsefulManual(text) {
  return String(text || "").replace(/\s/g, "").length >= 300;
}

async function ingestAllManuals() {
  const opts = args();
  const workDir = opts.workdir ? path.resolve(opts.workdir) : DEFAULT_WORK_DIR;
  ACTIVE_WORK_DIR = workDir;
  const extractDir = path.join(workDir, "manuals");
  const textDir = path.join(workDir, "extracted-text");
  ensureDirectories([workDir, extractDir, textDir]);

  let files = [];
  if (opts.zip) {
    extractArchive(path.resolve(opts.zip), extractDir);
    files = findManualFiles(extractDir);
    if (Number.isFinite(opts.limit)) files = files.slice(0, opts.limit);
  } else {
    const index = loadIndex();
    const picked = pickFiles(index, opts.only, opts.limit);
    if (!picked.length) {
      console.log("No manuals matched. Try --only \"mario\" or omit it with --limit N.");
      return;
    }
    console.log(`Selected ${picked.length} manual(s) from index.`);
    for (const m of picked) {
      const url = ARCHIVE_FILE_BASE + encodeURIComponent(m.file);
      const dest = path.join(extractDir, m.file);
      try {
        console.log(`Downloading: ${m.file}`);
        await downloadFile(url, dest);
        files.push(dest);
      } catch (e) {
        console.error(`  download failed (${e.message}), skipping.`);
      }
    }
  }

  const knowledge = new GameKnowledgeBase(KNOWLEDGE_PATH);
  const anton = new SonOfAntonGameLearner({ knowledgeBase: knowledge });
  console.log(`Found ${files.length} manual files.`);

  let learned = 0, skipped = 0;
  for (const filePath of files) {
    try {
      const title = cleanTitle(path.basename(filePath, path.extname(filePath)));
      if (!title) continue;
      console.log(`Processing: ${title}`);
      const text = await extractManualTextTo(filePath, textDir);
      if (!isUsefulManual(text)) {
        console.log(`  skipped: not enough readable text.`);
        skipped++;
        continue;
      }
      const stored = anton.learnFromManual({ title, manualText: text, manualPath: filePath });
      learned++;
      console.log(`  learned: ${stored.title} | controls: ${Object.keys(stored.controls).length} | objectives: ${stored.objectives.length} | rules: ${stored.rules.length} | strategies: ${stored.strategies.length}`);
    } catch (error) {
      console.error(`  FAILED on ${filePath}: ${error.message}`);
    }
  }

  try { if (sharedWorker) await sharedWorker.terminate(); } catch (e) { /* ignore */ }
  knowledge.save();
  console.log(`Finished. Learned: ${learned}, skipped: ${skipped}, knowledge base: ${KNOWLEDGE_PATH} (${knowledge.count()} games).`);
}

function rasterizePdf(filePath, workDir) {
  const outDir = path.join(workDir, "raster",
    path.basename(filePath, path.extname(filePath)).replace(/[^A-Za-z0-9]+/g, "_"));
  fs.mkdirSync(outDir, { recursive: true });
  return new Promise((resolve) => {
    execFile("python3", [path.join(__dirname, "rasterize.py"), filePath, outDir,
      String(OCR_DPI), String(OCR_MAX_PAGES)], { timeout: 600000 },
      (err, stdout) => {
        if (err) return resolve([]);
        try {
          resolve(JSON.parse(stdout).rasterized || []);
        } catch (e) {
          resolve([]);
        }
      });
  });
}

async function ocrPdfPages(filePath, workDir) {
  const pngs = await rasterizePdf(filePath, workDir);
  if (!pngs.length) return "";
  if (!sharedWorker) sharedWorker = await createWorker("eng");
  const parts = [];
  for (const png of pngs) {
    try {
      const result = await sharedWorker.recognize(png);
      parts.push((result.data.text || "").trim());
    } catch (e) {
      console.log(`  OCR page failed (${path.basename(png)}): ${e.message}`);
    }
  }
  return parts.filter(Boolean).join("\n");
}

let ACTIVE_WORK_DIR = null;

async function extractManualTextTo(filePath, textDir) {
  const extension = path.extname(filePath).toLowerCase();
  const outputPath = path.join(textDir, path.basename(filePath, extension) + ".txt");
  if (fs.existsSync(outputPath)) return fs.readFileSync(outputPath, "utf8");
  let text = "";
  if (extension === ".pdf") {
    text = await extractPdfText(filePath);
    if (text.replace(/\s/g, "").length < 200) {
      console.log(`  embedded text too thin; rasterize+OCR path…`);
      try {
        text = await ocrPdfPages(filePath, ACTIVE_WORK_DIR);
      } catch (e) {
        console.log(`  PDF OCR failed (${e.message}); skipping.`);
        text = "";
      }
    }
  } else {
    try {
      text = await ocrFile(filePath);
    } catch (e) {
      console.log(`  OCR failed (${e.message}); skipping.`);
      text = "";
    }
  }
  fs.writeFileSync(outputPath, text, "utf8");
  return text;
}

ingestAllManuals().catch((e) => {
  console.error("Ingest failed:", e.message);
  process.exit(1);
});
