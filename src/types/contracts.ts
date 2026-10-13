// contracts.ts — the single documented contract between dialog and cycles.
//
// > Cycles are autonomous background cognition. Dialog is a separate path.
// > Dialog reads KNOWLEDGE from long-term memory; it never triggers or steers cycles.
// > Cycles plan from OBSERVATION / TASK / experience plus explicitly promoted notes only.
//
// | Path   | Writes                                                        | Reads                                          | Never                                  |
// |--------|---------------------------------------------------------------|------------------------------------------------|----------------------------------------|
// | Dialog | dialog-namespaced LTM records, ephemeral working notes,       | knowledge-namespaced LTM via                   | calls runCycle, writes committed       |
// |        | ConversationEntry (App.handleMessage → answerComposer)         | queryScored + CONVERSATION exclusion          | history                                |
// | Cycle  | observation/task/experience records, committed history,       | queryCycle (allowlist, no dialog),             | calls onMessage, reads the ephemeral   |
// |        | feedback (runCycle)                                           | getCycleVisibleHistory(5)                      | buffer except via promoteToCycle       |
//
// The ONLY dialog→cycle bridge is manual: CognitiveInterface's "Promote to
// cycle" button calls promoteToCycle() with a logged reason. Seed/ingest
// completion promotes a task-namespaced summary, never raw chat text.
export {};
