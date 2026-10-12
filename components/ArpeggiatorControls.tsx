
import React from 'react';

export interface ArpeggiatorConfig {
    isOn: boolean;
    tempo: number;
    pattern: 'up' | 'down' | 'upDown' | 'random';
    octave: number;
}

interface ArpeggiatorControlsProps {
    config: ArpeggiatorConfig;
    onChange: (config: ArpeggiatorConfig) => void;
    disabled: boolean;
}

export const ArpeggiatorControls: React.FC<ArpeggiatorControlsProps> = ({ config, onChange, disabled }) => {
    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Arpeggiator</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl flex flex-wrap gap-4 items-center justify-center">
                 <button
                    onClick={() => onChange({ ...config, isOn: !config.isOn })}
                    disabled={disabled}
                    className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200
                        ${config.isOn 
                            ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                            : 'bg-transparent border-gray-600 text-gray-400'
                        }
                    `}
                >
                    ARP
                </button>

                <div className="flex-grow space-y-2 min-w-[150px]">
                     <label className="block text-xs text-blue-200/70 text-center">Tempo: {config.tempo} ms</label>
                     <input 
                        type="range" 
                        min="50" 
                        max="1000" 
                        step="10" 
                        value={config.tempo}
                        onChange={(e) => onChange({...config, tempo: parseInt(e.target.value)})}
                        disabled={disabled}
                     />
                </div>

                <div className="space-y-2 min-w-[100px]">
                    <label className="block text-xs text-blue-200/70 text-center">Pattern</label>
                    <select
                        value={config.pattern}
                        onChange={(e) => onChange({...config, pattern: e.target.value as any})}
                        disabled={disabled}
                        className="w-full bg-black/20 border border-white/10 text-white text-xs rounded-lg p-1.5"
                    >
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                        <option value="upDown">Up/Down</option>
                        <option value="random">Random</option>
                    </select>
                </div>

                <div className="space-y-2 min-w-[100px]">
                    <label className="block text-xs text-blue-200/70 text-center">Octave Range: {config.octave}</label>
                     <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="1" 
                        value={config.octave}
                        onChange={(e) => onChange({...config, octave: parseInt(e.target.value)})}
                        disabled={disabled}
                     />
                </div>
            </div>
        </div>
    );
};
