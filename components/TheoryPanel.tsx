import React, { useMemo, useState } from 'react';
import { ALL_NOTES, ScaleName, getScaleNotes, getScaleChords, type ScaleChord } from '../utils/musicTheory';
import { downloadMidiFile, type NoteEvent } from '../utils/midiWriter';
import './TheoryPanel.css';

interface TheoryPanelProps {
    onAuditionChord: (pitches: string[]) => void;
    onHighlightChange: (pitchClasses: Set<string>) => void;
    disabled?: boolean;
}

const SCALES: ScaleName[] = ['Major', 'Minor', 'Dorian', 'Mixolydian'];

/** Pick an octave-4 spelling for a pitch class (falls back to octave 3). */
export const pitchToNoteName = (pitchClass: string, octave = 4): string => `${pitchClass}${octave}`;

/**
 * Music-theory teaching panel (tables adapted from GuoChen018/piano-app):
 * scale selector with keyboard highlighting, diatonic chord cards with
 * audition, 4-slot progression tray, and MIDI export.
 */
export const TheoryPanel: React.FC<TheoryPanelProps> = ({ onAuditionChord, onHighlightChange, disabled = false }) => {
    const [root, setRoot] = useState('C');
    const [scale, setScale] = useState<ScaleName>('Major');
    const [progression, setProgression] = useState<ScaleChord[]>([]);
    const [bpm, setBpm] = useState(120);

    const scaleNotes = useMemo(() => getScaleNotes(root, scale), [root, scale]);
    const chords = useMemo(() => getScaleChords(root, scale), [root, scale]);

    const handleScaleChange = (newRoot: string, newScale: ScaleName) => {
        setRoot(newRoot);
        setScale(newScale);
        onHighlightChange(new Set(getScaleNotes(newRoot, newScale)));
    };

    const handleClearHighlight = () => {
        onHighlightChange(new Set());
    };

    const handleAddChord = (chord: ScaleChord) => {
        if (disabled || progression.length >= 4) return;
        setProgression(prev => [...prev, chord]);
        onAuditionChord(chord.notes);
    };

    const handleRemoveChord = (index: number) => {
        setProgression(prev => prev.filter((_, i) => i !== index));
    };

    const handlePlayProgression = () => {
        if (disabled) return;
        progression.forEach((chord, i) => {
            setTimeout(() => onAuditionChord(chord.notes), i * 700);
        });
    };

    const handleExportMidi = () => {
        if (progression.length === 0) return;
        const events: NoteEvent[] = [];
        progression.forEach((chord, bar) => {
            chord.notes.forEach(pc => {
                events.push({ note: pitchToNoteName(pc, 4), time: bar * 4, duration: 3.5 });
            });
        });
        downloadMidiFile(events, bpm, `progression-${root}-${scale}`);
    };

    return (
        <div className="ls-theory-wrap">
            <h3 className="ls-theory-title">Music Theory</h3>
            <fieldset disabled={disabled} className="ls-theory-body">
                <div className="ls-theory-row">
                    <label className="ls-theory-label">Root
                        <select value={root} onChange={e => handleScaleChange(e.target.value, scale)} className="ls-theory-select">
                            {ALL_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                    <label className="ls-theory-label">Scale
                        <select value={scale} onChange={e => handleScaleChange(root, e.target.value as ScaleName)} className="ls-theory-select">
                            {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                    <button type="button" className="ls-theory-ghost" onClick={handleClearHighlight}>Clear highlight</button>
                </div>

                <div className="ls-theory-scale-notes" aria-live="polite">
                    {scaleNotes.map(n => <span key={n} className="ls-theory-note-chip">{n}</span>)}
                </div>

                <div className="ls-theory-chords">
                    {chords.map(chord => (
                        <button
                            key={chord.roman}
                            type="button"
                            className="ls-theory-chord-card"
                            onClick={() => handleAddChord(chord)}
                            title={`Add ${chord.roman} (${chord.notes.join('–')}) to progression`}
                        >
                            <span className="ls-theory-roman">{chord.roman}</span>
                            <span className="ls-theory-chord-notes">{chord.notes.join(' ')}</span>
                        </button>
                    ))}
                </div>

                <div className="ls-theory-tray">
                    <div className="ls-theory-tray-head">
                        <span>Progression ({progression.length}/4)</span>
                        <div className="ls-theory-tray-actions">
                            <button type="button" className="ls-theory-ghost" onClick={handlePlayProgression} disabled={progression.length === 0}>Play</button>
                            <button type="button" className="ls-theory-ghost" onClick={() => setProgression([])} disabled={progression.length === 0}>Clear</button>
                        </div>
                    </div>
                    <div className="ls-theory-slots">
                        {progression.length === 0 && <span className="ls-theory-empty">Click chord cards to build a I–IV–V…</span>}
                        {progression.map((chord, i) => (
                            <button key={`${chord.roman}-${i}`} type="button" className="ls-theory-slot" onClick={() => handleRemoveChord(i)} title="Remove chord">
                                <span className="ls-theory-order">{i + 1}</span>
                                <span className="ls-theory-roman">{chord.roman}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ls-theory-row">
                    <label className="ls-theory-label">Export BPM
                        <input type="number" min={40} max={240} value={bpm} onChange={e => setBpm(Number(e.target.value) || 120)} className="ls-theory-select ls-theory-bpm" />
                    </label>
                    <button type="button" className="ls-theory-export" onClick={handleExportMidi} disabled={progression.length === 0}>
                        Export progression (.mid)
                    </button>
                </div>
            </fieldset>
        </div>
    );
};
