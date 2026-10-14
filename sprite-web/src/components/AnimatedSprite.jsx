import { useEffect, useRef } from 'react';

/**
 * Plays a vanilla animated texture (vertical frame strip, .mcmeta timing)
 * on a canvas, scaled up with crisp pixels.
 */
export default function AnimatedSprite({ src, w, h, animation, scale = 8 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const img = new Image();
    let timer = 0;
    let dead = false;
    img.onload = () => {
      if (dead) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const frameH = animation?.height ?? w;
      const stripFrames = Math.max(1, Math.floor(h / frameH));
      const seq =
        animation?.frames?.length > 0
          ? animation.frames
          : Array.from({ length: stripFrames }, (_, i) => ({ index: i, time: animation?.frametime ?? 1 }));
      const ft = Math.max(1, animation?.frametime ?? 1);
      canvas.width = w;
      canvas.height = frameH;
      let i = 0;
      const draw = () => {
        if (dead) return;
        const f = seq[i % seq.length];
        const sy = ((f.index % stripFrames) + stripFrames) % stripFrames;
        ctx.clearRect(0, 0, w, frameH);
        ctx.drawImage(img, 0, sy * frameH, w, frameH, 0, 0, w, frameH);
        const hold = Math.max(1, f.time ?? ft) * 50;
        i += 1;
        timer = window.setTimeout(draw, hold);
      };
      draw();
    };
    img.src = src;
    return () => {
      dead = true;
      window.clearTimeout(timer);
    };
  }, [src, w, h, animation]);

  return (
    <canvas
      ref={ref}
      className="pixelated"
      style={{ width: w * scale, height: (animation?.height ?? w) * scale, maxWidth: '100%' }}
    />
  );
}
