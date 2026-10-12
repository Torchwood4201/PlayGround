
import React from 'react';
import { PowerIcon } from './Icons';

interface MasterControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    volume: number;
    onVolumeChange: (value: number) => void;
}

export const MasterControls: React.FC<MasterControlsProps> = ({ 
    isPlaying, 
    onTogglePlay, 
    volume, 
    onVolumeChange 
}) => {
    return (
        <div className="flex items-center justify-center gap-x-6 gap-y-4 pt-2 flex-wrap">
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
            <div className="flex-grow max-w-xs space-y-2">
                <label htmlFor="volume" className="block text-sm font-medium text-blue-200/70 text-center">
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
                    className="w-full"
                />
            </div>
        </div>
    );
};
