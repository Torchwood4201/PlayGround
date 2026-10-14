import { useState } from 'react';
import { FORMATS } from '../lib/formats.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export default function CopyBlock({ label, text }) {
  const [state, setState] = useState('copy');
  const onCopy = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied!' : 'failed');
    window.setTimeout(() => setState('copy'), 1500);
  };
  return (
    <div className="copyblock">
      <div className="copyblock-head">
        <span>{label}</span>
        <button onClick={onCopy}>{state}</button>
      </div>
      <pre>{text}</pre>
    </div>
  );
}

export function FormatList({ sprite }) {
  return (
    <div className="formatlist">
      {FORMATS.map((f) => (
        <CopyBlock key={f.key} label={f.label} text={f.build(sprite)} />
      ))}
    </div>
  );
}
