
import React from 'react';
import { EffectPedal } from './EffectPedal';

interface EffectsPedalboardProps {
    // On/Off states
    isFilterOn: boolean;
    onIsFilterOnToggle: (value: boolean) => void;
    isDistortionOn: boolean;
    onIsDistortionOnToggle: (value: boolean) => void;
    isDelayOn: boolean;
    onIsDelayOnToggle: (value: boolean) => void;
    isVibratoOn: boolean;
    onIsVibratoOnToggle: (value: boolean) => void;
    isReverbOn: boolean;
    onIsReverbOnToggle: (value: boolean) => void;
    isTremoloOn: boolean;
    onIsTremoloOnToggle: (value: boolean) => void;
    isChorusOn: boolean;
    onIsChorusOnToggle: (value: boolean) => void;
    
    // Values
    reverbMix: number;
    onReverbMixChange: (value: number) => void;
    distortionAmount: number;
    onDistortionAmountChange: (value: number) => void;
    delayTime: number;
    onDelayTimeChange: (value: number) => void;
    delayFeedback: number;
    onDelayFeedbackChange: (value: number) => void;
    delayMix: number;
    onDelayMixChange: (value: number) => void;
    filterType: BiquadFilterType;
    onFilterTypeChange: (value: BiquadFilterType) => void;
    filterFrequency: number;
    onFilterFrequencyChange: (value: number) => void;
    filterQ: number;
    onFilterQChange: (value: number) => void;
    vibratoRate: number;
    onVibratoRateChange: (value: number) => void;
    vibratoDepth: number;
    onVibratoDepthChange: (value: number) => void;
    tremoloRate: number;
    onTremoloRateChange: (value: number) => void;
    tremoloDepth: number;
    onTremoloDepthChange: (value: number) => void;
    chorusRate: number;
    onChorusRateChange: (value: number) => void;
    chorusDepth: number;
    onChorusDepthChange: (value: number) => void;
    chorusMix: number;
    onChorusMixChange: (value: number) => void;

    disabled: boolean;
}

const FILTER_TYPES: BiquadFilterType[] = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'];

export const EffectsPedalboard: React.FC<EffectsPedalboardProps> = ({
    isFilterOn, onIsFilterOnToggle, isDistortionOn, onIsDistortionOnToggle,
    isDelayOn, onIsDelayOnToggle, isVibratoOn, onIsVibratoOnToggle, isReverbOn, onIsReverbOnToggle,
    isTremoloOn, onIsTremoloOnToggle, isChorusOn, onIsChorusOnToggle,
    reverbMix, onReverbMixChange, distortionAmount, onDistortionAmountChange,
    delayTime, onDelayTimeChange, delayFeedback, onDelayFeedbackChange, delayMix, onDelayMixChange,
    filterType, onFilterTypeChange, filterFrequency, onFilterFrequencyChange, filterQ, onFilterQChange,
    vibratoRate, onVibratoRateChange, vibratoDepth, onVibratoDepthChange,
    tremoloRate, onTremoloRateChange, tremoloDepth, onTremoloDepthChange,
    chorusRate, onChorusRateChange, chorusDepth, onChorusDepthChange, chorusMix, onChorusMixChange,
    disabled
}) => {
    if (disabled) return null;

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Effects Pedalboard</h2>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="inline-flex items-stretch gap-4 px-2 sm:px-0">
                    
                    <EffectPedal title="Filter" color="purple" isOn={isFilterOn} onToggle={onIsFilterOnToggle}>
                         <div><label htmlFor="filter-type" className="block text-xs font-medium text-purple-200/70 mb-1 text-center">Type</label><select id="filter-type" value={filterType} onChange={e => onFilterTypeChange(e.target.value as BiquadFilterType)} className="neumorphic-inset bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-1.5 appearance-none text-center">{FILTER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                         <div><label htmlFor="filter-freq" className="block text-xs font-medium text-purple-200/70 mb-1 text-center">Freq: {filterFrequency.toFixed(0)} Hz</label><input id="filter-freq" type="range" min="20" max="20000" step="10" value={filterFrequency} onChange={e => onFilterFrequencyChange(parseFloat(e.target.value))} /></div>
                         <div><label htmlFor="filter-q" className="block text-xs font-medium text-purple-200/70 mb-1 text-center">Reso: {filterQ.toFixed(2)}</label><input id="filter-q" type="range" min="0.0001" max="20" step="0.1" value={filterQ} onChange={e => onFilterQChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>

                    <EffectPedal title="Distortion" color="orange" isOn={isDistortionOn} onToggle={onIsDistortionOnToggle}>
                        <div><label htmlFor="distortion" className="block text-xs font-medium text-orange-200/70 mb-1 text-center">Drive: {(distortionAmount * 100).toFixed(0)}%</label><input id="distortion" type="range" min="0" max="1" step="0.01" value={distortionAmount} onChange={e => onDistortionAmountChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>

                    <EffectPedal title="Chorus" color="cyan" isOn={isChorusOn} onToggle={onIsChorusOnToggle}>
                        <div><label htmlFor="chorus-rate" className="block text-xs font-medium text-cyan-200/70 mb-1 text-center">Rate: {chorusRate.toFixed(1)} Hz</label><input id="chorus-rate" type="range" min="0.1" max="5" step="0.1" value={chorusRate} onChange={e => onChorusRateChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="chorus-depth" className="block text-xs font-medium text-cyan-200/70 mb-1 text-center">Depth: {Math.round(chorusDepth * 1000)}</label><input id="chorus-depth" type="range" min="0" max="0.01" step="0.0001" value={chorusDepth} onChange={e => onChorusDepthChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="chorus-mix" className="block text-xs font-medium text-cyan-200/70 mb-1 text-center">Mix: {(chorusMix * 100).toFixed(0)}%</label><input id="chorus-mix" type="range" min="0" max="1" step="0.01" value={chorusMix} onChange={e => onChorusMixChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>

                    <EffectPedal title="Tremolo" color="pink" isOn={isTremoloOn} onToggle={onIsTremoloOnToggle}>
                        <div><label htmlFor="tremolo-rate" className="block text-xs font-medium text-pink-200/70 mb-1 text-center">Rate: {tremoloRate.toFixed(1)} Hz</label><input id="tremolo-rate" type="range" min="0" max="20" step="0.1" value={tremoloRate} onChange={e => onTremoloRateChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="tremolo-depth" className="block text-xs font-medium text-pink-200/70 mb-1 text-center">Depth: {Math.round(tremoloDepth * 100)}%</label><input id="tremolo-depth" type="range" min="0" max="1" step="0.01" value={tremoloDepth} onChange={e => onTremoloDepthChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>

                    <EffectPedal title="Delay" color="blue" isOn={isDelayOn} onToggle={onIsDelayOnToggle}>
                         <div><label htmlFor="delay-time" className="block text-xs font-medium text-blue-200/70 mb-1 text-center">Time: {delayTime.toFixed(2)}s</label><input id="delay-time" type="range" min="0" max="5" step="0.01" value={delayTime} onChange={e => onDelayTimeChange(parseFloat(e.target.value))} /></div>
                         <div><label htmlFor="delay-feedback" className="block text-xs font-medium text-blue-200/70 mb-1 text-center">Fdbk: {(delayFeedback * 100).toFixed(0)}%</label><input id="delay-feedback" type="range" min="0" max="0.95" step="0.01" value={delayFeedback} onChange={e => onDelayFeedbackChange(parseFloat(e.target.value))} /></div>
                         <div><label htmlFor="delay-mix" className="block text-xs font-medium text-blue-200/70 mb-1 text-center">Mix: {(delayMix * 100).toFixed(0)}%</label><input id="delay-mix" type="range" min="0" max="1" step="0.01" value={delayMix} onChange={e => onDelayMixChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>

                    <EffectPedal title="Vibrato" color="green" isOn={isVibratoOn} onToggle={onIsVibratoOnToggle}>
                        <div><label htmlFor="vibrato-rate" className="block text-xs font-medium text-emerald-200/70 mb-1 text-center">Rate: {vibratoRate.toFixed(1)} Hz</label><input id="vibrato-rate" type="range" min="0" max="20" step="0.1" value={vibratoRate} onChange={e => onVibratoRateChange(parseFloat(e.target.value))} /></div>
                        <div><label htmlFor="vibrato-depth" className="block text-xs font-medium text-emerald-200/70 mb-1 text-center">Depth: {(vibratoDepth / 50 * 100).toFixed(0)}%</label><input id="vibrato-depth" type="range" min="0" max="50" step="0.5" value={vibratoDepth} onChange={e => onVibratoDepthChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>
                    
                    <EffectPedal title="Reverb" color="purple" isOn={isReverbOn} onToggle={onIsReverbOnToggle}>
                        <div><label htmlFor="reverb-mix" className="block text-xs font-medium text-purple-200/70 mb-1 text-center">Mix: {(reverbMix * 100).toFixed(0)}%</label><input id="reverb-mix" type="range" min="0" max="1" step="0.01" value={reverbMix} onChange={e => onReverbMixChange(parseFloat(e.target.value))} /></div>
                    </EffectPedal>
                </div>
            </div>
        </div>
    );
};
