
import React, { useEffect, useRef } from 'react';
import { useAiSinger } from '../hooks/useAiSinger';

interface AiSingerControlsProps {
    disabled: boolean;
    masterStream: MediaStream | null;
}

export const AiSingerControls: React.FC<AiSingerControlsProps> = ({ disabled, masterStream }) => {
    const { isConnected, isSpeaking, volumeLevel, connect, disconnect } = useAiSinger(masterStream);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Visualizer Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Base circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fillStyle = isConnected ? '#06b6d4' : '#334155'; // Cyan or Slate
            ctx.fill();

            if (isConnected) {
                // Glow effect based on volume
                const maxRadius = 50;
                const radius = 20 + (volumeLevel * (maxRadius - 20));
                
                const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)'); // Inner cyan
                gradient.addColorStop(1, 'rgba(168, 85, 247, 0)'); // Outer purple fade

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Ring
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        };
        draw();

        return () => cancelAnimationFrame(animationId);
    }, [isConnected, volumeLevel]);

    const handleToggle = () => {
        if (isConnected) {
            disconnect();
        } else {
            connect();
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">AI Vocalist</h2>
            <div className="p-4 glass-base neumorphic-inset rounded-xl flex items-center justify-between px-4 gap-4">
                
                <div className="flex flex-col items-start gap-1">
                    <div className="text-xs text-blue-200/70 font-mono">STATUS</div>
                    <div className={`text-sm font-bold ${isConnected ? 'text-cyan-400 animate-pulse' : 'text-gray-500'}`}>
                        {isConnected ? (isSpeaking ? "SINGING" : "LISTENING") : "OFFLINE"}
                    </div>
                </div>

                <div className="relative w-24 h-24 flex items-center justify-center">
                    <canvas ref={canvasRef} width={100} height={100} className="absolute inset-0" />
                </div>

                <button
                    onClick={handleToggle}
                    disabled={disabled}
                    className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10
                        ${isConnected 
                            ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/40' 
                            : 'bg-cyan-500/20 border-cyan-500 text-cyan-500 hover:bg-cyan-500/40'
                        }
                        disabled:opacity-30 disabled:cursor-not-allowed
                    `}
                >
                     {isConnected ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                     )}
                </button>
            </div>
            <div className="text-[10px] text-center text-gray-500 px-4">
                Powered by Gemini 2.5 Live API
            </div>
        </div>
    );
};
