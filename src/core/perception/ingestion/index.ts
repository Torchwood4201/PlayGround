// ingestion/ — document upload pipeline.
// Extracts text from PDF / Word / plain-text files, chunks it for the
// vector long-term store, and drops a summary into short-term working
// memory so the current session can reason over it immediately.
//
// Heavy parsers (pdf.js, mammoth) are lazy-loaded so they only join the
// bundle when a matching file is actually uploaded.

import type { StorageProvider } from '../../longTermMemory/storage';

export type DocumentKind = 'pdf' | 'docx' | 'text' | 'other';

export interface ExtractedDocument {
  name: string;
  kind: DocumentKind;
  text: string;
  pages?: number;
}

export interface IngestedDocument {
  id: string;
  name: string;
  size: number;
  kind: DocumentKind;
  chunks: number;
  pages?: number;
  ingestedAt: number;
  summary: string;
}

export const ACCEPTED_UPLOADS =
  '.pdf,.docx,.txt,.md,.markdown,.json,.csv,.tsv,.log,.text,.rst,.tex,.org,' +
  '.js,.ts,.tsx,.jsx,.mjs,.py,.java,.rb,.go,.rs,.c,.h,.cpp,.cs,.html,.css,.xml,' +
  '.yml,.yaml,.toml,.ini,.cfg,.sh,.sql,' +
  'text/plain,application/pdf,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Hard cap per file so a huge upload can't exhaust memory or quota. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
/** Hard cap on stored chunks per document. */
export const MAX_CHUNKS_PER_DOC = 200;

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'log', 'text', 'rst', 'tex', 'org',
  'js', 'ts', 'tsx', 'jsx', 'mjs', 'cjs', 'py', 'java', 'rb', 'go', 'rs',
  'c', 'h', 'cpp', 'hpp', 'cs', 'html', 'css', 'xml', 'yml', 'yaml',
  'toml', 'ini', 'cfg', 'sh', 'sql',
]);

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function detectKind(file: File): DocumentKind {
  const ext = extensionOf(file.name);
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (
    ext === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (ext === 'doc') {
    throw new Error(`"${file.name}": legacy .doc is not supported — please re-save as .docx or .pdf`);
  }
  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) return 'text';
  return 'other';
}

async function extractPdfText(buffer: ArrayBuffer): Promise<{ text: string; pages: number }> {
  const pdfjsLib = await import('pdfjs-dist');
  const workerModule = (await import(
    'pdfjs-dist/build/pdf.worker.min.mjs?url'
  )) as unknown as { default: string };
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
  const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
  const parts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? (item.str as string) : ''))
      .join(' ');
    parts.push(line);
    page.cleanup();
  }
  // destroy() exists on browser builds; guard for variant APIs.
  await (pdf as unknown as { destroy?: () => Promise<void> }).destroy?.();
  return { text: parts.join('\n\n'), pages: pdf.numPages };
}

/** Extract raw text from an uploaded file, by kind. */
export async function extractText(file: File): Promise<ExtractedDocument> {
  if (file.size === 0) throw new Error(`"${file.name}" is empty`);
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" exceeds the ${MAX_FILE_BYTES / 1024 / 1024}MB limit`);
  }
  const kind = detectKind(file);
  if (kind === 'pdf') {
    const { text, pages } = await extractPdfText(await file.arrayBuffer());
    if (!text.trim()) throw new Error(`"${file.name}": no extractable text (scanned image?)`);
    return { name: file.name, kind, text, pages };
  }
  if (kind === 'docx') {
    const { default: mammoth } = await import('mammoth');
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    if (!value.trim()) throw new Error(`"${file.name}": no extractable text`);
    return { name: file.name, kind, text: value };
  }
  // text + unknown: try a text read, reject obvious binaries.
  const text = await file.text();
  const head = text.slice(0, 8000);
  let nulls = 0;
  for (let i = 0; i < head.length; i++) if (head.charCodeAt(i) === 0) nulls++;
  if (head.length > 0 && nulls / head.length > 0.01) {
    throw new Error(`"${file.name}": unsupported binary format`);
  }
  if (!text.trim()) throw new Error(`"${file.name}" contains no text`);
  return { name: file.name, kind, text };
}

/** Split text into overlapping chunks on paragraph/sentence boundaries. */
export function chunkText(text: string, maxChars = 1200, overlap = 150): string[] {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';
  const push = (s: string) => {
    const t = s.trim();
    if (t) chunks.push(t);
  };
  for (const para of paragraphs) {
    const piece = para.trim();
    if (!piece) continue;
    if ((current + '\n\n' + piece).trim().length <= maxChars) {
      current = current ? `${current}\n\n${piece}` : piece;
      continue;
    }
    push(current);
    if (piece.length <= maxChars) {
      // Overlap: carry the tail of the previous chunk forward.
      current = current ? `${current.slice(-overlap)}\n\n${piece}`.slice(-maxChars) : piece;
    } else {
      // Oversized paragraph: split on sentences, then hard-split.
      const sentences = piece.match(/[^.!?]+[.!?]+["']?\s*|[^.!?]+$/g) ?? [piece];
      let buf = current ? current.slice(-overlap) : '';
      for (const s of sentences) {
        if ((buf + ' ' + s).length > maxChars) {
          push(buf);
          buf = buf.slice(-overlap);
        }
        buf = buf ? `${buf} ${s}` : s;
        while (buf.length > maxChars) {
          push(buf.slice(0, maxChars));
          buf = buf.slice(maxChars - overlap);
        }
      }
      current = buf;
    }
  }
  push(current);
  return chunks;
}

/** Sinks for the two memories an ingested document feeds. */
export interface IngestTargets {
  addToLongTerm: (record: string) => Promise<void>;
  noteToWorking: (note: string) => void;
}

/** Full pipeline: extract -> chunk -> long-term store + working-memory note. */
export async function ingestDocument(
  file: File,
  targets: IngestTargets,
  opts: { maxChars?: number; overlap?: number } = {},
): Promise<IngestedDocument> {
  const extracted = await extractText(file);
  const chunks = chunkText(extracted.text, opts.maxChars ?? 1200, opts.overlap ?? 150);
  if (chunks.length === 0) throw new Error(`"${file.name}": nothing to store after chunking`);
  const stored = chunks.slice(0, MAX_CHUNKS_PER_DOC);
  for (let i = 0; i < stored.length; i++) {
    await targets.addToLongTerm(`DOCUMENT "${file.name}" [${i + 1}/${stored.length}]: ${stored[i]}`);
  }
  const summary = extracted.text.replace(/\s+/g, ' ').trim().slice(0, 300);
  const pagesNote = extracted.pages ? `, ${extracted.pages} pages` : '';
  targets.noteToWorking(
    `INGESTED DOCUMENT "${file.name}" (${extracted.kind}${pagesNote}, ${stored.length} chunks): ${summary}`,
  );
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    size: file.size,
    kind: extracted.kind,
    chunks: stored.length,
    pages: extracted.pages,
    ingestedAt: Date.now(),
    summary,
  };
}

/** Tracks which documents were ingested; persisted so the list survives reloads. */
export class DocumentRegistry {
  private docs: IngestedDocument[] = [];
  constructor(private store?: StorageProvider) {}

  attachStore(store: StorageProvider): void {
    this.store = store;
  }

  async load(): Promise<number> {
    if (!this.store) return 0;
    try {
      const records = await this.store.load();
      for (const r of records) {
        if (typeof r?.content !== 'string') continue;
        try {
          const parsed = JSON.parse(r.content) as { documents?: IngestedDocument[] };
          if (Array.isArray(parsed.documents)) {
            this.docs = parsed.documents.filter((d) => typeof d?.name === 'string');
            return this.docs.length;
          }
        } catch {
          // ignore unparsable records
        }
      }
    } catch (error) {
      console.error('[ingestion] registry load failed:', error);
    }
    return 0;
  }

  private async persist(): Promise<void> {
    if (!this.store) return;
    await this.store.save([
      {
        content: JSON.stringify({ version: 1, documents: this.docs }),
        embedding: [],
        timestamp: Date.now(),
        importance: 1,
      },
    ]);
  }

  async add(doc: IngestedDocument): Promise<void> {
    this.docs.unshift(doc);
    this.docs = this.docs.slice(0, 500);
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    this.docs = this.docs.filter((d) => d.id !== id);
    await this.persist();
  }

  list(): IngestedDocument[] {
    return [...this.docs];
  }
}
