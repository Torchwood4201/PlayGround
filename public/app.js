"use strict";
/* Playback — front end. Talks to the server (muzo-backend + playback routes):
   /api/search /api/album /api/playlist /api/related  (YouTube Music via muzo-backend)
   /api/play (JioSaavn -> yt_music_api)   /api/lyrics (yt_music_api) */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const HUES=[[32,60],[8,50],[200,55],[160,45],[280,45],[45,70],[340,50],[100,40]];
const grad=i=>{const[h,s]=HUES[Math.abs(i||0)%HUES.length];return`linear-gradient(135deg,hsl(${h} ${s}% 45%),hsl(${(h+40)%360} ${s}% 18%))`};
const big=u=>u?String(u).replace(/=w\d+-h\d+[^\s"']*$/,"=w544-h544-l90-rj"):"";
const bg=(t,i)=>t&&t.art?`center/cover url('${t.art}')`:grad(i);
const f=s=>{s=Math.max(0,s||0);return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")};
const dur=t=>typeof t==="number"?t:String(t||"").split(":").reduce((a,b)=>a*60+(+b||0),0);
const th=a=>a&&a.length?big(a[a.length-1].url):"";
async function api(p){const r=await fetch("/api"+p);const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||("HTTP "+r.status));return j}
const find=async(q,filter)=>{try{return (await api(`/search?q=${encodeURIComponent(q)}&filter=${filter}`)).results||[]}catch(e){return[]}};
const all=(...a)=>Promise.all(a.map(([q,fl])=>find(q,fl)));
const song=s=>({vid:s.videoId,title:s.title,artist:(s.artists||[]).map(a=>a.name).join(", ")||"Unknown artist",dur:s.duration_seconds||dur(s.duration),art:th(s.thumbnails)});
const songsOf=r=>r.filter(x=>x.videoId).map(song);

/* ---------- settings ---------- */
const S={needle:true,xfade:false,compact:false,motion:true};
try{Object.assign(S,JSON.parse(localStorage.getItem("pb_s")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("pb_s",JSON.stringify(S))}catch(e){}};
const apply=()=>{document.body.classList.toggle("compact",S.compact);document.body.classList.toggle("still",!S.motion)};
const recent=()=>{try{return JSON.parse(localStorage.getItem("pb_r")||"[]")}catch(e){return[]}};
const remember=t=>{try{localStorage.setItem("pb_r",JSON.stringify([t].concat(recent().filter(x=>x.vid!==t.vid)).slice(0,30)))}catch(e){}};

/* ---------- player ---------- */
const au=new Audio();au.preload="auto";
let Q=[],cur=-1,on=false,token=0;
const L={};
const T=()=>Q[cur];
function lost(m){const l=$("lost");l.textContent=m||"SIGNAL LOST";l.classList.add("show");$("status").textContent="SIGNAL LOST";setTimeout(()=>{l.classList.remove("show");$("status").textContent="ON AIR"},3500)}
function crackle(){if(!S.needle)return;try{const c=new(window.AudioContext||window.webkitAudioContext)(),b=c.createBuffer(1,c.sampleRate*.35,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()<.01?(Math.random()*2-1)*.35:0;const s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start()}catch(e){}}
function fade(){au.volume=S.xfade?0:1;if(!S.xfade)return;let v=0;const iv=setInterval(()=>{v+=.1;au.volume=Math.min(v,1);if(v>=1)clearInterval(iv)},200)}
async function playAt(i,list){
  if(list)Q=list;if(!Q[i])return;cur=i;const t=T();on=true;sync();crackle();const my=++token;
  $("status").textContent="TUNING…";
  try{
    const d=await api(`/play/${encodeURIComponent(t.vid)}?title=${encodeURIComponent(t.title)}&artist=${encodeURIComponent((t.artist||"").split(",")[0].trim())}`);
    if(my!==token)return;
    au.src=d.url;fade();await au.play();
    $("status").textContent="ON AIR · "+d.via.toUpperCase();remember(t);
    if($("lyr").style.display==="block")lyrics();
  }catch(e){if(my===token){on=false;sync();lost("SIGNAL LOST — "+(e.message||"no source"))}}
}
const step=d=>{if(Q.length)playAt((cur+d+Q.length)%Q.length)};
function toggle(){if(cur<0)return;if(au.paused){on=true;au.play().catch(()=>{on=false;sync()})}else{on=false;au.pause()}sync()}
au.onplay=()=>{on=true;sync()};au.onpause=()=>{on=false;sync()};au.onended=()=>step(1);
au.onerror=()=>{if(au.src){on=false;sync();lost("SIGNAL LOST — stream refused")}};
au.ontimeupdate=draw;au.onloadedmetadata=()=>{$("dur").textContent=f(au.duration)};
function draw(){const d=isFinite(au.duration)&&au.duration>0?au.duration:(T()&&T().dur)||1,p=Math.min(au.currentTime/d,1);
  $("ring").style.strokeDashoffset=295.3*(1-p);$("seek").value=p*100;$("cur").textContent=f(au.currentTime)}
$("seek").oninput=e=>{const d=isFinite(au.duration)?au.duration:(T()&&T().dur)||0;if(d)au.currentTime=e.target.value/100*d};
$("bars").innerHTML="<i></i>".repeat(24);
setInterval(()=>{if(!on)return;$("bars").querySelectorAll("i").forEach(b=>b.style.height=(15+Math.random()*85)+"%");document.querySelectorAll(".vu i").forEach(n=>n.style.transform="rotate("+(-50+Math.random()*85)+"deg)")},220);
function sync(){
  document.body.classList.toggle("playing",on);
  ["pp","pp2"].forEach(k=>$(k).textContent=on?"⏸":"▶");
  const t=T();if(!t)return;
  ["npT","mT"].forEach(k=>$(k).textContent=t.title);["npA","mA"].forEach(k=>$(k).textContent=t.artist);
  $("disc").style.background=bg(t,cur);$("mSw").style.background=bg(t,cur);$("dur").textContent=f(t.dur);
  $("queue").innerHTML='<div class="mono" style="margin-bottom:6px">UP NEXT</div>'+Q.map((x,i)=>`<button data-a="playq" data-i="${i}" class="${i===cur?"on":""}"><div class="sw" style="background:${esc(bg(x,i))}"></div><div style="flex:1;min-width:0"><div style="font-size:13px">${esc(x.title)}</div><div class="mono">${esc(x.artist)}</div></div><span class="mono">${f(x.dur)}</span></button>`).join("");
  document.querySelectorAll(".tr").forEach(r=>r.classList.toggle("on",r.dataset.vid===t.vid));
}
async function lyrics(){const t=T(),el=$("lyr");if(!t){el.textContent="Play a song to see lyrics.";return}
  el.textContent="Loading lyrics…";try{const d=await api("/lyrics/"+encodeURIComponent(t.vid));el.textContent=d.lyrics||"No lyrics for this track."}catch(e){el.textContent="No lyrics for this track."}}

/* ---------- views ---------- */
const ERAS=[["Gramophone","🎺","Classics & firsts"],["Vinyl","💿","Albums & crates"],["Radio","📻","Live stations"],["Cassette","📼","Playlists"],["CD","💽","Liner notes"],["MP3","🎧","Recently played"],["Stream","〰️","Discover"],["Settings","🎚️","Hi-fi rack"]];
const h2=t=>`<h2>${t}</h2>`;
const card=o=>`<button class="card ${o.cls||""}" data-a="${o.a}" data-v="${esc(o.v)}" ${o.i!=null?`data-i="${o.i}"`:""} ${o.st?`data-st="${o.st}"`:""}><div class="art" style="background:${esc(o.bg)}"></div><p>${esc(o.t)}</p><span class="mono">${esc(o.s||"")}</span></button>`;
const shelf=(key,list)=>{L[key]=list;return list.length?`<div class="row">${list.map((t,i)=>card({a:"play",v:key,i,bg:bg(t,i),t:t.title,s:t.artist})).join("")}</div>`:`<p class="mono">Nothing found.</p>`};
const albums=(list,st)=>{list=list.filter(x=>x.browseId);return list.length?`<div class="row">${list.map((x,i)=>card({a:"album",v:x.browseId,st,bg:bg({art:th(x.thumbnails)},i),t:x.title,s:(x.artists||[]).map(a=>a.name).join(", ")||x.year||""})).join("")}</div>`:`<p class="mono">Nothing found.</p>`};
const tapes=list=>{list=list.filter(x=>x.browseId||x.playlistId);return list.length?`<div class="row">${list.map(x=>`<button class="card tape" data-a="playlist" data-v="${esc(x.browseId||x.playlistId)}"><div class="reels"><div class="reel"></div><div class="reel"></div></div><div class="lab">${esc(x.title)}</div></button>`).join("")}</div>`:`<p class="mono">Nothing found.</p>`};
const rows=(key,list)=>{L[key]=list;return list.map((t,i)=>`<button class="tr" data-a="play" data-v="${key}" data-i="${i}" data-vid="${esc(t.vid)}"><b class="n mono">${String(i+1).padStart(2,"0")}</b><span class="t">${esc(t.title)}<br><span class="mono">${esc(t.artist)}</span></span><span class="mono">${f(t.dur)}</span></button>`).join("")};
const sw=(k,l,d)=>`<div class="r"><div><div>${l}</div><div class="mono">${d}</div></div><button class="sw ${S[k]?"on":""}" data-a="set" data-v="${k}" aria-label="${l}"></button></div>`;
const ST=[["88.1","Jazz"],["91.5","Soul"],["95.3","Indie"],["99.7","Rock"],["103.2","Lo-Fi"],["107.9","Pop"]];let sta=0;
const dial=()=>`<div class="dial" id="dial"><div class="needle" style="left:${8+sta*15.6}%"></div><div class="static"></div>${ST.map((s,i)=>`<b class="${i===sta?"on":""}" data-a="tune" data-i="${i}">${s[0]} ${s[1]}</b>`).join("")}</div>`;
let era="home",lastEra="home",gid=0;
const V={
 async home(){const[s,a,p]=await all(["top hits","songs"],["new albums","albums"],["chill mix","playlists"]);const songs=songsOf(s);L.home=songs;
  const hero=songs[0]?`<div class="hero"><div class="art" style="background:${esc(bg(songs[0],0))}"></div><div><div class="mono">FEATURED RELEASE</div><h1 class="brand">${esc(songs[0].title)}</h1><p class="mono">${esc(songs[0].artist)}</p><button class="btn" data-a="play" data-v="home" data-i="0">▶ Play</button></div></div>`:"";
  return hero+h2("Fresh Signal")+shelf("home",songs)+h2("Your Crate")+albums(a,"vinyl")+h2("Your Mixtapes")+tapes(p)},
 async 0(){return `<h2 class="brand">Gramophone</h2><p class="mono">Classics & first recordings</p>`+shelf("gr",songsOf(await find("classic jazz 1950s","songs")))},
 async 1(){return h2("Your Crate")+albums(await find("top albums","albums"),"vinyl")+h2("Continue Playback")+shelf("rc",recent())},
 async 2(){const songs=songsOf(await find(ST[sta][1]+" hits","songs"));return h2("Tune the Dial")+dial()+h2("Now broadcasting "+ST[sta][0]+" FM")+shelf("radio",songs)},
 async 3(){return h2("Your Mixtapes")+tapes(await find("mixtape playlist","playlists"))+h2("Side B")+tapes(await find("workout energy","playlists"))},
 async 4(){return h2("CD Shelf")+albums(await find("deluxe edition","albums"),"cd")+`<p class="mono">Open a disc to see its jewel case and liner notes</p>`},
 async 5(){const r=recent();return h2("MP3 Library")+(r.length?rows("rec",r):`<p class="mono">Play something and it will appear here.</p>`)},
 async 6(){const t=T();let rel=[];if(t){try{rel=((await api("/related/"+encodeURIComponent(t.vid))).data||[]).map(x=>({vid:x.videoId,title:x.title,artist:x.artist,dur:x.duration_seconds||0,art:big(x.thumbnail)}))}catch(e){}}
  if(!rel.length)rel=songsOf(await find("trending songs","songs"));
  return h2(t?"Because you played "+esc(t.title):"Fresh Signal")+shelf("str",rel)+h2("Streaming mode")+`<div class="rack">${sw("xfade","Crossfade","Fade each new track in")}</div>`},
 async 7(){return `<h2 class="brand">Hi-Fi Rack</h2><div class="rack"><div class="vus"><div class="vu"><span>L</span><i></i></div><div class="vu"><span>R</span><i></i></div></div>${sw("needle","Needle-drop crackle","Vinyl crackle when a track starts")}${sw("xfade","Crossfade","Fade each new track in")}${sw("compact","MP3 compact mode","LCD-style player panel")}${sw("motion","Motion","Spinning discs, reels and glow")}</div>`},
 async search(q){const[s,a,p]=await all([q,"songs"],[q,"albums"],[q,"playlists"]);return h2("Results for “"+esc(q)+"”")+rows("sr",songsOf(s).slice(0,10))+h2("Albums")+albums(a,"vinyl")+h2("Playlists")+tapes(p)},
 async album({id,st}){const d=await api("/album/"+encodeURIComponent(id));
  const tr=(d.tracks||[]).map(t=>({vid:t.videoId||t.id,title:t.title,artist:t.artist||"",dur:dur(t.duration),art:big(t.thumbnail)||big(d.thumbnail)})).filter(t=>t.vid);
  const b=bg({art:big(d.thumbnail)||(tr[0]&&tr[0].art)||""},1);
  const cover=st==="cd"?`<div class="cd" style="--a:${esc(b)}"></div>`:`<div class="sleeve"><div class="rec"></div><div class="cover" style="background:${esc(b)}"></div></div>`;
  return `<button class="mono" data-a="back">◄ BACK</button><h2 class="brand" style="margin-top:14px">${esc(d.title)}</h2><div class="${st==="cd"?"jewel":"crate"}">${cover}<div class="booklet"><div class="mono" style="margin-bottom:8px">${esc(d.artist)}${d.year?" · "+esc(d.year):""}</div>${tr.length?rows("det",tr):"<p class='mono'>No tracks found.</p>"}</div></div>`},
 async playlist({id}){const d=await api("/playlist/"+encodeURIComponent(id));
  const tr=(d.tracks||[]).map(t=>({vid:t.videoId||t.id,title:t.title,artist:t.artist||"",dur:dur(t.duration),art:big(t.thumbnail)})).filter(t=>t.vid);
  return `<button class="mono" data-a="back">◄ BACK</button><div class="tapeview"><div class="reel"></div><h2 class="brand" style="margin:0">${esc(d.title)}</h2><div class="reel"></div></div><div class="mono" style="margin-bottom:8px">${esc(d.author||"")}</div>${tr.length?rows("det",tr):"<p class='mono'>No tracks found.</p>"}`}
};
async function go(e,arg){
  if(e!=="album"&&e!=="playlist")lastEra=e;era=e;document.body.dataset.era=e;nav();
  const id=++gid,m=$("main");m.innerHTML='<p class="mono">TUNING…</p>';m.scrollTop=0;
  try{const html=await V[e](arg);if(id===gid){m.innerHTML=html;sync()}}
  catch(err){if(id===gid)m.innerHTML=`<p class="mono">SIGNAL LOST — ${esc(err.message)}</p>`}
}
function nav(){
  $("nav").innerHTML=`<button class="${era==="home"?"on":""}" data-a="go" data-v="home">🏠<div>Home<small>Streaming dashboard</small></div></button>`+ERAS.map((x,i)=>`<button class="${era===i?"on":""}" data-a="go" data-v="${i}">${x[1]}<div>${x[0]}<small>${x[2]}</small></div></button>`).join("");
  $("tabs").innerHTML=[["Home","home","🏠"],["Crate",1,"💿"],["Radio",2,"📻"],["Tapes",3,"📼"],["Library",5,"🎧"]].map(t=>`<button class="${era===t[1]?"on":""}" data-a="go" data-v="${t[1]}">${t[2]}<br>${t[0]}</button>`).join("");
}
async function tune(i){sta=i;await go(2);const d=$("dial");if(d){d.classList.add("tune")}if(L.radio&&L.radio.length)playAt(0,L.radio)}

/* ---------- events ---------- */
const ACT={
 go:v=>go(isNaN(v)?v:+v),
 play:(k,i)=>playAt(+i,L[k]),
 playq:(_,i)=>playAt(+i),
 album:(id,_,st)=>go("album",{id,st}),
 playlist:id=>go("playlist",{id}),
 tune:(_,i)=>tune(+i),
 set:k=>{S[k]=!S[k];save();apply();go(era)},
 tab:v=>{const l=v==="l";$("queue").style.display=l?"none":"block";$("lyr").style.display=l?"block":"none";$("tq").classList.toggle("on",!l);$("tl").classList.toggle("on",l);if(l)lyrics()},
 toggle,prev:()=>step(-1),next:()=>step(1),
 full:()=>document.body.classList.toggle("full"),
 back:()=>go(lastEra)
};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el)return;const d=el.dataset;if(ACT[d.a])ACT[d.a](d.v,d.i,d.st)});
$("q").addEventListener("keydown",e=>{const v=e.target.value.trim();if(e.key==="Enter"&&v)go("search",v)});
apply();setTimeout(()=>$("boot").classList.add("off"),1600);
go("home");
