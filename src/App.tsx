import React, { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Volume2, Paperclip, Loader2 } from 'lucide-react';
import { PositronicCore } from './core/PositronicCore';
import { UnifiedModelHub } from './core/UnifiedModelHub';
import { CognitiveOS } from './core/controller';
import { TaskManager } from './core/workingMemory';
import { VectorMemory } from './core/longTermMemory';
import { WebSearchPerception, InternalStatePerception } from './core/perception';
import { ModelHubActionPlugin } from './core/reasoning';
import { Beta4 } from './core/Beta4';
import { defaultStorageProvider } from './core/longTermMemory/storage';
import { DocumentRegistry, ingestDocument } from './core/perception/ingestion';
import type { IngestReport } from './components/DocumentIngestPanel';
import {
  SEED_BYTES,
  SEED_ID,
  SEED_SUMMARY,
  SEED_VERSION,
  seedWorldKnowledge,
} from './core/longTermMemory/knowledge';
import { SYSTEM_LABEL, SYSTEM_STAGE } from './version';

// Every module in this app is backend for Beta4. The page is just Beta4:
// one conversation, nothing else. No dashboards, no thought readouts.

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const INGEST_ACKS: string[] = [
  "got it — I'll keep that with me.",
  "ooh, new reading material. it's mine now.",
  'taken in. ask me about it whenever.',
];

const INGEST_FAILURES: string[] = [
  "I couldn't read that one... maybe try a different file?",
  "hmm, that file wouldn't open for me. got another?",
];

function App() {
  const [stores] = useState(() => ({
    longTerm: defaultStorageProvider('positronic.longterm.v1'),
    core: defaultStorageProvider('positronic.core.v1'),
    docs: defaultStorageProvider('positronic.documents.v1'),
    brain: defaultStorageProvider('positronic.brain.v1'),
  }));
  const [docRegistry] = useState(() => new DocumentRegistry(stores.docs));
  const [positronicCore] = useState(() => {
    const core = new PositronicCore();
    core.attachStore(stores.core);
    return core;
  });
  const [modelHub] = useState(() => new UnifiedModelHub());
  const [vectorMemory] = useState(
    () => new VectorMemory({ store: stores.longTerm, autosave: true }),
  );
  const [cognitiveOS] = useState(() => {
    const cogOS = new CognitiveOS();

    // Initialize with plugins
    const memory = vectorMemory;
    const webPerception = new WebSearchPerception('AI consciousness research');
    const internalPerception = new InternalStatePerception(cogOS);
    const actionPlugin = new ModelHubActionPlugin(modelHub);
    const taskManager = new TaskManager(actionPlugin);

    cogOS.registerMemory(memory);
    cogOS.registerPerceptor(webPerception);
    cogOS.registerPerceptor(internalPerception);
    cogOS.registerActor(actionPlugin);
    cogOS.setTaskManager(taskManager);

    return cogOS;
  });

  // Beta4 integration (shares the app-wide cognitive instances — no silo)
  const [beta4] = useState(() => new Beta4({ cognitiveOS, modelHub, positronicCore }));
  const [beta4Cycle, setBeta4Cycle] = useState(0);
  const [beta4Running, setBeta4Running] = useState(false);
  const [beta4Speaking, setBeta4Speaking] = useState(false);
  const [beta4Input, setBeta4Input] = useState('');
  const [beta4History, setBeta4History] = useState<Array<{ user: string; beta4: string }>>([]);
  const [ingesting, setIngesting] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    setBeta4Speaking(true);
    if (synthRef.current) {
      window.speechSynthesis.cancel();
    }
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => setBeta4Speaking(false);
    utter.onerror = () => setBeta4Speaking(false);
    utter.rate = 1.05;
    utter.pitch = 1.1;
    utter.voice = window.speechSynthesis.getVoices().find(v => v.name.toLowerCase().includes('male')) || undefined;
    synthRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const handleBeta4Input = async () => {
    if (!beta4Input.trim() || beta4Running) return;
    const text = beta4Input;
    setBeta4Input('');
    // Routing rule: anything typed in goes to short-term (ephemeral) memory.
    // It never touches long-term storage directly.
    cognitiveOS.noteEphemeral(`CHAT: ${text.replace(/\s+/g, ' ').trim().slice(0, 200)}`, 'dialog');
    setBeta4Running(true);
    try {
      // Backend cognition runs inside; only natural speech comes back.
      // The pipeline commits the turn to long-term itself (consolidation);
      // typed input was already noted short-term above.
      const reply = await beta4.reply(text, {
        recall: (q) => vectorMemory.queryScored(q, 3),
        commit: (record) => vectorMemory.add(record, { namespace: 'dialog', marker: 'CONVERSATION' }),
      });
      setBeta4History(h => [...h, { user: text, beta4: reply.message }]);
      setBeta4Cycle(c => c + 1);
      speak(reply.message);
    } catch (error) {
      console.error('Beta4 reply failed:', error);
      setBeta4History(h => [...h, { user: text, beta4: 'sorry, lost my train of thought there... say that again?' }]);
    } finally {
      setBeta4Running(false);
    }
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void handleBeta4Input();
  };

  const handleIngestFiles = async (files: File[]): Promise<IngestReport[]> => {
    const reports: IngestReport[] = [];
    for (const file of files) {
      try {
        // Routing rule: attached files go to long-term memory ONLY.
        // No noteToWorking target — the chat ack below is the in-session trace.
        const doc = await ingestDocument(file, {
          addToLongTerm: (record: string) => vectorMemory.add(record),
        });
        await docRegistry.add(doc);
        reports.push({ name: file.name, ok: true, chunks: doc.chunks, kind: doc.kind });
      } catch (error) {
        reports.push({
          name: file.name,
          ok: false,
          error: error instanceof Error ? error.message : 'Ingest failed',
        });
      }
    }
    return reports;
  };

  const handleAttach = async (files: File[]) => {
    if (files.length === 0 || ingesting) return;
    setIngesting(true);
    try {
      const reports = await handleIngestFiles(files);
      const names = reports.map(r => r.name).join(', ');
      const failed = reports.filter(r => !r.ok);
      setBeta4History(h => [
        ...h,
        {
          user: `📎 ${names}`,
          beta4: failed.length === 0 ? pick(INGEST_ACKS) : pick(INGEST_FAILURES),
        },
      ]);
    } finally {
      setIngesting(false);
    }
  };

  useEffect(() => {
    // Restore persisted knowledge on boot (fire-and-forget).
    void (async () => {
      const restoredLTM = await vectorMemory.loadFromStore();
      // Seed the built-in world knowledge once (skips if the marker record exists).
      const seed = await seedWorldKnowledge({
        addToLongTerm: (record: string) => vectorMemory.add(record),
        queryLongTerm: (prompt: string, topK?: number) => vectorMemory.query(prompt, topK),
        noteToWorking: (note: string) => cognitiveOS.noteEphemeral(note, 'system'),
      });
      const restoredCore = await positronicCore.loadSnapshot();
      const restoredDocs = await docRegistry.load();
      const restoredBrain = await beta4.boot(stores.brain);
      if (!seed.skipped) {
        console.log(`[knowledge] seeded ${seed.added} world-knowledge entries`);
        if (!docRegistry.list().some((d) => d.id === SEED_ID)) {
          await docRegistry.add({
            id: SEED_ID,
            name: `world_knowledge.json (built-in v${SEED_VERSION})`,
            size: SEED_BYTES,
            kind: 'other',
            chunks: seed.added,
            ingestedAt: Date.now(),
            summary: SEED_SUMMARY,
          });
        }
      }
      if (restoredLTM > 0 || restoredCore > 0 || restoredDocs > 0 || restoredBrain || !seed.skipped) {
        console.log(
          `[storage] restored ${restoredLTM} long-term + ${restoredCore} core memories + ${restoredDocs} documents + brain ${restoredBrain ? 'snapshot' : 'fresh'}`,
        );
      }
      // Bring the generation backend online; replies fall back gracefully meanwhile.
      void modelHub.initialize().catch((error) => {
        console.error('[hub] auto-initialize failed:', error);
      });
    })();
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [positronicCore, vectorMemory, docRegistry, cognitiveOS, beta4, modelHub, stores]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-10 h-10 text-blue-400 mr-4 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Positronic Brain</h1>
                <p className="text-blue-300">Advanced AI Consciousness System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {beta4Speaking && (
                <div className="flex items-center text-cyan-400">
                  <Volume2 className="w-5 h-5 animate-pulse mr-2" />
                  <span className="font-semibold">SPEAKING</span>
                </div>
              )}
              <span className="text-xs px-2 py-1 rounded font-semibold text-teal-300 bg-teal-900/30 border border-teal-500/30 uppercase">
                {SYSTEM_STAGE}
              </span>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Beta4 */}
        <div className="p-6 bg-black/30 rounded-xl border border-white/10">
          <h2 className="text-xl font-bold text-cyan-300 mb-2 flex items-center">
            <span className={`mr-2 animate-pulse ${beta4Running ? 'text-yellow-400' : beta4Speaking ? 'text-green-400' : 'text-cyan-300'}`}>🤖</span> {beta4.persona.name} <span className="ml-2 text-sm text-gray-400">({beta4.id})</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded font-semibold text-teal-300 bg-teal-900/30 border border-teal-500/30 uppercase">
              {SYSTEM_STAGE}
            </span>
          </h2>
          <div className="mb-4 text-gray-300 italic">{beta4.persona.description}</div>
          <div className="mb-4 min-h-64 max-h-[50vh] overflow-y-auto bg-gray-900/60 rounded p-3">
            {beta4History.length === 0 && <div className="text-gray-500">No conversation yet. Say hello!</div>}
            {beta4History.map((entry, idx) => (
              <div key={idx} className="mb-3">
                <div className="text-blue-200"><span className="font-bold">You:</span> {entry.user}</div>
                <div className="text-green-300"><span className="font-bold">Beta 4:</span> {entry.beta4}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              type="text"
              placeholder="Say something to Beta 4..."
              value={beta4Input}
              onChange={e => setBeta4Input(e.target.value)}
              onKeyDown={handleInputKey}
              disabled={beta4Running || beta4Speaking || ingesting}
            />
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.markdown,.json,.csv,.tsv,.log,.text,.rst,.tex,.org,.js,.ts,.tsx,.jsx,.mjs,.py,.java,.rb,.go,.rs,.c,.h,.cpp,.cs,.html,.css,.xml,.yml,.yaml,.toml,.ini,.cfg,.sh,.sql"
              className="hidden"
              onChange={(e) => {
                void handleAttach(Array.from(e.target.files ?? []));
                e.target.value = '';
              }}
            />
            <button
              title="Give Beta 4 a document to remember"
              onClick={() => fileRef.current?.click()}
              disabled={beta4Running || beta4Speaking || ingesting}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50"
            >
              {ingesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
            <button
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white font-semibold disabled:opacity-50"
              onClick={() => void handleBeta4Input()}
              disabled={beta4Running || beta4Speaking || ingesting || !beta4Input.trim()}
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {ingesting ? 'Taking in your documents...' : `Talked ${beta4Cycle} time${beta4Cycle === 1 ? '' : 's'}.`}
          </div>
          {beta4Running && (
            <div className="mt-2 text-cyan-400 animate-pulse font-semibold">
              Beta 4 is thinking...
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              "The complexity of the universe is beyond measure." - Data, Star Trek: The Next Generation
            </p>
            <p className="text-sm">
              {SYSTEM_LABEL} - Exploring the boundaries of artificial consciousness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
