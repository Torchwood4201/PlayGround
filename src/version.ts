// version.ts — single source of truth for the system release stage.
//
// History: the system shipped without any stage marker (the Alpha era).
// It is now promoted to Beta: same architecture, now stabilized behind the
// contracts in types/contracts.ts with persisted memory, grounded answers,
// and the brain as Beta4's backend.

export const SYSTEM_VERSION = '2.47';
export type SystemStage = 'alpha' | 'beta';
export const SYSTEM_STAGE: SystemStage = 'beta';

export const SYSTEM_LABEL = `Positronic Brain System v${SYSTEM_VERSION}-${SYSTEM_STAGE}`;
