
import { NoteEvent } from './midiWriter';

export interface MidiSample {
    name: string;
    bpm: number;
    notes: NoteEvent[];
}

export const midiSamples: MidiSample[] = [
    {
        name: "Twinkle Twinkle Little Star",
        bpm: 100,
        notes: [
            { note: 'C4', time: 0, duration: 1 }, { note: 'C4', time: 1, duration: 1 },
            { note: 'G4', time: 2, duration: 1 }, { note: 'G4', time: 3, duration: 1 },
            { note: 'A4', time: 4, duration: 1 }, { note: 'A4', time: 5, duration: 1 },
            { note: 'G4', time: 6, duration: 2 },
            { note: 'F4', time: 8, duration: 1 }, { note: 'F4', time: 9, duration: 1 },
            { note: 'E4', time: 10, duration: 1 }, { note: 'E4', time: 11, duration: 1 },
            { note: 'D4', time: 12, duration: 1 }, { note: 'D4', time: 13, duration: 1 },
            { note: 'C4', time: 14, duration: 2 },
        ]
    },
    {
        name: "Ode to Joy",
        bpm: 120,
        notes: [
            { note: 'E4', time: 0, duration: 1 }, { note: 'E4', time: 1, duration: 1 },
            { note: 'F4', time: 2, duration: 1 }, { note: 'G4', time: 3, duration: 1 },
            { note: 'G4', time: 4, duration: 1 }, { note: 'F4', time: 5, duration: 1 },
            { note: 'E4', time: 6, duration: 1 }, { note: 'D4', time: 7, duration: 1 },
            { note: 'C4', time: 8, duration: 1 }, { note: 'C4', time: 9, duration: 1 },
            { note: 'D4', time: 10, duration: 1 }, { note: 'E4', time: 11, duration: 1 },
            { note: 'E4', time: 12, duration: 1.5 }, { note: 'D4', time: 13.5, duration: 0.5 },
            { note: 'D4', time: 14, duration: 2 },
        ]
    },
    {
        name: "Mary Had a Little Lamb",
        bpm: 110,
        notes: [
            { note: 'E4', time: 0, duration: 1 }, { note: 'D4', time: 1, duration: 1 },
            { note: 'C4', time: 2, duration: 1 }, { note: 'D4', time: 3, duration: 1 },
            { note: 'E4', time: 4, duration: 1 }, { note: 'E4', time: 5, duration: 1 },
            { note: 'E4', time: 6, duration: 2 },
            { note: 'D4', time: 8, duration: 1 }, { note: 'D4', time: 9, duration: 1 },
            { note: 'D4', time: 10, duration: 2 },
            { note: 'E4', time: 12, duration: 1 }, { note: 'G4', time: 13, duration: 1 },
            { note: 'G4', time: 14, duration: 2 },
        ]
    },
    {
        name: "Für Elise (Opening)",
        bpm: 80,
        notes: [
            { note: 'E5', time: 0, duration: 0.5 }, { note: 'D#5', time: 0.5, duration: 0.5 },
            { note: 'E5', time: 1, duration: 0.5 }, { note: 'D#5', time: 1.5, duration: 0.5 },
            { note: 'E5', time: 2, duration: 0.5 }, { note: 'B4', time: 2.5, duration: 0.5 },
            { note: 'D5', time: 3, duration: 0.5 }, { note: 'C5', time: 3.5, duration: 0.5 },
            { note: 'A4', time: 4, duration: 2 },
            { note: 'C4', time: 6, duration: 0.5 }, { note: 'E4', time: 6.5, duration: 0.5 },
            { note: 'A4', time: 7, duration: 0.5 }, { note: 'B4', time: 7.5, duration: 0.5 },
            { note: 'E4', time: 8, duration: 0.5 }, { note: 'G#4', time: 8.5, duration: 0.5 },
            { note: 'B4', time: 9, duration: 0.5 }, { note: 'C5', time: 9.5, duration: 0.5 },
            { note: 'E4', time: 10, duration: 2 },
        ]
    },
    {
        name: "Greensleeves",
        bpm: 70,
        notes: [
            { note: 'A4', time: 0, duration: 3 }, { note: 'C5', time: 3, duration: 1 },
            { note: 'D5', time: 4, duration: 3 }, { note: 'E5', time: 7, duration: 1 },
            { note: 'F5', time: 8, duration: 3 }, { note: 'E5', time: 11, duration: 1 },
            { note: 'D5', time: 12, duration: 2 }, { note: 'B4', time: 14, duration: 2 },
            { note: 'G4', time: 16, duration: 3 }, { note: 'A4', time: 19, duration: 1 },
            { note: 'B4', time: 20, duration: 3 }, { note: 'C5', time: 23, duration: 1 },
            { note: 'A4', time: 24, duration: 2 }, { note: 'F#4', time: 26, duration: 2 },
            { note: 'G4', time: 28, duration: 4 },
        ]
    },
];
