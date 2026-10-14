import { useEffect, useState } from 'react';
import SpriteDetail from './components/SpriteDetail.jsx';

export default function App() {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [atlas, setAtlas] = useState('all');
  const [animatedOnly, setAnimatedOnly] = useState(false);
  const [hideUnsupported, setHideUnsupported] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('minecraft-sprites/manifest.json')
      .then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json();
      })
      .then(setManifest)
      .catch((e) => setError(String(e.message || e)));
  }, []);

  if (error) {
    return (
      <div className="app">
        <header>
          <h1>Sprite Feature Web</h1>
        </header>
        <main>
          <p className="error">
            Could not load sprite data ({error}). Run <code>npm run sprites:generate</code> first.
          </p>
        </main>
      </div>
    );
  }
  if (!manifest) {
    return (
      <div className="app">
        <header>
          <h1>Sprite Feature Web</h1>
        </header>
        <main>
          <p>Loading sprite manifest…</p>
        </main>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = manifest.sprites.filter((s) => {
    if (atlas !== 'all' && s.atlasName !== atlas) return false;
    if (animatedOnly && !s.animation) return false;
    if (hideUnsupported && !s.supported) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.sprite.toLowerCase().includes(q)
    );
  });
  const animCount = manifest.sprites.filter((s) => s.animation).length;
  const unsupCount = manifest.sprites.filter((s) => !s.supported).length;

  return (
    <div className="app">
      <header>
        <div>
          <h1>Sprite Feature Web</h1>
          <p className="sub">
            Vanilla Minecraft sprite atlas browser — MiniMessage, JSON, <code>/tellraw</code> and{' '}
            <code>/title</code> for Java 1.21.9+
          </p>
        </div>
        <div className="version">
          <span className="chip">Java {manifest.version}</span>
          <span className="chip">{manifest.sprites.length} sprites</span>
          <span className="chip anim">{animCount} animated</span>
          {unsupCount > 0 && <span className="chip unsup">{unsupCount} unsupported</span>}
        </div>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search name or sprite id… (e.g. porkchop, heart, trims)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={atlas} onChange={(e) => setAtlas(e.target.value)} aria-label="Atlas">
          <option value="all">All atlases</option>
          {manifest.atlases.map((a) => (
            <option key={a.key} value={a.key}>
              {a.name} ({a.count})
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={animatedOnly} onChange={(e) => setAnimatedOnly(e.target.checked)} />{' '}
          animated only
        </label>
        <label>
          <input
            type="checkbox"
            checked={hideUnsupported}
            onChange={(e) => setHideUnsupported(e.target.checked)}
          />{' '}
          hide unsupported
        </label>
        <span className="count">
          {filtered.length} / {manifest.sprites.length}
        </span>
      </div>

      <main className="grid">
        {filtered.map((s) => (
          <button key={s.id} className="card" onClick={() => setSelected(s)} title={s.id}>
            <span className="thumb">
              {s.supported && s.image ? (
                <img src={s.image} alt="" loading="lazy" draggable={false} className="pixelated" />
              ) : (
                <span className="noimg">?</span>
              )}
            </span>
            <span className="card-name">{s.name}</span>
            <span className="card-sub">
              {s.atlasName}
              {s.animation ? ' · anim' : ''}
              {!s.supported ? ' · unsupported' : ''}
            </span>
          </button>
        ))}
      </main>
      {filtered.length === 0 && <p className="empty">No sprites match. Try a different search.</p>}

      <footer>
        Data from the {manifest.version} client jar ({manifest.source.toLowerCase()}). Sprite components
        render 8×8 in chat. Atlas contents: <code>assets/minecraft/atlases/</code> (F3+S in-game).
      </footer>

      <SpriteDetail sprite={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
