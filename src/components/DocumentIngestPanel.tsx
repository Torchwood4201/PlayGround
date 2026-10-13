import React, { useRef, useState } from 'react';
import { FileUp, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  ACCEPTED_UPLOADS,
  type DocumentKind,
  type IngestedDocument,
} from '../core/perception/ingestion';

export interface IngestReport {
  name: string;
  ok: boolean;
  chunks?: number;
  kind?: DocumentKind;
  error?: string;
}

interface DocumentIngestPanelProps {
  documents: IngestedDocument[];
  persistent: boolean;
  onIngestFiles: (files: File[]) => Promise<IngestReport[]>;
  onRemoveDocument: (id: string) => void;
}

const KIND_STYLES: Record<DocumentKind, string> = {
  pdf: 'text-red-300 bg-red-900/20 border-red-500/30',
  docx: 'text-blue-300 bg-blue-900/20 border-blue-500/30',
  text: 'text-green-300 bg-green-900/20 border-green-500/30',
  other: 'text-gray-300 bg-gray-800 border-gray-600',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const DocumentIngestPanel: React.FC<DocumentIngestPanelProps> = ({
  documents,
  persistent,
  onIngestFiles,
  onRemoveDocument,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<IngestReport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || busy) return;
    setBusy(true);
    try {
      const results = await onIngestFiles(files);
      setReports(results);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-teal-500/30">
      <div className="flex items-center mb-2">
        <FileUp className="w-8 h-8 text-teal-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Document Ingest</h2>
        <div className="ml-auto text-sm text-gray-400">
          {documents.length} document{documents.length === 1 ? '' : 's'} in memory
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Upload PDFs, Word documents, or text files. Each file is chunked into
        long-term memory for recall and summarized into short-term working
        memory for the current session.
        {!persistent && ' (Session-only: storage unavailable, uploads last until reload.)'}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(Array.from(e.dataTransfer.files));
        }}
        className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 ${
          dragOver ? 'border-teal-400 bg-teal-900/20' : 'border-gray-600 hover:border-teal-500/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOADS}
          className="hidden"
          onChange={(e) => {
            void handleFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        {busy ? (
          <div className="flex items-center justify-center text-teal-300">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            <span>Parsing and storing…</span>
          </div>
        ) : (
          <>
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-500" />
            <p className="text-gray-300">Drop files here or click to browse</p>
            <p className="text-gray-500 text-xs mt-1">PDF · DOCX · TXT · Markdown · code & data files</p>
          </>
        )}
      </div>

      {reports.length > 0 && (
        <div className="space-y-2 mb-4">
          {reports.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className={`flex items-center text-sm p-2 rounded border ${
                r.ok
                  ? 'text-green-300 bg-green-900/10 border-green-500/20'
                  : 'text-red-300 bg-red-900/10 border-red-500/20'
              }`}
            >
              {r.ok ? (
                <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              )}
              <span className="truncate">
                {r.name}
                {r.ok
                  ? ` — stored ${r.chunks} chunk${r.chunks === 1 ? '' : 's'} (${r.kind}) + working summary`
                  : ` — ${r.error}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="flex items-center min-w-0">
                <span className={`text-xs px-2 py-1 rounded border mr-3 shrink-0 ${KIND_STYLES[doc.kind]}`}>
                  {doc.kind.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-gray-200 text-sm truncate">{doc.name}</div>
                  <div className="text-gray-500 text-xs">
                    {doc.chunks} chunks · {formatBytes(doc.size)}
                    {doc.pages ? ` · ${doc.pages} pages` : ''} ·{' '}
                    {new Date(doc.ingestedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemoveDocument(doc.id)}
                title="Remove from list (stored chunks stay in long-term memory)"
                className="ml-3 text-gray-500 hover:text-red-400 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
