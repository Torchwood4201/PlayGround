import { useEffect } from 'react';
import AnimatedSprite from './AnimatedSprite.jsx';
import { FormatList } from './CopyBlock.jsx';

export default function SpriteDetail({ sprite, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!sprite) return null;
  const rows = [
    ['Sprite ID', sprite.id],
    ['Atlas', sprite.atlas],
    ['Sprite name', sprite.sprite],
    ['Size', sprite.w != null ? `${sprite.w}×${sprite.h}px` : '— (generated variant)'],
    [
      'Animation',
      sprite.animation
        ? `frametime ${sprite.animation.frametime}, ${sprite.animation.frames?.length > 0 ? `${sprite.animation.frames.length} frames` : `${Math.max(1, Math.floor(sprite.h / (sprite.animation.height ?? sprite.w)))} strip frames`}${sprite.animation.interpolate ? ', interpolated' : ''}`
        : 'static',
    ],
    ['Status', sprite.supported ? 'exported' : `unsupported — ${sprite.reason ?? 'unknown'}`],
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>{sprite.name}</h2>
        <div className="detail-body">
          <div className="detail-preview">
            {sprite.supported && sprite.image ? (
              sprite.animation ? (
                <AnimatedSprite src={sprite.image} w={sprite.w} h={sprite.h} animation={sprite.animation} scale={10} />
              ) : (
                <img src={sprite.image} alt={sprite.id} className="pixelated detail-img" draggable={false} />
              )
            ) : (
              <div className="no-preview">no preview — generated variant not rendered by the exporter</div>
            )}
            <div className="badges">
              <span className="chip">{sprite.atlasName}</span>
              {sprite.animation && <span className="chip anim">animated</span>}
              {!sprite.supported && <span className="chip unsup">unsupported</span>}
            </div>
          </div>
          <div className="detail-meta">
            <table>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h3>Copy</h3>
        <FormatList sprite={sprite} />
      </div>
    </div>
  );
}
