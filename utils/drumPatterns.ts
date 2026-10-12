import type { NoteEvent } from './midiWriter';

// Drum kit model (ideas from Revisto/drum-machine DrumPart + GM map and
// shiny-drum-machine INSTRUMENTS table). All voices are synthesized in
// hooks/useDrumMachine.ts — no audio files, no network.

export interface DrumVoice {
    id: string;
    name: string;
    /** General MIDI percussion note (Revisto DEFAULT_MIDI_NOTES convention). */
    midiNote: number;
    /** Base pitch used by the synthesizer (Hz). Scaled by per-voice pitch. */
    baseFreq: number;
}

export const DRUM_VOICES: DrumVoice[] = [
    { id: 'kick', name: 'Kick', midiNote: 36, baseFreq: 150 },
    { id: 'snare', name: 'Snare', midiNote: 38, baseFreq: 180 },
    { id: 'hihat', name: 'HiHat', midiNote: 42, baseFreq: 8000 },
    { id: 'tom1', name: 'Tom 1', midiNote: 43, baseFreq: 220 },
    { id: 'tom2', name: 'Tom 2', midiNote: 45, baseFreq: 180 },
    { id: 'tom3', name: 'Tom 3', midiNote: 47, baseFreq: 140 },
];

export const STEP_COUNT = 16;

/** Step velocity: 0 = off, 1 = half, 2 = full (shiny-drum-machine convention). */
export type StepValue = 0 | 1 | 2;
export const STEP_GAINS: Record<StepValue, number> = { 0: 0, 1: 0.35, 2: 1 };

export interface DrumPattern {
    name: string;
    tempo: number; // BPM, 50–180
    swing: number; // 0–1
    pitches: number[]; // per-voice pitch 0–1 (0.5 = neutral)
    steps: StepValue[][]; // [voice][16]
}

export const createEmptyPattern = (name = 'My Beat'): DrumPattern => ({
    name,
    tempo: 120,
    swing: 0,
    pitches: DRUM_VOICES.map(() => 0.5),
    steps: DRUM_VOICES.map(() => Array<StepValue>(STEP_COUNT).fill(0)),
});

/** Fresh factory patterns (in the spirit of shiny DEMO_BEATS, written from scratch). */
export const DEMO_PATTERNS: DrumPattern[] = [
    {
        name: 'Four Floor',
        tempo: 124,
        swing: 0,
        pitches: DRUM_VOICES.map(() => 0.5),
        steps: [
            [2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0], // kick
            [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0], // snare
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // hihat
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom1
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom2
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], // tom3
        ],
    },
    {
        name: 'Boom Bap',
        tempo: 92,
        swing: 0.45,
        pitches: DRUM_VOICES.map(() => 0.5),
        steps: [
            [2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0], // kick
            [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0], // snare
            [2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 1], // hihat
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0], // tom1
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom2
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom3
        ],
    },
    {
        name: 'Half Time',
        tempo: 70,
        swing: 0.15,
        pitches: DRUM_VOICES.map(() => 0.5),
        steps: [
            [2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0], // kick
            [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0], // snare
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // hihat
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom1
            [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom2
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // tom3
        ],
    },
];

const MIDI_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const midiNoteName = (midi: number): string => {
    const pc = MIDI_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${pc}${octave}`;
};

/** 16th-note grid -> NoteEvents in beats (for jsonToMidi export). */
export function patternToMidiEvents(pattern: DrumPattern): NoteEvent[] {
    const events: NoteEvent[] = [];
    pattern.steps.forEach((voiceSteps, v) => {
        const midiName = midiNoteName(DRUM_VOICES[v].midiNote);
        voiceSteps.forEach((step, s) => {
            if (step === 0) return;
            events.push({ note: midiName, time: s * 0.25, duration: 0.24 });
        });
    });
    return events;
}

/** Validate + normalize an imported JSON pattern (file load / drag-drop). */
export function parsePatternJson(json: unknown): DrumPattern | null {
    if (!json || typeof json !== 'object') return null;
    const p = json as Partial<DrumPattern>;
    if (!Array.isArray(p.steps) || p.steps.length !== DRUM_VOICES.length) return null;
    if (!p.steps.every(row => Array.isArray(row) && row.length === STEP_COUNT)) return null;
    const steps = p.steps.map(row => row.map(v => (v === 2 ? 2 : v === 1 ? 1 : 0) as StepValue));
    const pitches = Array.isArray(p.pitches) && p.pitches.length === DRUM_VOICES.length
        ? p.pitches.map(v => (typeof v === 'number' ? Math.min(1, Math.max(0, v)) : 0.5))
        : DRUM_VOICES.map(() => 0.5);
    const tempo = typeof p.tempo === 'number' ? Math.min(180, Math.max(50, p.tempo)) : 120;
    const swing = typeof p.swing === 'number' ? Math.min(1, Math.max(0, p.swing)) : 0;
    return { name: typeof p.name === 'string' ? p.name.slice(0, 60) : 'Imported Beat', tempo, swing, pitches, steps };
}
