
import React, { useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from './Icons';
import { midiSamples, MidiSample } from '../utils/midiSamples';

interface MidiPlayerControlsProps {
    onFileLoad: (file: File) => void;
    onSampleLoad: (sample: MidiSample) => void;
    fileName: string | null;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
    progress: number;
    disabled: boolean;
}

export const MidiPlayerControls: React.FC<MidiPlayerControlsProps> = ({
    onFileLoad,
    onSampleLoad,
    fileName,
    isPlaying,
    onPlay,
    onPause,
    onStop,
    progress,
    disabled
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileLoad(event.target.files[0]);
        }
    };

    const triggerFileLoad = () => {
        fileInputRef.current?.click();
    };
    
    const handleSampleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const sampleName = event.target.value;
        if (sampleName) {
            const sample = midiSamples.find(s => s.name === sampleName);
            if (sample) {
                onSampleLoad(sample);
            }
        }
         // Reset the select so the same sample can be re-triggered
        event.target.value = "";
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MIDI Player</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">

                <div>
                    <label htmlFor="sample-selector" className="sr-only">Load Sample Song</label>
                    <select
                        id="sample-selector"
                        onChange={handleSampleSelect}
                        disabled={disabled}
                        defaultValue=""
                        className="w-full p-2.5 bg-black/20 border border-white/20 rounded-lg neumorphic-outset text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                        <option value="" disabled>Load a sample song...</option>
                        {midiSamples.map(sample => (
                            <option key={sample.name} value={sample.name}>
                                {sample.name}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".mid,.midi"
                    className="hidden"
                    disabled={disabled}
                />
                <button
                    onClick={triggerFileLoad}
                    disabled={disabled}
                    className="w-full p-2.5 bg-black/20 border border-white/20 rounded-lg neumorphic-outset text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {fileName ? `Loaded: ${fileName}` : '...or load your own MIDI file'}
                </button>

                {fileName && (
                    <>
                        <div className="p-1 glass-base neumorphic-inset rounded-full">
                            <label htmlFor="midi-progress" className="sr-only">MIDI Progress</label>
                            <progress
                                id="midi-progress"
                                max="100"
                                value={progress}
                                className="w-full h-2 rounded-lg [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-cyan-400 [&::-webkit-progress-value]:to-blue-500 [&::-moz-progress-bar]:bg-gradient-to-r [&::-moz-progress-bar]:from-cyan-400 [&::-moz-progress-bar]:to-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={isPlaying ? onPause : onPlay}
                                disabled={disabled}
                                className="w-16 h-16 rounded-full flex items-center justify-center border border-white/20 transition-all duration-150 neumorphic-outset active:neumorphic-inset disabled:neumorphic-inset disabled:bg-black/20 disabled:border-white/10 disabled:text-gray-600 disabled:cursor-not-allowed"
                                aria-label={isPlaying ? "Pause MIDI" : "Play MIDI"}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button
                                onClick={onStop}
                                disabled={disabled}
                                className="w-16 h-16 rounded-full flex items-center justify-center border border-white/20 transition-all duration-150 neumorphic-outset active:neumorphic-inset disabled:neumorphic-inset disabled:bg-black/20 disabled:border-white/10 disabled:text-gray-600 disabled:cursor-not-allowed"
                                aria-label="Stop MIDI"
                            >
                                <StopIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
