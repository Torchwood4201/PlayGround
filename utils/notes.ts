
import type { PianoKey } from '../components/PianoKeyboard';

const A4 = 440;
const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const getFrequency = (noteIndex: number, octave: number): number => {
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9);
    return A4 * Math.pow(2, semitonesFromA4 / 12);
};

export const NOTE_FREQUENCIES: { [note: string]: number } = {};
for (let octave = 0; octave < 9; octave++) {
    for (let i = 0; i < notesSharp.length; i++) {
        const freq = getFrequency(i, octave);
        const sharpName = notesSharp[i];
        const flatName = notesFlat[i];
        NOTE_FREQUENCIES[`${sharpName}${octave}`] = freq;
        // Also map the flat equivalent to the same frequency
        if (sharpName !== flatName) {
            NOTE_FREQUENCIES[`${flatName}${octave}`] = freq;
        }
    }
}


export const generatePianoKeys = (): PianoKey[] => {
    const keys: PianoKey[] = [];
    const notes = notesSharp; // Use sharp names for key generation for UI consistency
    
    // Octave 0: A0, A#0, B0
    for (let i = 9; i < 12; i++) {
        const noteName = notes[i];
        keys.push({
            note: `${noteName}0`,
            frequency: getFrequency(i, 0),
            type: noteName.includes('#') ? 'black' : 'white',
        });
    }

    // Octaves 1 through 7
    for (let octave = 1; octave < 8; octave++) {
        for (let i = 0; i < notes.length; i++) {
            const noteName = notes[i];
            keys.push({
                note: `${noteName}${octave}`,
                frequency: getFrequency(i, octave),
                type: noteName.includes('#') ? 'black' : 'white',
            });
        }
    }

    // Octave 8: C8
    keys.push({
        note: 'C8',
        frequency: getFrequency(0, 8),
        type: 'white',
    });

    return keys;
};

// Generate 88 keys for a full piano keyboard.
export const PIANO_KEYS = generatePianoKeys();

// Mapping for desktop keyboard to piano notes
export const KEYBOARD_MAP: { [key: string]: string } = {
    // Octave 3 (lower row of QWERTY)
    'z': 'C3',
    's': 'C#3',
    'x': 'D3',
    'd': 'D#3',
    'c': 'E3',
    'v': 'F3',
    'g': 'F#3',
    'b': 'G3',
    'h': 'G#3',
    'n': 'A3',
    'j': 'A#3',
    'm': 'B3',
    // Octave 4 (upper row of QWERTY)
    'q': 'C4',
    '2': 'C#4',
    'w': 'D4',
    '3': 'D#4',
    'e': 'E4',
    'r': 'F4',
    '5': 'F#4',
    't': 'G4',
    '6': 'G#4',
    'y': 'A4',
    '7': 'A#4',
    'u': 'B4',
};

// Reverse mapping for displaying shortcuts on the piano UI
export const NOTE_TO_KEY_MAP: { [note: string]: string } = Object.fromEntries(
  Object.entries(KEYBOARD_MAP).map(([key, note]) => [note, key.toUpperCase()])
);
