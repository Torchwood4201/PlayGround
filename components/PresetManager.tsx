
import React from 'react';
import type { SynthPreset } from '../utils/presets';

interface PresetManagerProps {
    presets: SynthPreset[];
    currentPresetId: string;
    onLoadPreset: (presetId: string) => void;
    disabled: boolean;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
    presets,
    currentPresetId,
    onLoadPreset,
    disabled
}) => {
    
    const handleLoad = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        if (id) {
            onLoadPreset(id);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Synth Presets</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl space-y-4">
                {/* Preset Selector */}
                <div>
                    <label htmlFor="preset-selector" className="sr-only">Load Preset</label>
                    <select
                        id="preset-selector"
                        value={currentPresetId}
                        onChange={handleLoad}
                        disabled={disabled}
                        className="neumorphic-outset bg-black/20 border border-white/20 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 disabled:opacity-50 appearance-none"
                    >
                        {presets.map(preset => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
