import React, { useRef, useEffect, useState } from 'react';
import './XyScopeVisualizer.css';

interface XyScopeVisualizerProps {
    analyserL: AnalyserNode | null;
    analyserR: AnalyserNode | null;
    monoFallback: AnalyserNode | null;
    disabled?: boolean;
}

type ScopeMode = 'xy' | 'wave';

/**
 * XY vector scope (adapted from EvanWestermann/Oscillator's animate() recipe):
 * L channel -> X, R channel -> Y Lissajous with RGB triple-stroke additive
 * blending, trails, Z-warp pseudo-3D, trace offset and drift. Falls back to
 * the mono master analyser (diagonal) when the stereo tap is unavailable.
 */
export const XyScopeVisualizer: React.FC<XyScopeVisualizerProps> = ({
    analyserL, analyserR, monoFallback, disabled = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const paramsRef = useRef({ trails: 0.25, rgbSplit: true, zWarp: 0.5, traceOffset: 60, drift: 4, gain: 1 });
    const [mode, setMode] = useState<ScopeMode>('xy');
    const [trails, setTrails] = useState(0.25);
    const [rgbSplit, setRgbSplit] = useState(true);
    const [zWarp, setZWarp] = useState(0.5);
    const [traceOffset, setTraceOffset] = useState(60);
    const [drift, setDrift] = useState(4);
    const modeRef = useRef<ScopeMode>('xy');
    modeRef.current = mode;

    useEffect(() => {
        paramsRef.current = { trails, rgbSplit, zWarp, traceOffset, drift, gain: 1 };
    }, [trails, rgbSplit, zWarp, traceOffset, drift]);

    useEffect(() => {
        if (disabled || !canvasRef.current) return;
        const analyserLeft = analyserL ?? monoFallback;
        const analyserRight = analyserR ?? monoFallback;
        if (!analyserLeft) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scale = window.devicePixelRatio || 1;
        const resizeCanvas = () => {
            canvas.width = Math.floor(canvas.clientWidth * scale);
            canvas.height = Math.floor(canvas.clientHeight * scale);
        };
        resizeCanvas();
        const observer = new ResizeObserver(resizeCanvas);
        observer.observe(canvas);

        const len = Math.min(analyserLeft.frequencyBinCount, 2048);
        const dataL = new Uint8Array(analyserLeft.frequencyBinCount);
        const dataR = new Uint8Array((analyserRight ?? analyserLeft).frequencyBinCount);
        const stereo = analyserL && analyserR ? true : false;
        let t = 0;

        const passes = [
            { color: 'rgba(255,0,0,0.8)', phase: 0 },
            { color: 'rgba(0,255,0,0.8)', phase: (2 * Math.PI) / 3 },
            { color: 'rgba(0,100,255,0.8)', phase: (4 * Math.PI) / 3 },
        ];

        const draw = () => {
            animationFrameId.current = requestAnimationFrame(draw);
            const p = paramsRef.current;
            const currentMode = modeRef.current;
            t += 0.016;
            analyserLeft.getByteTimeDomainData(dataL);
            (analyserRight ?? analyserLeft).getByteTimeDomainData(dataR);

            // RMS for line width
            let sum = 0;
            for (let i = 0; i < len; i += 4) {
                const v = (dataL[i] - 128) / 128;
                sum += v * v;
            }
            const rms = Math.sqrt(sum / (len / 4));
            const W = canvas.width;
            const H = canvas.height;
            const cx = W / 2;
            const cy = H / 2;

            // Trails: translucent fill instead of clear
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = `rgba(0,0,0,${Math.min(0.9, Math.max(0.05, p.trails))})`;
            ctx.fillRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'screen';
            ctx.lineWidth = Math.max(1, (2 + rms * 14) * scale * 0.5);

            const dx = Math.sin(t * 0.7) * p.drift * scale;
            const dy = Math.cos(t * 0.9) * p.drift * scale;
            const activePasses = p.rgbSplit ? passes : [{ color: 'rgba(34,211,238,0.9)', phase: 0 }];

            for (const pass of activePasses) {
                ctx.strokeStyle = pass.color;
                ctx.beginPath();
                const zPhase = pass.phase;
                if (currentMode === 'xy') {
                    for (let i = 0; i < len; i += 2) {
                        const x = ((dataL[i] - 128) / 128) * p.gain;
                        const y = (((analyserRight ? dataR[i] : dataL[i]) - 128) / 128) * p.gain;
                        const z = Math.sin(t * 2 + (i / len) * Math.PI * 2 + zPhase) * p.zWarp;
                        const persp = 1 / (1 + z * 0.4);
                        const px = cx + x * cx * 0.9 * persp + dx + (p.rgbSplit ? (activePasses.indexOf(pass) - 1) * p.traceOffset * scale * 0.2 : 0);
                        const py = cy + y * cy * 0.9 * persp + dy;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                } else {
                    const off = p.traceOffset * scale * 0.15;
                    for (let i = 0; i < len; i += 2) {
                        const v = stereo
                            ? (((dataL[i] - 128) / 128 + (dataR[i] - 128) / 128) / 2) * p.gain
                            : ((dataL[i] - 128) / 128) * p.gain;
                        const px = (i / len) * W;
                        const py = cy + v * cy * 0.9 + (p.rgbSplit ? (activePasses.indexOf(pass) - 1) * off * 0.25 : 0) + dy * 0.3;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
        };

        draw();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            observer.disconnect();
        };
    }, [analyserL, analyserR, monoFallback, disabled]);

    if (disabled) {
        return (
            <div className="ls-xy-placeholder" aria-label="XY vector scope (offline)">
                Enable the synthesizer to start the vector scope.
            </div>
        );
    }

    return (
        <div className="ls-xy-wrap">
            <div className="ls-xy-toolbar">
                <div className="ls-xy-modes" role="tablist" aria-label="Scope mode">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'xy'}
                        className={`ls-xy-mode-btn${mode === 'xy' ? ' ls-xy-active' : ''}`}
                        onClick={() => setMode('xy')}
                    >
                        3D XY
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === 'wave'}
                        className={`ls-xy-mode-btn${mode === 'wave' ? ' ls-xy-active' : ''}`}
                        onClick={() => setMode('wave')}
                    >
                        WAVE
                    </button>
                </div>
                <label className="ls-xy-check">
                    <input type="checkbox" checked={rgbSplit} onChange={e => setRgbSplit(e.target.checked)} />
                    RGB split
                </label>
            </div>
            <div className="ls-xy-screen">
                <canvas ref={canvasRef} className="ls-xy-canvas" aria-label="XY vector scope visualizer" />
                <div className="ls-xy-grid" aria-hidden="true" />
                <div className="ls-xy-scanlines" aria-hidden="true" />
            </div>
            <div className="ls-xy-controls">
                <label className="ls-xy-slider">Trails
                    <input type="range" min="0.05" max="0.9" step="0.01" value={trails} onChange={e => setTrails(parseFloat(e.target.value))} />
                </label>
                <label className="ls-xy-slider">Z-warp
                    <input type="range" min="0" max="1" step="0.01" value={zWarp} onChange={e => setZWarp(parseFloat(e.target.value))} />
                </label>
                <label className="ls-xy-slider">Trace offset
                    <input type="range" min="0" max="300" step="1" value={traceOffset} onChange={e => setTraceOffset(parseFloat(e.target.value))} />
                </label>
                <label className="ls-xy-slider">Drift
                    <input type="range" min="0" max="20" step="0.5" value={drift} onChange={e => setDrift(parseFloat(e.target.value))} />
                </label>
            </div>
        </div>
    );
};
