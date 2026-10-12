
import { Midi } from '@tonejs/midi';

export interface NoteEvent {
  note: string;
  time: number; // in beats
  duration: number; // in beats
}

/**
 * Converts a JSON representation of notes into a MIDI file buffer.
 * @param notes An array of note events.
 * @param bpm The beats per minute for the MIDI file.
 * @returns An ArrayBuffer containing the MIDI data.
 */
export const jsonToMidi = (notes: NoteEvent[], bpm: number): ArrayBuffer => {
    const midi = new Midi();
    const track = midi.addTrack();
    
    // Set tempo
    midi.header.setTempo(bpm);
    
    // Function to convert beats to seconds
    const beatsToSeconds = (beats: number) => (60 / bpm) * beats;

    notes.forEach(noteEvent => {
        // The prompt to Gemini in App.tsx asks for monophonic lead, so 'note' is a single note string.
        // We'll add a check for rests or invalid notes.
        if (noteEvent.note && noteEvent.note.toLowerCase() !== 'rest' && typeof noteEvent.time === 'number' && typeof noteEvent.duration === 'number') {
             track.addNote({
                name: noteEvent.note,
                time: beatsToSeconds(noteEvent.time),
                duration: beatsToSeconds(noteEvent.duration),
                velocity: 0.9 // a good default velocity
            });
        }
    });

    // Return the MIDI data as an ArrayBuffer
    return midi.toArray().buffer;
};

/**
 * Downloads note events as a .mid file (pattern adapted from
 * piano-app's downloadMidiFile, but using this repo's NoteEvent shape
 * and @tonejs/midi writer). Sorts by beat so simultaneous drum/piano
 * chords pack correctly (Revisto/drum-machine group-by-beat idea).
 */
export const downloadMidiFile = (notes: NoteEvent[], bpm: number, filename: string): void => {
    const sorted = [...notes]
        .filter(n => n.note && n.note.toLowerCase() !== 'rest' && typeof n.time === 'number' && typeof n.duration === 'number')
        .sort((a, b) => a.time - b.time || a.note.localeCompare(b.note));
    const buffer = jsonToMidi(sorted, bpm);
    const blob = new Blob([buffer], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
};
