"use strict";
/* Playback — static music streaming app (no backend).
   Data: iTunes Search API (CORS-open, no key). 30s previewUrl streams. */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = ms => { const s = Math.max(0, Math.round((ms || 0) / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const fmtS = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
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

/* ---------- iTunes API ---------- */
async function itunes(params) {
  const u = "https://itunes.apple.com/search?" + new URLSearchParams(Object.assign({ media: "music", entity: "song", limit: 24 }, params));
  const r = await fetch(u);
  if (!r.ok) throw new Error("Search failed (" + r.status + ")");
  const j = await r.json();
  return (j.results || []).map(norm);
}
function norm(x) {
  return {
    id: String(x.trackId || x.collectionId || Math.random()),
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
const cache = new Map();
async function cached(key, fn) {
  if (cache.has(key)) return cache.get(key);
  const p = fn().catch(() => []);
  cache.set(key, p);
  return p;
}
const shelf = term => cached("t:" + term, () => itunes({ term, limit: 18 }));

/* ---------- player ---------- */
const au = $("audio");
let Q = [], cur = -1, playing = false;
const T = () => Q[cur];
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
  if (!t || !t.url) { toast("NO PREVIEW FOR THIS TRACK"); return; }
  au.src = t.url;
  au.play().catch(() => { playing = false; sync(); toast("TAP PLAY TO START AUDIO"); });
  remember(t);
  sync();
  renderQueue();
  renderAbout();
  updateLikeBtn();
  document.body.classList.add("playing");
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
au.onerror = () => { if (au.src) toast("STREAM REFUSED — TRY NEXT"); };
au.onloadedmetadata = () => { $("dur").textContent = fmtS(au.duration || 30); };
au.ontimeupdate = draw;
function draw() {
  const d = isFinite(au.duration) && au.duration > 0 ? au.duration : 30;
  const p = Math.min((au.currentTime || 0) / d, 1);
  $("ring").style.strokeDashoffset = 295.3 * (1 - p);
  $("seek").value = Math.round(p * 1000);
  $("cur").textContent = fmtS(au.currentTime || 0);
  if (isFinite(au.duration) && au.duration > 0) $("dur").textContent = fmtS(au.duration);
}
$("seek").addEventListener("input", e => {
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
  $("npG").textContent = [t.genre, fmt(t.ms)].filter(Boolean).join(" · ");
  $("disc").style.backgroundImage = t.art ? `url('${t.art}')` : "none";
  $("disc").style.backgroundSize = "cover";
  $("disc").style.backgroundPosition = "center";
  $("mSw").style.background = t.art ? `center/cover url('${t.artSm || t.art}')` : grad(cur);
  $("dur").textContent = fmt(t.ms);
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
  $("lyr").innerHTML = esc(`${t.title} — ${t.artist}\n\nAlbum: ${t.album || "Single"}\nGenre: ${t.genre || "Music"}\nLength: ${fmt(t.ms)} (preview 0:30)\n\nThis is a 30-second preview streamed from Apple iTunes. Full tracks open in Apple Music.`) +
    (t.link ? `\n\n<a href="${esc(t.link)}" target="_blank" rel="noopener" style="color:var(--brass-b)">Open in Apple Music ↗</a>` : "");
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
const GENRES = ["Pop", "Hip-Hop", "Rock", "Jazz", "Soul", "Lo-Fi", "Indie", "Latin"];
const ST = [["88.1", "jazz classics"], ["91.5", "soul motown"], ["95.3", "indie folk"], ["99.7", "classic rock"], ["103.2", "lofi chill"], ["107.9", "pop hits"]];
let sta = 2, era = "home", gid = 0;
const L = {};

const skel = '<div class="skel">' + "<i></i>".repeat(5) + "</div>";
const card = o => `<button class="card ${o.cls || ""}" data-a="${o.a}" data-v="${esc(o.v)}" ${o.i != null ? `data-i="${o.i}"` : ""}><div class="art" style="background:${esc(o.bg)}"><span class="playbadge">▶</span></div><p>${esc(o.t)}</p><span class="mono">${esc(o.s || "")}</span></button>`;
const shelfHtml = (key, list) => {
  L[key] = list;
  return list.length ? `<div class="row">${list.map((t, i) => card({ a: "play", v: key, i, bg: bgOf(t, i), t: t.title, s: t.artist })).join("")}</div>` : `<div class="empty mono">Nothing found — check your connection and retry.</div>`;
};
const rowsHtml = (key, list) => {
  L[key] = list;
  return list.map((t, i) => `<button class="tr" data-a="play" data-v="${key}" data-i="${i}" data-vid="${esc(t.id)}"><b class="n mono">${String(i + 1).padStart(2, "0")}</b><img loading="lazy" src="${esc(t.artSm || t.art)}" alt=""><span class="t">${esc(t.title)}<small class="mono">${esc(t.artist)} · ${esc(t.album || t.genre)}</small></span><button class="like ${isLiked(String(t.id)) ? "liked" : ""}" data-a="likeone" data-v="${key}" data-i="${i}" aria-label="Like">♥</button><span class="mono">${fmt(t.ms)}</span></button>`).join("");
};
const h2 = t => `<h2>${t}</h2>`;
const chips = active => `<div class="chiprow">${GENRES.map(g => `<button class="chip ${active === g ? "on" : ""}" data-a="genre" data-v="${esc(g)}">${esc(g)}</button>`).join("")}</div>`;

const V = {
  async home() {
    const [top, chill, rock] = await Promise.all([shelf("top hits 2025"), shelf("chill acoustic"), shelf("classic rock legends")]);
    L.home = top;
    const hero = top[0] ? `<div class="hero"><div class="art" style="background:${esc(bgOf(top[0], 0))}"></div><div style="position:relative;z-index:1"><div class="mono">FEATURED RELEASE</div><h1 class="brand">${esc(top[0].title)}</h1><p class="mono">${esc(top[0].artist)} · ${esc(top[0].album || top[0].genre)}</p><div><button class="btn" data-a="play" data-v="home" data-i="0">▶ Play</button><button class="btn ghost" data-a="go" data-v="6">Discover →</button></div></div></div>` : "";
    return hero + h2("Fresh Signal · Top Hits") + shelfHtml("home", top)
      + h2("Chill Shelf") + shelfHtml("chill", chill)
      + h2("Rock Crate") + shelfHtml("rock", rock)
      + `<p class="mono" style="margin-top:18px">30-second previews · Powered by iTunes Search API · No account needed</p>`;
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
    const songs = await shelf(ST[sta][1]);
    L.radio = songs;
    return h2("Tune the Dial") + `<div class="dial">${ST.map((s, i) => `<b class="${i === sta ? "on" : ""}" data-a="tune" data-i="${i}">${s[0]} · ${s[1]}</b>`).join("")}</div>`
      + h2("Now broadcasting " + ST[sta][0] + " FM · " + esc(ST[sta][1])) + shelfHtml("radio", songs);
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
    const genre = typeof g === "string" && g ? g : "trending pop";
    const [a, b] = await Promise.all([shelf(genre), shelf(genre + " hits")]);
    const rel = T() ? (await cached("rel:" + T().id, () => itunes({ term: (T().artist || "pop") + " " + (T().genre || "hits"), limit: 12 }))) : [];
    return h2("Streaming mode · " + esc(genre)) + chips(typeof g === "string" ? g : "")
      + shelfHtml("str", a)
      + (rel.length ? h2("Because you played “" + esc(T().title) + "”") + shelfHtml("rel", rel) : "")
      + h2("More like this") + shelfHtml("str2", b);
  },
  async 7() {
    const sw = (k, l, d) => `<div class="r"><div><div>${l}</div><div class="mono">${d}</div></div><button class="sw ${S[k] ? "on" : ""}" data-a="set" data-v="${k}" aria-label="${l}"></button></div>`;
    return `<h2 class="brand">Hi-Fi Rack</h2><p class="mono sub">Tuning &amp; motion · saved on this device</p><div class="rack"><div class="vus"><div class="vu"><span>L</span><i></i></div><div class="vu"><span>R</span><i></i></div></div>${sw("shuffle", "Shuffle", "Randomize next track")}${sw("repeat", "Repeat one", "Loop the current preview")}${sw("compact", "MP3 compact mode", "LCD-style player panel")}${sw("motion", "Motion", "Spinning discs, reels and glow")}</div>
    <div class="empty mono" style="margin-top:14px;text-align:left">DATA · iTunes Search API (no key, CORS-open). Audio = 30s previews. Actual full-length streaming needs licensed backends (Spotify / Apple Music SDK). This static build runs anywhere — GitHub Pages, Netlify, Vercel.</div>`;
  },
  async search(q) {
    const res = await itunes({ term: q, limit: 20 });
    const alb = await itunes({ term: q + " album", limit: 12 });
    return h2("Results for “" + esc(q) + "”") + (res.length ? rowsHtml("sr", res.slice(0, 14)) : `<div class="empty mono">No results for “${esc(q)}”.</div>`)
      + h2("More from “" + esc(q) + "”") + shelfHtml("sr2", alb.length ? alb : res);
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
  tune: (_, i) => { sta = +i; go(2); const songs = L.radio; if (songs && songs.length) setTimeout(() => playAt(0, songs), 600); },
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
