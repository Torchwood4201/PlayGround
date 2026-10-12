
import { useRef, useCallback, useState } from 'react';
import type { Waveform } from '../App';

type BaseConfig = {
  oscillatorType: Waveform;
  secondaryOscillatorType?: Waveform;
  tertiaryOscillatorType?: Waveform;
  quaternaryOscillatorType?: Waveform;
  mixRatio?: number;
  tertiaryMix?: number;
  quaternaryMix?: number;
  secondaryOscillatorFreqRatio?: number;
  tertiaryOscillatorFreqRatio?: number;
  quaternaryOscillatorFreqRatio?: number;
  secondaryOscillatorDetune?: number;
  tertiaryOscillatorDetune?: number;
  quaternaryOscillatorDetune?: number;
  archHarmonics?: number[];
  pulseWidth?: number;
  attackTime?: number;
  decayTime?: number;
  sustainLevel?: number;
  releaseTime?: number;
  tremoloRate?: number;
  tremoloDepth?: number;
  vibratoRate?: number;
  vibratoDepth?: number;
  reverbMix?: number;
  distortionAmount?: number;
  delayTime?: number;
  delayFeedback?: number;
  delayMix?: number;
  filterType?: BiquadFilterType;
  filterFrequency?: number;
  filterQ?: number;
  velocity?: number;
  
  // V1.0 Effects
  chorusMix?: number;
  chorusRate?: number;
  chorusDepth?: number;

  // Effect toggles
  isFilterOn?: boolean;
  isDistortionOn?: boolean;
  isDelayOn?: boolean;
  isVibratoOn?: boolean;
  isReverbOn?: boolean;
  isTremoloOn?: boolean;
  isChorusOn?: boolean;
}
type PlayConfig = (
    | { frequency: number; } 
    | { scanMinFreq: number; scanMaxFreq: number; scanSpeed: number; }
) & BaseConfig;

// A type for the nodes associated with a single playing note ("voice")
type VoiceNodes = {
    sourceNode1: AudioNode;
    sourceNode2: AudioNode | null;
    sourceNode3: AudioNode | null;
    sourceNode4: AudioNode | null;
    envelopeGain: GainNode;
    mixGain1: GainNode;
    mixGain2: GainNode;
    mixGain3: GainNode;
    mixGain4: GainNode;
};

const makeDistortionCurve = (amount: number, context: AudioContext) => {
    if (amount === 0) return null;
    const k = amount * 100; // Scale amount to a more effective range
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
};


export const useAudioOscillator = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const mainGainNodeRef = useRef<GainNode | null>(null);
    const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null); // Master compressor
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const masterStreamNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null); // For loopback
    const activeVoicesRef = useRef<Map<number, VoiceNodes>>(new Map());

    // Recorder
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingChunksRef = useRef<Blob[]>([]);
    const destNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    // Effects nodes
    const vibratoLFORef = useRef<OscillatorNode | null>(null);
    const vibratoDepthRef = useRef<GainNode | null>(null);
    const tremoloLFORef = useRef<OscillatorNode | null>(null);
    const tremoloDepthRef = useRef<GainNode | null>(null);
    
    // Chorus Nodes
    const chorusLFORef = useRef<OscillatorNode | null>(null);
    const chorusDepthRef = useRef<GainNode | null>(null);
    const chorusDelayRef = useRef<DelayNode | null>(null);
    const chorusDryRef = useRef<GainNode | null>(null);
    const chorusWetRef = useRef<GainNode | null>(null);

    // Global Insert Effects
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);
    const distortionNodeRef = useRef<WaveShaperNode | null>(null);
    const tremoloGainRef = useRef<GainNode | null>(null);
    
    // Global Send/Return Effects
    const reverbConvolverRef = useRef<ConvolverNode | null>(null);
    const reverbDryRef = useRef<GainNode | null>(null);
    const reverbWetRef = useRef<GainNode | null>(null);

    // Dedicated drum-machine input: synthesized drum voices connect here so
    // they flow through the same filter/distortion/delay/reverb/master chain.
    const drumBusRef = useRef<GainNode | null>(null);
    
    const delayNodeRef = useRef<DelayNode | null>(null);
    const delayFeedbackRef = useRef<GainNode | null>(null);
    const delayDryRef = useRef<GainNode | null>(null);
    const delayWetRef = useRef<GainNode | null>(null);


    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const [analyserL, setAnalyserL] = useState<AnalyserNode | null>(null);
    const [analyserR, setAnalyserR] = useState<AnalyserNode | null>(null);
    const [masterStream, setMasterStream] = useState<MediaStream | null>(null);
    const noiseBuffersRef = useRef<Record<string, AudioBuffer>>({});
    const sonicScrewdriverBuffersRef = useRef<Record<number, AudioBuffer>>({});


    const createImpulseResponse = (context: AudioContext): AudioBuffer => {
        const sampleRate = context.sampleRate;
        const length = sampleRate * 2; // 2 seconds reverb tail
        const impulse = context.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // Simple exponential decay
            const decay = Math.pow(1 - t / 2, 4);
            left[i] = (Math.random() * 2 - 1) * decay;
            right[i] = (Math.random() * 2 - 1) * decay;
        }
        return impulse;
    };


    const initializeAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;

            // Master Output Chain: Main Gain -> Compressor -> Analyser -> Destination
            mainGainNodeRef.current = context.createGain();
            compressorNodeRef.current = context.createDynamicsCompressor();
            // Compressor settings for mastering polish
            compressorNodeRef.current.threshold.value = -24;
            compressorNodeRef.current.knee.value = 30;
            compressorNodeRef.current.ratio.value = 12;
            compressorNodeRef.current.attack.value = 0.003;
            compressorNodeRef.current.release.value = 0.25;

            analyserNodeRef.current = context.createAnalyser();
            
            mainGainNodeRef.current.connect(compressorNodeRef.current);
            compressorNodeRef.current.connect(analyserNodeRef.current);
            analyserNodeRef.current.connect(context.destination);

            // Stereo tap for the XY vector scope (Oscillator recipe):
            // ChannelSplitter(2) off the compressor feeds two dedicated
            // analysers without touching the existing mono master path.
            const splitter = context.createChannelSplitter(2);
            const analyserLeft = context.createAnalyser();
            const analyserRight = context.createAnalyser();
            analyserLeft.fftSize = 2048;
            analyserRight.fftSize = 2048;
            analyserLeft.smoothingTimeConstant = 0.8;
            analyserRight.smoothingTimeConstant = 0.8;
            compressorNodeRef.current.connect(splitter);
            splitter.connect(analyserLeft, 0);
            splitter.connect(analyserRight, 1);
            setAnalyserL(analyserLeft);
            setAnalyserR(analyserRight);
            
            // Loopback Stream Setup
            if (!masterStreamNodeRef.current) {
                masterStreamNodeRef.current = context.createMediaStreamDestination();
                compressorNodeRef.current.connect(masterStreamNodeRef.current);
                setMasterStream(masterStreamNodeRef.current.stream);
            }

            setAnalyserNode(analyserNodeRef.current);

            // Vibrato LFO setup
            vibratoLFORef.current = context.createOscillator();
            vibratoLFORef.current.frequency.value = 5; // Default rate
            vibratoDepthRef.current = context.createGain();
            vibratoDepthRef.current.gain.value = 0; // Default depth
            vibratoLFORef.current.connect(vibratoDepthRef.current);
            vibratoLFORef.current.start();

            // Tremolo LFO setup for AM effect
            tremoloLFORef.current = context.createOscillator();
            tremoloLFORef.current.frequency.value = 5; // Default rate
            tremoloDepthRef.current = context.createGain();
            tremoloDepthRef.current.gain.value = 0; // Default depth
            const tremoloDcOffset = context.createConstantSource(); // To make LFO unipolar for AM
            tremoloDcOffset.offset.value = 1;
            tremoloGainRef.current = context.createGain();

            tremoloLFORef.current.connect(tremoloDepthRef.current);
            tremoloDepthRef.current.connect(tremoloGainRef.current.gain);
            tremoloDcOffset.connect(tremoloGainRef.current.gain);
            tremoloLFORef.current.start();
            tremoloDcOffset.start();

            // Chorus Setup
            chorusLFORef.current = context.createOscillator();
            chorusLFORef.current.type = 'sine';
            chorusLFORef.current.frequency.value = 1.5; // Default slow rate
            chorusDepthRef.current = context.createGain();
            chorusDepthRef.current.gain.value = 0; // Default depth (modulates delay time)
            chorusDelayRef.current = context.createDelay(0.1); // Max delay
            chorusDelayRef.current.delayTime.value = 0.03; // 30ms base delay
            chorusDryRef.current = context.createGain();
            chorusWetRef.current = context.createGain();

            chorusLFORef.current.connect(chorusDepthRef.current);
            chorusDepthRef.current.connect(chorusDelayRef.current.delayTime);
            chorusLFORef.current.start();
            
            // Create global effects chain
            const effectsInput = context.createGain();
            filterNodeRef.current = context.createBiquadFilter();
            distortionNodeRef.current = context.createWaveShaper();
            distortionNodeRef.current.oversample = '4x';

            // Create parallel paths for Delay and Reverb
            delayDryRef.current = context.createGain();
            delayWetRef.current = context.createGain();
            delayNodeRef.current = context.createDelay(5.0); // Max 5s delay
            delayFeedbackRef.current = context.createGain();
            
            reverbDryRef.current = context.createGain();
            reverbWetRef.current = context.createGain();
            reverbConvolverRef.current = context.createConvolver();
            reverbConvolverRef.current.buffer = createImpulseResponse(context);
            
            // Connect the graph
            // Voice -> Filter -> Distortion -> Chorus -> Tremolo -> Delay -> Reverb -> Master
            
            effectsInput.connect(filterNodeRef.current);
            filterNodeRef.current.connect(distortionNodeRef.current);
            
            // Chorus Stage (Insert)
            const chorusInput = distortionNodeRef.current;
            chorusInput.connect(chorusDryRef.current);
            chorusInput.connect(chorusDelayRef.current);
            chorusDelayRef.current.connect(chorusWetRef.current);

            // Recombine Chorus to go to Tremolo
            const postChorusSum = context.createGain();
            chorusDryRef.current.connect(postChorusSum);
            chorusWetRef.current.connect(postChorusSum);

            postChorusSum.connect(tremoloGainRef.current); 
            
            // Split after tremolo for dry/wet paths (Delay & Reverb)
            const postTremoloSplit = tremoloGainRef.current;

            // Delay Path
            postTremoloSplit.connect(delayDryRef.current);
            postTremoloSplit.connect(delayNodeRef.current);
            delayNodeRef.current.connect(delayFeedbackRef.current);
            delayFeedbackRef.current.connect(delayNodeRef.current); // Feedback loop
            delayNodeRef.current.connect(delayWetRef.current);
            
            // Reverb Path
            delayDryRef.current.connect(reverbDryRef.current);
            delayWetRef.current.connect(reverbDryRef.current); // Delay output feeds into reverb's dry path
            
            delayDryRef.current.connect(reverbConvolverRef.current);
            delayWetRef.current.connect(reverbConvolverRef.current); // Delay output also feeds into reverb's wet path

            // Final Mixing
            reverbDryRef.current.connect(mainGainNodeRef.current);
            reverbConvolverRef.current.connect(reverbWetRef.current);
            reverbWetRef.current.connect(mainGainNodeRef.current);
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!audioContextRef.current || !compressorNodeRef.current) return;
        
        // Connect to a MediaStreamDestination to record
        const dest = audioContextRef.current.createMediaStreamDestination();
        destNodeRef.current = dest;
        // Tap in after the compressor (master out)
        compressorNodeRef.current.connect(dest);

        const recorder = new MediaRecorder(dest.stream);
        mediaRecorderRef.current = recorder;
        recordingChunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordingChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(recordingChunksRef.current, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `liquid-synth-recording-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.wav`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        };

        recorder.start();
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        // Cleanup connection
        if (destNodeRef.current && compressorNodeRef.current) {
            try {
                compressorNodeRef.current.disconnect(destNodeRef.current);
            } catch(e) {}
        }
    }, []);

    const cleanupVoice = useCallback((frequency: number) => {
        const voice = activeVoicesRef.current.get(frequency);
        if (voice) {
            try {
                if (voice.sourceNode1 instanceof OscillatorNode || voice.sourceNode1 instanceof AudioBufferSourceNode) {
                    voice.sourceNode1.stop();
                }
                voice.sourceNode1.disconnect();
                if (voice.sourceNode2) {
                    if (voice.sourceNode2 instanceof OscillatorNode || voice.sourceNode2 instanceof AudioBufferSourceNode) {
                        voice.sourceNode2.stop();
                    }
                    voice.sourceNode2.disconnect();
                }
                if (voice.sourceNode3) {
                    if (voice.sourceNode3 instanceof OscillatorNode || voice.sourceNode3 instanceof AudioBufferSourceNode) {
                        voice.sourceNode3.stop();
                    }
                    voice.sourceNode3.disconnect();
                }
                if (voice.sourceNode4) {
                    if (voice.sourceNode4 instanceof OscillatorNode || voice.sourceNode4 instanceof AudioBufferSourceNode) {
                        voice.sourceNode4.stop();
                    }
                    voice.sourceNode4.disconnect();
                }
                voice.envelopeGain.disconnect();
                voice.mixGain1.disconnect();
                voice.mixGain2.disconnect();
                voice.mixGain3.disconnect();
                voice.mixGain4.disconnect();
            } catch (e) { /* Node may already be stopped or disconnected */ }
            activeVoicesRef.current.delete(frequency);
        }
    }, []);

     const createNode = useCallback((audioContext: AudioContext, type: Waveform, config: PlayConfig) => {
        if (type === 'sonic-screwdriver') {
            const baseFreq = 'frequency' in config ? config.frequency : 3700;
            if (!sonicScrewdriverBuffersRef.current[baseFreq]) {
                const f_mid = baseFreq;
                const df_ratio = 400 / 3700;
                const df = baseFreq * df_ratio;
                const t_circ_max = 0.2;
                const sampleRate = audioContext.sampleRate;
                const numSamples = Math.floor(t_circ_max * sampleRate);
                const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
                const data = buffer.getChannelData(0);
                const T = 1.0 / sampleRate;
                const t_mid = t_circ_max / 2.0;

                let phase1 = 0, phase2 = 0, maxAmp = 0;
                for (let i = 0; i < numSamples; i++) {
                    const t_circ_i = i * T;
                    const ratio = (t_circ_i - t_mid) / t_mid;
                    const f_circ_i = df * Math.sqrt(Math.max(0, 1.0 - ratio * ratio));
                    phase1 += 2 * Math.PI * (f_mid + f_circ_i) * T;
                    phase2 += 2 * Math.PI * (f_mid - f_circ_i) * T;
                    const sample = Math.sin(phase1) + Math.sin(phase2);
                    data[i] = sample;
                    if (Math.abs(sample) > maxAmp) maxAmp = Math.abs(sample);
                }
                if (maxAmp > 0) for (let i = 0; i < numSamples; i++) data[i] /= maxAmp;
                
                sonicScrewdriverBuffersRef.current[baseFreq] = buffer;
            }
            const bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = sonicScrewdriverBuffersRef.current[baseFreq];
            bufferSource.loop = true;
            return bufferSource;
        }

        if (type.includes('noise')) {
            if (!noiseBuffersRef.current[type]) {
                const bufferSize = audioContext.sampleRate * 2;
                const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                if (type === 'white-noise') for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                else if (type === 'pink-noise') { let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0; for (let i=0; i < bufferSize; i++) { const w = Math.random()*2-1; b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.969*b2+w*0.153852; b3=0.8665*b3+w*0.3104856; b4=0.55*b4+w*0.5329522; b5=-0.7616*b5-w*0.016898; data[i]=b0+b1+b2+b3+b4+b5+b6+w*0.5362; data[i]*=0.11; b6=w*0.115926; } }
                else if (type === 'brown-noise') { let lastOut = 0; for (let i = 0; i < bufferSize; i++) { const w = Math.random()*2-1; const out=(lastOut+(0.02*w))/1.02; data[i]=out*3.5; lastOut = out; } }
                noiseBuffersRef.current[type] = buffer;
            }
            const bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = noiseBuffersRef.current[type];
            bufferSource.loop = true;
            return bufferSource;
        }
        const oscillator = audioContext.createOscillator();
        const termCount = 128; let real = new Float32Array(termCount); let imag = new Float32Array(termCount); let pWave: PeriodicWave | null = null;
        switch(type) {
            case 'sine-dc': real[0] = 0.5; imag[1] = 1; pWave = audioContext.createPeriodicWave(real, imag, { disableNormalization: true }); break;
            case 'arch': real[0] = 1/Math.PI; for (let n=2; n<termCount; n+=2) { real[n]=2/(Math.PI*(1-n*n)); } const h = config.archHarmonics??[0.5,0,0,0,0]; h.forEach((v, i) => { if(i+1 < termCount) imag[i+1]=v; }); pWave=audioContext.createPeriodicWave(real, imag,{disableNormalization:false}); break;
            case 'pulse': const d=config.pulseWidth??0.5; for (let n=1; n<termCount; n++) { imag[n]=2*Math.sin(n*Math.PI*d)/(n*Math.PI); } pWave=audioContext.createPeriodicWave(real, imag, {disableNormalization:true}); break;
            case 'neg-ramp': for(let n=1;n<termCount;n++) { imag[n]=-2*(n%2===0?-1:1)/(n*Math.PI); } pWave=audioContext.createPeriodicWave(real,imag,{disableNormalization:false}); break;
            case 'organ': imag[1]=1; imag[2]=0.8; imag[3]=0.6; imag[4]=0.7; imag[6]=0.4; pWave=audioContext.createPeriodicWave(real,imag,{disableNormalization:false}); break;
            case 'piano': 
                imag[1] = 1.0; imag[2] = 0.75; imag[3] = 0.6; imag[4] = 0.3; imag[5] = 0.4; imag[6] = 0.25; imag[7] = 0.2; imag[8] = 0.15; imag[9] = 0.1; imag[10] = 0.1; imag[11] = 0.05; imag[12] = 0.05;
                pWave=audioContext.createPeriodicWave(real,imag,{disableNormalization:false}); 
                break;
            case 'acoustic-guitar': 
                imag[1] = 1.0; imag[2] = 0.7; imag[3] = 0.5; imag[4] = 0.3; imag[5] = 0.2; imag[6] = 0.1;
                pWave=audioContext.createPeriodicWave(real,imag,{disableNormalization:false}); 
                break;
            case 'flute': imag[1]=1; imag[2]=0.3; imag[3]=0.2; imag[4]=0.1; pWave=audioContext.createPeriodicWave(real,imag,{disableNormalization:false}); break;
            case 'sine': case 'square': case 'sawtooth': case 'triangle': oscillator.type = type; break;
        }
        if (pWave) oscillator.setPeriodicWave(pWave);
        if (vibratoDepthRef.current) {
            vibratoDepthRef.current.connect(oscillator.frequency);
        }
        return oscillator;
    }, []);

    const noteOff = useCallback((releaseTime: number, frequency: number) => {
        const audioContext = audioContextRef.current;
        if (!audioContext || !frequency) return;

        const voice = activeVoicesRef.current.get(frequency);
        if (!voice) return;

        const now = audioContext.currentTime;
        const currentGain = voice.envelopeGain.gain.value;
        voice.envelopeGain.gain.cancelScheduledValues(now);
        voice.envelopeGain.gain.setValueAtTime(currentGain, now);
        voice.envelopeGain.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.01, releaseTime));

        setTimeout(() => {
            cleanupVoice(frequency);
        }, (releaseTime + 0.1) * 1000);
    }, [cleanupVoice]);

    const play = useCallback((config: PlayConfig) => {
        initializeAudio();
        const audioContext = audioContextRef.current;
        if (!audioContext || !mainGainNodeRef.current || !vibratoLFORef.current || !vibratoDepthRef.current || !tremoloLFORef.current || !tremoloDepthRef.current || !reverbDryRef.current || !reverbWetRef.current || !reverbConvolverRef.current || !filterNodeRef.current || !distortionNodeRef.current || !delayNodeRef.current || !delayFeedbackRef.current || !delayDryRef.current || !delayWetRef.current || !chorusLFORef.current || !chorusDepthRef.current || !chorusDelayRef.current || !chorusDryRef.current || !chorusWetRef.current) return;
        if (audioContext.state === 'suspended') audioContext.resume();

        // This implementation focuses on note-based playback, not scanning.
        if (!('frequency' in config)) {
            // Stop all playing notes if we switch out of frequency mode.
            activeVoicesRef.current.forEach((_, freq) => noteOff(0.1, freq));
            return;
        }

        const newFrequency = config.frequency;
        const now = audioContext.currentTime;

        // If the same note is re-triggered, clean up the old voice instantly before starting a new one.
        if (activeVoicesRef.current.has(newFrequency)) {
            cleanupVoice(newFrequency);
        }
        
        // Create a new voice (all the nodes needed for one note)
        const envelopeGain = audioContext.createGain();
        const mixGain1 = audioContext.createGain();
        const mixGain2 = audioContext.createGain();
        const mixGain3 = audioContext.createGain();
        const mixGain4 = audioContext.createGain();
        
        // Connect the voice's envelope to the global effects chain
        const firstEffectNode = filterNodeRef.current;
        envelopeGain.connect(firstEffectNode);

        // --- Oscillator 1 ---
        const sourceNode1 = createNode(audioContext, config.oscillatorType, config);
        sourceNode1.connect(mixGain1);
        mixGain1.connect(envelopeGain);

        // --- Oscillator 2 ---
        let sourceNode2: AudioNode | null = null;
        const secondaryOscillatorType = config.secondaryOscillatorType ?? 'sine';
        if (secondaryOscillatorType) {
            sourceNode2 = createNode(audioContext, secondaryOscillatorType, config);
            sourceNode2.connect(mixGain2);
            mixGain2.connect(envelopeGain);
        }
        
        // --- Oscillator 3 ---
        let sourceNode3: AudioNode | null = null;
        const tertiaryOscillatorType = config.tertiaryOscillatorType;
        if (tertiaryOscillatorType && (config.tertiaryMix ?? 0) > 0) {
            sourceNode3 = createNode(audioContext, tertiaryOscillatorType, config);
            sourceNode3.connect(mixGain3);
            mixGain3.connect(envelopeGain);
        }

        // --- Oscillator 4 ---
        let sourceNode4: AudioNode | null = null;
        const quaternaryOscillatorType = config.quaternaryOscillatorType;
        if (quaternaryOscillatorType && (config.quaternaryMix ?? 0) > 0) {
            sourceNode4 = createNode(audioContext, quaternaryOscillatorType, config);
            sourceNode4.connect(mixGain4);
            mixGain4.connect(envelopeGain);
        }

        // --- Set Mix Gains ---
        const mixRatio = config.mixRatio ?? 0;
        const tertiaryMix = config.tertiaryMix ?? 0;
        const quaternaryMix = config.quaternaryMix ?? 0;
        const primarySecondaryMixGain = Math.max(0, 1 - tertiaryMix - quaternaryMix);

        mixGain1.gain.setValueAtTime(primarySecondaryMixGain * (1 - mixRatio), now);
        mixGain2.gain.setValueAtTime(sourceNode2 ? primarySecondaryMixGain * mixRatio : 0, now);
        mixGain3.gain.setValueAtTime(sourceNode3 ? tertiaryMix : 0, now);
        mixGain4.gain.setValueAtTime(sourceNode4 ? quaternaryMix : 0, now);

        // Set frequencies and detune
        if (sourceNode1 instanceof OscillatorNode) sourceNode1.frequency.setValueAtTime(newFrequency, now);
        if (sourceNode2 instanceof OscillatorNode) {
            const freq = newFrequency * (config.secondaryOscillatorFreqRatio ?? 1);
            sourceNode2.frequency.setValueAtTime(freq, now);
            sourceNode2.detune.setTargetAtTime(config.secondaryOscillatorDetune ?? 0, now, 0.01);
        }
        if (sourceNode3 instanceof OscillatorNode) {
            const freq = newFrequency * (config.tertiaryOscillatorFreqRatio ?? 1);
            sourceNode3.frequency.setValueAtTime(freq, now);
            sourceNode3.detune.setTargetAtTime(config.tertiaryOscillatorDetune ?? 0, now, 0.01);
        }
        if (sourceNode4 instanceof OscillatorNode) {
            const freq = newFrequency * (config.quaternaryOscillatorFreqRatio ?? 1);
            sourceNode4.frequency.setValueAtTime(freq, now);
            sourceNode4.detune.setTargetAtTime(config.quaternaryOscillatorDetune ?? 0, now, 0.01);
        }


        // Apply ADSR Attack/Decay/Sustain with velocity
        const attackTime = config.attackTime ?? 0.01;
        const decayTime = config.decayTime ?? 0.1;
        const sustainLevel = config.sustainLevel ?? 0.8;
        const velocity = config.velocity ?? 1.0;
        const peakGain = velocity;
        const sustainGain = sustainLevel * peakGain;

        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(peakGain, now + Math.max(0.001, attackTime));
        envelopeGain.gain.linearRampToValueAtTime(sustainGain, now + Math.max(0.001, attackTime) + Math.max(0.001, decayTime));


        // Start the sound sources for the new voice
        (sourceNode1 as any).start(now);
        if (sourceNode2) (sourceNode2 as any).start(now);
        if (sourceNode3) (sourceNode3 as any).start(now);
        if (sourceNode4) (sourceNode4 as any).start(now);
        
        // Store the new voice
        activeVoicesRef.current.set(newFrequency, { sourceNode1, sourceNode2, sourceNode3, sourceNode4, envelopeGain, mixGain1, mixGain2, mixGain3, mixGain4 });
        
        // Set global effects parameters based on pedal on/off state
        filterNodeRef.current.type = config.isFilterOn ? (config.filterType ?? 'lowpass') : 'lowpass';
        filterNodeRef.current.frequency.setTargetAtTime(config.isFilterOn ? (config.filterFrequency ?? 15000) : 20000, now, 0.01);
        filterNodeRef.current.Q.setTargetAtTime(config.isFilterOn ? (config.filterQ ?? 1) : 1, now, 0.01);
        
        distortionNodeRef.current.curve = makeDistortionCurve(config.isDistortionOn ? (config.distortionAmount ?? 0) : 0, audioContext);

        // Chorus settings
        const chorusMix = config.isChorusOn ? (config.chorusMix ?? 0.5) : 0;
        const chorusRate = config.isChorusOn ? (config.chorusRate ?? 1.5) : 1.5;
        const chorusDepth = config.isChorusOn ? (config.chorusDepth ?? 0.002) : 0;
        
        chorusDryRef.current.gain.setTargetAtTime(1 - chorusMix, now, 0.01);
        chorusWetRef.current.gain.setTargetAtTime(chorusMix, now, 0.01);
        chorusLFORef.current.frequency.setTargetAtTime(chorusRate, now, 0.01);
        chorusDepthRef.current.gain.setTargetAtTime(chorusDepth, now, 0.01);

        const delayTime = config.isDelayOn ? (config.delayTime ?? 0.5) : 0;
        const delayFeedback = config.isDelayOn ? (config.delayFeedback ?? 0) : 0;
        const delayMix = config.isDelayOn ? (config.delayMix ?? 0) : 0;
        delayNodeRef.current.delayTime.setTargetAtTime(delayTime, now, 0.01);
        delayFeedbackRef.current.gain.setTargetAtTime(delayFeedback, now, 0.01);
        delayDryRef.current.gain.setTargetAtTime(1.0 - delayMix, now, 0.01);
        delayWetRef.current.gain.setTargetAtTime(delayMix, now, 0.01);

        const vibratoRate = config.isVibratoOn ? (config.vibratoRate ?? 5) : 5;
        const vibratoDepth = config.isVibratoOn ? (config.vibratoDepth ?? 0) : 0;
        vibratoLFORef.current.frequency.setTargetAtTime(vibratoRate, now, 0.01);
        vibratoDepthRef.current.gain.setTargetAtTime(vibratoDepth, now, 0.01);

        const tremoloRate = config.isTremoloOn ? (config.tremoloRate ?? 5) : 5;
        const tremoloDepth = config.isTremoloOn ? (config.tremoloDepth ?? 0) : 0;
        tremoloLFORef.current.frequency.setTargetAtTime(tremoloRate, now, 0.01);
        tremoloDepthRef.current.gain.setTargetAtTime(tremoloDepth, now, 0.01);

        const reverbMix = config.isReverbOn ? (config.reverbMix ?? 0) : 0;
        reverbDryRef.current.gain.setTargetAtTime(1 - reverbMix, now, 0.01);
        reverbWetRef.current.gain.setTargetAtTime(reverbMix, now, 0.01);

    }, [initializeAudio, createNode, noteOff, cleanupVoice]);

    const setVolume = useCallback((level: number) => {
        initializeAudio();
        if (mainGainNodeRef.current && audioContextRef.current) {
            mainGainNodeRef.current.gain.setTargetAtTime(level, audioContextRef.current.currentTime, 0.01);
        }
    }, [initializeAudio]);

    /** Shared host context + drum input bus (created on first drum play). */
    const getDrumBus = useCallback((): { context: AudioContext; bus: GainNode } | null => {
        initializeAudio();
        const context = audioContextRef.current;
        const filterNode = filterNodeRef.current;
        if (!context || !filterNode) return null;
        if (context.state === 'suspended') void context.resume();
        if (!drumBusRef.current) {
            drumBusRef.current = context.createGain();
            drumBusRef.current.gain.value = 0.9;
            drumBusRef.current.connect(filterNode);
        }
        return { context, bus: drumBusRef.current };
    }, [initializeAudio]);

    return { play, noteOff, setVolume, analyserNode, analyserL, analyserR, getDrumBus, startRecording, stopRecording, masterStream };
};
