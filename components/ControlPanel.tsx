import React from 'react';
import { PowerIcon } from './Icons';
import type { Waveform } from '../App';

interface ControlPanelProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    volume: number;
    onVolumeChange: (value: number) => void;
    frequency: number;
    onFrequencyChange: (value: number) => void;
    isPianoMode: boolean;
    isScanMode: boolean;
    onIsScanModeChange: (value: boolean) => void;
    scanMinFreq: number;
    onScanMinFreqChange: (value: number) => void;
    scanMaxFreq: number;
    onScanMaxFreqChange: (value: number) => void;
    scanSpeed: number;
    onScanSpeedChange: (value: number) => void;
    oscillatorType: Waveform;
    onOscillatorTypeChange: (type: Waveform) => void;
    secondaryOscillatorType: Waveform;
    onSecondaryOscillatorTypeChange: (type: Waveform) => void;
    mixRatio: number;
    onMixRatioChange: (value: number) => void;
    archHarmonics: number[];
    onArchHarmonicsChange: (harmonics: number[]) => void;
    pulseWidth: number;
    onPulseWidthChange: (value: number) => void;
    // ADSR
    attackTime: number;
    onAttackTimeChange: (value: number) => void;
    decayTime: number;
    onDecayTimeChange: (value: number) => void;
    sustainLevel: number;
    onSustainLevelChange: (value: number) => void;
    releaseTime: number;
    onReleaseTimeChange: (value: number) => void;
    // Vibrato
    vibratoRate: number;
    onVibratoRateChange: (value: number) => void;
    vibratoDepth: number;
    onVibratoDepthChange: (value: number) => void;
    // Reverb
    reverbMix: number;
    onReverbMixChange: (value: number) => void;
    // Distortion
    distortionAmount: number;
    onDistortionAmountChange: (value: number) => void;
    // Delay
    delayTime: number;
    onDelayTimeChange: (value: number) => void;
    delayFeedback: number;
    onDelayFeedbackChange: (value: number) => void;
    delayMix: number;
    onDelayMixChange: (value: number) => void;
    // Filter
    filterType: BiquadFilterType;
    onFilterTypeChange: (value: BiquadFilterType) => void;
    filterFrequency: number;
    onFilterFrequencyChange: (value: number) => void;
    filterQ: number;
    onFilterQChange: (value: number) => void;
}

const WAVEFORM_GROUPS = [
    {
        label: 'Instruments',
        options: [
            { value: 'piano', label: 'Piano' },
            { value: 'organ', label: 'Organ' },
            { value: 'acoustic-guitar', label: 'Acoustic Guitar' },
            { value: 'flute', label: 'Flute' },
            { value: 'sonic-screwdriver', label: 'Sonic Wave' },
        ],
    },
    {
        label: 'Standard Waves',
        options: [
            { value: 'sine', label: 'Sine' },
            { value: 'square', label: 'Square' },
            { value: 'sawtooth', label: 'Sawtooth' },
            { value: 'triangle', label: 'Triangle' },
            { value: 'pulse', label: 'Pulse' },
            { value: 'neg-ramp', label: 'Negative Ramp' },
            { value: 'arch', label: 'Arch' },
        ],
    },
    {
        label: 'Noise',
        options: [
            { value: 'white-noise', label: 'White Noise' },
            { value: 'pink-noise', label: 'Pink Noise' },
            { value: 'brown-noise', label: 'Brown Noise' },
        ],
    },
];

const FILTER_TYPES: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'];


export const ControlPanel: React.FC<ControlPanelProps> = ({ 
    isPlaying, 
    onTogglePlay, 
    volume, 
    onVolumeChange,
    frequency,
    onFrequencyChange,
    isPianoMode,
    isScanMode,
    onIsScanModeChange,
    scanMinFreq,
    onScanMinFreqChange,
    scanMaxFreq,
    onScanMaxFreqChange,
    scanSpeed,
    onScanSpeedChange,
    oscillatorType,
    onOscillatorTypeChange,
    secondaryOscillatorType,
    onSecondaryOscillatorTypeChange,
    mixRatio,
    onMixRatioChange,
    archHarmonics,
    onArchHarmonicsChange,
    pulseWidth,
    onPulseWidthChange,
    attackTime, onAttackTimeChange,
    decayTime, onDecayTimeChange,
    sustainLevel, onSustainLevelChange,
    releaseTime, onReleaseTimeChange,
    vibratoRate, onVibratoRateChange,
    vibratoDepth, onVibratoDepthChange,
    reverbMix, onReverbMixChange,
    distortionAmount, onDistortionAmountChange,
    delayTime, onDelayTimeChange,
    delayFeedback, onDelayFeedbackChange,
    delayMix, onDelayMixChange,
    filterType, onFilterTypeChange,
    filterFrequency, onFilterFrequencyChange,
    filterQ, onFilterQChange,
}) => {
    const showPulseWidth = oscillatorType === 'pulse' || (mixRatio > 0 && secondaryOscillatorType === 'pulse');

    const renderWaveformOptions = () => {
        return WAVEFORM_GROUPS.map(group => (
            <optgroup key={group.label} label={group.label}>
                {group.options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </optgroup>
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <button
                    onClick={onTogglePlay}
                    className={`
                        w-20 h-20 
                        rounded-full 
                        flex items-center justify-center 
                        transition-all duration-200
                        focus:outline-none focus:ring-4 focus:ring-cyan-500/50
                        border
                        bg-gray-900/40
                        ${isPlaying 
                            ? 'neumorphic-inset border-cyan-700 shadow-[0_0_20px_rgba(6,182,212,0.6)]' 
                            : 'neumorphic-outset border-white/20 hover:border-white/40'
                        }
                    `}
                    aria-label={isPlaying ? "Disable Synthesizer" : "Enable Synthesizer"}
                >
                    <PowerIcon enabled={isPlaying} />
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Volume Control */}
                <div>
                    <label htmlFor="volume" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">
                        Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    />
                </div>

                 {/* Primary Waveform Selector */}
                 <div>
                    <label htmlFor="primary-waveform" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">
                        {mixRatio > 0 ? 'Primary Waveform' : 'Waveform'}
                    </label>
                    <select
                        id="primary-waveform"
                        value={oscillatorType}
                        onChange={(e) => onOscillatorTypeChange(e.target.value as Waveform)}
                        className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 appearance-none"
                    >
                       {renderWaveformOptions()}
                    </select>
                </div>
                
                {/* Waveform Specific Controls */}
                {oscillatorType === 'arch' && (
                     <div className="space-y-3 p-4 glass-base neumorphic-inset rounded-xl">
                        <h3 className="text-sm font-medium text-blue-200/70 mb-2 text-center">Arch Harmonics</h3>
                        {archHarmonics.map((value, index) => (
                            <div key={index}>
                                <label htmlFor={`harmonic-${index}`} className="block text-xs text-blue-200/70 mb-1 text-center">
                                    Harmonic {index + 1}: {value.toFixed(2)}
                                </label>
                                <input
                                    id={`harmonic-${index}`}
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={value}
                                    onChange={(e) => {
                                        const newHarmonics = [...archHarmonics];
                                        newHarmonics[index] = parseFloat(e.target.value);
                                        onArchHarmonicsChange(newHarmonics);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {showPulseWidth && (
                    <div className="p-4 glass-base neumorphic-inset rounded-xl">
                        <label htmlFor="pulse-width" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">
                            Pulse Width: {pulseWidth.toFixed(2)}
                        </label>
                        <input
                            id="pulse-width"
                            type="range"
                            min="0.01"
                            max="0.99"
                            step="0.01"
                            value={pulseWidth}
                            onChange={(e) => onPulseWidthChange(parseFloat(e.target.value))}
                        />
                    </div>
                )}

                {/* Waveform Mix Controls */}
                <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">
                     <h3 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Waveform Mix</h3>
                     <div>
                        <label htmlFor="mix-ratio" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">
                            Mix Ratio: {Math.round(mixRatio * 100)}%
                        </label>
                        <input
                            id="mix-ratio"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={mixRatio}
                            onChange={(e) => onMixRatioChange(parseFloat(e.target.value))}
                        />
                    </div>
                    {mixRatio > 0 && (
                        <div>
                            <label htmlFor="secondary-waveform" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">
                                Secondary Waveform
                            </label>
                            <select
                                id="secondary-waveform"
                                value={secondaryOscillatorType}
                                onChange={(e) => onSecondaryOscillatorTypeChange(e.target.value as Waveform)}
                                className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 appearance-none"
                            >
                                {renderWaveformOptions()}
                            </select>
                        </div>
                    )}
                </div>
                

                {/* ADSR Envelope */}
                <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">
                    <h3 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ADSR Envelope</h3>
                    <div><label htmlFor="attack" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Attack: {attackTime.toFixed(2)}s</label><input id="attack" type="range" min="0.001" max="2" step="0.001" value={attackTime} onChange={e => onAttackTimeChange(parseFloat(e.target.value))} /></div>
                    <div><label htmlFor="decay" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Decay: {decayTime.toFixed(2)}s</label><input id="decay" type="range" min="0.001" max="2" step="0.001" value={decayTime} onChange={e => onDecayTimeChange(parseFloat(e.target.value))} /></div>
                    <div><label htmlFor="sustain" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Sustain: {(sustainLevel * 100).toFixed(0)}%</label><input id="sustain" type="range" min="0" max="1" step="0.01" value={sustainLevel} onChange={e => onSustainLevelChange(parseFloat(e.target.value))} /></div>
                    <div><label htmlFor="release" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Release: {releaseTime.toFixed(2)}s</label><input id="release" type="range" min="0.01" max="5" step="0.01" value={releaseTime} onChange={e => onReleaseTimeChange(parseFloat(e.target.value))} /></div>
                </div>

                {/* Effects */}
                <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">
                    <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Effects</h2>
                    
                    {/* Filter */}
                    <div className="p-3 bg-black/20 rounded-lg space-y-3"><h3 className="text-lg font-semibold text-center text-blue-200/90">Filter</h3>
                        <div><label htmlFor="filter-type" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Type</label><select id="filter-type" value={filterType} onChange={e => onFilterTypeChange(e.target.value as BiquadFilterType)} className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 appearance-none">{FILTER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label htmlFor="filter-freq" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Frequency: {filterFrequency.toFixed(0)} Hz</label><input id="filter-freq" type="range" min="20" max="20000" step="10" value={filterFrequency} onChange={e => onFilterFrequencyChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="filter-q" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Resonance (Q): {filterQ.toFixed(2)}</label><input id="filter-q" type="range" min="0.0001" max="20" step="0.1" value={filterQ} onChange={e => onFilterQChange(parseFloat(e.target.value))} /></div>
                    </div>

                    {/* Distortion */}
                    <div className="p-3 bg-black/20 rounded-lg space-y-3"><h3 className="text-lg font-semibold text-center text-blue-200/90">Distortion</h3>
                        <div><label htmlFor="distortion" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Amount: {(distortionAmount * 100).toFixed(0)}%</label><input id="distortion" type="range" min="0" max="1" step="0.01" value={distortionAmount} onChange={e => onDistortionAmountChange(parseFloat(e.target.value))} /></div>
                    </div>
                    
                    {/* Delay */}
                    <div className="p-3 bg-black/20 rounded-lg space-y-3"><h3 className="text-lg font-semibold text-center text-blue-200/90">Delay</h3>
                         <div><label htmlFor="delay-time" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Time: {delayTime.toFixed(2)}s</label><input id="delay-time" type="range" min="0" max="5" step="0.01" value={delayTime} onChange={e => onDelayTimeChange(parseFloat(e.target.value))} /></div>
                         <div><label htmlFor="delay-feedback" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Feedback: {(delayFeedback * 100).toFixed(0)}%</label><input id="delay-feedback" type="range" min="0" max="0.95" step="0.01" value={delayFeedback} onChange={e => onDelayFeedbackChange(parseFloat(e.target.value))} /></div>
                         <div><label htmlFor="delay-mix" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Mix: {(delayMix * 100).toFixed(0)}%</label><input id="delay-mix" type="range" min="0" max="1" step="0.01" value={delayMix} onChange={e => onDelayMixChange(parseFloat(e.target.value))} /></div>
                    </div>
                    
                    {/* Modulation & Ambience */}
                    <div className="p-3 bg-black/20 rounded-lg space-y-3"><h3 className="text-lg font-semibold text-center text-blue-200/90">Modulation & Ambience</h3>
                        <div><label htmlFor="vibrato-rate" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Vibrato Rate: {vibratoRate.toFixed(1)} Hz</label><input id="vibrato-rate" type="range" min="0" max="20" step="0.1" value={vibratoRate} onChange={e => onVibratoRateChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="vibrato-depth" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Vibrato Depth: {(vibratoDepth / 50 * 100).toFixed(0)}%</label><input id="vibrato-depth" type="range" min="0" max="50" step="0.5" value={vibratoDepth} onChange={e => onVibratoDepthChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="reverb-mix" className="block text-sm font-medium text-blue-200/70 mb-2 text-center">Reverb Mix: {(reverbMix * 100).toFixed(0)}%</label><input id="reverb-mix" type="range" min="0" max="1" step="0.01" value={reverbMix} onChange={e => onReverbMixChange(parseFloat(e.target.value))} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};