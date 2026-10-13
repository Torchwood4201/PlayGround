// Playback routes: resolve a playable audio URL and lyrics.
//  1) JioSaavn (muzo-backend lib)  -> direct CDN URL the browser can play anywhere (incl. Netlify)
//  2) yt_music_api (vendor/)       -> YouTube stream URL (works when the server runs on your own machine)
const express = require('express');
const JioSaavn = require('../lib/jiosaavn');
const router = express.Router();
const saavn = new JioSaavn();

let yt = null;
try { yt = require('../vendor/yt_music_api/dist/index.js'); }
catch (e) { console.log('[yt_music_api] not built, YouTube fallback + lyrics disabled:', e.message); }

router.get('/play/:id', async (req, res) => {
  const { title, artist } = req.query;
  const log = [];
  if (title && artist) {
    try {
      const r = await saavn.search(String(title), String(artist));
      if (r && r.downloadUrl) return res.json({ via: 'jiosaavn', url: r.downloadUrl, log });
      log.push('jiosaavn: no url');
    } catch (e) { log.push('jiosaavn: ' + e.message); }
  }
  if (yt) {
    try {
      const sp = await yt.getPlayers(req.params.id);
      if (!sp.available) throw new Error(sp.unplayable_reason || 'unavailable');
      const p = sp.bestAudio();
      const url = typeof p.url === 'function' ? await p.url() : p.url;
      if (url) return res.json({ via: 'youtube', url, log });
      log.push('yt_music_api: no url');
    } catch (e) { log.push('yt_music_api: ' + e.message); }
  }
  res.status(502).json({ error: 'No playable source', log });
});

router.get('/lyrics/:id', async (req, res) => {
  if (!yt) return res.status(503).json({ error: 'yt_music_api not built' });
  try {
    const m = await yt.get(req.params.id);
    const l = await m.getLyrics();
    res.json({ lyrics: l.lyrics || '' });
  } catch (e) { res.status(404).json({ error: e.message || 'No lyrics' }); }
});

module.exports = router;
