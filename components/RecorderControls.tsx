
import React, { useState, useEffect } from 'react';

interface RecorderControlsProps {
    startRecording: () => void;
    stopRecording: () => void;
    disabled: boolean;
}

export const RecorderControls: React.FC<RecorderControlsProps> = ({ startRecording, stopRecording, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleToggle = () => {
        if (isRecording) {
            stopRecording();
            setIsRecording(false);
        } else {
            startRecording();
            setIsRecording(true);
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">Master Recorder</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl flex items-center justify-between px-8">
                <div className="font-mono text-xl text-red-400 tabular-nums">
                    {isRecording ? formatTime(duration) : '--:--'}
                </div>
                
                <button
                    onClick={handleToggle}
                    disabled={disabled}
                    className={`
                        w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-200 shadow-lg
                        ${isRecording 
                            ? 'bg-transparent border-red-500 text-red-500 hover:bg-red-500/10' 
                            : 'bg-red-500 border-red-600 text-white hover:scale-105 active:scale-95'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {isRecording ? (
                        <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                    ) : (
                        <div className="w-6 h-6 bg-white rounded-full"></div>
                    )}
                </button>

                <div className={`text-xs uppercase tracking-widest ${isRecording ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
                    {isRecording ? 'REC' : 'READY'}
                </div>
            </div>
        </div>
    );
};
