
import type { Waveform } from '../App';

export interface SynthPreset {
    id: string;
    name: string;
    isDefault?: boolean;
    settings: {
        oscillatorType: Waveform;
        secondaryOscillatorType: Waveform;
        tertiaryOscillatorType?: Waveform;
        quaternaryOscillatorType?: Waveform;
        mixRatio: number;
        tertiaryMix?: number;
        quaternaryMix?: number;
        
        secondaryOscillatorFreqRatio: number;
        tertiaryOscillatorFreqRatio: number;
        quaternaryOscillatorFreqRatio: number;
        secondaryOscillatorDetune: number;
        tertiaryOscillatorDetune: number;
        quaternaryOscillatorDetune: number;
        
        archHarmonics: number[];
        pulseWidth: number;
        attackTime: number;
        decayTime: number;
        sustainLevel: number;
        releaseTime: number;

        tremoloRate: number;
        tremoloDepth: number;
        vibratoRate: number;
        vibratoDepth: number;

        reverbMix: number;
        distortionAmount: number;
        delayTime: number;
        delayFeedback: number;
        delayMix: number;
        filterType: BiquadFilterType;
        filterFrequency: number;
        filterQ: number;

        // V1.0 Chorus
        chorusMix?: number;
        chorusRate?: number;
        chorusDepth?: number;
    };
}

export const defaultPresets: SynthPreset[] = [
    {
        id: 'default-piano',
        name: 'Default Piano',
        isDefault: true,
        settings: {
            oscillatorType: 'piano',
            secondaryOscillatorType: 'sine',
            mixRatio: 0,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.01,
            decayTime: 0.1,
            sustainLevel: 0.8,
            releaseTime: 0.5,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 5,
            vibratoDepth: 0,
            reverbMix: 0,
            distortionAmount: 0,
            delayTime: 0.3,
            delayFeedback: 0,
            delayMix: 0,
            filterType: 'lowpass',
            filterFrequency: 15000,
            filterQ: 1,
            chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
    {
        id: 'dreamy-pad',
        name: 'Liquid Pad',
        isDefault: true,
        settings: {
            oscillatorType: 'triangle',
            secondaryOscillatorType: 'sine',
            mixRatio: 0.4,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 1.2,
            decayTime: 0.5,
            sustainLevel: 0.7,
            releaseTime: 2.5,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 4.5,
            vibratoDepth: 8,
            reverbMix: 0.6,
            distortionAmount: 0,
            delayTime: 0.8,
            delayFeedback: 0.4,
            delayMix: 0.3,
            filterType: 'lowpass',
            filterFrequency: 4500,
            filterQ: 2,
            chorusMix: 0.4,
            chorusRate: 0.5,
            chorusDepth: 0.004
        }
    },
    {
        id: 'wobble-bass',
        name: 'Wobble Bass',
        isDefault: true,
        settings: {
            oscillatorType: 'sawtooth',
            secondaryOscillatorType: 'square',
            mixRatio: 0.5,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.02,
            decayTime: 0.3,
            sustainLevel: 0.6,
            releaseTime: 0.4,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 12,
            vibratoDepth: 25,
            reverbMix: 0.1,
            distortionAmount: 0.3,
            delayTime: 0,
            delayFeedback: 0,
            delayMix: 0,
            filterType: 'lowpass',
            filterFrequency: 800,
            filterQ: 8,
            chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
    {
        id: '8bit-lead',
        name: '8-Bit Lead',
        isDefault: true,
        settings: {
            oscillatorType: 'pulse',
            secondaryOscillatorType: 'square',
            mixRatio: 0,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.25,
            attackTime: 0.01,
            decayTime: 0.15,
            sustainLevel: 0.7,
            releaseTime: 0.2,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 10,
            vibratoDepth: 3,
            reverbMix: 0.05,
            distortionAmount: 0.05,
            delayTime: 0.2,
            delayFeedback: 0.2,
            delayMix: 0.1,
            filterType: 'lowpass',
            filterFrequency: 6000,
            filterQ: 1.5,
             chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
    {
        id: 'celestial-organ',
        name: 'Celestial Organ',
        isDefault: true,
        settings: {
            oscillatorType: 'organ',
            secondaryOscillatorType: 'sine',
            mixRatio: 0.3,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.8,
            decayTime: 0.4,
            sustainLevel: 0.8,
            releaseTime: 3.0,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 2.5,
            vibratoDepth: 5,
            reverbMix: 0.7,
            distortionAmount: 0,
            delayTime: 1.2,
            delayFeedback: 0.3,
            delayMix: 0.25,
            filterType: 'lowpass',
            filterFrequency: 8000,
            filterQ: 1,
            chorusMix: 0.6,
            chorusRate: 1.2,
            chorusDepth: 0.005
        }
    },
    {
        id: 'aggressive-lead',
        name: 'Aggressive Lead',
        isDefault: true,
        settings: {
            oscillatorType: 'sawtooth',
            secondaryOscillatorType: 'square',
            mixRatio: 0.4,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.01,
            decayTime: 0.2,
            sustainLevel: 0.9,
            releaseTime: 0.5,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 6,
            vibratoDepth: 2,
            reverbMix: 0.2,
            distortionAmount: 0.6,
            delayTime: 0.25,
            delayFeedback: 0.1,
            delayMix: 0.15,
            filterType: 'lowpass',
            filterFrequency: 2500,
            filterQ: 4,
            chorusMix: 0.2,
            chorusRate: 0.5,
            chorusDepth: 0.001
        }
    },
    {
        id: 'sub-bass',
        name: 'Sub Bass',
        isDefault: true,
        settings: {
            oscillatorType: 'sine',
            secondaryOscillatorType: 'sine',
            mixRatio: 0,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.01,
            decayTime: 0.1,
            sustainLevel: 1.0,
            releaseTime: 0.2,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 0,
            vibratoDepth: 0,
            reverbMix: 0,
            distortionAmount: 0,
            delayTime: 0,
            delayFeedback: 0,
            delayMix: 0,
            filterType: 'lowpass',
            filterFrequency: 200,
            filterQ: 1,
             chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
    {
        id: 'sci-fi-fx',
        name: 'Sci-Fi FX',
        isDefault: true,
        settings: {
            oscillatorType: 'sonic-screwdriver',
            secondaryOscillatorType: 'sawtooth',
            mixRatio: 0.5,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.1,
            decayTime: 1.5,
            sustainLevel: 0.1,
            releaseTime: 2.0,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 18,
            vibratoDepth: 45,
            reverbMix: 0.5,
            distortionAmount: 0.1,
            delayTime: 0.1,
            delayFeedback: 0.85,
            delayMix: 0.6,
            filterType: 'bandpass',
            filterFrequency: 4000,
            filterQ: 15,
             chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
    {
        id: 'e-grand-piano',
        name: 'E. Grand Piano',
        isDefault: true,
        settings: {
            oscillatorType: 'piano',
            secondaryOscillatorType: 'sawtooth',
            mixRatio: 0.1,
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 0,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.01,
            decayTime: 0.8,
            sustainLevel: 0.5,
            releaseTime: 0.4,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 0,
            vibratoDepth: 0,
            reverbMix: 0.2,
            distortionAmount: 0.05,
            delayTime: 0,
            delayFeedback: 0,
            delayMix: 0,
            filterType: 'peaking',
            filterFrequency: 5000,
            filterQ: 1.2,
            chorusMix: 0.3,
            chorusRate: 0.8,
            chorusDepth: 0.003
        }
    },
    {
        id: 'honky-tonk-piano',
        name: 'Honky-tonk Piano',
        isDefault: true,
        settings: {
            oscillatorType: 'piano',
            secondaryOscillatorType: 'piano',
            mixRatio: 0.5, 
            secondaryOscillatorFreqRatio: 1,
            tertiaryOscillatorFreqRatio: 1,
            quaternaryOscillatorFreqRatio: 1,
            secondaryOscillatorDetune: 10,
            tertiaryOscillatorDetune: 0,
            quaternaryOscillatorDetune: 0,
            archHarmonics: [0.5, 0, 0, 0, 0],
            pulseWidth: 0.5,
            attackTime: 0.01,
            decayTime: 0.5,
            sustainLevel: 0.3,
            releaseTime: 0.2,
            tremoloRate: 5,
            tremoloDepth: 0,
            vibratoRate: 8, 
            vibratoDepth: 2,
            reverbMix: 0.1,
            distortionAmount: 0.1,
            delayTime: 0,
            delayFeedback: 0,
            delayMix: 0,
            filterType: 'highpass',
            filterFrequency: 200,
            filterQ: 1,
             chorusMix: 0,
            chorusRate: 1.5,
            chorusDepth: 0.002
        }
    },
];
