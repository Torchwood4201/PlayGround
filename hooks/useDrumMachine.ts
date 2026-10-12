import { useRef, useState, useCallback, useEffect } from 'react';
import { DRUM_VOICES, STEP_COUNT, STEP_GAINS, type DrumPattern, type StepValue } from '../utils/drumPatterns';

export interface DrumBus {
    context: AudioContext;
    bus: GainNode;
}

type GetDrumBus = () => DrumBus | null;

const LOOKAHEAD_MS = 25;
const SCHEDULE_HORIZON_S = 0.12;

/** Pitch slider 0–1 -> playback multiplier (shiny-drum-machine formula). */
const pitchRate = (p: number): number => Math.pow(2, 2 * (p - 0.5));

/**
 * Synthesized drum machine (clean-room Web Audio; no samples):
 * Kick = sine pitch drop, Snare = bandpass noise + tone, HiHat = highpass
 * noise (only voice with StereoPanner spread), Toms = sine drops.
 * Lookahead scheduler (NOT chained setTimeout): 25 ms interval, 0.12 s
 * horizon, audioTime-stamped voices, swing delays odd 16ths.
 */
export const useDrumMachine = (getDrumBus: GetDrumBus) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const patternRef = useRef<DrumPattern | null>(null);
    const schedulerRef = useRef<number | null>(null);
    const timeoutsRef = useRef<number[]>([]);
    const noiseBufferRef = useRef<AudioBuffer | null>(null);
    const stepRef = useRef(0);
    const nextTimeRef = useRef(0);

    const getNoiseBuffer = useCallback((context: AudioContext): AudioBuffer => {
        if (!noiseBufferRef.current) {
            const len = context.sampleRate;
            const buffer = context.createBuffer(1, len, context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
            noiseBufferRef.current = buffer;
        }
        return noiseBufferRef.current;
    }, []);

    const playVoice = useCallback((context: AudioContext, out: GainNode, voice: number, when: number, velocity: number, pitch: number) => {
        if (velocity <= 0) return;
        const rate = pitchRate(pitch);
        const voiceDef = DRUM_VOICES[voice];
        const t = Math.max(when, context.currentTime);

        const env = (gain: GainNode, peak: number, decay: number) => {
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.linearRampToValueAtTime(peak, t + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        };

        const connectOut = (node: AudioNode, pan: number) => {
            if (pan !== 0) {
                const panner = context.createStereoPanner();
                panner.pan.value = pan;
                node.connect(panner);
                panner.connect(out);
            } else {
                node.connect(out);
            }
        };

        if (voiceDef.id === 'kick') {
            const osc = context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(voiceDef.baseFreq * rate, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
            const g = context.createGain();
            env(g, velocity, 0.28);
            osc.connect(g);
            connectOut(g, 0);
            osc.start(t);
            osc.stop(t + 0.32);
        } else if (voiceDef.id === 'snare') {
            const noise = context.createBufferSource();
            noise.buffer = getNoiseBuffer(context);
            const bp = context.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 1800;
            bp.Q.value = 0.8;
            const ng = context.createGain();
            env(ng, velocity * 0.8, 0.2);
            noise.connect(bp);
            bp.connect(ng);
            connectOut(ng, 0);
            noise.start(t);
            noise.stop(t + 0.25);
            const osc = context.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = voiceDef.baseFreq * rate;
            const og = context.createGain();
            env(og, velocity * 0.5, 0.12);
            osc.connect(og);
            connectOut(og, 0);
            osc.start(t);
            osc.stop(t + 0.15);
        } else if (voiceDef.id === 'hihat') {
            const noise = context.createBufferSource();
            noise.buffer = getNoiseBuffer(context);
            const hp = context.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.value = 7000;
            const g = context.createGain();
            env(g, velocity * 0.6, velocity >= 1 ? 0.12 : 0.05);
            noise.connect(hp);
            hp.connect(g);
            connectOut(g, 0.2);
            noise.start(t);
            noise.stop(t + 0.16);
        } else {
            // Toms: sine pitch drops at staggered base frequencies.
            const osc = context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(voiceDef.baseFreq * rate, t);
            osc.frequency.exponentialRampToValueAtTime((voiceDef.baseFreq * rate) / 2, t + 0.15);
            const g = context.createGain();
            env(g, velocity * 0.9, 0.3);
            osc.connect(g);
            connectOut(g, 0);
            osc.start(t);
            osc.stop(t + 0.35);
        }
    }, [getNoiseBuffer]);

    const clearTimers = useCallback(() => {
        if (schedulerRef.current !== null) {
            window.clearInterval(schedulerRef.current);
            schedulerRef.current = null;
        }
        timeoutsRef.current.forEach(id => window.clearTimeout(id));
        timeoutsRef.current = [];
    }, []);

    const stop = useCallback(() => {
        clearTimers();
        setIsPlaying(false);
        setCurrentStep(-1);
    }, [clearTimers]);

    const play = useCallback((pattern: DrumPattern) => {
        const nodes = getDrumBus();
        if (!nodes) return;
        const { context, bus } = nodes;
        if (context.state === 'suspended') void context.resume();
        clearTimers();
        patternRef.current = pattern;
        stepRef.current = 0;
        nextTimeRef.current = context.currentTime + 0.06;
        setIsPlaying(true);

        const tick = () => {
            const p = patternRef.current;
            if (!p) return;
            const stepDur = 60 / p.tempo / 4;
            while (nextTimeRef.current < context.currentTime + SCHEDULE_HORIZON_S) {
                const step = stepRef.current % STEP_COUNT;
                const stepTime = nextTimeRef.current + (step % 2 === 1 ? (p.swing / 3) * stepDur : 0);
                p.steps.forEach((voiceSteps, v) => {
                    const s = voiceSteps[step] as StepValue;
                    if (s !== 0) playVoice(context, bus, v, stepTime, STEP_GAINS[s], p.pitches[v]);
                });
                const delayMs = Math.max(0, (stepTime - context.currentTime) * 1000);
                const captured = step;
                const id = window.setTimeout(() => setCurrentStep(captured), delayMs);
                timeoutsRef.current.push(id);
                nextTimeRef.current += stepDur;
                stepRef.current += 1;
            }
        };

        schedulerRef.current = window.setInterval(tick, LOOKAHEAD_MS);
        tick();
    }, [clearTimers, getDrumBus, playVoice]);

    const audition = useCallback((voice: number, pitch = 0.5, velocity = 1) => {
        const nodes = getDrumBus();
        if (!nodes) return;
        playVoice(nodes.context, nodes.bus, voice, nodes.context.currentTime, velocity, pitch);
    }, [getDrumBus, playVoice]);

    useEffect(() => () => {
        if (schedulerRef.current !== null) window.clearInterval(schedulerRef.current);
        timeoutsRef.current.forEach(id => window.clearTimeout(id));
    }, []);

    return { isPlaying, currentStep, play, stop, audition };
};
