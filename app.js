const TRACKS = [
  {id:'UEO6uyczDMk', cat:'remixes', title:'Funky Town', dur:'3:05', badge:'LATEST'},
  {id:'xQZUjCSx9v4', cat:'remixes', title:'Block Rocking Firestarter', dur:'3:12'},
  {id:'AdqOXNrHr8o', cat:'originals', title:'Captain G.Capacitor', dur:'3:51'},
  {id:'OvcsrY8ksvI', cat:'originals', title:'Dance', dur:'4:32'},
  {id:'XMdR8emp_cQ', cat:'remixes', title:'Rakins (Hey Boy, Hey Girl, Harder, Better, Faster, Satisfaction)', dur:'4:09'},
  {id:'b2cZX9yMcco', cat:'beats', title:'Had To Go (NujaFlow)', dur:'3:24'},
  {id:'KvK_pMvFV94', cat:'flips', title:'Aquatic Ambience (Hip Hop/Trap Remix)', dur:'5:57', badge:'FAN FAVE'},
  {id:'Wb6AauUjceM', cat:'remixes', title:'SHAQ FU (Extended Remaster)', dur:'2:40'},
  {id:'IiEcpi-ANc4', cat:'beats', title:'Break', dur:'7:21'},
  {id:'0uN1dCu0iDE', cat:'beats', title:'Jazzed Up', dur:'6:48'},
  {id:'voJZJmEvd2g', cat:'remixes', title:'itachi Uchiha', dur:'4:16'},
  {id:'_lqXKH8YWNY', cat:'originals', title:'Weirdmageddon', dur:'3:30'},
  {id:'iWDEqFFZK3s', cat:'beats', title:'Pac Man (Tyler the Creator Type Beat)', dur:'4:03', badge:'TYPE BEAT'},
  {id:'cGuNRYCcjCo', cat:'remixes', title:'M is for Max (Headroom EDM)', dur:'5:31'},
  {id:'jhrt-f9Z-rM', cat:'originals', title:'Fight to Face', dur:'2:58'},
  {id:'ZIX_XGPy64U', cat:'flips', title:'Klax Amiga (Re-Mix)', dur:'2:38'},
  {id:'9XMMrZi20zA', cat:'remixes', title:'Sweet Brother Funk Soul', dur:'2:32'},
  {id:'TQzpwgzwW4Y', cat:'flips', title:'Jet Set Bumble', dur:'5:30'},
  {id:'54DIDKHmqDQ', cat:'remixes', title:'Everybody Teachers Around', dur:'3:14'},
  {id:'1LMst8ovXlw', cat:'remixes', title:'Daft Prydz', dur:'4:08'},
  {id:'nUwwnRiKw-k', cat:'flips', title:'Dr. Gerald Robotnik', dur:'7:52', badge:'EPIC'},
  {id:'mQd45iUCxFE', cat:'remixes', title:'Daft Voltage', dur:'3:26'},
  {id:'2rWDeE_mngc', cat:'remixes', title:'Composite Devices', dur:'3:51'},
  {id:'sEPGWmxvXXw', cat:'flips', title:'Chemical Plant Zone 2.0', dur:'4:25', badge:'FAN FAVE'},
  {id:'nVpb879Qinc', cat:'remixes', title:'Magique 2.0', dur:'3:59'},
  {id:'k6SU-jkF2Ks', cat:'flips', title:'Koopahari Desert', dur:'3:59'},
  {id:'Fma74rHnWdo', cat:'beats', title:'102 Rap', dur:'3:59'},
  {id:'SFJY6957j4E', cat:'beats', title:'Piece By Piece (Dreams For A Price)', dur:'5:13'},
  {id:'BAiGJ8Tkob4', cat:'beats', title:'Need A Dollar', dur:'4:04'},
  {id:'sswM4oASom8', cat:'beats', title:'Falling Rain', dur:'2:31'},
  {id:'iBIraLyM6YQ', cat:'originals', title:'The Toclafane', dur:'5:16'},
  {id:'2kYxnMWP0Go', cat:'remixes', title:"Critters Buggin' - Naked Truth (Remix)", dur:'4:18'},
  {id:'BoYQAanhAmk', cat:'originals', title:'Fulcrum Point', dur:'6:24'},
  {id:'Umro-inRsxY', cat:'originals', title:'All I Do Is Boogerman', dur:'3:53'},
  {id:'4SX7V924UVY', cat:'flips', title:"Bart's Nightmare - Dream Street (Re Pro)", dur:'4:00'},
  {id:'XBKeTuhlMzQ', cat:'originals', title:'Narceus', dur:'2:28'},
  {id:'HoLPlFd4cac', cat:'originals', title:'Hard Work, No Glory', dur:'2:37'},
  {id:'U7CjmLNwNjY', cat:'originals', title:'A Beez Kneez', dur:'3:18'},
  {id:'4SMLcyWGhe4', cat:'originals', title:'Shadow of The Goat', dur:'4:01'},
  {id:'4_o49CZl_kA', cat:'originals', title:'Eyes of Vanta', dur:'3:24'},
];
const CATS = {flips:'Game Flip', beats:'Type Beat', remixes:'Remix', originals:'Original'};

const grid = document.getElementById('trackGrid');
const tabs = document.getElementById('tabs');
const search = document.getElementById('search');
const playerEl = null; // replaced by YT API player below
const upNextTitle = document.getElementById('upNextTitle');
const upNextMeta = document.getElementById('upNextMeta');
const heroNow = document.getElementById('heroNow');
const deckArtImg = document.getElementById('deckArtImg');
const deckGlyph = document.getElementById('deckGlyph');
const playPauseBtn = document.getElementById('playPauseBtn');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const tCur = document.getElementById('tCur');
const tTot = document.getElementById('tTot');
const vol = document.getElementById('vol');
let filter = 'all';
let currentId = 'UEO6uyczDMk';
let mode = 'single'; // 'single' | 'queue'
let qi = 0;
let yt = null, ytReady = false, wantPlay = false, isPlaying = false;

// Streaming audio via YouTube IFrame API: chromeless player hidden
// behind the artwork, custom progress bar + transport on top.
(function loadYT(){
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  // Fallback: if the API never loads, show a plain embed instead.
  setTimeout(()=>{
    if(!ytReady){
      const holder = document.querySelector('.yt-holder');
      if(holder){
        holder.classList.add('yt-fallback');
        holder.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${currentId}?rel=0" title="Weird0Radi0 player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      }
      setGlyph(false);
    }
  }, 7000);
})();
window.onYouTubeIframeAPIReady = function(){
  yt = new YT.Player('ytAudio', {
    videoId: currentId,
    playerVars: { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0 },
    events: { onReady: onYTReady, onStateChange: onYTState }
  });
};
function onYTReady(){
  ytReady = true;
  yt.setVolume(Number(vol.value));
  fmtDur();
  if(wantPlay){ wantPlay = false; yt.playVideo(); }
}
function onYTState(e){
  if(e.data === YT.PlayerState.PLAYING){ setPlaying(true); }
  else if(e.data === YT.PlayerState.PAUSED){ setPlaying(false); }
  else if(e.data === YT.PlayerState.ENDED){ advance(1, true); }
  else if(e.data === YT.PlayerState.CUED){ setPlaying(false); }
}
function setPlaying(on){
  isPlaying = on;
  deckGlyph.textContent = on ? '❚❚' : '▶';
  playPauseBtn.textContent = on ? '❚❚' : '▶';
}
function fmt(s){
  s = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}
function fmtDur(){
  if(ytReady && yt.getDuration) tTot.textContent = fmt(yt.getDuration());
}
(function tick(){
  if(ytReady && yt.getCurrentTime && yt.getDuration){
    try{
      const c = yt.getCurrentTime(), d = yt.getDuration() || 0;
      if(d > 0 && !scrubbing){
        progressFill.style.width = (c/d*100) + '%';
        progress.setAttribute('aria-valuenow', Math.round(c/d*100));
        tCur.textContent = fmt(c);
        tTot.textContent = fmt(d);
      }
    }catch(_){}
  }
  requestAnimationFrame(tick);
})();
// Seek: click or drag on the progress bar
let scrubbing = false;
function seekTo(clientX){
  const r = progress.getBoundingClientRect();
  const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  if(ytReady && yt.getDuration){
    const d = yt.getDuration();
    yt.seekTo(frac * d, true);
    progressFill.style.width = (frac*100) + '%';
    tCur.textContent = fmt(frac * d);
  }
}
progress.addEventListener('pointerdown', e=>{ scrubbing = true; progress.setPointerCapture(e.pointerId); seekTo(e.clientX); });
progress.addEventListener('pointermove', e=>{ if(scrubbing) seekTo(e.clientX); });
progress.addEventListener('pointerup', ()=>{ scrubbing = false; });
progress.addEventListener('keydown', e=>{
  if(!ytReady) return;
  const c = yt.getCurrentTime() || 0;
  if(e.key === 'ArrowRight') yt.seekTo(c + 5, true);
  if(e.key === 'ArrowLeft') yt.seekTo(Math.max(0, c - 5), true);
});
function setGlyph(playing){ setPlaying(playing); }
function togglePlay(){
  if(!ytReady){ wantPlay = true; toast('Buffering the signal…'); return; }
  const st = yt.getPlayerState();
  if(st === YT.PlayerState.PLAYING) yt.pauseVideo();
  else yt.playVideo();
}
playPauseBtn.onclick = togglePlay;
document.getElementById('deckArt').onclick = togglePlay;
document.getElementById('deckArt').onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); togglePlay(); } };
vol.oninput = ()=>{ if(ytReady) yt.setVolume(Number(vol.value)); };

function trackById(id){ return TRACKS.find(t=>t.id===id); }

function renderTracks(){
  const q = search.value.trim().toLowerCase();
  grid.innerHTML = '';
  TRACKS.filter(t => (filter==='all' || t.cat===filter) && (!q || t.title.toLowerCase().includes(q))).forEach(t=>{
    const el = document.createElement('article');
    el.className = 'card' + (t.id===currentId ? ' playing' : '');
    el.innerHTML = `<div class="card-art"><img src="images/tracks/${t.id}.jpg" alt="${t.title}" loading="lazy" />${t.badge?`<span class="card-badge">${t.badge}</span>`:''}${t.id===currentId?'<span class="now-badge">PLAYING</span>':''}</div>
      <div class="card-body"><p class="aka">${CATS[t.cat]} • ${t.dur}</p><h3>${t.title}</h3>
      <div class="card-foot"><button class="play" data-play="${t.id}">Play</button><button class="add" data-queue="${t.id}">+ Queue</button></div></div>`;
    grid.appendChild(el);
  });
  if(!grid.children.length) grid.innerHTML = '<div class="empty">No signal on this frequency. Try another search.</div>';
}
tabs.addEventListener('click', e=>{
  const b = e.target.closest('.tab'); if(!b) return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  b.classList.add('active'); filter = b.dataset.cat; renderTracks();
});
search.addEventListener('input', renderTracks);

function loadIntoDeck(t, autoplay){
  currentId = t.id;
  deckArtImg.src = `images/tracks/${t.id}.jpg`;
  deckArtImg.alt = `${t.title} artwork`;
  upNextTitle.textContent = t.title;
  upNextMeta.textContent = `${CATS[t.cat]} • ${t.dur}`;
  heroNow.textContent = t.title;
  tTot.textContent = t.dur;
  tCur.textContent = '0:00';
  progressFill.style.width = '0%';
  if(ytReady){ if(autoplay) yt.loadVideoById(t.id); else yt.cueVideoById(t.id); }
  else if(autoplay){ wantPlay = true; }
  renderTracks();
}
function playTrack(id, opts={}){
  const t = trackById(id); if(!t) return;
  if(!opts.keepMode) mode = 'single';
  loadIntoDeck(t, opts.autoplay !== false);
  document.getElementById('featured').scrollIntoView({behavior:'smooth'});
}
// Transport: next/prev step through queue when in queue mode,
// otherwise through the catalog. Restarts track if >3s in.
function catalogStep(dir){
  const i = TRACKS.findIndex(t=>t.id===currentId);
  const n = TRACKS[(i + dir + TRACKS.length) % TRACKS.length];
  mode = 'single';
  playTrack(n.id);
}
function advance(dir, auto){
  if(mode === 'queue' && queue.length){
    const ni = qi + dir;
    if(ni >= 0 && ni < queue.length){ qi = ni; playTrack(queue[qi], {keepMode:true}); return; }
    if(auto){ toast('Queue finished.'); setPlaying(false); return; }
  }
  catalogStep(dir);
}
document.getElementById('nextBtn').onclick = ()=>advance(1, false);
document.getElementById('prevBtn').onclick = ()=>{
  if(ytReady && yt.getCurrentTime && yt.getCurrentTime() > 3){ yt.seekTo(0, true); return; }
  advance(-1, false);
};
document.addEventListener('click', e=>{
  const p = e.target.closest('[data-play]');
  if(p){ playTrack(p.dataset.play); return; }
  const q = e.target.closest('[data-queue]');
  if(q){ addToQueue(q.dataset.queue); }
});
document.getElementById('playLatest').onclick = ()=>playTrack('UEO6uyczDMk');

// Queue drawer
const queue = [];
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
function openQueue(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); overlay.hidden=false; }
function closeQueue(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden=true; }
document.getElementById('queueOpen').onclick = openQueue;
document.getElementById('queueOpen2').onclick = openQueue;
document.getElementById('queueOpen3').onclick = openQueue;
document.getElementById('queueClose').onclick = closeQueue;
overlay.onclick = closeQueue;

function addToQueue(id){
  const t = trackById(id); if(!t) return;
  if(queue.includes(id)){ toast('Already in your queue.'); openQueue(); return; }
  queue.push(id);
  updateQueue();
  toast(`${t.title} queued.`);
  openQueue();
}
function updateQueue(){
  const box = document.getElementById('queueItems');
  document.getElementById('queueCount').textContent = queue.length;
  if(!queue.length){ box.innerHTML = '<div class="empty">Queue is empty.<br/>Stack some signals.</div>'; return; }
  box.innerHTML = '';
  queue.forEach((id, i)=>{
    const t = trackById(id);
    const row = document.createElement('div'); row.className = 'cart-row';
    row.innerHTML = `<img class="cart-thumb" src="images/tracks/${id}.jpg" alt="" /><div><strong>${i+1}. ${t.title}</strong><span>${CATS[t.cat]} • ${t.dur}</span></div>
      <div class="qty"><button data-qplay="${id}">Play</button><button data-qrm="${id}">×</button></div>`;
    box.appendChild(row);
  });
}
document.getElementById('queueItems').addEventListener('click', e=>{
  const p = e.target.closest('[data-qplay]'), r = e.target.closest('[data-qrm]');
  if(p){ closeQueue(); const i = queue.indexOf(p.dataset.qplay); if(i >= 0){ mode = 'queue'; qi = i; } playTrack(p.dataset.qplay, {keepMode:true}); }
  if(r){ queue.splice(queue.indexOf(r.dataset.qrm), 1); updateQueue(); }
});
document.getElementById('clearQueue').onclick = ()=>{ queue.length = 0; updateQueue(); };
function playQueue(){
  if(!queue.length){ toast('Queue is empty — add some tracks first.'); return; }
  closeQueue(); mode = 'queue'; qi = 0; playTrack(queue[0], {keepMode:true});
}
document.getElementById('playQueueBtn').onclick = playQueue;
document.getElementById('playQueueBtn2').onclick = playQueue;

let toastT;
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2200);
}

// Collab form with confirm step
const collabForm = document.getElementById('collabForm');
const confirmModal = document.getElementById('confirmModal');
let pending = null;
collabForm.addEventListener('submit', e=>{
  e.preventDefault();
  pending = { name: document.getElementById('collabName').value, email: document.getElementById('collabEmail').value };
  document.getElementById('confirmText').textContent = `Transmit as ${pending.name}? Reply goes to ${pending.email}.`;
  confirmModal.hidden = false;
});
document.getElementById('confirmCancel').onclick = ()=>{ confirmModal.hidden = true; pending = null; };
confirmModal.addEventListener('click', e=>{ if(e.target===confirmModal){ confirmModal.hidden = true; pending = null; } });
document.getElementById('confirmGo').onclick = ()=>{
  confirmModal.hidden = true;
  if(pending){ toast(`Transmission received. Stay weird, ${pending.name}.`); collabForm.reset(); pending = null; }
};

document.getElementById('hamburger').onclick = ()=> document.getElementById('navLinks').classList.toggle('open');
document.querySelectorAll('#navLinks a').forEach(a=>a.onclick=()=>document.getElementById('navLinks').classList.remove('open'));

// duplicate ticker for seamless loop
const track = document.getElementById('tickerTrack');
track.innerHTML += track.innerHTML;

renderTracks(); updateQueue();
