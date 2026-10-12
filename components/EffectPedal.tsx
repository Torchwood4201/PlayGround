
import React from 'react';

interface EffectPedalProps {
    title: string;
    color: string; // e.g., 'cyan', 'orange', 'green'
    isOn: boolean;
    onToggle: (isOn: boolean) => void;
    children: React.ReactNode;
}

export const EffectPedal: React.FC<EffectPedalProps> = ({ title, color, isOn, onToggle, children }) => {
    const colorVariants = {
        cyan: {
            bg: 'bg-cyan-900/40',
            border: 'border-cyan-700',
            text: 'text-cyan-300',
            led: 'bg-cyan-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.7)]'
        },
        orange: {
            bg: 'bg-orange-900/40',
            border: 'border-orange-700',
            text: 'text-orange-300',
            led: 'bg-orange-400 shadow-[0_0_8px_2px_rgba(251,146,60,0.7)]'
        },
        green: {
            bg: 'bg-emerald-900/40',
            border: 'border-emerald-700',
            text: 'text-emerald-300',
            led: 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]'
        },
        purple: {
            bg: 'bg-purple-900/40',
            border: 'border-purple-700',
            text: 'text-purple-300',
            led: 'bg-purple-400 shadow-[0_0_8px_2px_rgba(192,132,252,0.7)]'
        },
        blue: {
            bg: 'bg-sky-900/40',
            border: 'border-sky-700',
            text: 'text-sky-300',
            led: 'bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.7)]'
        },
        pink: {
            bg: 'bg-pink-900/40',
            border: 'border-pink-700',
            text: 'text-pink-300',
            led: 'bg-pink-400 shadow-[0_0_8px_2px_rgba(236,72,153,0.7)]'
        }
    };

    const selectedColor = colorVariants[color as keyof typeof colorVariants] || colorVariants.cyan;

    return (
        <div className={`
            w-full sm:w-64 flex-shrink-0 p-4 rounded-2xl border ${selectedColor.bg} ${selectedColor.border}
            neumorphic-outset space-y-3 flex flex-col transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-60'}
        `}>
            <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${selectedColor.text}`}>{title}</h3>
                <div className={`w-3 h-3 rounded-full transition-all duration-200 ${isOn ? selectedColor.led : 'bg-gray-800 shadow-inner'}`}></div>
            </div>
            <div className={`space-y-3 flex-grow transition-opacity ${!isOn ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <fieldset disabled={!isOn}>
                    {children}
                </fieldset>
            </div>
            <div className="flex justify-center pt-2">
                <button
                    onClick={() => onToggle(!isOn)}
                    className="w-12 h-12 rounded-full bg-gray-300 border-2 border-gray-500 neumorphic-outset active:neumorphic-inset focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white flex items-center justify-center"
                    aria-label={`Toggle ${title} effect`}
                >
                    <div className="w-8 h-8 rounded-full bg-gray-700 neumorphic-inset"></div>
                </button>
            </div>
        </div>
    );
};
