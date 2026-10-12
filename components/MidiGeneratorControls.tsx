
import React from 'react';

interface MidiGeneratorControlsProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    genre: string;
    onGenreChange: (value: string) => void;
    rootNote: string;
    onRootNoteChange: (value: string) => void;
    scale: string;
    onScaleChange: (value: string) => void;
    bpm: number;
    onBpmChange: (value: number) => void;
    bars: number;
    onBarsChange: (value: number) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    disabled: boolean;
    error: string | null;
}

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Blues', 'Dorian', 'Phrygian'];
const GENRES = ['Pop', 'Hip Hop', 'Funk', 'Drill', 'Grime', 'Reggae', 'Rap', 'Trap', 'Trip Hop', 'Jazz', 'Blues', 'R&B', 'Rock', 'Classical', 'Lo-fi'];

export const MidiGeneratorControls: React.FC<MidiGeneratorControlsProps> = ({
    prompt, onPromptChange, genre, onGenreChange, rootNote, onRootNoteChange, scale, onScaleChange,
    bpm, onBpmChange, bars, onBarsChange, onGenerate, isGenerating, disabled, error
}) => {
    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Generative AI MIDI</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">
                <fieldset disabled={disabled || isGenerating} className="space-y-4">
                    <div>
                        <label htmlFor="gen-prompt" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Describe the vibe or style</label>
                        <textarea
                            id="gen-prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            placeholder="e.g., a simple, happy melody"
                            className="neumorphic-inset bg-black/20 border border-white/10 text-white text-sm rounded-lg block w-full p-2.5"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="gen-genre" className="block text-sm font-medium text-blue-200/70 mb-2">Genre</label>
                            <select id="gen-genre" value={genre} onChange={e => onGenreChange(e.target.value)} className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg block w-full p-2.5 appearance-none">
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="gen-root" className="block text-sm font-medium text-blue-200/70 mb-2">Key</label>
                            <select id="gen-root" value={rootNote} onChange={e => onRootNoteChange(e.target.value)} className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg block w-full p-2.5 appearance-none">
                                {ROOT_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="gen-scale" className="block text-sm font-medium text-blue-200/70 mb-2">Scale</label>
                            <select id="gen-scale" value={scale} onChange={e => onScaleChange(e.target.value)} className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg block w-full p-2.5 appearance-none">
                                {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="gen-bpm" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Tempo (BPM): {bpm}</label>
                        <input id="gen-bpm" type="range" min="60" max="200" step="1" value={bpm} onChange={e => onBpmChange(parseInt(e.target.value))} />
                    </div>
                     <div>
                        <label htmlFor="gen-bars" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Bars: {bars}</label>
                        <input id="gen-bars" type="range" min="2" max="16" step="2" value={bars} onChange={e => onBarsChange(parseInt(e.target.value))} />
                    </div>
                    
                    {error && <p className="text-red-400 text-xs text-center bg-red-900/30 p-2 rounded-md">{error}</p>}

                    <button
                        onClick={onGenerate}
                        className="w-full p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400 rounded-lg neumorphic-outset text-white disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : 'Generate Piano Line'}
                    </button>
                </fieldset>
            </div>
        </div>
    );
};
