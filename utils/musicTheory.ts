// Music theory helpers (adapted from GuoChen018/piano-app theory tables,
// normalized to this repo's sharp/flat note names in utils/notes.ts).
// Pure functions only: no audio, no network, fully unit-testable.

export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type ScaleName = 'Major' | 'Minor' | 'Dorian' | 'Mixolydian';

export const SCALE_INTERVALS: Record<ScaleName, number[]> = {
    Major: [0, 2, 4, 5, 7, 9, 11],
    Minor: [0, 2, 3, 5, 7, 8, 10],
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

export type ChordQuality = 'M' | 'm' | 'dim';

export const CHORD_QUALITIES: Record<string, ChordQuality> = {
    Major: 'M',
    Minor: 'm',
    Dorian: 'm',
    Mixolydian: 'M',
};

export const ROMAN_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

const FLAT_TO_SHARP: Record<string, string> = {
    Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
};

/** Full note name (e.g. 'F#4', 'Db3') -> pitch class in sharps (e.g. 'F#', 'C#'). */
export function pitchClass(note: string): string {
    const m = /^([A-G])([#b]?)/.exec(note.trim());
    if (!m) return note;
    const base = m[1] + (m[2] || '');
    if (m[2] === 'b') return FLAT_TO_SHARP[base] || base;
    return base;
}

/** Root pitch class + scale -> scale pitch classes. */
export function getScaleNotes(root: string, scale: ScaleName): string[] {
    const rootPc = pitchClass(root);
    const rootIndex = ALL_NOTES.indexOf(rootPc);
    if (rootIndex < 0) return [];
    const intervals = SCALE_INTERVALS[scale];
    return intervals.map(i => ALL_NOTES[(rootIndex + i) % 12]);
}

/** Root pitch class + triad quality -> chord pitch classes (root position). */
export function buildChord(rootPc: string, quality: ChordQuality): string[] {
    const root = pitchClass(rootPc);
    const rootIndex = ALL_NOTES.indexOf(root);
    if (rootIndex < 0) return [];
    const third = quality === 'M' ? 4 : 3;
    const fifth = quality === 'dim' ? 6 : 7;
    return [0, third, fifth].map(i => ALL_NOTES[(rootIndex + i) % 12]);
}

export interface ScaleChord {
    roman: string;
    root: string;
    quality: ChordQuality;
    notes: string[];
}

/** Scale degrees of a key -> diatonic triads with roman numerals. */
export function getScaleChords(root: string, scale: ScaleName): ScaleChord[] {
    const scaleNotes = getScaleNotes(root, scale);
    if (scaleNotes.length !== 7) return [];
    // Diatonic triad qualities per degree.
    const qualities: ChordQuality[] = scale === 'Major'
        ? ['M', 'm', 'm', 'M', 'M', 'm', 'dim']
        : scale === 'Minor'
            ? ['m', 'dim', 'M', 'm', 'm', 'M', 'M']
            : scale === 'Dorian'
                ? ['m', 'm', 'M', 'M', 'm', 'dim', 'M']
                : ['M', 'm', 'dim', 'M', 'm', 'm', 'M']; // Mixolydian
    return scaleNotes.map((chordRoot, i) => ({
        roman: ROMAN_NUMERALS[i],
        root: chordRoot,
        quality: qualities[i],
        notes: buildChord(chordRoot, qualities[i]),
    }));
}
