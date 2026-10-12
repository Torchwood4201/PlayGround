import React, { useRef, useState } from 'react';
import {
    DRUM_VOICES, STEP_COUNT, DEMO_PATTERNS, createEmptyPattern,
    patternToMidiEvents, parsePatternJson, type DrumPattern, type StepValue,
} from '../utils/drumPatterns';
import { downloadMidiFile } from '../utils/midiWriter';
import './DrumMachinePanel.css';

interface DrumMachinePanelProps {
    isPlaying: boolean;
    currentStep: number;
    onPlay: (pattern: DrumPattern) => void;
    onStop: () => void;
    onAudition: (voice: number, pitch: number, velocity: number) => void;
    disabled?: boolean;
}

/**
 * 6-track x 16-step drum sequencer (interaction contracts from
 * shiny-drum-machine: 3-state velocity, audition-on-toggle, JSON
 * save/load + drag-drop; synthesized voices so no samples needed).
 */
export const DrumMachinePanel: React.FC<DrumMachinePanelProps> = ({
    isPlaying, currentStep, onPlay, onStop, onAudition, disabled = false,
}) => {
    const [pattern, setPattern] = useState<DrumPattern>(DEMO_PATTERNS[0]);
    const fileRef = useRef<HTMLInputElement>(null);

    const restartWith = (next: DrumPattern) => {
        setPattern(next);
        if (isPlaying) {
            onStop();
            // Restart on next tick so state settles first.
            setTimeout(() => onPlay(next), 0);
        }
    };

    const handleToggle = (voice: number, step: number) => {
        if (disabled) return;
        const next: DrumPattern = {
            ...pattern,
            steps: pattern.steps.map((row, v) =>
                v === voice ? row.map((s, i) => (i === step ? ((s + 1) % 3 as StepValue) : s)) : [...row],
            ),
        };
        setPattern(next);
        const value = next.steps[voice][step];
        if (value !== 0) onAudition(voice, next.pitches[voice], value === 2 ? 1 : 0.35);
        if (isPlaying) {
            onStop();
            setTimeout(() => onPlay(next), 0);
        }
    };

    const handleParam = (patch: Partial<DrumPattern>) => {
        restartWith({ ...pattern, ...patch });
    };

    const handlePitch = (voice: number, pitch: number) => {
        if (disabled) return;
        const next: DrumPattern = {
            ...pattern,
            pitches: pattern.pitches.map((p, v) => (v === voice ? pitch : p)),
        };
        restartWith(next);
    };

    const handleSave = () => {
        const blob = new Blob([JSON.stringify(pattern, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `drums-${date}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = parsePatternJson(JSON.parse(String(reader.result)));
                if (parsed) {
                    if (isPlaying) onStop();
                    setPattern(parsed);
                }
            } catch {
                // Ignore malformed files silently.
            }
        };
        reader.readAsText(file);
    };

    const handleExportMidi = () => {
        downloadMidiFile(patternToMidiEvents(pattern), pattern.tempo, `${pattern.name}-drums`);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="ls-dm-wrap" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
            <div className="ls-dm-head">
                <h3 className="ls-dm-title">Drum Machine <span className="ls-dm-kit">Analog Kit · synthesized</span></h3>
                <div className="ls-dm-transport">
                    {!isPlaying ? (
                        <button type="button" className="ls-dm-play" onClick={() => onPlay(pattern)} disabled={disabled} aria-label="Play drum pattern">
                            ▶ Play
                        </button>
                    ) : (
                        <button type="button" className="ls-dm-stop" onClick={onStop} aria-label="Stop drum pattern">
                            ⏹ Stop
                        </button>
                    )}
                </div>
            </div>

            <fieldset disabled={disabled} className="ls-dm-body">
                <div className="ls-dm-params">
                    <label className="ls-dm-param">Tempo {pattern.tempo} BPM
                        <input type="range" min={50} max={180} step={1} value={pattern.tempo} onChange={e => handleParam({ tempo: Number(e.target.value) })} />
                    </label>
                    <label className="ls-dm-param">Swing {Math.round(pattern.swing * 100)}%
                        <input type="range" min={0} max={1} step={0.01} value={pattern.swing} onChange={e => handleParam({ swing: Number(e.target.value) })} />
                    </label>
                </div>

                <div className="ls-dm-scroll">
                    <div className="ls-dm-grid">
                        <div className="ls-dm-corner" />
                        {Array.from({ length: STEP_COUNT }, (_, s) => (
                            <div key={s} className={`ls-dm-led${currentStep === s ? ' ls-dm-led-on' : ''}`} aria-hidden="true" />
                        ))}
                        {DRUM_VOICES.map((voice, v) => (
                            <React.Fragment key={voice.id}>
                                <button
                                    type="button"
                                    className="ls-dm-voice"
                                    onClick={() => onAudition(v, pattern.pitches[v], 1)}
                                    title={`Audition ${voice.name} (GM ${voice.midiNote})`}
                                >
                                    {voice.name}
                                </button>
                                {Array.from({ length: STEP_COUNT }, (_, s) => {
                                    const value = pattern.steps[v][s];
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            aria-label={`${voice.name} step ${s + 1} ${value === 0 ? 'off' : value === 1 ? 'half' : 'full'}`}
                                            aria-pressed={value !== 0}
                                            className={`ls-dm-step ls-dm-step-${value}${currentStep === s ? ' ls-dm-step-now' : ''}${s % 4 === 0 ? ' ls-dm-step-bar' : ''}`}
                                            onClick={() => handleToggle(v, s)}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="ls-dm-pitches">
                    {DRUM_VOICES.map((voice, v) => (
                        <label key={voice.id} className="ls-dm-pitch">{voice.name}
                            <input
                                type="range" min={0} max={1} step={0.01} value={pattern.pitches[v]}
                                onDoubleClick={() => handlePitch(v, 0.5)}
                                onChange={e => handlePitch(v, Number(e.target.value))}
                                title="Double-click to reset"
                            />
                        </label>
                    ))}
                </div>

                <div className="ls-dm-tools">
                    <div className="ls-dm-demos">
                        {DEMO_PATTERNS.map(d => (
                            <button
                                key={d.name}
                                type="button"
                                className={`ls-dm-demo${pattern.name === d.name ? ' ls-dm-demo-active' : ''}`}
                                onClick={() => { if (isPlaying) onStop(); setPattern(d); }}
                            >
                                {d.name}
                            </button>
                        ))}
                        <button type="button" className="ls-dm-demo" onClick={() => { if (isPlaying) onStop(); setPattern(createEmptyPattern()); }}>
                            Blank
                        </button>
                    </div>
                    <div className="ls-dm-io">
                        <button type="button" className="ls-dm-ghost" onClick={handleSave}>Save JSON</button>
                        <button type="button" className="ls-dm-ghost" onClick={() => fileRef.current?.click()}>Load</button>
                        <button type="button" className="ls-dm-ghost" onClick={handleExportMidi}>Export .mid</button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".json,application/json"
                            hidden
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
                        />
                    </div>
                </div>
                <p className="ls-dm-hint">Tip: drag &amp; drop a saved pattern anywhere on this panel to load it. Drums run through the pedalboard FX.</p>
            </fieldset>
        </div>
    );
};
