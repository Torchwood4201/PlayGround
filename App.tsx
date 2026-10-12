
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Hooks
import { useAudioOscillator } from './hooks/useAudioOscillator';
import { useDrumMachine } from './hooks/useDrumMachine';

// Components
import { FrequencyDisplay } from './components/FrequencyDisplay';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { XyScopeVisualizer } from './components/XyScopeVisualizer';
import { TheoryPanel, pitchToNoteName } from './components/TheoryPanel';
import { DrumMachinePanel } from './components/DrumMachinePanel';
import { PianoKeyboard } from './components/PianoKeyboard';
import { MasterControls } from './components/MasterControls';
import { PresetManager } from './components/PresetManager';
import { EffectsPedalboard } from './components/EffectsPedalboard';
import { MidiPlayerControls } from './components/MidiPlayerControls';
import { MidiGeneratorControls } from './components/MidiGeneratorControls';
import { ArpeggiatorControls, ArpeggiatorConfig } from './components/ArpeggiatorControls';
import { RecorderControls } from './components/RecorderControls';
import { AiSingerControls } from './components/AiSingerControls';


// Utils
import { PIANO_KEYS, KEYBOARD_MAP, NOTE_FREQUENCIES } from './utils/notes';
import { pitchClass } from './utils/musicTheory';
import { defaultPresets } from './utils/presets';
import { jsonToMidi, type NoteEvent } from './utils/midiWriter';
import { midiSamples, MidiSample } from './utils/midiSamples';


// @ts-ignore
import MidiPlayer from './utils/midiPlayer.js';

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'sine-dc' | 'pulse' | 'neg-ramp' | 'arch' | 'organ' | 'piano' | 'acoustic-guitar' | 'flute' | 'sonic-screwdriver' | 'white-noise' | 'pink-noise' | 'brown-noise';

const WAVEFORM_GROUPS = [
    {
        label: 'Instruments',
        options: [ { value: 'piano', label: 'Piano' }, { value: 'organ', label: 'Organ' }, { value: 'acoustic-guitar', label: 'Acoustic Guitar' }, { value: 'flute', label: 'Flute' }, { value: 'sonic-screwdriver', label: 'Sonic Wave' } ]
    },
    {
        label: 'Standard Waves',
        options: [ { value: 'sine', label: 'Sine' }, { value: 'square', label: 'Square' }, { value: 'sawtooth', label: 'Sawtooth' }, { value: 'triangle', label: 'Triangle' }, { value: 'pulse', label: 'Pulse' }, { value: 'neg-ramp', label: 'Negative Ramp' }, { value: 'arch', label: 'Arch' } ]
    },
    {
        label: 'Noise',
        options: [ { value: 'white-noise', label: 'White Noise' }, { value: 'pink-noise', label: 'Pink Noise' }, { value: 'brown-noise', label: 'Brown Noise' } ]
    }
];

const App: React.FC = () => {
    // Master State
    const [isPoweredOn, setIsPoweredOn] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [activeNotes, setActiveNotes] = useState(new Map<string, number>());
    
    // Synth Settings State
    const [currentPresetId, setCurrentPresetId] = useState(defaultPresets[0].id);
    const [settings, setSettings] = useState(defaultPresets[0].settings);

    // Effects On/Off State
    const [isFilterOn, setIsFilterOn] = useState(true);
    const [isDistortionOn, setIsDistortionOn] = useState(false);
    const [isDelayOn, setIsDelayOn] = useState(false);
    const [isVibratoOn, setIsVibratoOn] = useState(true);
    const [isReverbOn, setIsReverbOn] = useState(true);
    const [isTremoloOn, setIsTremoloOn] = useState(false);
    const [isChorusOn, setIsChorusOn] = useState(false);

    // Arpeggiator State
    const [arpConfig, setArpConfig] = useState<ArpeggiatorConfig>({
        isOn: false,
        tempo: 150,
        pattern: 'up',
        octave: 1
    });
    const heldNotesRef = useRef<Set<string>>(new Set()); // Physical keys/notes held
    const arpIntervalRef = useRef<any>(null);

    // MIDI Player State
    const playerRef = useRef<any>(null);
    const [midiFileName, setMidiFileName] = useState<string | null>(null);
    const [isMidiPlaying, setIsMidiPlaying] = useState(false);
    const [midiProgress, setMidiProgress] = useState(0);

    // MIDI Generator State
    const [genPrompt, setGenPrompt] = useState('a simple, happy melody');
    const [genGenre, setGenGenre] = useState('Pop');
    const [genRootNote, setGenRootNote] = useState('C');
    const [genScale, setGenScale] = useState('Major');
    const [genBpm, setGenBpm] = useState(120);
    const [genBars, setGenBars] = useState(4);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);


    const { play, noteOff, setVolume: setAudioVolume, analyserNode, analyserL, analyserR, getDrumBus, startRecording, stopRecording, masterStream } = useAudioOscillator();
    const heldKeysRef = useRef(new Set<string>());

    // Theory highlight (pitch classes shared with the piano keyboard).
    const [theoryHighlight, setTheoryHighlight] = useState<Set<string>>(new Set());
    const theoryTimeoutsRef = useRef<number[]>([]);

    // Drum machine transport (synthesized voices through the host FX chain).
    const { isPlaying: isDrumPlaying, currentStep: drumStep, play: playDrums, stop: stopDrums, audition: auditionDrum } = useDrumMachine(getDrumBus);

    const getFullPlayConfig = useCallback(() => ({
        ...settings,
        isFilterOn, isDistortionOn, isDelayOn, isVibratoOn, isReverbOn, isTremoloOn, isChorusOn
    }), [settings, isFilterOn, isDistortionOn, isDelayOn, isVibratoOn, isReverbOn, isTremoloOn, isChorusOn]);
    
    // Core sound triggering (bypasses Arp logic)
    const triggerSound = useCallback((frequency: number, velocity: number = 0.9) => {
        play({ frequency, velocity, ...getFullPlayConfig() });
    }, [play, getFullPlayConfig]);

    const stopSound = useCallback((frequency: number) => {
        noteOff(settings.releaseTime, frequency);
    }, [noteOff, settings.releaseTime]);

    // Arpeggiator Logic
    useEffect(() => {
        if (!isPoweredOn || !arpConfig.isOn) {
            if (arpIntervalRef.current) {
                clearInterval(arpIntervalRef.current);
                arpIntervalRef.current = null;
            }
            return;
        }

        let step = 0;
        // Keep track of the currently playing note in the arp sequence so we can stop it
        let lastArpFreq: number | null = null; 

        arpIntervalRef.current = setInterval(() => {
            const heldNotes = Array.from(heldNotesRef.current) as string[];
            if (heldNotes.length === 0) {
                if (lastArpFreq) {
                    stopSound(lastArpFreq);
                    lastArpFreq = null;
                }
                return;
            }

            // Generate Arp Sequence based on held notes
            let sequence: number[] = [];
            
            // Base frequencies
            const baseFreqs = heldNotes.map(n => NOTE_FREQUENCIES[n]).sort((a, b) => a - b);
            
            // Octave expansion
            for (let oct = 0; oct < arpConfig.octave; oct++) {
                baseFreqs.forEach(f => sequence.push(f * Math.pow(2, oct)));
            }

            if (arpConfig.pattern === 'down') sequence.reverse();
            else if (arpConfig.pattern === 'upDown') {
                 sequence = [...sequence, ...[...sequence].reverse().slice(1, -1)];
            } else if (arpConfig.pattern === 'random') {
                sequence.sort(() => Math.random() - 0.5);
            }

            if (sequence.length === 0) return;

            // Pick next note
            const freq = sequence[step % sequence.length];
            step++;

            if (lastArpFreq && lastArpFreq !== freq) {
                 // Short release for arp
                 noteOff(0.05, lastArpFreq);
            }
            
            triggerSound(freq, 0.8);
            lastArpFreq = freq;

        }, arpConfig.tempo);

        return () => {
            if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
            if (lastArpFreq) stopSound(lastArpFreq);
        };
    }, [isPoweredOn, arpConfig, triggerSound, stopSound, noteOff]);


    const handleNoteOn = useCallback((note: string, frequency: number, velocity: number = 0.9) => {
        if (!isPoweredOn) return;
        
        // Track held notes physically
        heldNotesRef.current.add(note);
        setActiveNotes(prev => new Map(prev).set(note, frequency));

        // If ARP is OFF, play sound directly
        if (!arpConfig.isOn) {
            triggerSound(frequency, velocity);
        }
    }, [isPoweredOn, arpConfig.isOn, triggerSound]);

    const handleNoteOff = useCallback((note: string) => {
        if (!isPoweredOn) return;
        
        heldNotesRef.current.delete(note);
        const frequency = NOTE_FREQUENCIES[note];
        
        // Only stop sound if ARP is OFF
        if (!arpConfig.isOn && frequency) {
            stopSound(frequency);
        }

        setActiveNotes(prev => {
            const newMap = new Map(prev);
            newMap.delete(note);
            return newMap;
        });
    }, [isPoweredOn, arpConfig.isOn, stopSound]);

    // Audition a theory chord (pitch classes) as a quick strum on the host engine.
    const handleAuditionChord = useCallback((pitches: string[]) => {
        if (!isPoweredOn) return;
        theoryTimeoutsRef.current.forEach(id => window.clearTimeout(id));
        theoryTimeoutsRef.current = [];
        pitches.forEach((pc, i) => {
            const noteName = pitchToNoteName(pitchClass(pc), 4);
            const frequency = NOTE_FREQUENCIES[noteName] ?? NOTE_FREQUENCIES[pitchToNoteName(pitchClass(pc), 3)];
            if (!frequency) return;
            const onId = window.setTimeout(() => handleNoteOn(noteName, frequency, 0.85), i * 90);
            const offId = window.setTimeout(() => handleNoteOff(noteName), 900 + i * 90);
            theoryTimeoutsRef.current.push(onId, offId);
        });
    }, [isPoweredOn, handleNoteOn, handleNoteOff]);

    // Clear pending theory auditions on unmount / power off.
    useEffect(() => {
        if (!isPoweredOn) {
            theoryTimeoutsRef.current.forEach(id => window.clearTimeout(id));
            theoryTimeoutsRef.current = [];
            if (isDrumPlaying) stopDrums();
        }
    }, [isPoweredOn, isDrumPlaying, stopDrums]);

    useEffect(() => () => {
        theoryTimeoutsRef.current.forEach(id => window.clearTimeout(id));
    }, []);

    const handleTogglePower = useCallback(() => {
        setIsPoweredOn(prev => {
            if (prev) { // Turning off
                activeNotes.forEach((_, note) => handleNoteOff(note));
                setActiveNotes(new Map());
                heldNotesRef.current.clear();
            }
            return !prev;
        });
    }, [activeNotes, handleNoteOff]);

    useEffect(() => {
        setAudioVolume(isPoweredOn ? volume : 0);
    }, [volume, isPoweredOn, setAudioVolume]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat || heldKeysRef.current.has(event.key)) return;
            const noteName = KEYBOARD_MAP[event.key.toLowerCase()];
            if (noteName && NOTE_FREQUENCIES[noteName]) {
                heldKeysRef.current.add(event.key);
                handleNoteOn(noteName, NOTE_FREQUENCIES[noteName]);
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (!heldKeysRef.current.has(event.key)) return;
            heldKeysRef.current.delete(event.key);
            const noteName = KEYBOARD_MAP[event.key.toLowerCase()];
            if (noteName) handleNoteOff(noteName);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleNoteOn, handleNoteOff]);

    const handleLoadPreset = (presetId: string) => {
        const preset = defaultPresets.find(p => p.id === presetId);
        if (preset) {
            setSettings(preset.settings);
            setCurrentPresetId(preset.id);
            // Auto-enable effects if they have values in preset
            if ((preset.settings.chorusMix ?? 0) > 0) setIsChorusOn(true);
            else setIsChorusOn(false);
        }
    };
    
    // MIDI Player Logic
    const handleMidiPlay = () => {
        if (playerRef.current && !isMidiPlaying) {
            playerRef.current.play();
            setIsMidiPlaying(true);
        }
    };

    const loadMidiData = useCallback((data: ArrayBuffer, name: string) => {
        if (playerRef.current) {
            playerRef.current.stop();
        }
        
        const p: any = new MidiPlayer.Player();
        
        p.on('midiEvent', (event: any) => {
            if (!isPoweredOn) return;
            
            if (event.name === 'Note on' && event.velocity > 0) {
                const frequency = NOTE_FREQUENCIES[event.noteName];
                if (frequency) {
                     // MidiPlayer.js provides velocity from 0-100
                     const velocity = event.velocity / 100;
                     handleNoteOn(event.noteName, frequency, velocity);
                }
            } else if (event.name === 'Note off' || (event.name === 'Note on' && event.velocity === 0)) {
                handleNoteOff(event.noteName);
            }
        });

        p.on('playing', ({ tick }: { tick: number }) => {
            if (p.totalTicks > 0) {
                setMidiProgress((tick / p.totalTicks) * 100);
            }
        });

        p.on('endOfFile', () => {
            setIsMidiPlaying(false);
            setMidiProgress(100);
            setTimeout(() => setMidiProgress(0), 1000); // Reset progress bar after a second
        });

        p.loadArrayBuffer(data);
        playerRef.current = p;
        setMidiFileName(name);
        setIsMidiPlaying(false);
        setMidiProgress(0);

        if (name === 'Generated Composition') {
             setTimeout(() => {
                if (isPoweredOn) {
                    handleMidiPlay();
                }
             }, 500);
        }
    }, [isPoweredOn, handleNoteOn, handleNoteOff]);


    const handleFileLoad = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                loadMidiData(e.target.result as ArrayBuffer, file.name);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const handleSampleLoad = (sample: MidiSample) => {
        const midiBuffer = jsonToMidi(sample.notes, sample.bpm);
        loadMidiData(midiBuffer, sample.name);
    };

    const handleMidiPause = () => {
        if (playerRef.current && isMidiPlaying) {
            playerRef.current.pause();
            setIsMidiPlaying(false);
        }
    };
    const handleMidiStop = () => {
        if (playerRef.current) {
            playerRef.current.stop();
            setIsMidiPlaying(false);
            setMidiProgress(0);
            // Stop all sounds
            activeNotes.forEach((frequency) => stopSound(frequency));
            setActiveNotes(new Map());
            heldNotesRef.current.clear();
        }
    };

    const handleGenerateMidi = async () => {
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const totalBeats = genBars * 4; // Assuming 4/4 time

            const prompt = `
You are an expert music composition assistant. Your task is to generate a polyphonic piano composition based on the user's request.
The output MUST BE ONLY a valid JSON array of note objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
Each object in the array must have three properties:
1. "note": A string representing the note and octave (e.g., "C4", "F#5").
2. "time": A number representing the start time of the note in beats, starting from 0.
3. "duration": A number representing the duration of the note in beats.

Generation Parameters:
- Genre: ${genGenre}
- Key: ${genRootNote} ${genScale}
- Tempo: ${genBpm} BPM
- Length: ${genBars} bars in 4/4 time (total of ${totalBeats} beats).
- Vibe/Style: ${genPrompt}

Composition Guidelines:
- Create a complete piano part, including melody, chords, and a bass line where appropriate for the genre.
- The composition must be musically coherent and fit the specified genre, key, and scale.
- The total duration of the composition must be exactly ${totalBeats} beats.
- Use a standard piano range (e.g., A0 to C8).
- Use a variety of rhythms suitable for the genre.
- Ensure notes can overlap (polyphony) by setting their "time" values correctly. For example, a chord would have multiple notes with the same "time" value.
- The final output must be a single, clean JSON array.
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const responseText = response.text.trim();
            // Clean the response: remove markdown and comments before parsing.
            const jsonString = responseText
                .replace(/^```json\s*|```$/g, '')
                .replace(/\/\/.*/g, '');
            
            let generatedNotes: NoteEvent[];
            try {
                generatedNotes = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse AI response:", jsonString)
                throw new Error("AI returned invalid JSON. Please try generating again.");
            }

            if (!Array.isArray(generatedNotes) || generatedNotes.length === 0 || generatedNotes.some(n => !n.note || typeof n.time !== 'number' || typeof n.duration !== 'number')) {
                 throw new Error("AI returned a malformed or empty data structure.");
            }
            
            const midiBuffer = jsonToMidi(generatedNotes, genBpm);
            loadMidiData(midiBuffer, 'Generated Composition');

        } catch (error) {
            console.error("MIDI Generation Error:", error);
            setGenerationError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };


    // Stop MIDI player on power off
    useEffect(() => {
        if (!isPoweredOn && playerRef.current && isMidiPlaying) {
            handleMidiStop();
        }
    }, [isPoweredOn, isMidiPlaying]);

    const activeNoteEntry = activeNotes.size > 0 ? [...activeNotes.entries()][activeNotes.size - 1] : null;
    
    const renderWaveformOptions = () => WAVEFORM_GROUPS.map(group => (
        <optgroup key={group.label} label={group.label}>
            {group.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </optgroup>
    ));

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <header className="text-center p-6 relative">
                 <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse">
                    LIQUID SYNTH <span className="text-2xl font-light text-cyan-200 align-top opacity-80">1.0</span>
                </h1>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pb-64 max-w-[1600px] mx-auto w-full">
                <div className="lg:col-span-1 space-y-8 flex flex-col">
                    <div className="glass-base rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
                         <FrequencyDisplay
                            frequency={activeNoteEntry ? activeNoteEntry[1] : 0}
                            isPlaying={isPoweredOn && activeNotes.size > 0}
                            isScanMode={false}
                            scanMinFreq={0} scanMaxFreq={0}
                            oscillatorType={settings.oscillatorType}
                            activeNote={activeNoteEntry ? activeNoteEntry[0] : null}
                        />
                        <div className="mt-6">
                            <WaveformVisualizer analyserNode={analyserNode} />
                        </div>
                        <div className="mt-6">
                            <XyScopeVisualizer analyserL={analyserL} analyserR={analyserR} monoFallback={analyserNode} disabled={!isPoweredOn} />
                        </div>
                    </div>
                    
                    <div className="glass-base rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <MasterControls isPlaying={isPoweredOn} onTogglePlay={handleTogglePower} volume={volume} onVolumeChange={setVolume} />
                    </div>

                    <AiSingerControls disabled={!isPoweredOn} masterStream={masterStream} />
                    <RecorderControls startRecording={startRecording} stopRecording={stopRecording} disabled={!isPoweredOn} />
                </div>

                <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2 custom-scrollbar">
                    
                     <div className="p-6 glass-base neumorphic-outset rounded-2xl space-y-6">
                         
                        <div className="p-6 glass-base neumorphic-inset rounded-xl space-y-6">
                            <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Oscillator Core</h3>
                            <fieldset disabled={!isPoweredOn} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label htmlFor="osc-type" className="block text-xs uppercase tracking-wider text-blue-200/70 mb-2 font-semibold">Primary Wave</label><select id="osc-type" value={settings.oscillatorType} onChange={e => setSettings(s => ({...s, oscillatorType: e.target.value as Waveform}))} className="neumorphic-outset bg-black/20 border border-white/10 text-white text-sm rounded-lg block w-full p-2.5 appearance-none focus:ring-2 focus:ring-cyan-500">{renderWaveformOptions()}</select></div>
                                    {settings.mixRatio > 0 && <div><label htmlFor="sec-osc-type" className="block text-xs uppercase tracking-wider text-blue-200/70 mb-2 font-semibold">Secondary Wave</label><select id="sec-osc-type" value={settings.secondaryOscillatorType} onChange={e => setSettings(s => ({...s, secondaryOscillatorType: e.target.value as Waveform}))} className="neumorphic-outset bg-black/20 border border-white/10 text-white text-sm rounded-lg block w-full p-2.5 appearance-none focus:ring-2 focus:ring-cyan-500">{renderWaveformOptions()}</select></div>}
                                </div>
                                
                                <div><label htmlFor="mix-ratio" className="block text-xs uppercase tracking-wider text-blue-200/70 mb-2 font-semibold text-center">Oscillator Mix: {Math.round(settings.mixRatio * 100)}%</label><input id="mix-ratio" type="range" min="0" max="1" step="0.01" value={settings.mixRatio} onChange={e => setSettings(s => ({ ...s, mixRatio: parseFloat(e.target.value) }))} /></div>
                                
                                {(settings.oscillatorType === 'pulse' || (settings.mixRatio > 0 && settings.secondaryOscillatorType === 'pulse')) && (<div><label htmlFor="pulse-width" className="block text-xs uppercase tracking-wider text-blue-200/70 mb-2 font-semibold text-center">Pulse Width</label><input id="pulse-width" type="range" min="0.01" max="0.99" step="0.01" value={settings.pulseWidth} onChange={e => setSettings(s => ({ ...s, pulseWidth: parseFloat(e.target.value) }))} /></div>)}
                                
                                <div className="p-4 bg-black/30 rounded-lg space-y-4 border border-white/5">
                                    <h4 className="text-sm font-semibold text-center text-blue-200/90 uppercase tracking-widest">ADSR Envelope</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div><input id="attack" type="range" className="h-32 appearance-none bg-transparent [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-runnable-track]:bg-gray-700/50 [&::-webkit-slider-runnable-track]:rounded-full" style={{writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical'}} min="0.001" max="2" step="0.001" value={settings.attackTime} onChange={e => setSettings(s => ({...s, attackTime: parseFloat(e.target.value)}))} /><label htmlFor="attack" className="block text-[10px] text-center mt-2 text-gray-400">ATK</label></div>
                                        <div><input id="decay" type="range" className="h-32 appearance-none bg-transparent [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-runnable-track]:bg-gray-700/50 [&::-webkit-slider-runnable-track]:rounded-full" style={{writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical'}} min="0.001" max="2" step="0.001" value={settings.decayTime} onChange={e => setSettings(s => ({...s, decayTime: parseFloat(e.target.value)}))} /><label htmlFor="decay" className="block text-[10px] text-center mt-2 text-gray-400">DEC</label></div>
                                        <div><input id="sustain" type="range" className="h-32 appearance-none bg-transparent [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-runnable-track]:bg-gray-700/50 [&::-webkit-slider-runnable-track]:rounded-full" style={{writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical'}} min="0" max="1" step="0.01" value={settings.sustainLevel} onChange={e => setSettings(s => ({...s, sustainLevel: parseFloat(e.target.value)}))} /><label htmlFor="sustain" className="block text-[10px] text-center mt-2 text-gray-400">SUS</label></div>
                                        <div><input id="release" type="range" className="h-32 appearance-none bg-transparent [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-runnable-track]:bg-gray-700/50 [&::-webkit-slider-runnable-track]:rounded-full" style={{writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical'}} min="0.01" max="5" step="0.01" value={settings.releaseTime} onChange={e => setSettings(s => ({...s, releaseTime: parseFloat(e.target.value)}))} /><label htmlFor="release" className="block text-[10px] text-center mt-2 text-gray-400">REL</label></div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        <ArpeggiatorControls config={arpConfig} onChange={setArpConfig} disabled={!isPoweredOn} />
                        
                        <PresetManager presets={defaultPresets} currentPresetId={currentPresetId} onLoadPreset={handleLoadPreset} disabled={!isPoweredOn}/>

                        <TheoryPanel onAuditionChord={handleAuditionChord} onHighlightChange={setTheoryHighlight} disabled={!isPoweredOn} />

                        <DrumMachinePanel
                            isPlaying={isDrumPlaying}
                            currentStep={drumStep}
                            onPlay={playDrums}
                            onStop={stopDrums}
                            onAudition={auditionDrum}
                            disabled={!isPoweredOn}
                        />

                        <MidiGeneratorControls
                            prompt={genPrompt} onPromptChange={setGenPrompt}
                            genre={genGenre} onGenreChange={setGenGenre}
                            rootNote={genRootNote} onRootNoteChange={setGenRootNote}
                            scale={genScale} onScaleChange={setGenScale}
                            bpm={genBpm} onBpmChange={setGenBpm}
                            bars={genBars} onBarsChange={setGenBars}
                            onGenerate={handleGenerateMidi}
                            isGenerating={isGenerating}
                            disabled={!isPoweredOn}
                            error={generationError}
                        />
                        
                        <MidiPlayerControls
                            onFileLoad={handleFileLoad}
                            onSampleLoad={handleSampleLoad}
                            fileName={midiFileName}
                            isPlaying={isMidiPlaying}
                            onPlay={handleMidiPlay}
                            onPause={handleMidiPause}
                            onStop={handleMidiStop}
                            progress={midiProgress}
                            disabled={!isPoweredOn}
                        />

                        <EffectsPedalboard
                            isFilterOn={isFilterOn} onIsFilterOnToggle={setIsFilterOn}
                            isDistortionOn={isDistortionOn} onIsDistortionOnToggle={setIsDistortionOn}
                            isDelayOn={isDelayOn} onIsDelayOnToggle={setIsDelayOn}
                            isVibratoOn={isVibratoOn} onIsVibratoOnToggle={setIsVibratoOn}
                            isReverbOn={isReverbOn} onIsReverbOnToggle={setIsReverbOn}
                            isTremoloOn={isTremoloOn} onIsTremoloOnToggle={setIsTremoloOn}
                            isChorusOn={isChorusOn} onIsChorusOnToggle={setIsChorusOn}
                            reverbMix={settings.reverbMix} onReverbMixChange={v => setSettings(s => ({...s, reverbMix: v}))}
                            distortionAmount={settings.distortionAmount} onDistortionAmountChange={v => setSettings(s => ({...s, distortionAmount: v}))}
                            delayTime={settings.delayTime} onDelayTimeChange={v => setSettings(s => ({...s, delayTime: v}))}
                            delayFeedback={settings.delayFeedback} onDelayFeedbackChange={v => setSettings(s => ({...s, delayFeedback: v}))}
                            delayMix={settings.delayMix} onDelayMixChange={v => setSettings(s => ({...s, delayMix: v}))}
                            filterType={settings.filterType} onFilterTypeChange={v => setSettings(s => ({...s, filterType: v}))}
                            filterFrequency={settings.filterFrequency} onFilterFrequencyChange={v => setSettings(s => ({...s, filterFrequency: v}))}
                            filterQ={settings.filterQ} onFilterQChange={v => setSettings(s => ({...s, filterQ: v}))}
                            vibratoRate={settings.vibratoRate} onVibratoRateChange={v => setSettings(s => ({...s, vibratoRate: v}))}
                            vibratoDepth={settings.vibratoDepth} onVibratoDepthChange={v => setSettings(s => ({...s, vibratoDepth: v}))}
                            tremoloRate={settings.tremoloRate} onTremoloRateChange={v => setSettings(s => ({...s, tremoloRate: v}))}
                            tremoloDepth={settings.tremoloDepth} onTremoloDepthChange={v => setSettings(s => ({...s, tremoloDepth: v}))}
                            chorusRate={settings.chorusRate ?? 1.5} onChorusRateChange={v => setSettings(s => ({...s, chorusRate: v}))}
                            chorusDepth={settings.chorusDepth ?? 0.002} onChorusDepthChange={v => setSettings(s => ({...s, chorusDepth: v}))}
                            chorusMix={settings.chorusMix ?? 0.5} onChorusMixChange={v => setSettings(s => ({...s, chorusMix: v}))}
                            disabled={!isPoweredOn}
                        />
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
                <div className="pointer-events-auto max-w-[1600px] mx-auto">
                    <PianoKeyboard notes={PIANO_KEYS} activeNotes={activeNotes} highlightNotes={theoryHighlight} onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} disabled={!isPoweredOn}/>
                </div>
            </footer>
        </div>
    );
};

export default App;
