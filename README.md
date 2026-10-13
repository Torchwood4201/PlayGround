# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/Torchwood4201/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/Torchwood4201/PlayGround)

- 🎮 [Open the project](https://omgithub.com/Torchwood4201/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=Torchwood4201%2FPlayGround).
- 💻 [Explore the source](https://github.com/Torchwood4201/PlayGround).
- 🛠️ [Check build runs](https://github.com/Torchwood4201/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/Torchwood4201/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/Torchwood4201).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

## Positronic Brain — realigned cognitive structure

Imported from `Positronic-AI.zip` and refactored into cognitive modules
(perception, working memory, long-term memory, reasoning) behind a
controller, per the realignment guide.

```plaintext
/src
  /components
    AIFace.tsx / CognitiveInterface.tsx / ... (11 panels)
    /shared            # SectionCard, StatusBadge, healthColor
  /core
    /perception/       # PerceptionPlugin, WebSearchPerception, InternalStatePerception
    /workingMemory/    # TaskManager, WorkingMemoryBuffer, Task
    /longTermMemory/   # MemoryPlugin, VectorMemory (persisted via storage/)
    /reasoning/        # Guardrail, ModelHubActionPlugin, RLPlugin, selectActionForTask
    /storage/          # StorageProvider, LocalStorageProvider, InMemoryProvider
    /ingestion/        # extractText (pdf/docx/text), chunkText, ingestDocument, DocumentRegistry
    controller.ts      # CognitiveOS orchestrator + EventBus (pub/sub)
    feedback.ts        # FeedbackTracker (self-calibration)
    CognitiveOS.ts     # backward-compat re-export facade
    PositronicBrain.ts # reconstructed (was an empty 1-byte placeholder)
    PositronicCore.ts  # neural/ethical/memory facade (stable UI API)
    UnifiedModelHub.ts # text/vision/audio model hub (web-simulated)
    Beta4.ts           # unified "person" combining all modules
  /hooks
  /types               # + PerceptionOutput, ReasoningPlan, CycleResult, CognitiveEvent...
  App.tsx / main.tsx
```

Notes:

- `src/core/CognitiveOS.ts` is now a thin re-export shim; canonical code
  lives in `controller.ts` + the four cognitive submodules. Existing imports
  keep working.
- `src/core/PositronicBrain.ts` was empty in the zip and broke `Beta4`/`App`;
  it is reconstructed with the API they expect
  (`perceive`, `thinkAndAct`, `memory`, `workingMemory`, `emotion`, `goal`).
- Inter-module communication: `CognitiveOS.events` event bus
  (`perception:update`, `memory:stored`, `reasoning:plan`, `action:result`,
  `feedback:score`, `system:health`) + `CognitiveOS.feedback` self-calibration
  that nudges the health score each cycle.
- Verified: `npm run build` passes; runtime smoke (2 cognitive cycles,
  brain + Beta4 think/act, event + feedback flow) passes.

## Own storage — how the AI keeps what it learns

No external models or vector DBs. Persistence is a small provider seam:

- `src/core/storage/` — `StorageProvider` interface (`load`/`save`/`clear`)
  with `LocalStorageProvider` (browser, quota-safe with prune-on-full) and
  `InMemoryProvider` (fallback). `defaultStorageProvider(key)` picks
  localStorage when available, memory otherwise — so a future desktop/file
  backend only needs a new provider, no core changes.
- `VectorMemory` (long-term knowledge) — `attachStore()` + `loadFromStore()`
  on boot, debounced autosave on every `add()`, plus `exportJSON()` /
  `importJSON()` / `clearAll()` / `flush()`.
- `PositronicCore` (visible memory list) — `attachStore()` +
  `loadSnapshot()` on boot, autosave, `exportSnapshot()` / `importSnapshot()`
  / `clearMemories()`.
- `App.tsx` wires two keys: `positronic.longterm.v1` (cognitive cycles) and
  `positronic.core.v1` (conversations), both restored at startup.
- `MemoryCore` panel shows a Persisted/Session-only badge plus
  Export (downloads a dated `.json` backup), Import (restores a backup file),
  and Forget-all (with confirm) controls.

## Document upload — files go to both memories

`src/core/ingestion/` + the `DocumentIngest` panel (drag-drop or browse):

- Supported: **PDF** (pdf.js, lazy-loaded), **DOCX** (mammoth, lazy-loaded),
  and plain-text family (`.txt/.md/.json/.csv`/code/…). Legacy `.doc` and
  binaries are rejected with a clear message. 20MB / 200-chunk caps per file.
- **Long-term**: text is chunked (~1200 chars, paragraph/sentence-aware with
  overlap) and each chunk is stored in `VectorMemory` prefixed
  `DOCUMENT "<name>" [i/n]:` so recall cites its source file.
- **Short-term**: a summary is pinned into working memory via
  `CognitiveOS.rememberWorking()`, so the next planning cycle reads it as
  immediate context (history capped at 300 entries).
- `DocumentRegistry` tracks ingested files (name, kind, chunks, pages) and
  persists the list under `positronic.documents.v1`; removing an entry only
  removes the listing — stored chunks stay in long-term memory.

## Built-in world knowledge — the AI's own reference memory

`src/data/world_knowledge.json` (v1.1, 83 entries across technology, empires,
religions, mathematics, art, codes, music, science, philosophy, literature)
ships with the app; `src/core/knowledge/` loads it into the AI's own stores:

- `flattenWorldKnowledge()` turns each entry into a `KNOWLEDGE [category]
  "Name" …` record (one per entry + overview).
- `seedWorldKnowledge()` stores all records in `VectorMemory` on first boot,
  posts a summary to working memory, and writes a `SEEDED:` marker — reseeds
  are skipped, so reloads never duplicate entries. The seed also appears in
  the Document panel list as `world_knowledge.json (built-in v1.1)`.
- Retrieval fix: `VectorMemory.query` now blends keyword overlap (dominant)
  with the simulated embedding + importance, so named entities reliably
  surface their own records (verified: Roman Empire, Morse Code, CRISPR,
  Calculus all recall top-3). A real embedding backend would rebalance these
  weights.

