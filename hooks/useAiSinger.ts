
import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { base64ToFloat32Array, float32ArrayToBase64, downsampleBuffer } from '../utils/audioStreamUtils';

export const useAiSinger = (externalAudioStream: MediaStream | null) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); // For visualizer (0-1)
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputMediaStreamRef = useRef<MediaStream | null>(null);
    const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    // Configs
    const INPUT_SAMPLE_RATE = 16000;
    const OUTPUT_SAMPLE_RATE = 24000;

    const connect = useCallback(async () => {
        if (isConnected) return;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Setup Audio Contexts
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE }); // Try to prefer 24k for output
            audioContextRef.current = ctx;
            nextStartTimeRef.current = ctx.currentTime;

            // Determine Input Source: External (Synth) or Microphone
            let stream: MediaStream;
            if (externalAudioStream) {
                console.log("Using External Synth Stream for AI Input");
                stream = externalAudioStream;
            } else {
                console.log("Using Microphone for AI Input");
                stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { 
                        channelCount: 1, 
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    } 
                });
            }
            inputMediaStreamRef.current = stream;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: `You are an expert AI Vocalist improvising over a live synthesizer track. 
                    The audio you hear is NOT speech; it is music being played by a human. 
                    Your task is to SING ALONG with this music in real-time.
                    
                    Guidelines:
                    1. Do NOT speak conversationally. Do NOT ask how you can help.
                    2. Listen to the melody and harmony of the input.
                    3. Improvise vocals: use humming, scatting (da-ba-dee), oohs, aahs, and ethereal lyrics about 'liquid neon', 'digital dreams', and 'flowing waves'.
                    4. Match the energy: if the music is fast, sing rhythmically. If slow, sing long, legato notes.
                    5. Be the voice of the instrument. React immediately to the sound.`,
                },
                callbacks: {
                    onopen: () => {
                        console.log("AI Singer Connected");
                        setIsConnected(true);
                        
                        // Setup Input Processing
                        const inputCtx = new AudioContextClass(); // Needs default system rate
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        source.connect(processor);
                        
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            // Downsample to 16kHz for Gemini
                            const downsampled = downsampleBuffer(inputData, inputCtx.sampleRate, INPUT_SAMPLE_RATE);
                            const b64Data = float32ArrayToBase64(downsampled);
                            
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: 'audio/pcm;rate=16000',
                                        data: b64Data
                                    }
                                });
                            });
                        };
                        
                        processor.connect(inputCtx.destination); // Required for script processor to run
                        inputProcessorRef.current = processor;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && audioContextRef.current) {
                            setIsSpeaking(true);
                            
                            // Decode
                            const float32 = base64ToFloat32Array(audioData);
                            
                            // Visualizer math (RMS)
                            let sum = 0;
                            for(let i=0; i<float32.length; i++) sum += float32[i]*float32[i];
                            const rms = Math.sqrt(sum / float32.length);
                            // Smoothing
                            setVolumeLevel(prev => prev * 0.8 + rms * 2.0); // Boost gain for visual

                            // Create Buffer
                            const buffer = audioContextRef.current.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
                            buffer.copyToChannel(float32, 0);

                            // Schedule
                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContextRef.current.destination);
                            
                            // Gapless playback logic
                            const now = audioContextRef.current.currentTime;
                            // Add a small buffer (0.05s) if we fell behind, otherwise strict scheduling
                            const startTime = Math.max(now, nextStartTimeRef.current);
                            source.start(startTime);
                            nextStartTimeRef.current = startTime + buffer.duration;
                            
                            activeSourcesRef.current.add(source);
                            source.onended = () => {
                                activeSourcesRef.current.delete(source);
                                if (activeSourcesRef.current.size === 0) {
                                    setIsSpeaking(false);
                                    setVolumeLevel(0);
                                }
                            };
                        }
                        
                        if (msg.serverContent?.turnComplete) {
                           // Turn complete logic if needed
                        }
                    },
                    onclose: () => {
                        console.log("AI Singer Disconnected");
                        disconnect();
                    },
                    onerror: (err) => {
                        console.error("AI Singer Error", err);
                        disconnect();
                    }
                }
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (e) {
            console.error("Failed to connect AI Singer", e);
            disconnect();
        }
    }, [isConnected, externalAudioStream]);

    const disconnect = useCallback(() => {
        setIsConnected(false);
        setIsSpeaking(false);
        setVolumeLevel(0);

        if (inputProcessorRef.current) {
            inputProcessorRef.current.disconnect();
            inputProcessorRef.current = null;
        }
        if (inputMediaStreamRef.current) {
            // Only stop tracks if we created them (i.e. it's a microphone stream)
            // If it's the synth stream (external), we shouldn't stop it as it breaks the synth output
            if (!externalAudioStream) {
                 inputMediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            inputMediaStreamRef.current = null;
        }
        
        // Close Live Session
        if (sessionPromiseRef.current) {
             sessionPromiseRef.current.then(session => {
                 try { session.close(); } catch(e) {}
             });
             sessionPromiseRef.current = null;
        }

        // Stop Audio Context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, [externalAudioStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return {
        isConnected,
        isSpeaking,
        volumeLevel,
        connect,
        disconnect
    };
};
