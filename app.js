/* Playback — static music streaming app (no backend).
   Grooveshark-style: free, no signup.
   Data: Audius (full-length, free, CORS-open) + iTunes Search API (mainstream 30s previews). */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = ms => { const s = Math.max(0, Math.round((ms || 0) / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const fmtS = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
const isStream = t => !!t && (t.kind === "hls" || t.kind === "dash");
const durLabel = t => !t ? "0:00" : t.live ? "LIVE" : isStream(t) ? t.kind.toUpperCase() : fmt(t.ms);
const badgeText = t => t.live ? "LIVE" : isStream(t) ? t.kind.toUpperCase() : t.src === "full" ? "FULL" : "0:30";
const badgeCls = t => t.live ? "live" : isStream(t) ? "stream" : t.src === "full" ? "full" : "prev";
const big = u => String(u || "").replace("100x100bb", "600x600bb");
const HUES = [[32, 60], [8, 50], [200, 55], [160, 45], [280, 45], [45, 70], [340, 50], [100, 40]];
const grad = i => { const [h, s] = HUES[Math.abs(i || 0) % HUES.length]; return `linear-gradient(135deg,hsl(${h} ${s}% 45%),hsl(${(h + 40) % 360} ${s}% 18%))`; };
const bgOf = (t, i) => t && t.art ? `center/cover url('${t.art}')` : grad(i);

/* ---------- tiny store ---------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const S = Object.assign({ shuffle: false, repeat: false, compact: false, motion: true }, store.get("pb_s", {}));
const saveS = () => store.set("pb_s", S);
const applyS = () => {
  document.body.classList.toggle("compact", !!S.compact);
  document.body.classList.toggle("still", !S.motion);
  $("shBtn").classList.toggle("active", !!S.shuffle);
  $("rpBtn").classList.toggle("active", !!S.repeat);
};
const recents = () => store.get("pb_r", []);
const remember = t => store.set("pb_r", [t].concat(recents().filter(x => x.id !== t.id)).slice(0, 30));
const likes = () => store.get("pb_l", []);
const isLiked = id => likes().some(x => x.id === id);
const toggleLike = t => {
  const l = likes();
  const has = l.some(x => x.id === t.id);
  store.set("pb_l", has ? l.filter(x => x.id !== t.id) : [t].concat(l).slice(0, 200));
  return !has;
};

/* ---------- iTunes API (mainstream previews) ---------- */
async function itunes(params) {
  const u = "https://itunes.apple.com/search?" + new URLSearchParams(Object.assign({ media: "music", entity: "song", limit: 24 }, params));
  const r = await fetch(u);
  if (!r.ok) throw new Error("Search failed (" + r.status + ")");
  const j = await r.json();
  return (j.results || []).map(norm);
}
function norm(x) {
  return {
    id: "it" + String(x.trackId || x.collectionId || Math.random()),
    src: "preview",
    title: x.trackName || x.collectionName || "Unknown title",
    artist: x.artistName || "Unknown artist",
    album: x.collectionName || "",
    genre: x.primaryGenreName || "",
    art: big(x.artworkUrl100 || x.artworkUrl60 || ""),
    artSm: x.artworkUrl100 || "",
    url: x.previewUrl || "",
    ms: x.trackTimeMillis || 30000,
    price: x.trackPrice,
    link: x.trackViewUrl || x.collectionViewUrl || ""
  };
}

/* ---------- Audius API (full-length free tracks, no key) ---------- */
const AU = "https://discoveryprovider.audius.co/v1";
const AU_APP = "Playback";
function normAu(x) {
  if (!x || !x.id) return null;
  const art = x.artwork || {};
  const img = art["480x480"] || art["1000x1000"] || art["150x150"] || "";
  return {
    id: "au" + String(x.id),
    src: "full",
    title: x.title || "Unknown title",
    artist: (x.user && x.user.name) || "Unknown artist",
    album: "",
    genre: x.genre || (x.tags || "").split(",")[0] || "Audius",
    art: img,
    artSm: art["150x150"] || img,
    url: `${AU}/tracks/${x.id}/stream?app_name=${AU_APP}`,
    ms: (x.duration || 180) * 1000,
    plays: x.play_count || 0,
    link: "https://audius.co" + (x.permalink || "")
  };
}
async function audius(path, params) {
  const u = `${AU}${path}?` + new URLSearchParams(Object.assign({ app_name: AU_APP }, params));
  const r = await fetch(u);
  if (!r.ok) throw new Error("Audius " + r.status);
  const j = await r.json();
  return (j.data || []).map(normAu).filter(Boolean).filter(t => t.url);
}
const auSearch = (q, limit) => audius("/tracks/search", { query: q, limit: limit || 14 });
const auTrending = (genre, limit) => audius("/tracks/trending", Object.assign({ limit: limit || 18 }, genre && genre !== "All" ? { genre } : {}));
const cache = new Map();
async function cached(key, fn) {
  if (cache.has(key)) return cache.get(key);
  const p = fn().catch(() => []);
  cache.set(key, p);
  return p;
}
const shelf = term => cached("t:" + term, () => itunes({ term, limit: 18 }));
const shelfFull = (genre, limit) => cached("au:" + genre + ":" + limit, () => auTrending(genre, limit));
const mixShelves = async (term, genre) => {
  const [a, b] = await Promise.all([shelf(term), shelfFull(genre || "All", 12)]);
  return [...b, ...a];
};

/* ---------- player (dual engine: <audio> for MP3/preview + live radio, Shaka for HLS/DASH) ----------
   Shaka is attached to the <audio> element so any video tracks inside an HLS/DASH stream
   are dropped by the player — i.e. we stream the video sources as AUDIO ONLY. */
const au = $("audio");
let Q = [], cur = -1, playing = false;
let engine = "audio", shakaPlayer = null;
const T = () => Q[cur];
const setEngine = e => { engine = e; document.body.dataset.engine = e; };
au.volume = 0.9;
au.preload = "auto";

function toast(m) {
  const el = $("toast");
  el.textContent = m;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2800);
  $("status").textContent = m.slice(0, 26).toUpperCase();
  setTimeout(() => { if (!$("toast").classList.contains("show")) $("status").textContent = playing ? "ON AIR" : "STANDBY"; }, 2900);
}

function playAt(i, list) {
  if (list) Q = list.filter(t => t && t.url);
  if (!Q.length) { toast("QUEUE IS EMPTY"); return; }
  cur = ((i % Q.length) + Q.length) % Q.length;
  const t = T();
  if (!t || !t.url) { toast("NO SOURCE FOR THIS TRACK"); return; }
  loadTrack(t);
  remember(t);
  sync();
  renderQueue();
  renderAbout();
  updateLikeBtn();
  document.body.classList.add("playing");
}
function loadTrack(t) {
  if (isStream(t)) playViaShaka(t);
  else playViaAudio(t);
}
function playViaAudio(t) {
  if (engine === "shaka") return stopShaka().then(() => startAudio(t));
  startAudio(t);
}
function startAudio(t) {
  setEngine("audio");
  au.src = t.url;
  au.play().catch(() => { playing = false; sync(); toast("TAP PLAY TO START AUDIO"); });
}
async function ensureShaka() {
  if (shakaPlayer) return shakaPlayer;
  if (!window.shaka) throw new Error("Shaka Player failed to load (offline?)");
  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) throw new Error("HLS/DASH not supported in this browser");
  const p = new shaka.Player(au);
  p.addEventListener("error", () => { if (engine === "shaka") toast("STREAM ERROR — TRY NEXT"); });
  shakaPlayer = p;
  return p;
}
async function playViaShaka(t) {
  setEngine("shaka");
  try {
    const p = await ensureShaka();
    await p.load(t.url);
    await au.play();
  } catch (e) {
    playing = false; sync();
    toast((t.kind === "dash" ? "DASH" : "HLS") + " UNAVAILABLE" + (e && e.message ? " — " + String(e.message).slice(0, 44) : ""));
  }
}
async function stopShaka() {
  setEngine("audio");
  if (shakaPlayer) { try { await shakaPlayer.unload(); } catch {} }
  try { au.pause(); } catch {}
}
function step(d) {
  if (!Q.length) return;
  if (S.shuffle && d > 0 && Q.length > 1) {
    let n; do { n = Math.floor(Math.random() * Q.length); } while (n === cur);
    return playAt(n);
  }
  playAt(cur + d);
}
function toggle() {
  if (cur < 0) {
    const first = (L.home || []).find(t => t.url);
    if (first) return playAt(Q.indexOf(first) >= 0 ? Q.indexOf(first) : 0, Q.length ? Q : [first]);
    return toast("PICK A TRACK FIRST");
  }
  if (au.paused) au.play().catch(() => toast("AUDIO BLOCKED — TAP AGAIN"));
  else au.pause();
}
au.onplay = () => { playing = true; document.body.classList.add("playing"); sync(); };
au.onpause = () => { playing = false; document.body.classList.remove("playing"); sync(); };
au.onended = () => { if (S.repeat && T()) { au.currentTime = 0; au.play().catch(() => {}); } else step(1); };
au.onerror = () => { if (au.src && engine === "audio") toast("STREAM REFUSED — TRY NEXT"); };
au.onloadedmetadata = () => {
  const t = T();
  if (t && t.live && !(isFinite(au.duration) && au.duration > 0)) $("dur").textContent = "LIVE";
  else if (isFinite(au.duration) && au.duration > 0) $("dur").textContent = fmtS(au.duration);
  else $("dur").textContent = t ? durLabel(t) : "0:00";
};
au.ontimeupdate = draw;
function draw() {
  const t = T();
  const hasDur = isFinite(au.duration) && au.duration > 0;
  if (t && t.live && !hasDur) {
    $("ring").style.strokeDashoffset = 0;
    $("seek").value = 1000;
    $("cur").textContent = "LIVE";
    $("dur").textContent = "LIVE";
    return;
  }
  const d = hasDur ? au.duration : 30;
  const p = Math.min((au.currentTime || 0) / d, 1);
  $("ring").style.strokeDashoffset = 295.3 * (1 - p);
  $("seek").value = Math.round(p * 1000);
  $("cur").textContent = fmtS(au.currentTime || 0);
  if (hasDur) $("dur").textContent = fmtS(au.duration);
}
$("seek").addEventListener("input", e => {
  const t = T();
  if (t && t.live && !(isFinite(au.duration) && au.duration > 0)) return;
  const d = isFinite(au.duration) && au.duration > 0 ? au.duration : 30;
  au.currentTime = (e.target.value / 1000) * d;
});
$("vol").addEventListener("input", e => { au.volume = e.target.value / 100; });
$("bars").innerHTML = "<i></i>".repeat(28);
setInterval(() => {
  if (!playing) return;
  $("bars").querySelectorAll("i").forEach(b => b.style.height = (12 + Math.random() * 88) + "%");
  document.querySelectorAll(".vu i").forEach(n => n.style.transform = "rotate(" + (-52 + Math.random() * 88) + "deg)");
}, 220);

function sync() {
  ["pp", "pp2"].forEach(k => $(k).textContent = playing ? "⏸" : "▶");
  $("status").textContent = playing ? "ON AIR" : "STANDBY";
  $("liveDot").style.background = playing ? "var(--neon)" : "var(--brass)";
  const t = T();
  if (!t) return;
  ["npT", "mT"].forEach(k => $(k).textContent = t.title);
  ["npA", "mA"].forEach(k => $(k).textContent = t.artist + (t.album ? " · " + t.album : ""));
  const tag = t.live ? "LIVE RADIO" : isStream(t) ? t.kind.toUpperCase() + " · AUDIO" : t.src === "full" ? "FULL TRACK" : "30s PREVIEW";
  $("npG").textContent = [tag, t.genre, t.live ? "LIVE" : isStream(t) ? "stream" : fmt(t.ms)].filter(Boolean).join(" · ");
  const kick = document.querySelector(".np-kicker");
  if (kick) kick.textContent = "NOW PLAYING · " + tag;
  $("disc").style.backgroundImage = t.art ? `url('${t.art}')` : "none";
  $("disc").style.backgroundSize = "cover";
  $("disc").style.backgroundPosition = "center";
  $("mSw").style.background = t.art ? `center/cover url('${t.artSm || t.art}')` : grad(cur);
  $("dur").textContent = durLabel(t);
  document.querySelectorAll(".tr").forEach(r => r.classList.toggle("on", r.dataset.vid === String(t.id)));
  document.querySelectorAll("#queue button").forEach((b, i) => b.classList.toggle("on", i === cur));
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: t.album || "Playback", artwork: t.art ? [{ src: t.art, sizes: "600x600" }] : [] });
    } catch {}
  }
}
function renderQueue() {
  $("queue").style.display = "block"; $("lyr").style.display = "none";
  $("tq").classList.add("on"); $("tl").classList.remove("on");
  $("queue").innerHTML = '<div class="mono" style="margin-bottom:6px">UP NEXT · ' + Q.length + '</div>' + (Q.length
    ? Q.map((x, i) => `<button data-a="playq" data-i="${i}" class="${i === cur ? "on" : ""}"><div class="sw" style="background:${esc(bgOf(x, i))}"></div><div style="flex:1;min-width:0"><div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.title)}</div><div class="mono" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.artist)}</div></div><span class="mono">${fmt(x.ms)}</span></button>`).join("")
    : '<div class="empty mono">Queue is empty — play anything.</div>');
}
function renderAbout() {
  const t = T();
  if (!t) return;
  const full = t.src === "full";
  let kind, body, open;
  if (t.live) { kind = "Live radio · audio"; body = "Always-on internet radio. There is no track list — you're hearing it live."; open = "Open station ↗"; }
  else if (isStream(t)) { kind = t.kind.toUpperCase() + " stream · audio only"; body = (t.video ? "This stream carries video, but Playback decodes the audio track only. " : "") + "Adaptive streaming via Shaka Player over " + t.kind.toUpperCase() + "."; open = "View source ↗"; }
  else if (full) { kind = "Full track"; body = "Free full-length stream via Audius (independent artists, legal + no signup)."; open = "Open on Audius ↗"; }
  else { kind = "30s preview"; body = "30-second preview via Apple iTunes. Full versions open in Apple Music."; open = "Open in Apple Music ↗"; }
  $("lyr").innerHTML = esc(`${t.title} — ${t.artist}\n\nKind: ${kind}\nGenre: ${t.genre || "Music"}\n\n${body}`)
    + (t.link ? `\n\n<a href="${esc(t.link)}" target="_blank" rel="noopener" style="color:var(--brass-b)">${open}</a>` : "");
}
function updateLikeBtn() {
  const t = T();
  const on = t && isLiked(String(t.id));
  $("likeBtn").textContent = on ? "♥ Liked" : "♡ Like";
  $("likeBtn").classList.toggle("on", !!on);
}

/* ---------- views ---------- */
const ERAS = [
  ["Gramophone", "🎺", "Classics & firsts"],
  ["Vinyl", "💿", "Albums & crates"],
  ["Radio", "📻", "Live stations"],
  ["Cassette", "📼", "Playlists"],
  ["CD", "💽", "Liner notes"],
  ["MP3", "🎧", "Recently played"],
  ["Stream", "〰️", "Discover"],
  ["Settings", "🎚️", "Hi-fi rack"]
];
const GENRES = ["All", "Electronic", "Hip-Hop/Rap", "Rock", "Pop", "Jazz", "R&B/Soul", "Lo-Fi", "Indie", "Latin", "Alternative"];
const ST = [["88.1", "jazz classics"], ["91.5", "soul motown"], ["95.3", "indie folk"], ["99.7", "classic rock"], ["103.2", "lofi chill"], ["107.9", "pop hits"]];
/* Live internet radio (<audio>) + HLS/DASH network streams (Shaka, video decoded as audio only). */
const STATIONS = [
  { id: "st-fip", mark: "FIP", kind: "live", live: true, name: "FIP", desc: "Radio France · jazz, soul, world", genre: "Eclectic", url: "https://icecast.radiofrance.fr/fip-midfi.mp3", link: "https://www.radiofrance.fr/fip" },
  { id: "st-nts", mark: "NTS 1", kind: "live", live: true, name: "NTS Radio 1", desc: "London · underground, global", genre: "Underground", url: "https://stream-relay-geo.ntslive.net/stream", link: "https://www.nts.live" },
  { id: "st-rpm", mark: "R.P. Mellow", kind: "live", live: true, name: "Radio Paradise · Mellow", desc: "eclectic mellow mix", genre: "Eclectic", url: "https://stream.radioparadise.com/mellow-320", link: "https://radioparadise.com" },
  { id: "st-rpr", mark: "R.P. Rock", kind: "live", live: true, name: "Radio Paradise · Rock", desc: "rock mix, always on", genre: "Rock", url: "https://stream.radioparadise.com/rock-320", link: "https://radioparadise.com" },
  { id: "st-defcon", mark: "SomaFM DEF", kind: "live", live: true, name: "SomaFM · DEF CON", desc: "hacker / electronic", genre: "Electronic", url: "https://ice1.somafm.com/defcon-256-mp3", link: "https://somafm.com" },
  { id: "st-angel", mark: "HLS Angel", kind: "hls", video: true, name: "Angel One", desc: "HLS adaptive · video → audio only", genre: "HLS", url: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8", link: "https://github.com/google/shaka-player" },
  { id: "st-bbb", mark: "HLS BBB", kind: "hls", video: true, name: "Big Buck Bunny", desc: "HLS · video → audio only", genre: "HLS", url: "https://storage.googleapis.com/shaka-demo-assets/bbb-dark-truths-hls/hls.m3u8", link: "https://github.com/google/shaka-player" },
  { id: "st-mux", mark: "HLS Mux", kind: "hls", video: true, name: "Mux Test Stream", desc: "HLS · video → audio only", genre: "HLS", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", link: "https://github.com/muxinc" },
  { id: "st-sintel", mark: "DASH Sintel", kind: "dash", video: true, name: "Sintel", desc: "DASH adaptive · video → audio only", genre: "DASH", url: "https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd", link: "https://github.com/google/shaka-player" },
  { id: "st-angel-dash", mark: "DASH Angel", kind: "dash", video: true, name: "Angel One", desc: "DASH adaptive · video → audio only", genre: "DASH", url: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd", link: "https://github.com/google/shaka-player" }
];
const stationTrack = s => ({ id: s.id, src: "station", kind: s.kind, live: !!s.live, video: !!s.video, title: s.name, artist: s.desc, album: "", genre: s.genre || (s.live ? "Live radio" : "Stream"), art: "", artSm: "", url: s.url, ms: 0, link: s.link || "" });
let sta = 2, era = "home", gid = 0;
const L = {};

const skel = '<div class="skel">' + "<i></i>".repeat(5) + "</div>";
const badge = t => `<span class="srcbadge ${badgeCls(t)}">${badgeText(t)}</span>`;
const card = o => `<button class="card ${o.cls || ""}" data-a="${o.a}" data-v="${esc(o.v)}" ${o.i != null ? `data-i="${o.i}"` : ""}><div class="art" style="background:${esc(o.bg)}">${o.badge || ""}<span class="playbadge">▶</span></div><p>${esc(o.t)}</p><span class="mono">${esc(o.s || "")}</span></button>`;
const shelfHtml = (key, list) => {
  L[key] = list;
  return list.length ? `<div class="row">${list.map((t, i) => card({ a: "play", v: key, i, bg: bgOf(t, i), t: t.title, s: (t.src === "full" || t.live ? "● " : "") + t.artist, badge: badge(t) })).join("")}</div>` : `<div class="empty mono">Nothing found — check your connection and retry.</div>`;
};
const rowsHtml = (key, list) => {
  L[key] = list;
  return list.map((t, i) => `<button class="tr" data-a="play" data-v="${key}" data-i="${i}" data-vid="${esc(t.id)}"><b class="n mono">${String(i + 1).padStart(2, "0")}</b><img loading="lazy" src="${esc(t.artSm || t.art)}" alt="" onerror="this.style.visibility='hidden'"><span class="t">${esc(t.title)} <span class="srcbadge ${badgeCls(t)}">${badgeText(t)}</span><small class="mono">${esc(t.artist)} · ${esc(t.album || t.genre)}</small></span><button class="like ${isLiked(String(t.id)) ? "liked" : ""}" data-a="likeone" data-v="${key}" data-i="${i}" aria-label="Like">♥</button><span class="mono">${t.live || isStream(t) ? t.live ? "LIVE" : "" : fmt(t.ms)}</span></button>`).join("");
};
const h2 = t => `<h2>${t}</h2>`;
const chips = active => `<div class="chiprow">${GENRES.map(g => `<button class="chip ${active === g ? "on" : ""}" data-a="genre" data-v="${esc(g)}">${esc(g)}</button>`).join("")}</div>`;

const V = {
  async home() {
    const [top, chill, free] = await Promise.all([shelf("top hits 2025"), shelf("chill acoustic"), shelfFull("All", 18)]);
    const mixed = [...free.slice(0, 8), ...top.slice(0, 10)];
    L.home = mixed;
    const hero = mixed[0] ? `<div class="hero"><div class="art" style="background:${esc(bgOf(mixed[0], 0))}"></div><div style="position:relative;z-index:1"><div class="mono">FEATURED RELEASE ${mixed[0].src === "full" ? "· FULL TRACK" : "· PREVIEW"}</div><h1 class="brand">${esc(mixed[0].title)}</h1><p class="mono">${esc(mixed[0].artist)} · ${esc(mixed[0].album || mixed[0].genre)}</p><div><button class="btn" data-a="play" data-v="home" data-i="0">▶ Play</button><button class="btn ghost" data-a="go" data-v="6">Discover →</button></div></div></div>` : "";
    return hero + h2("Fresh Signal · Free + Top Hits") + shelfHtml("home", mixed)
      + h2("Free Full-Length · Audius trending") + shelfHtml("free", free)
      + h2("Chill Shelf · Previews") + shelfHtml("chill", chill)
      + `<p class="mono" style="margin-top:18px">● FULL = free full-length (Audius) · 0:30 = preview (iTunes) · No account needed</p>`;
  },
  async 0() {
    const list = await shelf("ella fitzgerald frank sinatra jazz");
    return `<h2 class="brand">Gramophone</h2><p class="mono sub">Classics &amp; first recordings</p>` + shelfHtml("gr", list)
      + h2("Soul Classics") + shelfHtml("gr2", await shelf("aretha franklin marvin gaye soul"));
  },
  async 1() {
    const list = await shelf("abbey road rumours thriller albums");
    return h2("Your Crate · Albums") + `<div class="crate"><div class="sleeve"><div class="rec"></div><div class="cover" style="background:${esc(bgOf(list[0] || {}, 1))}"></div></div><div class="booklet"><div class="mono" style="margin-bottom:8px">PULL A RECORD · TAP TO PLAY</div>${rowsHtml("vinyl", list.slice(0, 12))}</div></div>`;
  },
  async 2() {
    const [chill, lofi] = await Promise.all([shelf("lofi chill beats"), shelfFull("Lo-Fi", 10).catch(() => [])]);
    const stations = STATIONS.map(stationTrack);
    L.stations = stations;
    const stCards = stations.map((t, i) => card({ a: "play", v: "stations", i, bg: bgOf(t, i), t: t.title, s: (t.live ? "● " : "▤ ") + t.artist, badge: badge(t) })).join("");
    return h2("Tune the Dial") + `<div class="dial">${STATIONS.map((s, i) => `<b class="${i === sta ? "on" : ""}" data-a="tune" data-i="${i}">${esc(s.mark || s.name)}</b>`).join("")}</div>`
      + h2("Live Broadcasts · always on") + `<div class="row">${stCards}</div>`
      + `<p class="mono" style="margin:-4px 0 4px">LIVE = internet radio (audio) · HLS / DASH = adaptive network streams · video tracks are decoded as <b>audio only</b></p>`
      + h2("Free Full-Length · Audius Lo-Fi") + shelfHtml("radio2", lofi)
      + h2("Session Shelf") + shelfHtml("radio", chill);
  },
  async 3() {
    const [m1, m2] = await Promise.all([shelf("workout energy mix"), shelf("midnight drive synth")]);
    const tapes = l => `<div class="row">${l.slice(0, 8).map((t, i) => `<button class="card tape" data-a="play" data-v="tp${i}" data-i="0"><div class="reels"><div class="reel"></div><div class="reel"></div></div><div class="lab">${esc(t.title)} — ${esc(t.artist)}</div><span class="mono">${esc(t.genre || "Mixtape")}</span></button>`).join("")}</div>`;
    m1.forEach((t, i) => L["tp" + i] = [t]);
    return h2("Your Mixtapes · Side A") + tapes(m1) + h2("Side B") + tapes(m2);
  },
  async 4() {
    const list = await shelf("deluxe edition remastered");
    const t = list[0] || {};
    return h2("CD Shelf · Liner notes") + `<div class="jewel"><div class="sleeve"><div class="cover" style="background:${esc(bgOf(t, 2))};border-radius:50%;box-shadow:0 0 0 6px #111,0 0 30px rgba(212,162,76,.3)"></div></div><div class="booklet"><div class="mono" style="margin-bottom:8px">${esc(t.album || t.title || "Deluxe")}</div>${rowsHtml("cd", list.slice(0, 12))}</div></div>`;
  },
  async 5() {
    const r = recents(), l = likes();
    return h2("MP3 Library · Recently played") + (r.length ? rowsHtml("rec", r) : `<div class="empty mono">Play something and it will appear here.</div>`)
      + h2("♥ Liked tracks (" + l.length + ")") + (l.length ? rowsHtml("lik", l) : `<div class="empty mono">Tap ♥ on any track to keep it here.</div>`);
  },
  async 6(g) {
    const genre = typeof g === "string" && g ? g : "All";
    const [free, main] = await Promise.all([shelfFull(genre, 18), shelf(genre === "All" ? "trending pop" : genre)]);
    const rel = T() ? (await cached("rel:" + T().id, () => auSearch((T().artist || "pop") + " " + (T().genre || ""), 10))) : [];
    return h2("Streaming mode · " + esc(genre) + " · full-length first") + chips(typeof g === "string" ? g : "")
      + shelfHtml("str", [...free, ...main.slice(0, 6)])
      + (rel.length ? h2("Because you played “" + esc(T().title) + "”") + shelfHtml("rel", rel) : "")
      + h2("Mainstream previews") + shelfHtml("str2", main);
  },
  async 7() {
    const sw = (k, l, d) => `<div class="r"><div><div>${l}</div><div class="mono">${d}</div></div><button class="sw ${S[k] ? "on" : ""}" data-a="set" data-v="${k}" aria-label="${l}"></button></div>`;
    return `<h2 class="brand">Hi-Fi Rack</h2><p class="mono sub">Tuning &amp; motion · saved on this device</p><div class="rack"><div class="vus"><div class="vu"><span>L</span><i></i></div><div class="vu"><span>R</span><i></i></div></div>${sw("shuffle", "Shuffle", "Randomize next track")}${sw("repeat", "Repeat one", "Loop the current track")}${sw("compact", "MP3 compact mode", "LCD-style player panel")}${sw("motion", "Motion", "Spinning discs, reels and glow")}</div>
    <div class="empty mono" style="margin-top:14px;text-align:left">DATA · Audius (full free tracks, no key) + iTunes Search API (mainstream 30s previews). RADIO · live internet radio via &lt;audio&gt;, plus HLS/DASH network streams via Shaka Player — video-bearing streams are decoded as audio only. Grooveshark-style free listening, no signup. Static build runs anywhere — GitHub Pages, Netlify, Vercel. Note: the 2011 Ruby Grooveshark-API gem targets the original service (shut down 2015); groovesharks.org is a closed BeMusic clone behind Cloudflare with no public API, so it can't be used as a backend.</div>`;
  },
  async search(q) {
    const [it, au] = await Promise.all([
      itunes({ term: q, limit: 14 }).catch(() => []),
      auSearch(q, 14).catch(() => [])
    ]);
    const res = [...au, ...it];
    return h2("Results for “" + esc(q) + "”") + (res.length ? rowsHtml("sr", res.slice(0, 20)) : `<div class="empty mono">No results for “${esc(q)}”.</div>`)
      + h2("Mainstream previews") + shelfHtml("sr2", it.length ? it : res);
  }
};

async function go(e, arg) {
  era = e;
  document.body.dataset.era = e;
  nav();
  const id = ++gid, m = $("main");
  m.innerHTML = skel;
  m.scrollTop = 0;
  try {
    const html = await V[e === "home" ? "home" : e](arg);
    if (id === gid) { m.innerHTML = html; sync(); }
  } catch (err) {
    if (id === gid) m.innerHTML = `<div class="empty mono">SIGNAL LOST — ${esc(err.message)}<br><br><button class="btn" data-a="go" data-v="home">↻ Retry</button></div>`;
  }
  if (window.innerWidth <= 1080) document.body.classList.remove("full");
}
function nav() {
  $("nav").innerHTML = `<button class="${era === "home" ? "on" : ""}" data-a="go" data-v="home">🏠<div>Home<small>Streaming dashboard</small></div></button>` +
    ERAS.map((x, i) => `<button class="${String(era) === String(i) ? "on" : ""}" data-a="go" data-v="${i}">${x[1]}<div>${x[0]}<small>${x[2]}</small></div></button>`).join("");
  $("tabs").innerHTML = [["Home", "home", "🏠"], ["Crate", 1, "💿"], ["Radio", 2, "📻"], ["Tapes", 3, "📼"], ["Library", 5, "🎧"]]
    .map(t => `<button class="${String(era) === String(t[1]) ? "on" : ""}" data-a="go" data-v="${t[1]}">${t[2]}<br>${t[0]}</button>`).join("");
}

/* ---------- events ---------- */
const ACT = {
  go: v => go(isNaN(v) || v === "home" ? (v === "home" ? "home" : +v) : +v),
  play: (k, i) => playAt(+i, L[k]),
  playq: (_, i) => playAt(+i),
  genre: g => go(6, g),
  tune: (_, i) => { sta = +i; const s = STATIONS[+i]; go(2); if (s) playAt(0, [stationTrack(s)]); },
  set: k => { S[k] = !S[k]; saveS(); applyS(); if (String(era) === "7") go(7); toast(k.toUpperCase() + (S[k] ? " ON" : " OFF")); },
  shuffle: () => { S.shuffle = !S.shuffle; saveS(); applyS(); toast("SHUFFLE " + (S.shuffle ? "ON" : "OFF")); },
  repeat: () => { S.repeat = !S.repeat; saveS(); applyS(); toast("REPEAT " + (S.repeat ? "ON" : "OFF")); },
  like: () => { const t = T(); if (!t) return toast("NOTHING TO LIKE YET"); const on = toggleLike(t); updateLikeBtn(); toast(on ? "♥ SAVED TO LIBRARY" : "REMOVED FROM LIKED"); },
  likeone: (k, i) => { const t = (L[k] || [])[+i]; if (!t) return; const on = toggleLike(t); toast(on ? "♥ SAVED" : "REMOVED"); go(era); updateLikeBtn(); },
  addq: () => { const t = T(); if (!t) return; Q.splice(cur + 1, 0, t); renderQueue(); toast("QUEUED NEXT ⤵"); },
  share: () => { const t = T(); if (!t) return; const url = location.origin + location.pathname + "#track=" + encodeURIComponent(t.title + " - " + t.artist); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("LINK COPIED ⧉"), () => toast(url)); },
  tab: v => {
    const toL = v === "l";
    $("queue").style.display = toL ? "none" : "block";
    $("lyr").style.display = toL ? "block" : "none";
    $("tq").classList.toggle("on", !toL); $("tl").classList.toggle("on", toL);
    if (toL) renderAbout();
  },
  toggle, prev: () => step(-1), next: () => step(1),
  full: () => document.body.classList.toggle("full"),
};
document.addEventListener("click", e => {
  if (e.target.closest(".like")) e.stopPropagation();
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const d = el.dataset;
  if (ACT[d.a]) { e.preventDefault(); ACT[d.a](d.v, d.i); }
});
let deb = null;
$("q").addEventListener("input", e => {
  clearTimeout(deb);
  const v = e.target.value.trim();
  if (v.length < 2) return;
  deb = setTimeout(() => go("search", v), 650);
});
$("q").addEventListener("keydown", e => {
  const v = e.target.value.trim();
  if (e.key === "Enter" && v) { clearTimeout(deb); go("search", v); }
});
$("mini").querySelector(".info").addEventListener("keydown", e => { if (e.key === "Enter") document.body.classList.toggle("full"); });
if ("mediaSession" in navigator) {
  try {
    navigator.mediaSession.setActionHandler("play", () => au.play());
    navigator.mediaSession.setActionHandler("pause", () => au.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
  } catch {}
}

/* ---------- boot ---------- */
applyS();
renderQueue();
setTimeout(() => $("boot").classList.add("off"), 1200);
const hash = location.hash.match(/track=([^&]+)/);
go("home").then(() => {
  if (hash) {
    const q = decodeURIComponent(hash[1]);
    setTimeout(() => go("search", q), 1500);
  }
});
