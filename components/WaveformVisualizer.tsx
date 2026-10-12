import React, { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
    analyserNode: AnalyserNode | null;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ analyserNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // FIX: Initialize useRef with a null value as it requires an initial argument.
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (!analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        // Set a high resolution for the canvas to avoid pixelation
        const scale = window.devicePixelRatio;
        
        const resizeCanvas = () => {
            canvas.width = Math.floor(canvas.clientWidth * scale);
            canvas.height = Math.floor(canvas.clientHeight * scale);
        }
        resizeCanvas();

        analyserNode.fftSize = 2048;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(canvas);

        const draw = () => {
            animationFrameId.current = requestAnimationFrame(draw);

            analyserNode.getByteTimeDomainData(dataArray);
            
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            canvasCtx.lineWidth = 2 * scale;
            canvasCtx.strokeStyle = 'rgb(34 211 238)'; // text-cyan-400
            canvasCtx.shadowColor = 'rgb(34 211 238)';
            canvasCtx.shadowBlur = 10;


            canvasCtx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            observer.disconnect();
        };
    }, [analyserNode]);

    return <canvas ref={canvasRef} className="w-full h-32 bg-black/30 rounded-xl neumorphic-inset" aria-label="Audio waveform visualizer"/>;
};