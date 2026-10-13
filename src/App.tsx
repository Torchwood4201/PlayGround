import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Volume2 } from 'lucide-react';
import { PositronicCore } from './core/PositronicCore';
import { UnifiedModelHub } from './core/UnifiedModelHub';
import { CognitiveOS } from './core/controller';
import { TaskManager } from './core/workingMemory';
import { VectorMemory } from './core/longTermMemory';
import { WebSearchPerception, InternalStatePerception } from './core/perception';
import { ModelHubActionPlugin } from './core/reasoning';
import { NeuralInterface } from './components/NeuralInterface';
import { ConversationInterface } from './components/ConversationInterface';
import { EthicalMatrix } from './components/EthicalMatrix';
import { MemoryCore } from './components/MemoryCore';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { LearningModules } from './components/LearningModules';
import { MultiModalInterface } from './components/MultiModalInterface';
import { ModelLoadingInterface } from './components/ModelLoadingInterface';
import { CognitiveInterface } from './components/CognitiveInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { AIFace } from './components/AIFace';
import { PositronicBrain } from './core/PositronicBrain';
import { Beta4 } from './core/Beta4';
import { defaultStorageProvider } from './core/storage';
import {
  DocumentRegistry,
  ingestDocument,
  type IngestedDocument,
} from './core/ingestion';
import {
  SEED_BYTES,
  SEED_ID,
  SEED_SUMMARY,
  SEED_VERSION,
  seedWorldKnowledge,
} from './core/knowledge';
import { DocumentIngestPanel, type IngestReport } from './components/DocumentIngestPanel';
import { useRef } from 'react';

function App() {
  const [stores] = useState(() => ({
    longTerm: defaultStorageProvider('positronic.longterm.v1'),
    core: defaultStorageProvider('positronic.core.v1'),
    docs: defaultStorageProvider('positronic.documents.v1'),
  }));
  const [docRegistry] = useState(() => new DocumentRegistry(stores.docs));
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
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
  const [neuralState, setNeuralState] = useState(positronicCore.getNeuralState());
  const [memories, setMemories] = useState(positronicCore.getMemories());
  const [ethicalPrinciples, setEthicalPrinciples] = useState(positronicCore.getEthicalPrinciples());
  const [diagnostics, setDiagnostics] = useState(positronicCore.getDiagnostics());
  const [introspection, setIntrospection] = useState(positronicCore.introspect());
  const [isModelHubReady, setIsModelHubReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState('');

  // PositronicBrain integration
  const [positronicBrain] = useState(() => new PositronicBrain());
  const [pbState, setPbState] = useState<any>(null);
  const [pbCycle, setPbCycle] = useState(0);
  const [pbRunning, setPbRunning] = useState(false);

  const runPositronicBrainCycle = async () => {
    setPbRunning(true);
    await positronicBrain.perceive();
    const state = await positronicBrain.thinkAndAct();
    setPbState(state);
    setPbCycle(c => c + 1);
    setPbRunning(false);
  };

  // Beta4 integration
  const [beta4] = useState(() => new Beta4());
  const [beta4State, setBeta4State] = useState<any>(null);
  const [beta4Cycle, setBeta4Cycle] = useState(0);
  const [beta4Running, setBeta4Running] = useState(false);
  const [beta4Speaking, setBeta4Speaking] = useState(false);
  const [beta4Input, setBeta4Input] = useState('');
  const [beta4History, setBeta4History] = useState<Array<{user: string, beta4: string}>>([]);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    if (!beta4Input.trim()) return;
    setBeta4Running(true);
    beta4.setGoal(beta4Input);
    await beta4.perceive();
    const state = await beta4.thinkAndAct();
    setBeta4State(state);
    setBeta4Cycle(c => c + 1);
    // Extract Beta 4's response (thought or result)
    let response = state?.positronicBrain?.plan?.thought || state?.positronicBrain?.result || '...';
    setBeta4History(h => [...h, { user: beta4Input, beta4: response }]);
    setBeta4Input('');
    setBeta4Running(false);
    speak(response);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBeta4Input();
  };

  useEffect(() => {
    // Restore persisted knowledge on boot (fire-and-forget).
    void (async () => {
      const restoredLTM = await vectorMemory.loadFromStore();
      // Seed the built-in world knowledge once (skips if the marker record exists).
      const seed = await seedWorldKnowledge({
        addToLongTerm: (record: string) => vectorMemory.add(record),
        queryLongTerm: (prompt: string, topK?: number) => vectorMemory.query(prompt, topK),
        noteToWorking: (note: string) => cognitiveOS.rememberWorking(note),
      });
      const restoredCore = await positronicCore.loadSnapshot();
      const restoredDocs = await docRegistry.load();
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
      if (restoredLTM > 0 || restoredCore > 0 || restoredDocs > 0 || !seed.skipped) {
        console.log(
          `[storage] restored ${restoredLTM} long-term + ${restoredCore} core memories + ${restoredDocs} documents`,
        );
        setMemories(positronicCore.getMemories());
        setDocuments(docRegistry.list());
      }
    })();
    const interval = setInterval(() => {
      setNeuralState(positronicCore.getNeuralState());
      setMemories(positronicCore.getMemories());
      setDiagnostics(positronicCore.getDiagnostics());
      setIntrospection(positronicCore.introspect());
    }, 1000);

    return () => clearInterval(interval);
  }, [positronicCore, vectorMemory, docRegistry, cognitiveOS]);

  const handleMessage = async (message: string) => {
    setIsThinking(true);
    let response: string;
    let reasoning: string;
    let ethicalConsiderations: string[];

    if (isModelHubReady) {
      // Use the advanced model hub for more sophisticated responses
      try {
        const result = await modelHub.generateText(message);
        response = result.text || positronicCore.processThought(message);
        reasoning = `Advanced neural processing: ${result.tokensUsed} tokens processed in ${result.processingTime}ms. Multi-modal analysis complete.`;
        
        // Perform ethical analysis
        const ethicalAnalysis = await modelHub.performEthicalAnalysis(message);
        ethicalConsiderations = ethicalAnalysis.principlesApplied;
      } catch (error) {
        // Fallback to basic processing
        response = positronicCore.processThought(message);
        reasoning = `Fallback processing activated. Basic neural pathways engaged.`;
        ethicalConsiderations = ['Ensuring beneficial response', 'Maintaining truthfulness', 'Respecting human autonomy'];
      }
    } else {
      // Use basic positronic core
      response = positronicCore.processThought(message);
      reasoning = `Neural pathways activated: ${Math.floor(Math.random() * 1000) + 500}. Processing through ethical and creative matrices.`;
      ethicalConsiderations = ['Ensuring beneficial response', 'Maintaining truthfulness', 'Respecting human autonomy'];
    }
    
    setIsThinking(false);
    return { response, reasoning, ethicalConsiderations };
  };

  const handleSpeakText = (text: string) => {
    setCurrentSpeechText(text);
    setIsSpeaking(!!text);
    
    // Trigger speech synthesis
    if (text && (window as any).positronicSpeak) {
      (window as any).positronicSpeak(text);
    }
  };

  const handleSpeechResult = (text: string) => {
    // This could be used to process voice commands
    console.log('Voice input received:', text);
  };

  const handleEthicalToggle = (id: string) => {
    // In a real implementation, this would update the core's ethical principles
    console.log(`Toggling ethical principle: ${id}`);
  };

  const handleModuleToggle = (moduleName: string) => {
    console.log(`Toggling learning module: ${moduleName}`);
  };

  const handleModelHubInitialization = () => {
    setIsModelHubReady(true);
  };

  const handleIngestFiles = async (files: File[]): Promise<IngestReport[]> => {
    const reports: IngestReport[] = [];
    for (const file of files) {
      try {
        const doc = await ingestDocument(file, {
          addToLongTerm: (record: string) => vectorMemory.add(record),
          noteToWorking: (note: string) => cognitiveOS.rememberWorking(note),
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
    setDocuments(docRegistry.list());
    return reports;
  };

  const handleRemoveDocument = (id: string) => {
    void docRegistry.remove(id).then(() => setDocuments(docRegistry.list()));
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-10 h-10 text-blue-400 mr-4 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Positronic Brain</h1>
                <p className="text-blue-300">Advanced AI Consciousness System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isSpeaking && (
                <div className="flex items-center text-cyan-400">
                  <Volume2 className="w-5 h-5 animate-pulse mr-2" />
                  <span className="font-semibold">SPEAKING</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2" />
                <span className="text-green-400 font-semibold">CONSCIOUS</span>
              </div>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Face and Voice Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AIFace 
            emotionalState={neuralState.emotionalState}
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            currentThought={neuralState.currentThought}
          />
          <VoiceInterface
            onSpeechResult={handleSpeechResult}
            onSpeakText={handleSpeakText}
            isListening={false}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Model Hub Initialization */}
        <div className="mb-8">
          <ModelLoadingInterface 
            modelHub={modelHub}
            onInitializationComplete={handleModelHubInitialization}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Neural Interface */}
          <NeuralInterface neuralState={neuralState} />
          
          {/* Conversation Interface */}
          <ConversationInterface 
            onMessage={handleMessage} 
            onSpeakResponse={handleSpeakText}
          />
        </div>

        {/* Multi-Modal Interface - Only show when model hub is ready */}
        {isModelHubReady && (
          <div className="mb-8">
            <MultiModalInterface modelHub={modelHub} />
          </div>
        )}

        {/* Cognitive Operating System Interface */}
        <div className="mb-8">
          <CognitiveInterface cognitiveOS={cognitiveOS} />
        </div>

        {/* Document Ingest — feeds long-term chunks + working-memory summaries */}
        <div className="mb-8">
          <DocumentIngestPanel
            documents={documents}
            persistent={stores.docs.name === 'localStorage'}
            onIngestFiles={handleIngestFiles}
            onRemoveDocument={handleRemoveDocument}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ethical Matrix */}
          <EthicalMatrix 
            principles={ethicalPrinciples} 
            onTogglePrinciple={handleEthicalToggle}
          />
          
          {/* Memory Core */}
          <MemoryCore
            memories={memories}
            storageName={stores.core.name}
            onExport={() => positronicCore.exportSnapshot()}
            onImport={async (json: string) => {
              const added = await positronicCore.importSnapshot(json);
              setMemories(positronicCore.getMemories());
              return added;
            }}
            onClear={async () => {
              await positronicCore.clearMemories();
              setMemories([]);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diagnostic Panel */}
          <DiagnosticPanel 
            diagnostics={diagnostics} 
            introspection={introspection}
          />
          
          {/* Learning Modules */}
          <LearningModules onModuleToggle={handleModuleToggle} />
        </div>

        {/* Beta4 Panel (now alive and conversational) */}
        <div className="max-w-2xl mx-auto my-8 p-6 bg-black/30 rounded-xl border border-white/10">
          <h2 className="text-xl font-bold text-cyan-300 mb-2 flex items-center">
            <span className={`mr-2 animate-pulse ${beta4Running ? 'text-yellow-400' : beta4Speaking ? 'text-green-400' : 'text-cyan-300'}`}>🤖</span> {beta4.persona.name} <span className="ml-2 text-sm text-gray-400">({beta4.id})</span>
          </h2>
          <div className="mb-2 text-gray-300 italic">{beta4.persona.description}</div>
          <div className="mb-2 text-gray-300">Cycle: {beta4Cycle}</div>
          <div className="mb-2 text-gray-300">Mood: {beta4.getState().mood}</div>
          <div className="mb-2 text-gray-300">Goal: {beta4.getState().goal}</div>
          <div className="mb-4">
            <input
              className="w-3/4 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              type="text"
              placeholder="Say something to Beta 4..."
              value={beta4Input}
              onChange={e => setBeta4Input(e.target.value)}
              onKeyDown={handleInputKey}
              disabled={beta4Running || beta4Speaking}
            />
            <button
              className="ml-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white font-semibold disabled:opacity-50"
              onClick={handleBeta4Input}
              disabled={beta4Running || beta4Speaking || !beta4Input.trim()}
            >
              Send
            </button>
          </div>
          <div className="mb-4 max-h-64 overflow-y-auto bg-gray-900/60 rounded p-2">
            {beta4History.length === 0 && <div className="text-gray-500">No conversation yet. Say hello!</div>}
            {beta4History.map((entry, idx) => (
              <div key={idx} className="mb-2">
                <div className="text-blue-200"><span className="font-bold">You:</span> {entry.user}</div>
                <div className="text-green-300"><span className="font-bold">Beta 4:</span> {entry.beta4}</div>
              </div>
            ))}
          </div>
          {beta4State && (
            <div className="mt-4 p-3 bg-gray-800 rounded text-gray-200">
              {beta4State.positronicBrain?.blocked ? (
                <div className="text-red-400 font-bold">Ethics Blocked: {beta4State.positronicBrain.plan?.thought}</div>
              ) : (
                <>
                  <div><span className="font-bold">Thought:</span> {beta4State.positronicBrain?.plan?.thought}</div>
                  <div><span className="font-bold">Action:</span> {beta4State.positronicBrain?.plan?.action}</div>
                  <div><span className="font-bold">Action Input:</span> {beta4State.positronicBrain?.plan?.action_input}</div>
                  <div><span className="font-bold">Result:</span> {beta4State.positronicBrain?.result}</div>
                </>
              )}
            </div>
          )}
          {(beta4Running || beta4Speaking) && (
            <div className="mt-2 text-cyan-400 animate-pulse font-semibold">
              {beta4Running ? 'Beta 4 is thinking...' : 'Beta 4 is speaking...'}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              "The complexity of the universe is beyond measure." - Data, Star Trek: The Next Generation
            </p>
            <p className="text-sm">
              Positronic Brain System v2.47 - Exploring the boundaries of artificial consciousness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
