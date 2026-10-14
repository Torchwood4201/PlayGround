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

> Release stage: **beta** (`src/version.ts`, `v2.47-beta`). The system shipped
> without a stage marker (the Alpha era) and is now promoted: same
> architecture, stabilized behind the cycle↔dialog contracts, persisted
> memory, grounded answers, and the brain as Beta4's backend.

Imported from `Positronic-AI.zip` and refactored into cognitive modules
(perception, working memory, long-term memory, reasoning) behind a
controller, per the realignment guide.

```plaintext
/src
  /components
    Beta4 lives on the page (header + conversation + footer); other panels
    remain as dormant views, not rendered. /shared holds SectionCard, StatusBadge.
  /core
    /perception/       # PerceptionPlugin, WebSearchPerception, InternalStatePerception
      /ingestion/      # extractText (pdf/docx/text), chunkText, ingestDocument, DocumentRegistry
    /workingMemory/    # TaskManager, WorkingMemoryBuffer, Task, neuralState
    /longTermMemory/   # MemoryPlugin, VectorMemory, experienceLog
      /storage/        # StorageProvider, LocalStorageProvider, InMemoryProvider
      /knowledge/      # world-knowledge seeder (flatten + seed-once)
    /reasoning/        # Guardrail, ModelHubActionPlugin, RLPlugin, selectActionForTask
                       # answerComposer, naturalVoice (Beta4's voice box), ethicalAnalysis, cannedResponse
    controller.ts      # CognitiveOS orchestrator (cycles; direct typed calls, no bus)
    feedback.ts        # FeedbackTracker (self-calibration, recorded from runCycle only)
    PositronicBrain.ts # Beta4's private persisted backend (planner/memory/affect)
    PositronicCore.ts  # experience projector facade (stable UI API over submodules)
    UnifiedModelHub.ts # text/vision/audio model hub (web-simulated, auto-initialized)
    Beta4.ts           # the "person" entity; owns the brain backend
  /hooks
  /types               # + memory (namespaces/notes), brain (snapshot), contracts (cycle↔dialog rules)
  App.tsx (Beta4 page) / main.tsx
```

Notes:

- `src/core/CognitiveOS.ts` shim deleted (re-export-only, zero importers);
  canonical code lives in `controller.ts` + the four cognitive submodules.
- `src/core/PositronicBrain.ts` was empty in the zip and broke `Beta4`/`App`;
  it is reconstructed with the API they expect
  (`perceive`, `thinkAndAct`, `memory`, `workingMemory`, `emotion`, `goal`).
- Inter-module communication: direct typed calls (the old emit-only event bus
  had nine emit sites and zero subscribers, so it was removed with a reason
  comment in `controller.ts`) + `CognitiveOS.feedback` self-calibration
  that nudges the health score each cycle.
- Verified: `npm run build` passes; runtime smoke (2 cognitive cycles,
  brain + Beta4 think/act, feedback flow) passes.

## Cycles ≠ dialog — the contract (`src/types/contracts.ts`)

- **Cycles are autonomous background cognition** (`CognitiveOS.runCycle`,
  driven from `CognitiveInterface`). **Dialog is a separate path**
  (`App.handleMessage` → `ConversationInterface` → `answerComposer`).
  Neither invokes the other.
- Long-term records carry namespaces (`dialog|knowledge|observation|task|
  experience|system`, `src/types/memory.ts`). Cycle retrieval (`queryCycle`)
  is allowlisted to everything except `dialog`; legacy prefix records
  (`CONVERSATION`, `DOCUMENT`, `OBSERVATION`…) route via `inferNamespace`.
- Working memory is split: dialog/seed/ingest notes land in an **ephemeral**
  buffer the planner never reads; the planner reads committed history only.
  The ONLY dialog→cycle bridge is the manual **"Promote to cycle"** button
  in `CognitiveInterface` (logged + deduplicated).

## Brain = Beta4's backend (`src/core/PositronicBrain.ts`, `src/core/Beta4.ts`)

- The brain is Beta4's private substrate (`#brain`, no live accessor):
  planner/memory/affect, persisted via `StorageProvider`
  (`positronic.brain.v1`, snapshot + debounced autosave, tolerant load).
  Outsiders see frozen copies (`getBrainSnapshot()`); mutations go through
  person verbs (`perceive/thinkAndAct/setGoal`) + `boot()`/`restoreBrain()`.
- `cognitiveOS` inside Beta4 is LOOP-ONLY (optional `tick()` for one background
  cycle; hot path never calls it). `modelHub` is the brain's generation service
  (`attachGenerator`) with canned fallback when unloaded. `positronicCore` is
  the experience projector for cold `getState()`/`introspect()` paths.

## Beta4's voice — late-night human, never thought readouts
- The page is only Beta4: header, one conversation, footer. All panels are
  backend now (hub auto-initializes on boot; documents attach via 📎).
- `Beta4.reply(input, recall)` is the sole front door: backend cognition runs
  inside, and ONLY natural speech comes out — no plans, thoughts, actions,
  scores, or debug boxes anywhere in the UI.
- `src/core/reasoning/naturalVoice.ts` renders late-night register (soft,
  unhurried, honest): strong memory match → the fact woven into speech;
  familiar topic → hedged ("rings a bell..."); nothing → a musing, never a
  fabrication; ethics-block → a soft refusal. A 24-word system-vocabulary
  denylist is asserted clean across 135+ checks.

## Memory routing rule

- **Attached files → long-term memory only.** Ingested chunks persist in
  `VectorMemory` (`positronic.longterm.v1`); no working-memory note is written.
  The chat acknowledgement is the only in-session trace.
- **Anything typed in → short-term memory only.** Each input is noted to the
  ephemeral working buffer (`origin: 'dialog'`), which the cycle planner never
  reads. Typed input never touches long-term storage directly.

## Own storage — how the AI keeps what it learns

No external models or vector DBs. Persistence is a small provider seam:

- `src/core/longTermMemory/storage/` — `StorageProvider` interface (`load`/`save`/`clear`)
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

`src/core/perception/ingestion/` + the `DocumentIngest` panel (drag-drop or browse):

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
ships with the app; `src/core/longTermMemory/knowledge/` loads it into the AI's own stores:

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
  weights. `queryScored()` exposes the hybrid score for grounding thresholds.

## Grounded answers — chat replies from its own memory

`src/core/reasoning/answerComposer.ts` + retrieval wired into
`App.tsx handleMessage`:

- Every question first runs `vectorMemory.queryScored(message, 5)` (seed
  knowledge + uploaded documents + prior turns, never breaking chat on failure).
- **Strong match** (top `KNOWLEDGE`/`DOCUMENT` hit, score ≥ 1.5): the fact
  *leads* the answer (`From memory ([1] label): excerpt…`), template
  discarded, with an "Answered from memory" badge. Hits below 0.3 are noise
  and excluded, so gibberish falls back cleanly.
- **Weak/no match**: existing template kept, relevant citations appended.
- Each answer renders collapsible **Sources** in the chat panel.
- Each turn persists back: `CONVERSATION Q:… | A:…` to long-term memory +
  a `rememberWorking()` note to short-term (past turns are excluded from
  grounding, so no feedback loops).
- Cleanup folded in: dead `PositronicBrain` demo state removed from `App.tsx`;
  `Beta4` now takes shared `{ cognitiveOS, modelHub, positronicCore }`
  instead of constructing its own silo; `CognitiveInterface` Start/Stop uses
  a ref-driven loop (the old `while (isRunning)` captured stale state).

