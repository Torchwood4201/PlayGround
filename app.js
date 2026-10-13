"use strict";
/* Playback — static music streaming website (no backend).
   - Instant demo catalog (SoundHelix MP3s, playable everywhere, works offline-ish)
   - Live search + streaming previews via the public iTunes Search API (CORS, no key)
   - Album lookup via iTunes Lookup API, lyrics via lyrics.ovh (both optional, degrade gracefully)
*/
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const HUES = [[32, 60], [8, 50], [200, 55], [160, 45], [280, 45], [45, 70], [340, 50], [100, 40]];
const grad = i => { const [h, s] = HUES[Math.abs(i || 0) % HUES.length]; return `linear-gradient(135deg,hsl(${h} ${s}% 45%),hsl(${(h + 40) % 360} ${s}% 18%))`; };
const bg = (t, i) => t && t.art ? `center/cover url('${t.art}')` : grad(i);
const f = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
const big = u => u ? String(u).replace("100x100bb.jpg", "600x600bb.jpg").replace("60x60bb.jpg", "600x600bb.jpg") : "";

/* ---------- demo catalog (always available) ---------- */
const SH = n => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const DEMO = [
  { id: "demo-1", title: "Midnight Drive", artist: "Neon Coast", album: "Afterglow", dur: 372, url: SH(1), art: "", genre: "Synthwave" },
  { id: "demo-2", title: "Paper Sunsets", artist: "The Gramophones", album: "First Pressing", dur: 425, url: SH(2), art: "", genre: "Indie" },
  { id: "demo-3", title: "Static Bloom", artist: "Velvet Dial", album: "FM Dreams", dur: 315, url: SH(3), art: "", genre: "Pop" },
  { id: "demo-4", title: "Cassette Summer", artist: "Side B", album: "Mixtape '94", dur: 281, url: SH(4), art: "", genre: "Rock" },
  { id: "demo-5", title: "Brass & Smoke", artist: "Blue Note Society", album: "Club Session", dur: 354, url: SH(5), art: "", genre: "Jazz" },
  { id: "demo-6", title: "Low Orbit", artist: "Satellite Hearts", album: "Stream State", dur: 398, url: SH(6), art: "", genre: "Electronic" },
  { id: "demo-7", title: "Honey Reel", artist: "The Tapes", album: "Rewind", dur: 302, url: SH(7), art: "", genre: "Soul" },
  { id: "demo-8", title: "Ivory Static", artist: "Cassette Club", album: "Dolby Dreams", dur: 441, url: SH(8), art: "", genre: "Lo-Fi" },
  { id: "demo-9", title: "Golden Groove", artist: "Vinyl Collective", album: "Crate Digger", dur: 367, url: SH(9), art: "", genre: "Funk" },
  { id: "demo-10", title: "Night Frequency", artist: "Radio Mirage", album: "107.9 FM", dur: 389, url: SH(10), art: "", genre: "Pop" },
  { id: "demo-11", title: "Analog Heart", artist: "Tube & Wire", album: "Hi-Fi Rack", dur: 333, url: SH(11), art: "", genre: "Rock" },
  { id: "demo-12", title: "Last Encore", artist: "Century Players", album: "A Century of Sound", dur: 356, url: SH(12), art: "", genre: "Classical" },
];
const TAPES = [
  { id: "tape-chill", title: "Chill Evening Mix", desc: "12 tracks · lo-fi & soul", tracks: [7, 4, 2, 5, 0, 9] },
  { id: "tape-drive", title: "Night Drive Mix", desc: "6 tracks · synth & pop", tracks: [0, 9, 5, 3, 10, 2] },
  { id: "tape-vinyl", title: "Crate Classics", desc: "6 tracks · jazz & funk", tracks: [4, 8, 1, 6, 11, 3] },
];
const CRATES = [
  { id: "crate-1", title: "Afterglow", artist: "Neon Coast", year: "2024", tracks: [0, 5] },
  { id: "crate-2", title: "First Pressing", artist: "The Gramophones", year: "1962", tracks: [1, 11] },
  { id: "crate-3", title: "FM Dreams", artist: "Velvet Dial", year: "1987", tracks: [2, 9] },
  { id: "crate-4", title: "Crate Digger", artist: "Vinyl Collective", year: "1978", tracks: [8, 4] },
];

/* ---------- settings + history ---------- */
const S = { needle: true, xfade: false, compact: false, motion: true };
try { Object.assign(S, JSON.parse(localStorage.getItem("pb_s") || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem("pb_s", JSON.stringify(S)); } catch (e) {} };
const apply = () => { document.body.classList.toggle("compact", S.compact); document.body.classList.toggle("still", !S.motion); };
const recent = () => { try { const r = JSON.parse(localStorage.getItem("pb_r") || "[]"); return Array.isArray(r) ? r : []; } catch (e) { return []; } };
const remember = t => { try { localStorage.setItem("pb_r", JSON.stringify([t].concat(recent().filter(x => x.id !== t.id)).slice(0, 30))); } catch (e) {} };

/* ---------- iTunes API (live, optional) ---------- */
async function itunes(path) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch("https://itunes.apple.com" + path, { signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}
const fromIT = r => ({
  id: "it-" + r.trackId,
  title: r.trackName || "Unknown title",
  artist: r.artistName || "Unknown artist",
  album: r.collectionName || "",
  dur: Math.round((r.trackTimeMillis || 30000) / 1000),
  art: big(r.artworkUrl100 || ""),
  url: r.previewUrl || "",
  collectionId: r.collectionId,
  via: "preview · 30s",
});
async function searchSongs(q) {
  const j = await itunes(`/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=20`);
  return (j.results || []).filter(r => r.previewUrl).map(fromIT);
}
async function searchAlbums(q) {
  const j = await itunes(`/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=12`);
  return (j.results || []).map(r => ({
    id: String(r.collectionId), title: r.collectionName || "Unknown album",
    artist: r.artistName || "", year: (r.releaseDate || "").slice(0, 4),
    art: big(r.artworkUrl100 || ""), collectionId: r.collectionId,
  }));
}
async function albumTracks(collectionId) {
  const j = await itunes(`/lookup?id=${encodeURIComponent(collectionId)}&entity=song&limit=50`);
  const col = (j.results || [])[0] || {};
  const tracks = (j.results || []).slice(1).filter(r => r.wrapperType === "track").map(fromIT);
  return { title: col.collectionName || "Album", artist: col.artistName || "", year: (col.releaseDate || "").slice(0, 4), art: big(col.artworkUrl100 || ""), tracks };
}

/* ---------- player ---------- */
const au = $("au");
let Q = [], cur = -1, on = false, token = 0;
const L = {};
const T = () => Q[cur];
let actx = null, analyser = null, freq = null, useAnalyser = false;

function hookAnalyser() {
  if (actx || !S.motion) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
    const src = actx.createMediaElementSource(au);
    analyser = actx.createAnalyser();
    analyser.fftSize = 64;
    src.connect(analyser); analyser.connect(actx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
    useAnalyser = true;
  } catch (e) { useAnalyser = false; }
}
function lost(m) {
  const l = $("lost");
  l.textContent = m || "SIGNAL LOST";
  l.classList.add("show");
  $("status").textContent = "SIGNAL LOST";
  setTimeout(() => { l.classList.remove("show"); $("status").textContent = "ON AIR"; }, 3500);
}
function crackle() {
  if (!S.needle) return;
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const b = c.createBuffer(1, c.sampleRate * .35, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < .01 ? (Math.random() * 2 - 1) * .35 : 0;
    const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start();
  } catch (e) {}
}
function fadeIn() {
  au.volume = S.xfade ? 0 : 1;
  if (!S.xfade) return;
  let v = 0;
  const iv = setInterval(() => { v += .1; au.volume = Math.min(v, 1); if (v >= 1) clearInterval(iv); }, 200);
}
async function playAt(i, list) {
  if (list) Q = list;
  if (!Q[i]) return;
  cur = i; const t = T(); on = true; sync(); crackle();
  const my = ++token;
  $("status").textContent = "TUNING…";
  try {
    if (!t.url) throw new Error("no playable source");
    hookAnalyser();
    if (actx && actx.state === "suspended") actx.resume().catch(() => {});
    au.src = t.url;
    fadeIn();
    await au.play();
    if (my !== token) return;
    $("status").textContent = "ON AIR · " + (t.via || "MP3").toUpperCase();
    remember(t);
    if ($("lyr").style.display === "block") lyrics();
  } catch (e) {
    if (my === token) { on = false; sync(); lost("SIGNAL LOST — " + (e.message || "no source")); }
  }
}
const step = d => { if (Q.length) playAt((cur + d + Q.length) % Q.length); };
function toggle() {
  if (cur < 0) { playAt(0, L.home || DEMO); return; }
  if (au.paused) { on = true; au.play().catch(() => { on = false; sync(); }); }
  else { on = false; au.pause(); }
  sync();
}
au.onplay = () => { on = true; sync(); };
au.onpause = () => { on = false; sync(); };
au.onended = () => step(1);
au.onerror = () => { if (au.src) { on = false; sync(); lost("SIGNAL LOST — stream refused"); } };
au.ontimeupdate = draw;
au.onloadedmetadata = () => { $("dur").textContent = f(au.duration); };
function draw() {
  const d = isFinite(au.duration) && au.duration > 0 ? au.duration : (T() && T().dur) || 1;
  const p = Math.min(au.currentTime / d, 1);
  $("ring").style.strokeDashoffset = 295.3 * (1 - p);
  $("seek").value = p * 100;
  $("cur").textContent = f(au.currentTime);
}
$("seek").addEventListener("input", e => {
  const d = isFinite(au.duration) ? au.duration : (T() && T().dur) || 0;
  if (d) au.currentTime = e.target.value / 100 * d;
});
$("bars").innerHTML = "<i></i>".repeat(24);
setInterval(() => {
  if (!on) return;
  const bars = $("bars").querySelectorAll("i");
  if (useAnalyser && analyser) {
    try {
      analyser.getByteFrequencyData(freq);
      bars.forEach((b, i) => { const v = freq[i % freq.length] / 255; b.style.height = (12 + v * 88) + "%"; });
    } catch (e) { useAnalyser = false; }
  } else {
    bars.forEach(b => b.style.height = (15 + Math.random() * 85) + "%");
  }
  document.querySelectorAll(".vu i").forEach(n => n.style.transform = "rotate(" + (-50 + Math.random() * 85) + "deg)");
}, 220);
function sync() {
  document.body.classList.toggle("playing", on);
  ["pp", "pp2"].forEach(k => $(k).textContent = on ? "⏸" : "▶");
  const t = T(); if (!t) return;
  ["npT", "mT"].forEach(k => $(k).textContent = t.title);
  ["npA", "mA"].forEach(k => $(k).textContent = t.artist + (t.album ? " · " + t.album : ""));
  $("disc").style.background = bg(t, cur);
  $("mSw").style.background = bg(t, cur);
  $("dur").textContent = f(t.dur);
  $("queue").innerHTML = '<div class="mono" style="margin-bottom:6px">UP NEXT</div>' + Q.map((x, i) =>
    `<button data-a="playq" data-i="${i}" class="${i === cur ? "on" : ""}"><div class="sw" style="background:${esc(bg(x, i))}"></div><div style="flex:1;min-width:0"><div style="font-size:13px">${esc(x.title)}</div><div class="mono">${esc(x.artist)}</div></div><span class="mono">${f(x.dur)}</span></button>`).join("");
  document.querySelectorAll(".tr").forEach(r => r.classList.toggle("on", r.dataset.vid === t.id));
}
async function lyrics() {
  const t = T(), el = $("lyr");
  if (!t) { el.textContent = "Play a song to see lyrics."; return; }
  el.textContent = "Loading lyrics…";
  try {
    const a = (t.artist || "").split(",")[0].split("&")[0].split("feat")[0].trim();
    const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t.title)}`);
    const j = await r.json();
    el.textContent = (j.lyrics || "").trim() || "No lyrics for this track.";
  } catch (e) { el.textContent = "No lyrics for this track."; }
}

/* ---------- views ---------- */
const ERAS = [["Gramophone", "🎺", "Classics & firsts"], ["Vinyl", "💿", "Albums & crates"], ["Radio", "📻", "Live stations"], ["Cassette", "📼", "Playlists"], ["CD", "💽", "Liner notes"], ["MP3", "🎧", "Recently played"], ["Stream", "〰️", "Discover"], ["Settings", "🎚️", "Hi-fi rack"]];
const h2 = t => `<h2>${t}</h2>`;
const card = o => `<button class="card ${o.cls || ""}" data-a="${o.a}" data-v="${esc(o.v)}" ${o.i != null ? `data-i="${o.i}"` : ""} ${o.st ? `data-st="${o.st}"` : ""}><div class="art" style="background:${esc(o.bg)}"></div><p>${esc(o.t)}</p><span class="mono">${esc(o.s || "")}</span></button>`;
const shelf = (key, list) => { L[key] = list; return list.length ? `<div class="row">${list.map((t, i) => card({ a: "play", v: key, i, bg: bg(t, i), t: t.title, s: t.artist })).join("")}</div>` : `<p class="mono">Nothing found.</p>`; };
const albumCards = list => list.length ? `<div class="row">${list.map((x, i) => card({ a: "album", v: x.id, st: "vinyl", bg: x.art ? `center/cover url('${x.art}')` : grad(i), t: x.title, s: x.artist || x.year || "" })).join("")}</div>` : `<p class="mono">Nothing found.</p>`;
const tapes = () => `<div class="row">${TAPES.map(x => `<button class="card tape" data-a="playlist" data-v="${esc(x.id)}"><div class="reels"><div class="reel"></div><div class="reel"></div></div><div class="lab">${esc(x.title)}</div></button>`).join("")}</div>`;
const rows = (key, list) => {
  L[key] = list;
  return list.map((t, i) => `<button class="tr" data-a="play" data-v="${key}" data-i="${i}" data-vid="${esc(t.id)}"><b class="n mono">${String(i + 1).padStart(2, "0")}</b><span class="t">${esc(t.title)}<br><span class="mono">${esc(t.artist)}</span></span><span class="mono">${f(t.dur)}</span></button>`).join("");
};
const sw = (k, l, d) => `<div class="r"><div><div>${l}</div><div class="mono">${d}</div></div><button class="sw ${S[k] ? "on" : ""}" data-a="set" data-v="${k}" aria-label="${l}"></button></div>`;
const ST = [["88.1", "Jazz"], ["91.5", "Soul"], ["95.3", "Indie"], ["99.7", "Rock"], ["103.2", "Lo-Fi"], ["107.9", "Pop"]];
let sta = 0;
const dial = () => `<div class="dial" id="dial"><div class="needle" style="left:${8 + sta * 15.6}%"></div><div class="static"></div>${ST.map((s, i) => `<b class="${i === sta ? "on" : ""}" data-a="tune" data-i="${i}">${s[0]} ${s[1]}</b>`).join("")}</div>`;
const msearch = `<div class="msearch"><input id="qm" placeholder="Search songs, artists, albums…" aria-label="Search"></div>`;
let era = "home", lastEra = "home", gid = 0;

async function liveOrDemo(q, demoFilter) {
  try { const r = await searchSongs(q); if (r.length) return { live: true, tracks: r }; }
  catch (e) {}
  return { live: false, tracks: DEMO.filter(demoFilter || (() => true)) };
}
const V = {
  async home() {
    const [top, fresh] = await Promise.all([
      liveOrDemo("top hits 2025", t => [0, 5, 9].includes(DEMO.indexOf(t))),
      liveOrDemo("chill pop", t => [2, 7, 4].includes(DEMO.indexOf(t))),
    ]);
    L.home = top.tracks;
    const hero = top.tracks[0] ? `<div class="hero"><div class="art" style="background:${esc(bg(top.tracks[0], 0))}"></div><div><div class="mono">FEATURED RELEASE</div><h1 class="brand">${esc(top.tracks[0].title)}</h1><p class="mono">${esc(top.tracks[0].artist)}${top.live ? " · LIVE FROM ITUNES" : " · HOUSE BAND"}</p><button class="btn" data-a="play" data-v="home" data-i="0">▶ Play</button></div></div>` : "";
    return msearch + hero +
      (top.live ? "" : `<p class="notice mono">OFFLINE DEMO MODE — connect to the internet for live search &amp; 30s previews. These 12 house tracks always play.</p>`) +
      h2("Fresh Signal") + shelf("fresh", fresh.tracks) +
      h2("Your Crate") + albumCards(CRATES) +
      h2("Your Mixtapes") + tapes();
  },
  async 0() {
    const r = await liveOrDemo("classic jazz 1950s", t => ["Jazz", "Classical", "Funk"].includes(t.genre));
    return msearch + `<h2 class="brand">Gramophone</h2><p class="mono">Classics &amp; first recordings${r.live ? " · live" : " · house band"}</p>` + shelf("gr", r.tracks);
  },
  async 1() {
    let liveAlbums = [];
    try { liveAlbums = await searchAlbums("top albums"); } catch (e) {}
    return msearch + h2("Your Crate") + albumCards(CRATES) +
      (liveAlbums.length ? h2("Top Albums — Live") + albumCards(liveAlbums.slice(0, 8)) : "") +
      h2("Continue Playback") + shelf("rc", recent().length ? recent() : DEMO.slice(0, 6));
  },
  async 2() {
    const r = await liveOrDemo(ST[sta][1] + " hits", t => t.genre.toLowerCase().includes(ST[sta][1].toLowerCase().replace("-", "") ) || true);
    L.radio = r.tracks;
    return msearch + h2("Tune the Dial") + dial() + h2("Now broadcasting " + ST[sta][0] + " FM · " + ST[sta][1]) + shelf("radio", r.tracks);
  },
  async 3() { return msearch + h2("Your Mixtapes") + tapes() + `<p class="mono">Hand-dubbed from the house catalog — tap a tape to open it.</p>`; },
  async 4() {
    let liveAlbums = [];
    try { liveAlbums = await searchAlbums("deluxe edition"); } catch (e) {}
    return msearch + h2("CD Shelf") + albumCards(CRATES.map(c => ({ ...c }))) +
      (liveAlbums.length ? h2("Deluxe Editions — Live") + albumCards(liveAlbums.slice(0, 8)) : "") +
      `<p class="mono">Open a disc to see its jewel case and liner notes.</p>`;
  },
  async 5() {
    const r = recent();
    return msearch + h2("MP3 Library") + (r.length ? rows("rec", r) : `<p class="mono">Play something and it will appear here.</p>` + rows("rec", DEMO.slice(0, 5)));
  },
  async 6() {
    const t = T();
    let rel = [];
    if (t) {
      try { rel = await searchSongs(t.artist.split(",")[0].trim() + " " + (t.genre || "")); } catch (e) {}
      rel = rel.filter(x => x.id !== t.id).slice(0, 10);
    }
    if (!rel.length) rel = (await liveOrDemo("trending songs", () => true)).tracks;
    return msearch + h2(t ? "Because you played " + esc(t.title) : "Fresh Signal") + shelf("str", rel) +
      h2("Streaming mode") + `<div class="rack">${sw("xfade", "Crossfade", "Fade each new track in")}<p class="mono" style="margin:0">Live tracks are 30-second previews courtesy of the iTunes Search API. House tracks play in full.</p></div>`;
  },
  async 7() {
    return msearch + `<h2 class="brand">Hi-Fi Rack</h2><div class="rack"><div class="vus"><div class="vu"><span>L</span><i></i></div><div class="vu"><span>R</span><i></i></div></div>${sw("needle", "Needle-drop crackle", "Vinyl crackle when a track starts")}${sw("xfade", "Crossfade", "Fade each new track in")}${sw("compact", "MP3 compact mode", "LCD-style player panel")}${sw("motion", "Motion", "Spinning discs, reels and glow")}</div>
    <p class="mono" style="margin-top:12px">Playback is a 100% static website: no account, no server. Search is live via iTunes; tapes &amp; crates are the built-in house band (SoundHelix).</p>`;
  },
  async search(q) {
    let songs = [], albums = [];
    try { ([songs] = [await searchSongs(q)]); } catch (e) {}
    try { albums = await searchAlbums(q); } catch (e) {}
    if (!songs.length) songs = DEMO.filter(t => (t.title + t.artist + t.album).toLowerCase().includes(q.toLowerCase()));
    return msearch + h2("Results for “" + esc(q) + "”") +
      (songs.length ? rows("sr", songs.slice(0, 12)) : `<p class="mono">No tracks found.</p>`) +
      h2("Albums") + (albums.length ? albumCards(albums.slice(0, 8)) : `<p class="mono">No live albums — try “beatles”, “jazz”, “pop”.</p>`) +
      h2("House matches") + shelf("srh", DEMO.filter(t => (t.title + t.artist).toLowerCase().includes(q.toLowerCase())).slice(0, 6));
  },
  async album({ id }) {
    const crate = CRATES.find(c => c.id === id);
    if (crate) {
      const tr = crate.tracks.map(i => DEMO[i]);
      return `<button class="mono" data-a="back">◄ BACK</button><h2 class="brand" style="margin-top:14px">${esc(crate.title)}</h2><div class="crate"><div class="sleeve"><div class="rec"></div><div class="cover" style="background:${esc(bg(tr[0], 1))}"></div></div><div class="booklet"><div class="mono" style="margin-bottom:8px">${esc(crate.artist)} · ${esc(crate.year || "")}</div>${rows("det", tr)}</div></div>`;
    }
    try {
      const d = await albumTracks(id);
      const b = d.art ? `center/cover url('${d.art}')` : grad(1);
      return `<button class="mono" data-a="back">◄ BACK</button><h2 class="brand" style="margin-top:14px">${esc(d.title)}</h2><div class="jewel"><div class="cd" style="--a:${esc(b)};background-image:${d.art ? `url('${d.art}')` : "none"}"></div><div class="booklet"><div class="mono" style="margin-bottom:8px">${esc(d.artist)}${d.year ? " · " + esc(d.year) : ""} · 30s previews</div>${d.tracks.length ? rows("det", d.tracks) : "<p class='mono'>No playable previews on this album.</p>"}</div></div>`;
    } catch (e) { return `<button class="mono" data-a="back">◄ BACK</button><p class="mono">SIGNAL LOST — ${esc(e.message)}</p>`; }
  },
  async playlist({ id }) {
    const tp = TAPES.find(t => t.id === id);
    const tr = tp ? tp.tracks.map(i => DEMO[i]) : DEMO.slice(0, 6);
    return `<button class="mono" data-a="back">◄ BACK</button><div class="tapeview"><div class="reel"></div><h2 class="brand" style="margin:0">${esc(tp ? tp.title : "Mixtape")}</h2><div class="reel"></div></div><div class="mono" style="margin-bottom:8px">${esc(tp ? tp.desc : "")}</div>${rows("det", tr)}`;
  },
};
async function go(e, arg) {
  if (e !== "album" && e !== "playlist") lastEra = e;
  era = e; document.body.dataset.era = e; nav();
  const id = ++gid, m = $("main");
  m.innerHTML = msearch + '<p class="mono">TUNING…</p>'; m.scrollTop = 0;
  wireMobileSearch();
  try { const html = await V[e](arg); if (id === gid) { m.innerHTML = html; wireMobileSearch(); sync(); } }
  catch (err) { if (id === gid) m.innerHTML = msearch + `<p class="mono">SIGNAL LOST — ${esc(err.message)}</p>`; }
}
function nav() {
  $("nav").innerHTML = `<button class="${era === "home" ? "on" : ""}" data-a="go" data-v="home">🏠<div>Home<small>Streaming dashboard</small></div></button>` +
    ERAS.map((x, i) => `<button class="${era === i ? "on" : ""}" data-a="go" data-v="${i}">${x[1]}<div>${x[0]}<small>${x[2]}</small></div></button>`).join("");
  $("tabs").innerHTML = [["Home", "home", "🏠"], ["Crate", 1, "💿"], ["Radio", 2, "📻"], ["Tapes", 3, "📼"], ["Library", 5, "🎧"]].map(t =>
    `<button class="${era === t[1] ? "on" : ""}" data-a="go" data-v="${t[1]}">${t[2]}<br>${t[0]}</button>`).join("");
}
async function tune(i) {
  sta = i; await go(2);
  const d = $("dial"); if (d) d.classList.add("tune");
  if (L.radio && L.radio.length) playAt(0, L.radio);
}
function wireMobileSearch() {
  const qm = $("qm");
  if (qm) qm.addEventListener("keydown", e => { const v = e.target.value.trim(); if (e.key === "Enter" && v) go("search", v); });
}

/* ---------- events ---------- */
const ACT = {
  go: v => go(isNaN(v) ? v : +v),
  play: (k, i) => playAt(+i, L[k]),
  playq: (_, i) => playAt(+i),
  album: (id, _, st) => go("album", { id, st }),
  playlist: id => go("playlist", { id }),
  tune: (_, i) => tune(+i),
  set: k => { S[k] = !S[k]; save(); apply(); go(era); },
  tab: v => {
    const l = v === "l";
    $("queue").style.display = l ? "none" : "block";
    $("lyr").style.display = l ? "block" : "none";
    $("tq").classList.toggle("on", !l); $("tl").classList.toggle("on", l);
    if (l) lyrics();
  },
  toggle, prev: () => step(-1), next: () => step(1),
  full: () => document.body.classList.toggle("full"),
  back: () => go(lastEra),
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const d = el.dataset;
  if (ACT[d.a]) ACT[d.a](d.v, d.i, d.st);
});
$("q").addEventListener("keydown", e => { const v = e.target.value.trim(); if (e.key === "Enter" && v) go("search", v); });
apply();
setTimeout(() => $("boot").classList.add("off"), 1400);
L.home = DEMO.slice(0, 6);
go("home");
