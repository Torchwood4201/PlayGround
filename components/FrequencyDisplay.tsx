import React from 'react';
import type { Waveform } from '../App';

interface FrequencyDisplayProps {
    frequency: number;
    isPlaying: boolean;
    isScanMode: boolean;
    scanMinFreq: number;
    scanMaxFreq: number;
    oscillatorType: Waveform;
    activeNote: string | null;
}

export const FrequencyDisplay: React.FC<FrequencyDisplayProps> = ({ 
    frequency, 
    isPlaying, 
    isScanMode,
    scanMinFreq,
    scanMaxFreq,
    oscillatorType,
    activeNote,
}) => {
    const pulseClass = isPlaying ? 'animate-pulse' : '';
    const textColor = isPlaying ? 'text-cyan-300' : 'text-gray-500';
    const isNoise = oscillatorType.includes('noise');
    const isNotePlaying = activeNote !== null && isPlaying;

    return (
        <div className={`
            bg-black/30
            rounded-full 
            w-48 
            h-48 
            mx-auto 
            flex 
            flex-col 
            items-center 
            justify-center 
            neumorphic-inset
            border-2
            transition-all 
            duration-300
            ${isPlaying 
                ? 'border-t-cyan-600/50 border-l-cyan-600/50 border-b-cyan-900/50 border-r-cyan-900/50 shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_0_15px_rgba(0,0,0,0.5)]' 
                : 'border-white/5'
            }
        `}>
            {isPlaying && isNoise ? (
                 <>
                    <span className={`
                        font-mono 
                        text-5xl 
                        font-bold 
                        transition-colors 
                        duration-300
                        ${textColor}
                        ${pulseClass}
                        drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]
                    `}>
                        NOISE
                    </span>
                     <span className="text-blue-200/70 text-lg capitalize mt-1">{oscillatorType.split('-')[0]}</span>
                 </>
            ) : isPlaying && isScanMode ? (
                 <>
                    <span className={`
                        font-mono 
                        text-3xl 
                        font-bold 
                        transition-colors 
                        duration-300
                        ${textColor}
                        ${pulseClass}
                        drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]
                    `}>
                        {Math.round(scanMinFreq)}↔{Math.round(scanMaxFreq)}
                    </span>
                    <span className="text-blue-200/70 text-lg mt-1">Hz</span>
                    <span className="text-gray-400 text-sm mt-1">Scanning</span>
                </>
            ) : (
                <>
                    <span className={`
                        font-mono 
                        text-5xl 
                        font-bold 
                        transition-colors 
                        duration-300
                        ${textColor}
                        ${pulseClass}
                        drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]
                    `}>
                        {isNotePlaying ? frequency.toFixed(2) : '---.--'}
                    </span>
                    <span className="text-blue-200/70 text-lg">Hz</span>
                </>
            )}
        </div>
    );
};