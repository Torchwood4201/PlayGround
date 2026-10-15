"use strict";
(function(){

/* =====================================================
   CONSTANTS & DEFAULTS
===================================================== */
var CHUNK_SIZES = [16,32,64,96,128,256,512,1024];
var TILE = 64; // sub-tile size for streaming mesh build

var DEFAULTS = {
  chunkIdx:5, waterLvl:36, maxHeight:128,
  noiseType:'simplex',
  scale:0.2, oct:3, lac:2.15, gain:0.60,
  dscale:3.0, dmix:0, rscale:0.35, rmix:0.52, basemix:0.54, exp:1.96,
  snowPct:59, treeline:52, pineline:41, sandPct:108,
  showWater:true, wireframe:false, autoRotate:true,
  tSpacing:4, sparseDens:20,
  treeOak:40, treePine:35, treeAutumn:12, treeMystic:6, treeGolden:6, treeTropical:0,
  cloudH:120, cloudSpeed:0.3, cloudAmt:5, cloudSize:37, cloudOpa:0.88,
  tod:12,
  maxRebuildsPerFrame:4,
  adaptiveRebuild:true,
  hotbarStyle:'cards',
  texturePack:'procedural',
  piano:true,
  music:true,
};
var cfg = Object.assign({}, DEFAULTS);
var currentSeed = 9043158;

/* =====================================================
   HELPERS
===================================================== */
function $e(id){ return document.getElementById(id); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

/* =====================================================
   PRNG
===================================================== */
function PRNG(seed){
  var s = ((seed ^ 0xdeadbeef) >>> 0) || 1;
  return function(){ s^=s<<13; s^=s>>>17; s^=s<<5; return (s>>>0)/4294967296; };
}

/* =====================================================
   PERLIN NOISE
===================================================== */
function makePerlin(seed){
  var rng=PRNG(seed), perm=new Uint8Array(512), i,j,tmp;
  for(i=0;i<256;i++) perm[i]=i;
  for(i=255;i>0;i--){ j=Math.floor(rng()*(i+1)); tmp=perm[i]; perm[i]=perm[j]; perm[j]=tmp; }
  for(i=0;i<256;i++) perm[i+256]=perm[i];
  function grad(h,x,y){ h&=3; var u=h<2?x:y, v=h<2?y:x; return ((h&1)?-u:u)+((h&2)?-v:v); }
  function fade(t){ return t*t*t*(t*(t*6-15)+10); }
  function lerp(a,b,t){ return a+t*(b-a); }
  return function(x,y){
    var xi=Math.floor(x)&255, yi=Math.floor(y)&255;
    var xf=x-Math.floor(x), yf=y-Math.floor(y);
    var u=fade(xf), v=fade(yf);
    var aa=perm[perm[xi]+yi], ab=perm[perm[xi]+yi+1];
    var ba=perm[perm[xi+1]+yi], bb=perm[perm[xi+1]+yi+1];
    return lerp(lerp(grad(aa,xf,yf),grad(ba,xf-1,yf),u),
                lerp(grad(ab,xf,yf-1),grad(bb,xf-1,yf-1),u),v)*0.5+0.5;
  };
}

/* =====================================================
   SIMPLEX NOISE
===================================================== */
function makeSimplex(seed){
  var rng=PRNG(seed), perm=new Uint8Array(512), i,j,tmp;
  for(i=0;i<256;i++) perm[i]=i;
  for(i=255;i>0;i--){ j=Math.floor(rng()*(i+1)); tmp=perm[i]; perm[i]=perm[j]; perm[j]=tmp; }
  for(i=0;i<256;i++) perm[i+256]=perm[i];
  var F2=0.5*(Math.sqrt(3)-1), G2=(3-Math.sqrt(3))/6;
  var GR=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  function dot(g,x,y){ return g[0]*x+g[1]*y; }
  return function(xin,yin){
    var s=(xin+yin)*F2, ii=Math.floor(xin+s), jj=Math.floor(yin+s);
    var t=(ii+jj)*G2, x0=xin-(ii-t), y0=yin-(jj-t);
    var i1,j1; if(x0>y0){i1=1;j1=0;}else{i1=0;j1=1;}
    var x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
    var ia=ii&255, ja=jj&255;
    var g0=perm[ia+perm[ja]]%8, g1=perm[ia+i1+perm[ja+j1]]%8, g2=perm[ia+1+perm[ja+1]]%8;
    var n0=0,n1=0,n2=0;
    var t0=0.5-x0*x0-y0*y0; if(t0>=0){t0*=t0; n0=t0*t0*dot(GR[g0],x0,y0);}
    var t1=0.5-x1*x1-y1*y1; if(t1>=0){t1*=t1; n1=t1*t1*dot(GR[g1],x1,y1);}
    var t2=0.5-x2*x2-y2*y2; if(t2>=0){t2*=t2; n2=t2*t2*dot(GR[g2],x2,y2);}
    return (70*(n0+n1+n2))*0.5+0.5;
  };
}

function makeNoise(seed){
  return cfg.noiseType==='simplex' ? makeSimplex(seed) : makePerlin(seed);
}
function fbm(p,x,y,oct,lac,gain){
  var v=0,a=0.5,f=1,mx=0;
  for(var i=0;i<oct;i++){ v+=a*p(x*f,y*f); mx+=a; a*=gain; f*=lac; }
  return v/mx;
}

/* =====================================================
   TEXTURES
===================================================== */
var TEX_SIZE=64, TEXTURES={};

function makeCanv(s){ var c=document.createElement('canvas'); c.width=c.height=s; return c; }
function texRng(n){ var s=((n^0x5f3759df)>>>0)||1; return function(){ s^=s<<13; s^=s>>>17; s^=s<<5; return (s>>>0)/4294967296; }; }
function mkTex(cv){ var t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; return t; }

function buildTextures(){
  var T=TEX_SIZE;

  // Grass top
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(1);
    ctx.fillStyle='#5d9e3f'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<140;i++){ var x=rng()*T,y=rng()*T,r=1+rng()*3;
      ctx.fillStyle='rgba('+Math.floor(60+rng()*60)+','+Math.floor(110+rng()*50)+','+Math.floor(20+rng()*40)+',0.55)'; ctx.fillRect(x,y,r,r); }
    for(var i2=0;i2<60;i2++){ ctx.fillStyle='rgba(130,210,60,'+(0.25+rng()*0.3)+')'; ctx.fillRect(rng()*T,rng()*T,1,2+rng()*2); }
    TEXTURES.grassTop=mkTex(cv); })();

  // Grass side
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(2),sh=Math.ceil(T*0.18);
    ctx.fillStyle='#8B5E3C'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<200;i++){ var x=rng()*T,y=T*0.18+rng()*T*0.82,v=Math.floor(100+rng()*60);
      ctx.fillStyle='rgba('+v+','+Math.floor(v*0.62)+','+Math.floor(v*0.35)+',0.5)'; ctx.fillRect(x,y,1+rng()*2,1+rng()*2); }
    ctx.fillStyle='#5d9e3f'; ctx.fillRect(0,0,T,sh);
    for(var i2=0;i2<30;i2++){ ctx.fillStyle='rgba(80,170,30,'+(0.3+rng()*0.4)+')'; ctx.fillRect(rng()*T,0,1,sh); }
    TEXTURES.grassSide=mkTex(cv); })();

  // Dirt
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(3);
    ctx.fillStyle='#8B5E3C'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<280;i++){ var v=Math.floor(90+rng()*80);
      ctx.fillStyle='rgba('+Math.floor(v*(0.9+rng()*0.2))+','+Math.floor(v*(0.55+rng()*0.15))+','+Math.floor(v*(0.28+rng()*0.12))+','+(0.35+rng()*0.45)+')';
      ctx.fillRect(rng()*T,rng()*T,1+Math.floor(rng()*3),1+Math.floor(rng()*3)); }
    TEXTURES.dirt=mkTex(cv); })();

  // Stone (world UV tiling)
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(4);
    ctx.fillStyle='#888'; ctx.fillRect(0,0,T,T);
    for(var c=0;c<8;c++){ var x=rng()*T,y=rng()*T; ctx.beginPath(); ctx.moveTo(x,y);
      for(var s=0;s<6;s++){ x+=(rng()-0.5)*14; y+=(rng()-0.5)*14; ctx.lineTo(x,y); }
      ctx.strokeStyle='rgba(48,48,48,'+(0.3+rng()*0.35)+')'; ctx.lineWidth=0.5+rng(); ctx.stroke(); }
    for(var i=0;i<320;i++){ var v=Math.floor(100+rng()*80);
      ctx.fillStyle='rgba('+v+','+v+','+(v-5)+','+(0.25+rng()*0.4)+')';
      ctx.fillRect(rng()*T,rng()*T,1+Math.floor(rng()*2),1+Math.floor(rng()*2)); }
    var t=mkTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; TEXTURES.stone=t; })();

  // Deep stone
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(10);
    ctx.fillStyle='#555'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<200;i++){ var v=Math.floor(55+rng()*50);
      ctx.fillStyle='rgba('+v+','+v+','+(v-3)+','+(0.3+rng()*0.4)+')';
      ctx.fillRect(rng()*T,rng()*T,1+Math.floor(rng()*2),1+Math.floor(rng()*2)); }
    var t=mkTex(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; TEXTURES.deepStone=t; })();

  // Sand
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(5);
    ctx.fillStyle='#d4b483'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<300;i++){ var v=Math.floor(190+rng()*50);
      ctx.fillStyle='rgba('+v+','+Math.floor(v*0.82)+','+Math.floor(v*0.52)+','+(0.2+rng()*0.4)+')';
      ctx.fillRect(rng()*T,rng()*T,1,1); }
    TEXTURES.sand=mkTex(cv); })();

  // Water
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(6);
    var grd=ctx.createLinearGradient(0,0,T,T); grd.addColorStop(0,'#2d7dd2'); grd.addColorStop(1,'#1a5fa0');
    ctx.fillStyle=grd; ctx.fillRect(0,0,T,T);
    for(var i=0;i<40;i++){ ctx.fillStyle='rgba(150,220,255,'+(0.08+rng()*0.12)+')'; ctx.fillRect(rng()*T,rng()*T,4+rng()*10,1); }
    TEXTURES.water=mkTex(cv); })();

  // Log side
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(7);
    ctx.fillStyle='#6b4c2a'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<T;i+=2+Math.floor(rng()*3)){
      ctx.fillStyle='rgba('+Math.floor(60+rng()*50)+','+Math.floor(30+rng()*30)+',10,'+(0.2+rng()*0.35)+')'; ctx.fillRect(i,0,1,T); }
    TEXTURES.log=mkTex(cv); })();

  // Log top (rings)
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(17);
    ctx.fillStyle='#5a3e22'; ctx.fillRect(0,0,T,T);
    var cx=T/2, cy=T/2;
    for(var r=4;r<T/2;r+=4+Math.floor(rng()*3)){
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle='rgba('+(50+Math.floor(rng()*40))+','+(25+Math.floor(rng()*25))+',8,'+(0.3+rng()*0.4)+')';
      ctx.lineWidth=1+rng(); ctx.stroke(); }
    TEXTURES.logTop=mkTex(cv); })();

  // Snow
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(9);
    ctx.fillStyle='#eef4f7'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<80;i++){ ctx.fillStyle='rgba(200,220,240,'+(0.15+rng()*0.25)+')'; ctx.fillRect(rng()*T,rng()*T,2+rng()*4,1); }
    TEXTURES.snow=mkTex(cv); })();

  // Pine needle texture
  (function(){ var cv=makeCanv(T),ctx=cv.getContext('2d'),rng=texRng(20);
    ctx.fillStyle='#1e5c18'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<200;i++){ var v=Math.floor(30+rng()*60);
      ctx.fillStyle='rgba('+v+','+(v+40)+','+v+','+(0.4+rng()*0.4)+')';
      ctx.fillRect(rng()*T,rng()*T,1,3+rng()*5); }
    TEXTURES.pine=mkTex(cv); })();

  // Leaf variants
  mkLeafTex('leavesOak',     11, [45,158,30]);
  mkLeafTex('leavesPine',    12, [30,100,25]);
  mkLeafTex('leavesAutumn',  13, [190,55,30]);
  mkLeafTex('leavesMystic',  14, [140,50,210]);
  mkLeafTex('leavesGolden',  15, [210,170,20]);
  mkLeafTex('leavesTropical',16, [30,170,120]);

  buildNotchTextures();
  Object.keys(TEXTURES).forEach(function(k){ TEXTURES[k].magFilter=TEXTURES[k].minFilter=THREE.NearestFilter; });
}

function mkLeafTex(key, sn, base){
  var cv=makeCanv(TEX_SIZE), ctx=cv.getContext('2d'), rng=texRng(sn), T=TEX_SIZE;
  ctx.fillStyle='rgb('+base[0]+','+base[1]+','+base[2]+')'; ctx.fillRect(0,0,T,T);
  for(var i=0;i<140;i++){
    var r=Math.floor(base[0]*(0.6+rng()*0.6)), g=Math.floor(base[1]*(0.6+rng()*0.6)), b=Math.floor(base[2]*(0.6+rng()*0.6));
    ctx.fillStyle='rgba('+r+','+g+','+b+','+(0.35+rng()*0.45)+')';
    ctx.fillRect(rng()*T,rng()*T,2+rng()*5,2+rng()*5); }
  TEXTURES[key]=mkTex(cv);
}

/* =====================================================
   VANILLA TEXTURE PACK — real 26.3 sprites (see sprite-web/).
   Snapshot lives in textures/vanilla/ so the game is self-contained.
   Animated strips are cropped to their first frame; fantasy leaf
   variants are oak leaves re-tinted on canvas.
===================================================== */
var VANILLA_TEX={
  grassTop:'textures/vanilla/block__grass_block_top.png',
  grassSide:'textures/vanilla/block__grass_block_side.png',
  dirt:'textures/vanilla/block__dirt.png',
  stone:'textures/vanilla/block__stone.png',
  deepStone:'textures/vanilla/block__deepslate.png',
  sand:'textures/vanilla/block__sand.png',
  water:'textures/vanilla/block__water_still.png',
  log:'textures/vanilla/block__oak_log.png',
  logTop:'textures/vanilla/block__oak_log_top.png',
  snow:'textures/vanilla/block__snow.png',
  pine:'textures/vanilla/block__spruce_leaves.png',
  leavesOak:'textures/vanilla/block__oak_leaves.png',
  coal_ore:'textures/vanilla/block__coal_ore.png',
  iron_ore:'textures/vanilla/block__iron_ore.png',
  gold_ore:'textures/vanilla/block__gold_ore.png',
  diamond_ore:'textures/vanilla/block__diamond_ore.png',
  bedrock:'textures/vanilla/block__bedrock.png',
  planks:'textures/vanilla/block__oak_planks.png',
  craftTable:'textures/vanilla/block__crafting_table_front.png',
  craftTableTop:'textures/vanilla/block__crafting_table_top.png',
  furnace:'textures/vanilla/block__furnace_front.png',
  furnaceTop:'textures/vanilla/block__furnace_top.png',
  furnaceSide:'textures/vanilla/block__furnace_side.png',
};
/* Item/block icons for hotbar, inventory, crafting grid and drops.
   Real 26.3 sprites snapshotted into textures/vanilla/. */
var VANILLA_ICONS={
  stick:'textures/vanilla/item__stick.png',
  coal:'textures/vanilla/item__coal.png',
  diamond:'textures/vanilla/item__diamond.png',
  iron_ingot:'textures/vanilla/item__iron_ingot.png',
  gold_ingot:'textures/vanilla/item__gold_ingot.png',
  raw_pork:'textures/vanilla/item__porkchop.png',
  cooked_pork:'textures/vanilla/item__cooked_porkchop.png',
  wood_pick:'textures/vanilla/item__wooden_pickaxe.png',
  stone_pick:'textures/vanilla/item__stone_pickaxe.png',
  iron_pick:'textures/vanilla/item__iron_pickaxe.png',
  gold_pick:'textures/vanilla/item__golden_pickaxe.png',
  diamond_pick:'textures/vanilla/item__diamond_pickaxe.png',
  wood_sword:'textures/vanilla/item__wooden_sword.png',
  stone_sword:'textures/vanilla/item__stone_sword.png',
  iron_sword:'textures/vanilla/item__iron_sword.png',
  gold_sword:'textures/vanilla/item__golden_sword.png',
  diamond_sword:'textures/vanilla/item__diamond_sword.png',
  grass:'textures/vanilla/block__grass_block_side.png',
  dirt:'textures/vanilla/block__dirt.png',
  stone:'textures/vanilla/block__stone.png',
  deep:'textures/vanilla/block__deepslate.png',
  sand:'textures/vanilla/block__sand.png',
  log:'textures/vanilla/block__oak_log.png',
  snow:'textures/vanilla/block__snow.png',
  planks:'textures/vanilla/block__oak_planks.png',
  craftTable:'textures/vanilla/block__crafting_table_front.png',
  furnace:'textures/vanilla/block__furnace_front.png',
  bedrock:'textures/vanilla/block__bedrock.png',
  coal_ore:'textures/vanilla/block__coal_ore.png',
  iron_ore:'textures/vanilla/block__iron_ore.png',
  gold_ore:'textures/vanilla/block__gold_ore.png',
  diamond_ore:'textures/vanilla/block__diamond_ore.png',
  water:'textures/vanilla/block__water_still.png',
  leavesOak:'textures/vanilla/block__oak_leaves.png',
  pine:'textures/vanilla/block__spruce_leaves.png',
};
var vanillaIconCache={};
function preloadVanillaIcons(){
  Object.keys(VANILLA_ICONS).forEach(function(id){
    if(vanillaIconCache[id]) return;
    var img=new Image();
    img.onload=function(){ vanillaIconCache[id]=img; try{ refreshInvUI(); }catch(e){} };
    img.onerror=function(){ vanillaIconCache[id]=null; };
    img.src=VANILLA_ICONS[id];
  });
}
var waterAnim=null;
var VANILLA_LEAF_TINTS={leavesAutumn:'#c05020',leavesMystic:'#9060e0',leavesGolden:'#e0b020',leavesTropical:'#20a080'};
function loadImage(src){
  return new Promise(function(res,rej){ var i=new Image(); i.onload=function(){res(i);}; i.onerror=function(){rej(new Error('img '+src));}; i.src=src; });
}
function vanillaCanvas(img){
  var s=Math.min(img.width,img.height); // first frame of animated strips
  var cv=makeCanv(16), ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,0,0,s,s,0,0,16,16);
  return cv;
}
function tintCanvas(srcCv,color){
  var cv=makeCanv(16), ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(srcCv,0,0);
  ctx.globalCompositeOperation='multiply';
  ctx.fillStyle=color; ctx.fillRect(0,0,16,16);
  return cv;
}
async function loadVanillaPack(){
  var keys=Object.keys(VANILLA_TEX);
  var imgs={};
  for(var i=0;i<keys.length;i++){ imgs[keys[i]]=await loadImage(VANILLA_TEX[keys[i]]); }
  var canvases={};
  keys.forEach(function(k){ canvases[k]=vanillaCanvas(imgs[k]); });
  Object.keys(VANILLA_LEAF_TINTS).forEach(function(k){ canvases[k]=tintCanvas(canvases.leavesOak,VANILLA_LEAF_TINTS[k]); });
  // pine keeps its own spruce texture; oak leaves double as pine fallback? no — spruce loaded above.
  Object.keys(canvases).forEach(function(k){ TEXTURES[k]=mkTex(canvases[k]); });
  TEXTURES.stone.wrapS=TEXTURES.stone.wrapT=THREE.RepeatWrapping;
  TEXTURES.deepStone.wrapS=TEXTURES.deepStone.wrapT=THREE.RepeatWrapping;
  Object.keys(TEXTURES).forEach(function(k){ TEXTURES[k].magFilter=TEXTURES[k].minFilter=THREE.NearestFilter; });
  // keep the full water strip for animation; TEXTURES.water shows frame 0
  try{
    var wimg=imgs.water;
    if(wimg && wimg.width>=16 && wimg.height>wimg.width){
      var frames=Math.floor(wimg.height/wimg.width);
      var strip=document.createElement('canvas'); strip.width=wimg.width; strip.height=wimg.height;
      strip.getContext('2d').drawImage(wimg,0,0);
      waterAnim={strip:strip, size:wimg.width, frames:frames, t:0};
    } else waterAnim=null;
  }catch(e){ waterAnim=null; }
  preloadVanillaIcons();
}
/* =====================================================
   CLASSIC 0.8 PACK — authentic upload textures
   (reference/minecraft-decompiled-0.8-alpha/, textures/classic08/).
   grass.png/dirt.png drive terrain; clouds.png tints clouds;
   char.png skins the zombie (classic mobs used /char.png).
===================================================== */
var CLASSIC_TEX={
  grass:'textures/classic08/grass.png',
  dirt:'textures/classic08/dirt.png',
  clouds:'textures/classic08/clouds.png',
  char:'textures/classic08/char.png',
};
var classicCloudTex=null, charSkinTex=null;
async function loadClassicPack(){
  var grass=await loadImage(CLASSIC_TEX.grass);
  var dirt=await loadImage(CLASSIC_TEX.dirt);
  var gcv=vanillaCanvas(grass), dcv=vanillaCanvas(dirt);
  TEXTURES.grassTop=mkTex(gcv);
  TEXTURES.dirt=mkTex(dcv);
  // grass side: authentic dirt with a grass lip on top
  var side=makeCanv(16), sctx=side.getContext('2d');
  sctx.imageSmoothingEnabled=false;
  sctx.drawImage(dcv,0,0);
  sctx.drawImage(gcv,0,0,16,4,0,0,16,4);
  TEXTURES.grassSide=mkTex(side);
  try{
    var clouds=await loadImage(CLASSIC_TEX.clouds);
    var ccv=document.createElement('canvas'); ccv.width=clouds.width; ccv.height=clouds.height;
    ccv.getContext('2d').drawImage(clouds,0,0);
    classicCloudTex=new THREE.CanvasTexture(ccv);
    classicCloudTex.magFilter=classicCloudTex.minFilter=THREE.NearestFilter;
    classicCloudTex.wrapS=classicCloudTex.wrapT=THREE.RepeatWrapping;
  }catch(e){ classicCloudTex=null; }
  try{
    var ch=await loadImage(CLASSIC_TEX.char);
    var chcv=document.createElement('canvas'); chcv.width=ch.width; chcv.height=ch.height;
    chcv.getContext('2d').drawImage(ch,0,0);
    charSkinTex=new THREE.CanvasTexture(chcv);
    charSkinTex.magFilter=charSkinTex.minFilter=THREE.NearestFilter;
  }catch(e){ charSkinTex=null; }
  Object.keys(TEXTURES).forEach(function(k){ TEXTURES[k].magFilter=TEXTURES[k].minFilter=THREE.NearestFilter; });
  preloadVanillaIcons();
}
function tickWaterAnim(dt){
  if(!waterAnim || cfg.texturePack!=='vanilla' || !TEXTURES.water) return;
  waterAnim.t+=dt;
  if(waterAnim.t<0.15) return;
  waterAnim.t=0;
  try{
    var tex=TEXTURES.water, img=tex.image;
    if(!img || !img.getContext) return;
    var s=waterAnim.size, f=Math.floor(performance.now()/400)%waterAnim.frames;
    var sctx=waterAnim.strip.getContext('2d');
    var d=img.getContext('2d');
    var fd=sctx.getImageData(0,f*s,s,s);
    d.clearRect(0,0,16,16);
    d.drawImage(waterAnim.strip,0,f*s,s,s,0,0,16,16);
    void fd;
    tex.needsUpdate=true;
  }catch(e){}
}

/* =====================================================
   MATERIALS
===================================================== */
var matCache={};
function getMat(texKey, opts){
  var k=texKey+(opts||'');
  if(matCache[k]) return matCache[k];
  var m=new THREE.MeshLambertMaterial({
    map: TEXTURES[texKey],
    transparent: !!(opts && opts.t),
    opacity: opts && opts.o!=null ? opts.o : 1,
    side: opts && opts.d ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: !(opts && opts.t),
    wireframe: cfg.wireframe
  });
  // vanilla leaves are real cutouts: punch transparency instead of ghosting
  if(cfg.texturePack==='vanilla' && (texKey.indexOf('leaves')!==-1||texKey==='pine')){
    m.alphaTest=0.5; m.transparent=false; m.opacity=1; m.side=THREE.DoubleSide; m.depthWrite=true;
  }
  matCache[k]=m; return m;
}

function getTexKey(type, fi){
  if(type.indexOf(':')!==-1){ return type.split(':')[1]; }
  switch(type){
    case 'grass': return fi===2?'grassTop':fi===3?'dirt':'grassSide';
    case 'dirt':  return 'dirt';
    case 'stone': return 'stone';
    case 'deep':  return 'deepStone';
    case 'sand':  return 'sand';
    case 'water': return 'water';
    case 'log':   return fi===2||fi===3?'logTop':'log';
    case 'pinelog': return fi===2||fi===3?'logTop':'log';
    case 'snow':  return fi===2?'snow':fi===3?'dirt':'grassSide';
    case 'coal_ore': return 'coal_ore';
    case 'iron_ore': return 'iron_ore';
    case 'gold_ore': return 'gold_ore';
    case 'diamond_ore': return 'diamond_ore';
    case 'bedrock': return 'bedrock';
    case 'planks': return 'planks';
    case 'craftTable': return fi===2?'craftTableTop':'craftTable';
    case 'furnace': return fi===2||fi===3?'furnaceTop':(fi===4?'furnace':'furnaceSide');
    default:      return 'stone';
  }
}
function isLeafBlock(t){ return t.indexOf('leaves')!==-1; }

/* =====================================================
   FACE DEFS
===================================================== */
var FACE_DEF=[
  {d:[1,0,0],  fi:0,v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],n:[1,0,0]},
  {d:[-1,0,0], fi:1,v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],n:[-1,0,0]},
  {d:[0,1,0],  fi:2,v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],n:[0,1,0]},
  {d:[0,-1,0], fi:3,v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],n:[0,-1,0]},
  {d:[0,0,1],  fi:4,v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],n:[0,0,1]},
  {d:[0,0,-1], fi:5,v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],n:[0,0,-1]},
];
var QUAD_UV=[[0,0],[0,1],[1,1],[1,0]];
var STONE_SCALE=1/4;
function stoneUV(bx,by,bz,fi,vi){
  var ov=FACE_DEF[fi].v[vi], wx=bx+ov[0], wy=by+ov[1], wz=bz+ov[2];
  var u,v;
  if(fi===2||fi===3){u=wx;v=wz;} else if(fi===0||fi===1){u=wz;v=wy;} else{u=wx;v=wy;}
  return [u*STONE_SCALE, v*STONE_SCALE];
}

/* =====================================================
   TREE BUILDERS
===================================================== */
function treeOak(rng, leafKey){
  var blocks=[], th=4+Math.floor(rng()*3), lr=2+(rng()>0.4?1:0);
  for(var y=1;y<=th;y++) blocks.push({dx:0,dy:y,dz:0,type:'log'});
  var top=th;
  for(var ly=top-1;ly<=top+2;ly++){
    var r=(ly>=top)?Math.max(1,lr-1):lr;
    for(var lx=-r;lx<=r;lx++) for(var lz=-r;lz<=r;lz++){
      if(lx===0 && lz===0 && ly<top) continue;
      if(Math.abs(lx)+Math.abs(lz)<=r && rng()>0.1) blocks.push({dx:lx,dy:ly,dz:lz,type:'leaves:'+leafKey});
    }
  }
  return blocks;
}

function treePine(rng){
  var blocks=[], th=8+Math.floor(rng()*7);
  for(var y=1;y<=th;y++) blocks.push({dx:0,dy:y,dz:0,type:'pinelog'});
  blocks.push({dx:0,dy:th+1,dz:0,type:'leaves:pine'});
  for(var tier=0;tier<Math.floor(th*0.7);tier+=2){
    var y2=th-tier, r=Math.max(0,Math.floor(tier*0.5));
    for(var lx=-r;lx<=r;lx++) for(var lz=-r;lz<=r;lz++){
      if(lx===0 && lz===0) continue;
      if(Math.abs(lx)+Math.abs(lz)<=r+1) blocks.push({dx:lx,dy:y2,dz:lz,type:'leaves:pine'});
    }
  }
  return blocks;
}

function treeAutumn(rng){ return treeOak(rng,'leavesAutumn'); }
function treeMystic(rng){ return treeOak(rng,'leavesMystic'); }
function treeGolden(rng){ return treeOak(rng,'leavesGolden'); }
function treeTropical(rng){
  var blocks=[], th=7+Math.floor(rng()*5);
  for(var y=1;y<=th;y++) blocks.push({dx:0,dy:y,dz:0,type:'log'});
  var dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
  for(var di=0;di<dirs.length;di++){
    var dx=dirs[di][0], dz=dirs[di][1];
    for(var r=1;r<=4;r++){
      var drop=Math.floor(r*0.6);
      if(rng()>0.15) blocks.push({dx:dx*r,dy:th-drop,dz:dz*r,type:'leaves:leavesTropical'});
    }
  }
  blocks.push({dx:0,dy:th+1,dz:0,type:'leaves:leavesTropical'});
  return blocks;
}

var TREE_BUILDERS = {
  oak:     function(rng){ return treeOak(rng,'leavesOak'); },
  pine:    treePine,
  autumn:  treeAutumn,
  mystic:  treeMystic,
  golden:  treeGolden,
  tropical:treeTropical,
};

/* =====================================================
   WORLD GEN
===================================================== */
function genWorld(seed){
  var CHUNK  = CHUNK_SIZES[cfg.chunkIdx];
  var WATER  = cfg.waterLvl;
  var MAXH   = cfg.maxHeight;

  var pBase   = makeNoise(seed);
  var pDetail = makeNoise(seed+7331);
  var pRidge  = makeNoise(seed+31337);

  /* --- Height map --- */
  var heights = new Int32Array(CHUNK*CHUNK);
  for(var z=0;z<CHUNK;z++) for(var x=0;x<CHUNK;x++){
    var nx=x/CHUNK, nz=z/CHUNK;
    var base   = fbm(pBase,  nx*cfg.scale+10, nz*cfg.scale+7,  cfg.oct,cfg.lac,cfg.gain);
    var detail = fbm(pDetail,nx*cfg.dscale+30,nz*cfg.dscale+20,Math.min(4,cfg.oct),2.0,0.5)*cfg.dmix;
    var ridge  = (1-Math.abs(fbm(pRidge,nx*cfg.rscale+60,nz*cfg.rscale+50,3,2.0,0.5)*2-1));
    ridge = Math.pow(ridge,2)*cfg.rmix;
    var h = base*cfg.basemix + detail + ridge;
    h = Math.pow(Math.max(0,h), cfg.exp);
    heights[z*CHUNK+x] = Math.max(1, Math.min(MAXH, Math.round(h*(MAXH-2)+2)));
  }

  /* --- Thresholds --- */
  var snowLine = Math.round(MAXH * (cfg.snowPct  / 100));
  var treeLine = Math.round(MAXH * (cfg.treeline / 100));
  var pineLine = Math.round(MAXH * (cfg.pineline / 100));
  var sandLine = Math.round(WATER * (cfg.sandPct / 100));

  /* --- Tree placement --- */
  var fullPool=[];
  var nonPineCounts={oak:cfg.treeOak,autumn:cfg.treeAutumn,mystic:cfg.treeMystic,golden:cfg.treeGolden,tropical:cfg.treeTropical};
  var npKeys=Object.keys(nonPineCounts);
  for(var ti=0;ti<npKeys.length;ti++){
    for(var tc=0;tc<nonPineCounts[npKeys[ti]];tc++) fullPool.push(npKeys[ti]);
  }
  for(var tc2=0;tc2<cfg.treePine;tc2++) fullPool.push('pine');

  var srng=PRNG(seed+1234);
  for(var i=fullPool.length-1;i>0;i--){ var j=Math.floor(srng()*(i+1)); var tmp=fullPool[i]; fullPool[i]=fullPool[j]; fullPool[j]=tmp; }

  var totalTrees=fullPool.length, placed=[], trng=PRNG(seed+8888);
  var attempts=0, poolIdx=0, sp=cfg.tSpacing;

  while(poolIdx<totalTrees && attempts<totalTrees*10){
    attempts++;
    var tx=2+Math.floor(trng()*(CHUNK-4)), tz=2+Math.floor(trng()*(CHUNK-4));
    var th=heights[tz*CHUNK+tx];
    if(th>=snowLine||th<=sandLine||th<=WATER||th>MAXH-6) continue;

    var zone = (th>=treeLine)?'sparse':(th>=pineLine)?'pine':'all';
    var ttype;
    if(zone==='sparse'){
      if(trng()*100>cfg.sparseDens) continue;
      ttype='pine';
    } else if(zone==='pine'){
      ttype='pine';
    } else {
      if(poolIdx>=fullPool.length) break;
      ttype=fullPool[poolIdx];
    }

    var ok=true;
    for(var k=0;k<placed.length;k++){
      if(Math.abs(placed[k].tx-tx)<sp && Math.abs(placed[k].tz-tz)<sp){ ok=false; break; }
    }
    if(!ok) continue;
    placed.push({tx:tx,tz:tz,th:th,ttype:ttype});
    if(zone==='all') poolIdx++;
  }

  var typeNames=[];
  var typeIds=Object.create(null);
  window.getTypeId = getTypeId; function getTypeId(s){
    if(typeIds[s]!=null) return typeIds[s];
    var id=typeNames.length; typeNames.push(s); typeIds[s]=id; return id;
  }

  var colMap=new Array(CHUNK*CHUNK);

  for(var z2=0;z2<CHUNK;z2++) for(var x2=0;x2<CHUNK;x2++){
    var h2=heights[z2*CHUNK+x2];
    var col=[];
    for(var y=0;y<=h2;y++){
      var type;
      if(y===h2){
        if(h2<=sandLine)      type='sand';
        else if(h2>=snowLine) type='snow';
        else                 type='grass';
      } else if(y>=h2-3){    type=(h2<=sandLine+1)?'sand':'dirt'; }
      else if(y>=h2-10){     type='stone'; }
      else{                 type='deep'; }
      col.push(y, getTypeId(type));
    }
    if(cfg.showWater && h2<WATER){
      for(var y2=h2+1;y2<=WATER;y2++) col.push(y2, getTypeId('water'));
    }
    colMap[x2+z2*CHUNK]=col;
  }

  var lrng=PRNG(seed+555);
  for(var pi=0;pi<placed.length;pi++){
    var p=placed[pi];
    var builder=TREE_BUILDERS[p.ttype]||TREE_BUILDERS.oak;
    var tblocks=builder(lrng);
    for(var bi=0;bi<tblocks.length;bi++){
      var tb=tblocks[bi];
      var bx=p.tx+tb.dx, bz=p.tz+tb.dz, by=p.th+tb.dy;
      if(bx<0||bx>=CHUNK||bz<0||bz>=CHUNK||by<0) continue;
      var col2=colMap[bx+bz*CHUNK];
      var found=false;
      for(var ci=0;ci<col2.length;ci+=2){ if(col2[ci]===by){ col2[ci+1]=getTypeId(tb.type); found=true; break; } }
      if(!found) col2.push(by, getTypeId(tb.type));
    }
  }

  try{ placeBedrock(colMap, CHUNK, getTypeId); }catch(e){}
  try{ sprinkleOres(colMap, CHUNK, typeNames, getTypeId); }catch(e){}
  try{ carveCaves(colMap, CHUNK); }catch(e){}
  return { colMap:colMap, typeNames:typeNames, CHUNK:CHUNK };
}

/* =====================================================
   TILE BLOCK LOOKUP
===================================================== */
function makeLookup(colMap, typeNames, CHUNK){
  return function getBlock(x,y,z){
    var CHUNK2=CHUNK_SIZES[cfg.chunkIdx];
    if(x<0||x>=CHUNK2||z<0||z>=CHUNK2||y<0) return null;
    var cm=colMapGlobal||colMap; var tn=typeNamesGlobal||typeNames;
    var col=cm[x+z*CHUNK2];
    for(var ci=0;ci<col.length;ci+=2){
      if(col[ci]===y) return tn[col[ci+1]];
    }
    return null;
  };
}

/* =====================================================
   MESH BUILD
===================================================== */
function buildTileMesh(colMap, typeNames, getBlock, CHUNK, tileX, tileZ, tileW, tileH){
  var buckets=Object.create(null);
  function bkt(k){
    if(!buckets[k]) buckets[k]={pos:[],nor:[],uv:[],idx:[],isStone:k==='stone'||k==='deepStone'};
    return buckets[k];
  }

  for(var bz=tileZ;bz<tileZ+tileH;bz++){
    for(var bx=tileX;bx<tileX+tileW;bx++){
      var col=colMap[bx+bz*CHUNK];
      for(var ci=0;ci<col.length;ci+=2){
        var by=col[ci];
        var type=typeNames[col[ci+1]];
        var isW=type==='water', isL=isLeafBlock(type);

        for(var fi=0;fi<6;fi++){
          var fd=FACE_DEF[fi];
          var nb=getBlock(bx+fd.d[0], by+fd.d[1], bz+fd.d[2]);
          if(nb){
            if(isW){ if(nb==='water') continue; if(fi!==2) continue; }
            else if(isL){ if(isLeafBlock(nb)) continue; }
            else{ if(!isLeafBlock(nb) && nb!=='water') continue; }
          }

          var tk=getTexKey(type,fi);
          if(!TEXTURES[tk]) tk='stone';
          var b=bkt(tk), base=b.pos.length/3;
          for(var vi=0;vi<4;vi++){
            var ov=fd.v[vi];
            b.pos.push(bx+ov[0],by+ov[1],bz+ov[2]);
            b.nor.push(fd.n[0],fd.n[1],fd.n[2]);
            var uv=b.isStone?stoneUV(bx,by,bz,fi,vi):QUAD_UV[vi];
            b.uv.push(uv[0],uv[1]);
          }
          b.idx.push(base,base+1,base+2,base,base+2,base+3);
        }
      }
    }
  }

  var group=new THREE.Group();
  Object.keys(buckets).forEach(function(tk){
    var b=buckets[tk]; if(!b.pos.length) return;
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));
    geo.setAttribute('normal',  new THREE.Float32BufferAttribute(b.nor,3));
    geo.setAttribute('uv',      new THREE.Float32BufferAttribute(b.uv,2));
    geo.setIndex(b.idx); geo.computeBoundingSphere();
    var isLeafTk=tk.indexOf('leaves')!==-1||tk==='pine';
    var transp=tk==='water'||isLeafTk;
    var mat=getMat(tk, transp?{t:true,o:tk==='water'?0.80:0.87,d:true}:null);
    var mesh=new THREE.Mesh(geo,mat);
    mesh.castShadow=tk!=='water'; mesh.receiveShadow=true;
    group.add(mesh);
  });
  return group;
}

/* =====================================================
   THREE.JS SETUP
===================================================== */
var cv=$e('cv');
var renderer=new THREE.WebGLRenderer({canvas:cv, antialias:false, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

var scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x87CEEB, 180, 900);

var camera=new THREE.PerspectiveCamera(58,1,0.1,2000);

function onResize(){
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  var sc=$e('sky-canvas');
  sc.width=window.innerWidth; sc.height=window.innerHeight;
  drawSky();
}
window.addEventListener('resize',onResize);

/* =====================================================
   TIME OF DAY
===================================================== */
var ambLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambLight);

var sunLight = new THREE.DirectionalLight(0xfffde7, 1.2);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.left = -300; sunLight.shadow.camera.right = 300;
sunLight.shadow.camera.top  = 300;  sunLight.shadow.camera.bottom = -300;
sunLight.shadow.camera.near = 1;    sunLight.shadow.camera.far = 1000;
scene.add(sunLight);

var moonLight = new THREE.DirectionalLight(0xb8c8e8, 0.0);
moonLight.castShadow = false;
scene.add(moonLight);

var hemiLight = new THREE.HemisphereLight(0x8ec8f0, 0x3e6e30, 0.5);
scene.add(hemiLight);

function lerpColor(a,b,t){
  var ar=(a>>16)&0xff, ag=(a>>8)&0xff, ab=a&0xff;
  var br=(b>>16)&0xff, bg=(b>>8)&0xff, bb=b&0xff;
  return (Math.round(ar+(br-ar)*t)<<16)|(Math.round(ag+(bg-ag)*t)<<8)|Math.round(ab+(bb-ab)*t);
}
function hexToRGB(h){ return [(h>>16)&0xff,(h>>8)&0xff,h&0xff]; }
function RGBToCSS(r,g,b){ return 'rgb('+r+','+g+','+b+')'; }

var SKY_KEYS = [
  { h:0,  top:0x04040e, bot:0x08091c, amb:0.12, sun:0.0,  moon:0.55, hs:0x0c0e22, fog:0x08091c, sc:0xe8eeff },
  { h:4,  top:0x06071a, bot:0x0d0e2a, amb:0.12, sun:0.0,  moon:0.50, hs:0x10122a, fog:0x0a0b22, sc:0xe0e8ff },
  { h:5,  top:0x1a0a20, bot:0x3a1a18, amb:0.16, sun:0.05, moon:0.20, hs:0x201028, fog:0x2a1518, sc:0xff8c40 },
  { h:6,  top:0x3a1a0a, bot:0xd4602a, amb:0.28, sun:0.55, moon:0.0,  hs:0x402010, fog:0xb04818, sc:0xffcc44 },
  { h:7,  top:0x6a8ab0, bot:0xffa040, amb:0.38, sun:0.85, moon:0.0,  hs:0x6070a0, fog:0xe88030, sc:0xffe060 },
  { h:8,  top:0x82aad0, bot:0xc8d8f0, amb:0.44, sun:1.05, moon:0.0,  hs:0x78a0c8, fog:0xb0cce0, sc:0xfffbe0 },
  { h:12, top:0x5fa8d8, bot:0xc8e8f8, amb:0.48, sun:1.30, moon:0.0,  hs:0x88c0e8, fog:0x87CEEB, sc:0xfffbe0 },
  { h:16, top:0x5fa8d8, bot:0xc8e8f8, amb:0.44, sun:1.15, moon:0.0,  hs:0x80b8e0, fog:0x8ac8e8, sc:0xfffbe0 },
  { h:18, top:0x5a3818, bot:0xf08030, amb:0.30, sun:0.65, moon:0.0,  hs:0x503020, fog:0xd06820, sc:0xffcc44 },
  { h:19, top:0x28180a, bot:0x7a2808, amb:0.18, sun:0.10, moon:0.10, hs:0x201010, fog:0x4a1808, sc:0xff9020 },
  { h:20, top:0x06060f, bot:0x10101e, amb:0.13, sun:0.0,  moon:0.45, hs:0x0a0a1a, fog:0x0d0d1c, sc:0xe0e8ff },
  { h:24, top:0x04040e, bot:0x08091c, amb:0.12, sun:0.0,  moon:0.55, hs:0x0c0e22, fog:0x08091c, sc:0xe8eeff },
];

function sampleSky(hour){
  var lo=SKY_KEYS[0], hi=SKY_KEYS[SKY_KEYS.length-1];
  for(var i=0;i<SKY_KEYS.length-1;i++){
    if(hour>=SKY_KEYS[i].h && hour<=SKY_KEYS[i+1].h){ lo=SKY_KEYS[i]; hi=SKY_KEYS[i+1]; break; }
  }
  var t=(lo.h===hi.h)?0:(hour-lo.h)/(hi.h-lo.h);
  var starA=0;
  if(hour<6)       starA=0.6+0.3*(1-hour/6);
  else if(hour<8)  starA=0.6*(1-(hour-6)/2);
  else if(hour<18) starA=0;
  else if(hour<20) starA=0.4*(hour-18)/2;
  else             starA=0.4+0.5*(hour-20)/4;
  return {
    top:  lerpColor(lo.top, hi.top, t),
    bot:  lerpColor(lo.bot, hi.bot, t),
    amb:  lo.amb+(hi.amb-lo.amb)*t,
    sun:  lo.sun+(hi.sun-lo.sun)*t,
    moon: lo.moon+(hi.moon-lo.moon)*t,
    hs:   lerpColor(lo.hs, hi.hs, t),
    fog:  lerpColor(lo.fog, hi.fog, t),
    sc:   lerpColor(lo.sc, hi.sc, t),
    stars:Math.max(0,Math.min(1,starA))
  };
}

function drawSky(){
  var sc=$e('sky-canvas');
  if(!sc) return;
  var ctx=sc.getContext('2d');
  var W=sc.width||window.innerWidth, H=sc.height||window.innerHeight;
  var s=sampleSky(cfg.tod);
  var topRGB=hexToRGB(s.top), botRGB=hexToRGB(s.bot);
  var grd=ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0, RGBToCSS(topRGB[0],topRGB[1],topRGB[2]));
  grd.addColorStop(1, RGBToCSS(botRGB[0],botRGB[1],botRGB[2]));
  ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

  if(s.stars>0.01){
    var starRng=PRNG(777);
    for(var i=0;i<500;i++){
      var sx=starRng()*W, sy=starRng()*H*0.72;
      var brightness=0.5+starRng()*0.5;
      var sr=0.4+starRng()*1.0;
      var alpha=s.stars*brightness;
      ctx.fillStyle='rgba(220,230,255,'+alpha.toFixed(3)+')';
      ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
    }
  }

  var sunAngle  = Math.max(0, Math.min(Math.PI, ((cfg.tod - 6) / 12) * Math.PI));
  var moonAngle = Math.max(0, Math.min(Math.PI, ((cfg.tod - 18 + 24) % 24 / 12) * Math.PI));

  var horizY = H * 0.78;
  var arcRX2  = W * 0.42;
  var arcRY2  = H * 0.75;

  function arcPos(angle){
    return {
      x: W*0.5 + arcRX2 * Math.cos(Math.PI - angle),
      y: horizY  - arcRY2 * Math.sin(angle)
    };
  }

  var sunPos  = arcPos(sunAngle);
  var moonPos = arcPos(moonAngle);

  if(cfg.tod>=5.5 && cfg.tod<=18.5){
    var sunCol=hexToRGB(s.sc);
    var grd2=ctx.createRadialGradient(sunPos.x,sunPos.y,0,sunPos.x,sunPos.y,48);
    grd2.addColorStop(0,'rgba('+sunCol[0]+','+sunCol[1]+','+sunCol[2]+',0.85)');
    grd2.addColorStop(0.25,'rgba('+sunCol[0]+','+sunCol[1]+','+sunCol[2]+',0.25)');
    grd2.addColorStop(1,'rgba('+sunCol[0]+','+sunCol[1]+','+sunCol[2]+',0)');
    ctx.fillStyle=grd2; ctx.beginPath(); ctx.arc(sunPos.x,sunPos.y,48,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgb('+sunCol[0]+','+sunCol[1]+','+sunCol[2]+')';
    ctx.beginPath(); ctx.arc(sunPos.x,sunPos.y,15,0,Math.PI*2); ctx.fill();
  }

  if(cfg.tod<6 || cfg.tod>18){
    var moonAlpha=Math.min(1, s.stars*1.5+0.3);
    ctx.fillStyle='rgba(200,215,245,'+Math.min(1,moonAlpha*0.4)+')';
    ctx.beginPath(); ctx.arc(moonPos.x,moonPos.y,28,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(215,225,248,'+moonAlpha+')';
    ctx.beginPath(); ctx.arc(moonPos.x,moonPos.y,11,0,Math.PI*2); ctx.fill();
  }
}

function applyTOD(){
  var s=sampleSky(cfg.tod);
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var cx=CHUNK/2, cz=CHUNK/2;

  var sunAngle3d = Math.max(0, Math.min(Math.PI, ((cfg.tod-6)/12)*Math.PI));
  var sunDist=800;
  sunLight.position.set(
    cx - sunDist*Math.cos(sunAngle3d),
    Math.max(20, sunDist*Math.sin(sunAngle3d)),
    cz + sunDist*0.15
  );
  sunLight.intensity = s.sun;
  var sc=hexToRGB(s.sc);
  sunLight.color.setRGB(sc[0]/255, sc[1]/255, sc[2]/255);

  var moonAngle3d = sunAngle3d + Math.PI;
  moonLight.position.set(
    cx - sunDist*Math.cos(moonAngle3d),
    Math.max(20, sunDist*Math.sin(moonAngle3d)),
    cz + sunDist*0.15
  );
  moonLight.intensity = s.moon;

  ambLight.intensity = s.amb;

  var hs=hexToRGB(s.hs);
  hemiLight.color.setRGB(hs[0]/255, hs[1]/255, hs[2]/255);
  hemiLight.groundColor.setHex(s.sun>0.1 ? 0x3e6e30 : 0x1a1a30);
  hemiLight.intensity = Math.max(0.08, s.amb*1.0);

  var fc=hexToRGB(s.fog);
  scene.fog.color.setRGB(fc[0]/255, fc[1]/255, fc[2]/255);

  drawSky();
  drawTODArc();
}

function drawTODArc(){
  var arc=$e('tod-arc'); if(!arc) return;
  var ctx=arc.getContext('2d'), W=arc.width, H=arc.height;
  ctx.clearRect(0,0,W,H);
  var grd=ctx.createLinearGradient(0,0,W,0);
  grd.addColorStop(0,'#04040e'); grd.addColorStop(0.22,'#d4602a');
  grd.addColorStop(0.26,'#ffa040'); grd.addColorStop(0.5,'#5fa8d8');
  grd.addColorStop(0.74,'#f08030'); grd.addColorStop(0.78,'#130a20');
  grd.addColorStop(1,'#04040e');
  ctx.fillStyle=grd; ctx.fillRect(0,4,W,H-10);
  ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.font='7px monospace'; ctx.textAlign='center';
  [0,6,12,18,24].forEach(function(h){ ctx.fillText(h+'h',h/24*W,H-1); });
  var px=cfg.tod/24*W;
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(px-1,2,2,H-12);
  var isDay=(cfg.tod>=5.5&&cfg.tod<=18.5);
  ctx.fillStyle=isDay?'#ffee66':'#c8d8f0';
  ctx.beginPath(); ctx.arc(px,H/2-5,4,0,Math.PI*2); ctx.fill();
}

/* =====================================================
   FLAT MINECRAFT-STYLE CLOUD SYSTEM
===================================================== */
var cloudGroup = new THREE.Group();
scene.add(cloudGroup);

function buildClouds(){
  while(cloudGroup.children.length){
    var c=cloudGroup.children[0];
    c.geometry.dispose();
    if(c.material) c.material.dispose();
    cloudGroup.remove(c);
  }
  cloudOffset=0;
  if(cfg.cloudAmt===0) return;

  var prng  = PRNG(999);
  var WORLD = CHUNK_SIZES[cfg.chunkIdx];
  var BSZ   = 4;
  var BH    = 4;

  for(var ci=0;ci<cfg.cloudAmt;ci++){
    var wx0 = prng()*WORLD;
    var wz0 = prng()*WORLD;
    var S   = Math.max(4, cfg.cloudSize|0);

    var GW = Math.ceil(S/BSZ)+2;
    var GH = Math.ceil(S/BSZ)+2;
    var grid = new Uint8Array(GW*GH);

    var sx=Math.floor(GW/2), sz=Math.floor(GH/2);
    grid[sx+sz*GW]=1;
    var filled=1;
    var target=Math.max(3, Math.floor(GW*GH*(0.28+prng()*0.30)));
    var frontier=[sx+sz*GW];
    var fi=0;
    var dirs=[1,-1,GW,-GW];
    while(filled<target && fi<frontier.length){
      var pick=fi+Math.floor(prng()*(frontier.length-fi));
      var tmp=frontier[fi]; frontier[fi]=frontier[pick]; frontier[pick]=tmp;
      var cur=frontier[fi++];
      var cx2=cur%GW, cz2=Math.floor(cur/GW);
      var ds=dirs.slice();
      for(var di=3;di>0;di--){ var dj=Math.floor(prng()*(di+1)); var dt2=ds[di]; ds[di]=ds[dj]; ds[dj]=dt2; }
      for(var di2=0;di2<4;di2++){
        var ni=cur+ds[di2];
        var nx2=ni%GW, nz2=Math.floor(ni/GW);
        if(ni>=0 && ni<GW*GH && nz2>=0 && nz2<GH && nx2>=0 && nx2<GW && !grid[ni]){
          var dist=Math.abs(nx2-sx)+Math.abs(nz2-sz);
          if(prng()<0.85-dist/(GW*0.5)*0.2){
            grid[ni]=1; filled++;
            frontier.push(ni);
          }
        }
      }
    }

    var positions=[], normals=[], indices=[];
    var vi=0;

    for(var gz=0;gz<GH;gz++){
      for(var gx=0;gx<GW;gx++){
        if(!grid[gx+gz*GW]) continue;
        var lx = (gx - GW/2) * BSZ;
        var ly = 0;
        var lz = (gz - GH/2) * BSZ;
        var B=BSZ, H2=BH;

        function quad(ax,ay,az, bx,by,bz, cx3,cy3,cz3, dx2,dy2,dz2, nx3,ny3,nz3){
          positions.push(ax,ay,az, bx,by,bz, cx3,cy3,cz3, dx2,dy2,dz2);
          normals.push(nx3,ny3,nz3, nx3,ny3,nz3, nx3,ny3,nz3, nx3,ny3,nz3);
          indices.push(vi,vi+1,vi+2, vi,vi+2,vi+3);
          vi+=4;
        }

        quad(lx,ly+H2,lz, lx+B,ly+H2,lz, lx+B,ly+H2,lz+B, lx,ly+H2,lz+B, 0,1,0);
        quad(lx,ly,lz+B, lx+B,ly,lz+B, lx+B,ly,lz, lx,ly,lz, 0,-1,0);
        if(!(gx+1<GW && grid[(gx+1)+gz*GW]))
          quad(lx+B,ly,lz+B, lx+B,ly,lz, lx+B,ly+H2,lz, lx+B,ly+H2,lz+B, 1,0,0);
        if(!(gx>0 && grid[(gx-1)+gz*GW]))
          quad(lx,ly,lz, lx,ly,lz+B, lx,ly+H2,lz+B, lx,ly+H2,lz, -1,0,0);
        if(!(gz>0 && grid[gx+(gz-1)*GW]))
          quad(lx+B,ly,lz, lx,ly,lz, lx,ly+H2,lz, lx+B,ly+H2,lz, 0,0,-1);
        if(!(gz+1<GH && grid[gx+(gz+1)*GW]))
          quad(lx,ly,lz+B, lx+B,ly,lz+B, lx+B,ly+H2,lz+B, lx,ly+H2,lz+B, 0,0,1);
      }
    }

    if(positions.length===0) continue;
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,3));
    geo.setIndex(indices);

    var mat=new THREE.MeshLambertMaterial({
      color:0xffffff, transparent:true, opacity:cfg.cloudOpa,
      depthWrite:false, side:THREE.FrontSide
    });
    // Classic 0.8 upload: authentic clouds.png on the cloud layer
    if(cfg.texturePack==='classic08' && classicCloudTex){
      mat.map=classicCloudTex; mat.needsUpdate=true;
    }

    var mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(wx0, cfg.cloudH, wz0);
    mesh.userData.startX=wx0;
    cloudGroup.add(mesh);
  }
}

function updateCloudOpacity(){
  cloudGroup.children.forEach(function(m){ if(m.material) m.material.opacity=cfg.cloudOpa; });
}

var cloudOffset=0;
var lastCloudTime=performance.now();

/* =====================================================
   GAME STATE
===================================================== */
var keys = {};
var mouse = {x:0,y:0,buttons:0,down:false};
var isLocked = false;
var lastFrameTime = performance.now();
var fps = 0, fpsAccum=0, fpsFrames=0, fpsLast=0;
var tileGroupsMap = {};
var dirtyTilesSet = new Set();
/* Chunks & rebuild benchmark state (declared up top: animate() runs once before bottom-of-file code) */
var bench={frames:0, frameMsAvg:16.6, lastFrameT:0, rebuilds:0, rebuildMsTotal:0, rebuildMsAvg:0, rebuildMsMax:0, lastMs:0, lastKey:'', tris:0, verts:0, tilesTotal:0, pendingPeak:0, benchRes:'--'};
var tileStatsMap={};
var benchUiAcc=0;
var chunkBorderGroup=null;
var flashGroup=null;
var flashes=[];
/* Pre-load perf gate data (up top: showPerfGate runs at init, before bottom-of-file code) */
var PRESETS={
  potato:{label:'Potato', sub:'64px world', chunkIdx:2, maxRebuilds:2, pixelRatio:1, shadows:false, shadowSize:1024, clouds:2, desc:'64×64 world, no shadows, min pixels. For weak iGPUs, SW renderers, ≤2 cores.'},
  laptop:{label:'Laptop', sub:'128px world', chunkIdx:4, maxRebuilds:4, pixelRatio:1.5, shadows:true, shadowSize:1024, clouds:4, desc:'128×128 world, small shadows. For typical laptops / integrated graphics.'},
  gaming:{label:'Gaming', sub:'256px world', chunkIdx:5, maxRebuilds:4, pixelRatio:2, shadows:true, shadowSize:2048, clouds:5, desc:'Full 256×256 world, full shadows. For discrete GPUs / fast desktops.'},
  beast:{label:'Beast', sub:'512px world', chunkIdx:6, maxRebuilds:8, pixelRatio:2, shadows:true, shadowSize:2048, clouds:7, desc:'Huge 512×512 world, 8 rebuilds/frame. For high-end GPUs only.'},
};
var PRESET_ORDER=['potato','laptop','gaming','beast'];
var perfProbe=null, perfSpecs=null, perfPick='laptop', perfPlaying=false;
function isBlockSolid(type){
  if(!type) return false;
  if(type==='water') return false;
  if(type.indexOf('leaves')===0) return true;
  return true;
}

function AABB(x0,y0,z0,x1,y1,z1){
  return {x0:x0,y0:y0,z0:z0,x1:x1,y1:y1,z1:z1};
}
function aabbFromSize(px,py,pz,w,h,d){
  return AABB(px-w/2, py, pz-d/2, px+w/2, py+h, pz+d/2);
}
function blocksInAABB(a){
  var minX=Math.floor(a.x0), maxX=Math.ceil(a.x1)-1;
  var minY=Math.floor(a.y0), maxY=Math.ceil(a.y1)-1;
  var minZ=Math.floor(a.z0), maxZ=Math.ceil(a.z1)-1;
  var list=[];
  for(var y=minY;y<=maxY;y++){
    for(var x=minX;x<=maxX;x++){
      for(var z=minZ;z<=maxZ;z++){
        list.push([x,y,z]);
      }
    }
  }
  return list;
}
function G(x,y,z){
  if(getBlockGlobal) return getBlockGlobal(x,y,z);
  return null;
}
function isSolidAt(x,y,z){
  return isBlockSolid(G(x,y,z));
}

var maxRebuildsBudget = 4;
var rebuildAdaptive = true;
var lastRebuildTime = performance.now();

var player = {
  pos: [0,80,0],
  vel: [0,0,0],
  yaw: 0,
  pitch: 0,
  size: [0.6, 1.8, 0.6],
  onGround: false,
  inWater: false,
  eyeHeight: 1.62,
};

var highlightMesh = null;
/* combat cooldown + sprint state */
var lastAttackT=0, lastHitDmg=0, sprintDrain=0;
function attackCdMs(){ var st=selectedStack(); return (st&&ITEMS[st.id]&&ITEMS[st.id].dmg)?600:350; }
function attackCdProg(){
  if(typeof performance==='undefined') return 1;
  return Math.min((performance.now()-lastAttackT)/attackCdMs(),1);
}
function updateCdUI(){
  var f=$e('cd-fill');
  if(f) f.style.width=Math.round(attackCdProg()*100)+'%';
}
var inv = {hot:[null,null,null,null,null,null,null,null,null], main:[]};
for(var _mi=0;_mi<27;_mi++) inv.main.push(null);
var selectedBlockIndex = 0;
var hotbarBlocks = ['grass', 'dirt', 'stone', 'sand', 'log', 'leaves:leavesOak', 'leaves:leavesPine', 'snow', 'deep'];
var blockHighlightGeo = null;

function vec3(x,y,z){ return [x,y,z]; }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }


/* =====================================================
   ORBIT CONTROLS
===================================================== */
var orb={theta:-0.35,phi:0.80,radius:130,target:new THREE.Vector3(32,10,32),mx:0,my:0,ldown:false,rdown:false,touchActive:false};
cv.addEventListener('mousedown',function(e){ if(typeof isLocked!=='undefined' && isLocked) return; if(e.button===0) orb.ldown=true; if(e.button===2) orb.rdown=true; orb.mx=e.clientX; orb.my=e.clientY; });
cv.addEventListener('contextmenu',function(e){ e.preventDefault(); });
window.addEventListener('mouseup',function(){ orb.ldown=orb.rdown=false; });
window.addEventListener('mousemove',function(e){
  var dx=e.clientX-orb.mx, dy=e.clientY-orb.my; orb.mx=e.clientX; orb.my=e.clientY;
  if(orb.ldown && !(typeof isLocked!=="undefined" && isLocked)){ cfg.autoRotate=false; var cb=$e('cb-autorotate'); if(cb) cb.checked=false; orb.theta-=dx*0.005; orb.phi=Math.max(0.06,Math.min(Math.PI/2-0.04,orb.phi-dy*0.005)); }
  if(orb.rdown){ var r=new THREE.Vector3(-Math.cos(orb.theta),0,Math.sin(orb.theta)); orb.target.addScaledVector(r,dx*0.14); orb.target.y=Math.max(-2,Math.min(200,orb.target.y-dy*0.14)); }
});
cv.addEventListener('wheel',function(e){ if(typeof isLocked!=='undefined' && isLocked) return; orb.radius=Math.max(12,Math.min(700,orb.radius+e.deltaY*0.18)); },{passive:true});
var lt=[];
cv.addEventListener('touchstart',function(e){ orb.touchActive=true; lt=Array.from(e.touches); },{passive:true});
cv.addEventListener('touchend',function(e){ if(e.touches.length===0) orb.touchActive=false; },{passive:true});
cv.addEventListener('touchcancel',function(e){ if(e.touches.length===0) orb.touchActive=false; },{passive:true});
cv.addEventListener('touchmove',function(e){
  if(e.touches.length===1 && lt.length>=1){ cfg.autoRotate=false; var cb=$e('cb-autorotate'); if(cb) cb.checked=false; orb.theta-=(e.touches[0].clientX-lt[0].clientX)*0.006; orb.phi=Math.max(0.06,Math.min(Math.PI/2-0.04,orb.phi-(e.touches[0].clientY-lt[0].clientY)*0.006)); }
  else if(e.touches.length===2 && lt.length>=2){ var d0=Math.hypot(lt[0].clientX-lt[1].clientX,lt[0].clientY-lt[1].clientY); var d1=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); orb.radius=Math.max(12,Math.min(700,orb.radius-(d1-d0)*0.3)); }
  lt=Array.from(e.touches);
},{passive:true});

/* =====================================================
   GENERATE
===================================================== */
var worldGroup = null;
var renderCancelToken = {id:0};
var colMapGlobal=null, typeNamesGlobal=[], typeIdsGlobal=null, getBlockGlobal=null;

function setProgress(p,msg){ $e('bar').style.width=p+'%'; if(msg) $e('load-status').textContent=msg; }

async function generate(seed, opts){
  opts=opts||{};
  renderCancelToken.id++;
  var myToken = renderCancelToken.id;
  var skipLoading = opts.skipLoading;

  var loading=$e('loading');
  if(!skipLoading){ loading.style.opacity='1'; loading.style.pointerEvents='all'; }
  $e('render-toast').style.display='none';

  $e('hud-seed').textContent=seed;
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  $e('hud-size').textContent=CHUNK; $e('hud-size2').textContent=CHUNK;

  setProgress(0,'BUILDING TEXTURES...'); await sleep(skipLoading?0:20);
  matCache={}; waterAnim=null;
  if(cfg.texturePack==='vanilla'){
    setProgress(5,'LOADING VANILLA PACK...');
    try{ await loadVanillaPack(); }
    catch(e){ console.warn('[texpack]',e); buildTextures(); var bi=$e('block-info'); if(bi) bi.textContent='Vanilla pack failed to load — procedural fallback'; }
  } else if(cfg.texturePack==='classic08'){
    setProgress(5,'LOADING CLASSIC 0.8 PACK...');
    buildTextures();
    try{ await loadClassicPack(); }
    catch(e){ console.warn('[texpack]',e); var bi2=$e('block-info'); if(bi2) bi2.textContent='Classic 0.8 pack failed to load — procedural fallback'; }
  } else buildTextures();

  setProgress(15,'GENERATING WORLD...'); await sleep(skipLoading?0:10);
  var result = genWorld(seed);
  var colMap=result.colMap, typeNames=result.typeNames;
  colMapGlobal=colMap; typeNamesGlobal=typeNames; typeIdsGlobal=(function(){ /* rebuild map from names */ var m={}; for(var i=0;i<typeNames.length;i++) m[typeNames[i]]=i; return m; })();
  var getBlock=makeLookup(colMap,typeNames,CHUNK);
  getBlockGlobal=getBlock;

  if(worldGroup){ scene.remove(worldGroup); worldGroup.traverse(function(o){ if(o.geometry) o.geometry.dispose(); }); }
  worldGroup = new THREE.Group();
  scene.add(worldGroup);
  tileGroupsMap = {};
  dirtyTilesSet.clear();
  resetBench();
  clearFlashes();
  editLog={}; furnaces={}; clearDrops(); dead=false; health=20; hunger=20;
  var ds=$e('death-screen'); if(ds) ds.classList.remove('open');

  orb.target.set(CHUNK/2, cfg.waterLvl+4, CHUNK/2);
  orb.radius = CHUNK*1.6;

  var tiles=[];
  for(var tz=0;tz<CHUNK;tz+=TILE) for(var tx=0;tx<CHUNK;tx+=TILE){
    tiles.push({tx:tx, tz:tz, tw:Math.min(TILE,CHUNK-tx), th:Math.min(TILE,CHUNK-tz)});
  }
  var cx=CHUNK/2, cz=CHUNK/2;
  tiles.sort(function(a,b){
    var da=Math.pow(a.tx+a.tw/2-cx,2)+Math.pow(a.tz+a.th/2-cz,2);
    var db=Math.pow(b.tx+b.tw/2-cx,2)+Math.pow(b.tz+b.th/2-cz,2);
    return da-db;
  });

  setProgress(40,'MESHING CENTRE TILE...'); await sleep(skipLoading?0:5);

  var t0=tiles[0];
  var genT0=(typeof performance!=='undefined')?performance.now():0;
  var m0=buildTileMesh(colMap,typeNames,getBlock,CHUNK,t0.tx,t0.tz,t0.tw,t0.th);
  worldGroup.add(m0);
  tileGroupsMap[t0.tx+','+t0.tz] = m0;
  recordTileStat(t0.tx+','+t0.tz, m0, (typeof performance!=='undefined')?performance.now()-genT0:0);
  // spawn player near center
  spawnPlayer(); try{ spawnMobs(); addMobMeshes(); }catch(e){}

  setProgress(100,'READY'); await sleep(skipLoading?20:120);
  if(!skipLoading){ loading.style.opacity='0'; loading.style.pointerEvents='none'; }

  buildClouds();
  applyTOD();

  if(tiles.length>1){
    var toast=$e('render-toast'), tbar=$e('toast-bar'), ttxt=$e('toast-text');
    toast.style.display='block'; toast.style.opacity='1';
    for(var ti=1;ti<tiles.length;ti++){
      if(renderCancelToken.id!==myToken){ toast.style.display='none'; return; }
      var t=tiles[ti];
      var genT1=(typeof performance!=='undefined')?performance.now():0;
      var mesh=buildTileMesh(colMap,typeNames,getBlock,CHUNK,t.tx,t.tz,t.tw,t.th);
      worldGroup.add(mesh);
      tileGroupsMap[t.tx+','+t.tz] = mesh;
      recordTileStat(t.tx+','+t.tz, mesh, (typeof performance!=='undefined')?performance.now()-genT1:0);
      var pct=Math.round((ti+1)/tiles.length*100);
      ttxt.textContent='STREAMING  '+pct+'%  ('+( ti+1)+' / '+tiles.length+' tiles)';
      tbar.style.width=pct+'%';
      await sleep(0);
    }
    toast.style.transition='opacity 0.6s';
    toast.style.opacity='0';
    await sleep(650);
    toast.style.display='none'; toast.style.opacity='1'; toast.style.transition='';
  }

  drawNoisePreview();
  if(pendingLoad){ try{ applyLoad(pendingLoad); }catch(e){ console.error(e); } pendingLoad=null; }
}

/* =====================================================
   NOISE PREVIEW
===================================================== */
function drawNoisePreview(){
  var canvas=$e('noise-preview'), ctx=canvas.getContext('2d');
  var W=canvas.width, H=canvas.height;
  var p1=makeNoise(currentSeed), p2=makeNoise(currentSeed+7331), p3=makeNoise(currentSeed+31337);
  var img=ctx.createImageData(W,H);
  var MAXH=cfg.maxHeight, WATER=cfg.waterLvl;
  var snowLine=cfg.snowPct/100, treelineN=cfg.treeline/100, pinelineN=cfg.pineline/100;
  for(var py=0;py<H;py++) for(var px=0;px<W;px++){
    var nx=px/W, nz=py/H;
    var base  =fbm(p1,nx*cfg.scale+10,nz*cfg.scale+7,cfg.oct,cfg.lac,cfg.gain);
    var detail=fbm(p2,nx*cfg.dscale+30,nz*cfg.dscale+20,Math.min(4,cfg.oct),2.0,0.5)*cfg.dmix;
    var ridge =(1-Math.abs(fbm(p3,nx*cfg.rscale+60,nz*cfg.rscale+50,3,2.0,0.5)*2-1));
    ridge=Math.pow(ridge,2)*cfg.rmix;
    var h=base*cfg.basemix+detail+ridge;
    h=Math.pow(Math.max(0,h),cfg.exp); h=Math.max(0,Math.min(1,h));
    var wl=WATER/MAXH;
    var r,g,b;
    if(h<wl-0.01){r=45;g=100;b=200;}
    else if(h<wl+0.012){r=210;g=185;b=130;}
    else if(h>snowLine){r=230;g=240;b=245;}
    else if(h>treelineN){r=Math.floor(80+h*60);g=Math.floor(110+h*70);b=Math.floor(80+h*50);}
    else if(h>pinelineN){r=Math.floor(30+h*40);g=Math.floor(80+h*60);b=Math.floor(30+h*30);}
    else{var t=h;r=Math.floor(35+t*55);g=Math.floor(100+t*80);b=Math.floor(18+t*28);}
    var idx=(py*W+px)*4; img.data[idx]=r; img.data[idx+1]=g; img.data[idx+2]=b; img.data[idx+3]=255;
  }
  ctx.putImageData(img,0,0);
}

/* =====================================================
   ZONE VISUALISER
===================================================== */
function updateZoneVis(){
  var snow  = cfg.snowPct;
  var tree  = Math.min(cfg.treeline, cfg.snowPct-1);
  var pine  = Math.min(cfg.pineline, cfg.treeline-1);

  var snowW  = 100 - snow;
  var sparseW= snow - tree;
  var pineW  = tree - pine;
  var allW   = pine;
  var sandW  = Math.max(2, 8);

  var total = snowW+sparseW+pineW+allW+sandW;
  function pct(v){ return (v/total*100).toFixed(1)+'%'; }

  $e('zb-snow').style.width   = pct(snowW);
  $e('zb-sparse').style.width = pct(sparseW);
  $e('zb-pine').style.width   = pct(pineW);
  $e('zb-all').style.width    = pct(allW);
  $e('zb-sand').style.width   = pct(sandW);
}

/* =====================================================
   SIDEBAR WIRING
===================================================== */
function updateSliderGrad(el){
  var mn=parseFloat(el.min), mx=parseFloat(el.max), v=parseFloat(el.value);
  el.style.setProperty('--pct',((v-mn)/(mx-mn)*100).toFixed(1)+'%');
}
function bindSlider(id,prop,fmt,extra){
  var el=$e(id), vEl=$e('v-'+id.replace('s-',''));
  el.addEventListener('input',function(){
    var v=parseFloat(el.value); cfg[prop]=v;
    if(vEl) vEl.textContent=fmt?fmt(v):v;
    updateSliderGrad(el); if(extra) extra(v);
  });
  updateSliderGrad(el);
}

var noiseDebounce;
function scheduleNoise(){ clearTimeout(noiseDebounce); noiseDebounce=setTimeout(drawNoisePreview,120); }
function scheduleZoneAndNoise(){ updateZoneVis(); scheduleNoise(); }

var treeRegenDebounce;
function scheduleTreeRegenerate(){
  clearTimeout(treeRegenDebounce);
  treeRegenDebounce=setTimeout(function(){
    var v=parseInt($e('s-seed').value); if(!isNaN(v) && v>=0) currentSeed=v;
    generate(currentSeed, {skipLoading:true});
  }, 400);
}

bindSlider('s-water',  'waterLvl', null, scheduleZoneAndNoise);
bindSlider('s-maxh',   'maxHeight',null, scheduleZoneAndNoise);
bindSlider('s-scale',  'scale',    function(v){return v.toFixed(1);}, scheduleNoise);
bindSlider('s-oct',    'oct',      null, scheduleNoise);
bindSlider('s-lac',    'lac',      function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-gain',   'gain',     function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-dscale', 'dscale',   function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-dmix',   'dmix',     function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-rscale', 'rscale',   function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-rmix',   'rmix',     function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-basemix','basemix',  function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-exp',    'exp',      function(v){return v.toFixed(2);}, scheduleNoise);
bindSlider('s-snow',   'snowPct',  null, function(){ scheduleZoneAndNoise(); scheduleTreeRegenerate(); });
bindSlider('s-treeline','treeline',null, function(){ scheduleZoneAndNoise(); scheduleTreeRegenerate(); });
bindSlider('s-pineline','pineline',null, function(){ scheduleZoneAndNoise(); scheduleTreeRegenerate(); });
bindSlider('s-sand',   'sandPct',  null, function(){ scheduleZoneAndNoise(); scheduleTreeRegenerate(); });
bindSlider('s-tspacing','tSpacing',null, scheduleTreeRegenerate);
bindSlider('s-sparsedens','sparseDens',null, scheduleTreeRegenerate);

bindSlider('s-cloudh',     'cloudH',     null, buildClouds);
bindSlider('s-cloudspeed', 'cloudSpeed', function(v){return v.toFixed(1);});
bindSlider('s-cloudamt',   'cloudAmt',   null, buildClouds);
bindSlider('s-cloudsize',  'cloudSize',  null, buildClouds);
bindSlider('s-cloudopa',   'cloudOpa',   function(v){return v.toFixed(2);}, updateCloudOpacity);

(function(){
  var el=$e('s-tod'), vEl=$e('v-tod');
  if(!el) return;
  el.addEventListener('input',function(){
    cfg.tod=parseFloat(el.value);
    vEl.textContent=cfg.tod.toFixed(1);
    updateSliderGrad(el);
    applyTOD();
  });
  updateSliderGrad(el);
})();

var treeSliderMap={oak:'treeOak',pine:'treePine',autumn:'treeAutumn',mystic:'treeMystic',golden:'treeGolden',tropical:'treeTropical'};
Object.keys(treeSliderMap).forEach(function(k){
  var el=$e('t-'+k), vEl=$e('tv-'+k);
  el.addEventListener('input',function(){ cfg[treeSliderMap[k]]=parseInt(el.value); vEl.textContent=el.value; updateSliderGrad(el); scheduleTreeRegenerate(); });
  updateSliderGrad(el);
});

document.querySelectorAll('.pill').forEach(function(p){
  p.addEventListener('click',function(){
    cfg.noiseType=this.dataset.type;
    document.querySelectorAll('.pill').forEach(function(pp){ pp.classList.remove('active'); });
    this.classList.add('active');
    scheduleNoise();
  });
});

document.querySelectorAll('.sz-badge').forEach(function(b){
  b.addEventListener('click',function(){
    cfg.chunkIdx=parseInt(this.dataset.idx);
    document.querySelectorAll('.sz-badge').forEach(function(bb){ bb.classList.remove('active'); });
    this.classList.add('active');
  });
});

$e('cb-water').addEventListener('change',function(){ cfg.showWater=this.checked; });
var packSel=$e('sel-pack');
if(packSel) packSel.addEventListener('change',function(){ cfg.texturePack=this.value; });
$e('cb-wireframe').addEventListener('change',function(){
  cfg.wireframe=this.checked;
  if(worldGroup) worldGroup.traverse(function(o){ if(o.material) o.material.wireframe=cfg.wireframe; });
});
$e('cb-autorotate').addEventListener('change',function(){ cfg.autoRotate=this.checked; });
$e('cb-piano').addEventListener('change',function(){ cfg.piano=this.checked; if(this.checked){ try{sf2Ensure();}catch(e){} } });
$e('cb-music').addEventListener('change',function(){ cfg.music=this.checked; ensureMusic(); });
  var hbsel=$e('hotbar-style'); if(hbsel){ hbsel.addEventListener('change',function(){ cfg.hotbarStyle=this.value; var hb=$e('hotbar'); if(hb){ hb.className='hotbar-style-'+cfg.hotbarStyle; }}); }
  var radapt=$e('rebuild-adaptive'); if(radapt){ radapt.addEventListener('change',function(){ cfg.adaptiveRebuild=this.checked; rebuildAdaptive=this.checked; }); }
  var smax=$e('s-maxrebuild'); if(smax){ smax.addEventListener('input',function(){ cfg.maxRebuildsPerFrame=parseInt(this.value); maxRebuildsBudget=cfg.maxRebuildsPerFrame; var v=$e('v-maxrebuild'); if(v) v.textContent=this.value; updateSliderGrad(this); }); }

$e('s-seed').addEventListener('input',function(){ var v=parseInt(this.value); if(!isNaN(v) && v>=0) currentSeed=v; });

$e('btn-apply').addEventListener('click',function(){ var v=parseInt($e('s-seed').value); if(!isNaN(v) && v>=0) currentSeed=v; generate(currentSeed); });
$e('btn-rand').addEventListener('click',function(){ currentSeed=Math.floor(Math.random()*9999999); $e('s-seed').value=currentSeed; generate(currentSeed); });
$e('btn-reset').addEventListener('click',function(){
  Object.assign(cfg,DEFAULTS); currentSeed=9043158;
  var propMap={water:'waterLvl',maxh:'maxHeight',scale:'scale',oct:'oct',lac:'lac',gain:'gain',dscale:'dscale',dmix:'dmix',rscale:'rscale',rmix:'rmix',basemix:'basemix',exp:'exp',snow:'snowPct',treeline:'treeline',pineline:'pineline',sand:'sandPct',tspacing:'tSpacing',sparsedens:'sparseDens',cloudh:'cloudH',cloudspeed:'cloudSpeed',cloudamt:'cloudAmt',cloudsize:'cloudSize',cloudopa:'cloudOpa',tod:'tod'};
  Object.keys(propMap).forEach(function(k){
    var el=$e('s-'+k); if(!el) return;
    var prop=propMap[k]; el.value=cfg[prop];
    var vEl=$e('v-'+k); if(vEl) vEl.textContent=cfg[prop];
    updateSliderGrad(el);
  });
  Object.keys(treeSliderMap).forEach(function(k){
    var el=$e('t-'+k), vEl=$e('tv-'+k);
    el.value=cfg[treeSliderMap[k]]; vEl.textContent=el.value; updateSliderGrad(el);
  });
  document.querySelectorAll('.sz-badge').forEach(function(b){ b.classList.toggle('active',parseInt(b.dataset.idx)===cfg.chunkIdx); });
  document.querySelectorAll('.pill').forEach(function(p){ p.classList.toggle('active',p.dataset.type===cfg.noiseType); });
  $e('cb-water').checked=cfg.showWater; $e('cb-wireframe').checked=cfg.wireframe; $e('cb-autorotate').checked=cfg.autoRotate;
  $e('cb-piano').checked=cfg.piano; $e('cb-music').checked=cfg.music;
  var ps=$e('sel-pack'); if(ps) ps.value=cfg.texturePack;
  $e('s-seed').value=currentSeed;
  updateZoneVis();
  buildClouds();
  applyTOD();
  generate(currentSeed);
});

document.querySelectorAll('.sb-section-head').forEach(function(head){
  head.addEventListener('click',function(){
    var body=$e('sec-'+this.dataset.sec);
    var isOpen=body.classList.contains('open');
    body.classList.toggle('open',!isOpen);
    body.style.display=isOpen?'none':'block';
    this.classList.toggle('open',!isOpen);
  });
});

var sidebarOpen=true;
var sbtog=$e('sb-toggle');
sbtog.addEventListener('click',function(){
  sidebarOpen=!sidebarOpen;
  $e('sidebar').classList.toggle('collapsed',!sidebarOpen);
  sbtog.classList.toggle('collapsed',!sidebarOpen);
  sbtog.innerHTML=sidebarOpen?'&#x276E;':'&#x276F;';
  setTimeout(onResize,320);
});

(function(){
  var modal=$e('info-modal'), btn=$e('info-btn'), close=$e('modal-close'), list=$e('contributors-list');
  if(!modal||!btn) return;
  function renderContributors(){
    if(!list) return;
    var data=typeof CONTRIBUTORS_DATA!=='undefined'?CONTRIBUTORS_DATA:[];
    if(data.length===0){ list.innerHTML='<p class="text-dim">No contributors yet. Add yourself in contributors/contributors.js!</p>'; return; }
    list.innerHTML=data.map(function(c){
      var avatar=c.avatar||(c.github?('https://github.com/'+String(c.github).replace(/^https?:\/\/github\.com\//,'').replace(/\/.*$/,'')+'.png'):'');
      var avatarHtml=avatar
        ?'<img class="contributor-avatar" src="'+avatar+'" alt="'+String(c.name||'').replace(/"/g,'&quot;')+'" loading="lazy">'
        :'<div class="contributor-avatar placeholder">?</div>';
      var gh=c.github||'#';
      return '<div class="contributor-card">'+avatarHtml+
        '<div class="contributor-name">'+(c.name||'')+'</div>'+
        '<div class="contributor-title">'+(c.title||'')+'</div>'+
        '<div class="contributor-desc">'+(c.description||'')+'</div>'+
        '<a class="contributor-github" href="'+gh+'" target="_blank" rel="noopener">GitHub</a></div>';
    }).join('');
  }
  renderContributors();
  function openModal(){ modal.classList.add('open'); }
  function closeModal(){ modal.classList.remove('open'); }
  function toggleModal(){ modal.classList.toggle('open'); }
  btn.addEventListener('click',openModal);
  close.addEventListener('click',closeModal);
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown',function(e){ if(e.key==='i'||e.key==='I'){ e.preventDefault(); toggleModal(); } });
  document.querySelectorAll('.modal-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      document.querySelectorAll('.modal-tab').forEach(function(t){ t.classList.remove('active'); });
      document.querySelectorAll('.modal-pane').forEach(function(p){ p.classList.remove('active'); });
      this.classList.add('active');
      var pane=$e('tab-'+this.dataset.tab);
      if(pane) pane.classList.add('active');
    });
  });
})();

/* =====================================================
   INIT
===================================================== */
$e('s-seed').value=currentSeed;
updateZoneVis();
onResize();
applyTOD();
buildClouds();
var hb=$e('hotbar'); if(hb){ var hbs=$e('hotbar-style'); hb.className='hotbar-style-'+(cfg.hotbarStyle||(hbs&&hbs.value)||'cards'); } preloadVanillaIcons(); buildHotbar(); setupInput(); wireInvModal(); wireFurnaceModal(); wireSaveLoad(); wirePerfGate(); showPerfGate();

/* =====================================================
   RENDER LOOP
===================================================== */
function animate(){
  requestAnimationFrame(animate);
  var now=performance.now();
  var dt=Math.min(0.1,(now-lastCloudTime)/1000);
  lastCloudTime=now;

  // fps
  fpsFrames++;
  fpsAccum += dt*1000;
  if(now-fpsLast>500){ fps=Math.round(fpsFrames*1000/fpsAccum); fpsFrames=0; fpsAccum=0; fpsLast=now; var fe=$e('fps'); if(fe) fe.textContent='FPS: '+fps; }
  bench.frames++;
  bench.frameMsAvg += ((now-(bench.lastFrameT||now))-bench.frameMsAvg)*0.05;
  bench.lastFrameT = now;
  updateFlashes(dt);
  benchUiAcc+=dt;
  if(benchUiAcc>0.5){ benchUiAcc=0; updateBenchUI(); }

  if(isLocked){
    updatePlayer(dt);
    updateHighlight();
  }else{
    if(cfg.autoRotate && !orb.ldown && !orb.rdown && !orb.touchActive) orb.theta+=0.04*dt;
    camera.position.x=orb.target.x+orb.radius*Math.sin(orb.phi)*Math.sin(orb.theta);
    camera.position.y=orb.target.y+orb.radius*Math.cos(orb.phi);
    camera.position.z=orb.target.z+orb.radius*Math.sin(orb.phi)*Math.cos(orb.theta);
    camera.lookAt(orb.target);
    if(highlightMesh) highlightMesh.visible=false;
  }

  if(cfg.cloudSpeed>0 && cloudGroup.children.length>0){
    var WORLD=CHUNK_SIZES[cfg.chunkIdx];
    cloudOffset += cfg.cloudSpeed*dt*6;
    for(var ci=0;ci<cloudGroup.children.length;ci++){
      var cm=cloudGroup.children[ci];
      var wx=(cm.userData.startX + cloudOffset) % WORLD;
      if(wx<0) wx+=WORLD;
      cm.position.x=wx;
    }
  }

  processDirtyTiles(); try{ updateMobs(dt); }catch(e){}
  try{ tickWaterAnim(dt); }catch(e){}
  try{ gameTick(dt); }catch(e){ console.error(e); }
  renderer.render(scene,camera);
}
/* Authentic 0.8-alpha AABB clip (reference/.../phys/AABB.java, epsilon=0).
   Signature: clip<Axis>(blockBox, moverBox, delta) — method on the block,
   mover passed in. Y resolved first, then X, then Z (see Entity.move). */
var PHYS_EPSILON=0;
function clipXCollide(box, c, xa){
  if(c.y1>box.y0 && c.y0<box.y1){
    if(c.z1>box.z0 && c.z0<box.z1){
      var max;
      if(xa>0 && c.x1<=box.x0){ max=box.x0-c.x1-PHYS_EPSILON; if(max<xa) xa=max; }
      if(xa<0 && c.x0>=box.x1){ max=box.x1-c.x0+PHYS_EPSILON; if(max>xa) xa=max; }
      return xa;
    }
  }
  return xa;
}
function clipYCollide(box, c, ya){
  if(c.x1>box.x0 && c.x0<box.x1){
    if(c.z1>box.z0 && c.z0<box.z1){
      var max;
      if(ya>0 && c.y1<=box.y0){ max=box.y0-c.y1-PHYS_EPSILON; if(max<ya) ya=max; }
      if(ya<0 && c.y0>=box.y1){ max=box.y1-c.y0+PHYS_EPSILON; if(max>ya) ya=max; }
      return ya;
    }
  }
  return ya;
}
function clipZCollide(box, c, za){
  if(c.x1>box.x0 && c.x0<box.x1){
    if(c.y1>box.y0 && c.y0<box.y1){
      var max;
      if(za>0 && c.z1<=box.z0){ max=box.z0-c.z1-PHYS_EPSILON; if(max<za) za=max; }
      if(za<0 && c.z0>=box.z1){ max=box.z1-c.z0+PHYS_EPSILON; if(max>za) za=max; }
      return za;
    }
  }
  return za;
}
function blockAABB(x,y,z){ return AABB(x,y,z,x+1,y+1,z+1); }
function moveAxisX(a, dx){
  // Authentic 0.8: clip requested delta against every solid neighbour (epsilon 0),
  // then shift. Same result as face-snapping, exact on grazes/edges.
  var x0=Math.floor(a.x0+Math.min(0,dx))-1, x1=Math.ceil(a.x1+Math.max(0,dx))+1;
  for(var x=x0;x<=x1;x++)
    for(var y=Math.floor(a.y0);y<Math.ceil(a.y1);y++)
      for(var z=Math.floor(a.z0);z<Math.ceil(a.z1);z++)
        if(isSolidAt(x,y,z)) dx=clipXCollide(blockAABB(x,y,z),a,dx);
  var w=a.x1-a.x0;
  var na=AABB(a.x0+dx,a.y0,a.z0,a.x0+dx+w,a.y1,a.z1);
  return na;
}
function moveAxisY(a, dy){
  var y0=Math.floor(a.y0+Math.min(0,dy))-1, y1=Math.ceil(a.y1+Math.max(0,dy))+1;
  for(var y=y0;y<=y1;y++)
    for(var x=Math.floor(a.x0);x<Math.ceil(a.x1);x++)
      for(var z=Math.floor(a.z0);z<Math.ceil(a.z1);z++)
        if(isSolidAt(x,y,z)) dy=clipYCollide(blockAABB(x,y,z),a,dy);
  var h=a.y1-a.y0;
  return AABB(a.x0,a.y0+dy,a.z0,a.x1,a.y0+dy+h,a.z1);
}
function moveAxisZ(a, dz){
  var z0=Math.floor(a.z0+Math.min(0,dz))-1, z1=Math.ceil(a.z1+Math.max(0,dz))+1;
  for(var z=z0;z<=z1;z++)
    for(var x=Math.floor(a.x0);x<Math.ceil(a.x1);x++)
      for(var y=Math.floor(a.y0);y<Math.ceil(a.y1);y++)
        if(isSolidAt(x,y,z)) dz=clipZCollide(blockAABB(x,y,z),a,dz);
  var d=a.z1-a.z0;
  return AABB(a.x0,a.y0,a.z0+dz,a.x1,a.y1,a.z0+dz+d);
}

function moveAABB(a, dx,dy,dz){
  var x = moveAxisX(a,dx);
  var y = moveAxisY(x,dy);
  var z = moveAxisZ(y,dz);
  var ex0=a.x0+dx, ey0=a.y0+dy, ez0=a.z0+dz;
  return {aabb:z,
    collidedX: (dx!==0 && Math.abs(z.x0-ex0)>1e-9)?(dx>0?1:-1):0,
    collidedY: (dy!==0 && Math.abs(z.y0-ey0)>1e-9)?(dy>0?1:-1):0,
    collidedZ: (dz!==0 && Math.abs(z.z0-ez0)>1e-9)?(dz>0?1:-1):0};
}
function raycast(maxDist){
  maxDist = maxDist || 4.5;
  var px=player.pos[0], py=player.pos[1]+player.eyeHeight, pz=player.pos[2];
  var vx=-Math.sin(player.yaw)*Math.cos(player.pitch);
  var vy=Math.sin(player.pitch);
  var vz=-Math.cos(player.yaw)*Math.cos(player.pitch);
  var step=0.01;
  for(var t=0;t<maxDist;t+=step){
    var x=Math.floor(px+vx*t), y=Math.floor(py+vy*t), z=Math.floor(pz+vz*t);
    if(isSolidAt(x,y,z)){
      // compute face - simple: find which axis gave intersection by checking neighbors from previous
      var px2=px+vx*(t-step), py2=py+vy*(t-step), pz2=pz+vz*(t-step);
      var fx=Math.floor(px2), fy=Math.floor(py2), fz=Math.floor(pz2);
      var face='y+';
      // determine
      if(Math.floor(py+vy*t)>fy) face='y-';
      else if(Math.floor(py+vy*t)<fy) face='y+';
      else if(Math.floor(px+vx*t)>fx) face='x-';
      else if(Math.floor(px+vx*t)<fx) face='x+';
      else if(Math.floor(pz+vz*t)>fz) face='z-';
      else if(Math.floor(pz+vz*t)<fz) face='z+';
      return {hit:true,x:x,y:y,z:z,face:face,dist:t};
    }
  }
  return {hit:false};
}

function spawnPlayer(){
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var cx=CHUNK/2, cz=CHUNK/2;
  // find height
  var h=0;
  for(var y=cfg.maxHeight;y>=0;y--){
    if(isSolidAt(Math.floor(cx),y,Math.floor(cz))) { h=y+2; break; }
  }
  if(h<cfg.waterLvl+2) h=cfg.waterLvl+2;
  player.pos=[cx,h,cz];
  player.vel=[0,0,0];
  player.yaw=Math.PI*1.25;
  player.pitch=0;
  player.onGround=false;
  fallPeak=null; wasAir=false; sprintDrain=0;
}

function tileKeyFor(x,z){
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var tx=Math.floor(x/TILE)*TILE;
  var tz=Math.floor(z/TILE)*TILE;
  if(tx<0) tx=0; if(tz<0) tz=0;
  if(tx>=CHUNK) tx=(Math.floor((CHUNK-1)/TILE))*TILE;
  if(tz>=CHUNK) tz=(Math.floor((CHUNK-1)/TILE))*TILE;
  return tx+','+tz;
}
function markDirtyAt(x,z){
  var k=tileKeyFor(x,z);
  dirtyTilesSet.add(k);
}
function rebuildTile(k){
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var parts=k.split(',');
  var tx=parseInt(parts[0]), tz=parseInt(parts[1]);
  var key=k;
  var old=tileGroupsMap[key];
  if(old && old.parent===worldGroup){ worldGroup.remove(old); }
  // dispose geometries
  if(old){
    old.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
  }
  if(tileStatsMap[key]){ bench.tris-=tileStatsMap[key].tris; bench.verts-=tileStatsMap[key].verts; delete tileStatsMap[key]; }
  var tw=Math.min(TILE,CHUNK-tx), th=Math.min(TILE,CHUNK-tz);
  if(!colMapGlobal || !getBlockGlobal) return;
  var t0=(typeof performance!=='undefined')?performance.now():0;
  var mesh=buildTileMesh(colMapGlobal,typeNamesGlobal,getBlockGlobal,CHUNK,tx,tz,tw,th);
  var ms=(typeof performance!=='undefined')?performance.now()-t0:0;
  recordTileStat(key, mesh, ms);
  tileGroupsMap[key]=mesh;
  worldGroup.add(mesh);
  flashTile(tx,tz,tw,th);
}
function processDirtyTiles(){
  if(dirtyTilesSet.size===0) return;
  if(dirtyTilesSet.size>bench.pendingPeak) bench.pendingPeak=dirtyTilesSet.size;
  var budget = (cfg.maxRebuildsPerFrame!=null?cfg.maxRebuildsPerFrame:4); if(budget<0) budget=0;
  if(cfg.adaptiveRebuild!==false){
    var now=performance.now();
    var dtFrame = now - lastRebuildTime;
    if(dtFrame<16) budget = Math.max(1, budget);
    if(dtFrame>33) budget = Math.max(0, Math.floor(budget/2));
  }
  var count=0;
  for(var k of dirtyTilesSet){
    if(count>=budget && budget>=0) break;
    dirtyTilesSet.delete(k);
    rebuildTile(k);
    count++;
  }
}

function getColumn(x,z){
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  if(x<0||x>=CHUNK||z<0||z>=CHUNK) return null;
  if(!colMapGlobal) return null;
  return colMapGlobal[x+z*CHUNK];
}
function getTypeIdLocal(s){
  if(typeIdsGlobal && typeIdsGlobal[s]!=null) return typeIdsGlobal[s];
  if(typeNamesGlobal){ typeIdsGlobal[s]=typeNamesGlobal.length; return typeNamesGlobal.push(s)-1; }
  return 0;
}
var editLog={};
function logEdit(x,y,z,t){ var ks=Object.keys(editLog); if(ks.length>5000) delete editLog[ks[0]]; editLog[x+','+y+','+z]=t; }
function setBlock(x,y,z,type){
  var col=getColumn(x,z);
  if(!col) return;
  logEdit(x,y,z,type);
  for(var i=0;i<col.length;i+=2){
    if(col[i]===y){ col.splice(i,2); break; }
  }
  if(type){
    col.push(y, getTypeIdLocal(type));
    var pairs=[];
    for(var j=0;j<col.length;j+=2) pairs.push([col[j],col[j+1]]);
    pairs.sort(function(a,b){ return a[0]-b[0]; });
    col.length=0;
    for(var k=0;k<pairs.length;k++){ col.push(pairs[k][0],pairs[k][1]); }
  }
  markDirtyAt(x,z);
}

function updateHighlight(){
  var hit=raycast(4.5);
  var info=$e('block-info');
  if(!highlightMesh){
    var geo=new THREE.BoxGeometry(1.01,1.01,1.01);
    var mat=new THREE.LineBasicMaterial({color:0xffffff, linewidth:2, transparent:true, opacity:0.6});
    highlightMesh=new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat);
    scene.add(highlightMesh);
  }
  if(hit.hit){
    highlightMesh.visible=true;
    highlightMesh.position.set(hit.x+0.5, hit.y+0.5, hit.z+0.5);
    var t=G(hit.x,hit.y,hit.z);
    if(info) info.textContent = t+' @('+hit.x+','+hit.y+','+hit.z+')';
  }else{
    highlightMesh.visible=false;
    if(info) info.textContent='';
  }
}

function setupInput(){
  window.addEventListener('keydown', function(e){
    keys[e.code]=true;
    if(e.code==='Escape' && isLocked){
      document.exitPointerLock();
    }
    // number keys
    if(e.code.startsWith('Digit')){
      var n=parseInt(e.code.slice(5));
      if(n>=1 && n<=hotbarBlocks.length){ selectedBlockIndex=n-1; updateHotbar(); }
    }
  });
  window.addEventListener('keyup', function(e){ keys[e.code]=false; });
  cv.addEventListener('mousedown', function(e){
    if(!isLocked){
      cv.requestPointerLock();
      return;
    }
    if(e.button===0){ // break
      var hit=raycast(4.5); if(hit.hit){ setBlock(hit.x,hit.y,hit.z,null); }
    }else if(e.button===2){ // place
      var hit=raycast(4.5); if(hit.hit){
        var nx=hit.x, ny=hit.y, nz=hit.z;
        if(hit.face==='x+') nx=hit.x+1; if(hit.face==='x-') nx=hit.x-1;
        if(hit.face==='y+') ny=hit.y+1; if(hit.face==='y-') ny=hit.y-1;
        if(hit.face==='z+') nz=hit.z+1; if(hit.face==='z-') nz=hit.z-1;
        var b=hotbarBlocks[selectedBlockIndex]||'stone';
        setBlock(nx,ny,nz,b);
      }
    }
  });
  cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  cv.addEventListener('wheel', function(e){
    var d=e.deltaY>0?1:-1;
    selectedBlockIndex=(selectedBlockIndex+d+hotbarBlocks.length)%hotbarBlocks.length;
    updateHotbar();
  }, {passive:true});
  document.addEventListener('pointerlockchange', function(){
    isLocked = document.pointerLockElement===cv;
    cfg.autoRotate = !isLocked;
    var cb=$e('cb-autorotate'); if(cb) cb.checked=cfg.autoRotate;
  });
  document.addEventListener('mousemove', function(e){
    if(!isLocked) return;
    player.yaw -= e.movementX*0.002;
    player.pitch -= e.movementY*0.002;
    if(player.pitch>Math.PI/2.5) player.pitch=Math.PI/2.5;
    if(player.pitch<-Math.PI/2.5) player.pitch=-Math.PI/2.5;
  });
}

function makeSlotThumb(block){
  var T=32;
  var c=document.createElement('canvas'); c.width=c.height=T;
  var ctx=c.getContext('2d');
  // simple colored thumb based on block
  var map={grass:'#5d9e3f',dirt:'#8B5E3C',stone:'#888',sand:'#d4b483',log:'#6b4c2a',snow:'#eef4f7',deep:'#555',water:'#2d7dd2'};
  if(block && block.indexOf('leaves')===0){ ctx.fillStyle = block.indexOf('Autumn')!==-1 ? '#be371e' : block.indexOf('Mystic')!==-1 ? '#8c32d2' : block.indexOf('Golden')!==-1 ? '#d2aa14' : block.indexOf('Tropical')!==-1 ? '#1eaa78' : '#3f8c2f'; ctx.fillRect(0,0,T,T); ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.strokeRect(0,0,T,T); return c; }
  ctx.fillStyle=map[block]||'#666';
  ctx.fillRect(0,0,T,T);
  ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.strokeRect(0,0,T,T);
  return c;
}
function buildHotbar(){
  var hb=$e('hotbar');
  if(!hb) return;
  hb.innerHTML='';
  for(var i=0;i<hotbarBlocks.length;i++){
    var slot=document.createElement('div');
    slot.className='hotbar-slot'+(i===selectedBlockIndex?' selected':'');
    var t=makeSlotThumb(hotbarBlocks[i]);
    slot.appendChild(t);
    hb.appendChild(slot);
  }
}
function updateHotbar(){
  var slots=document.querySelectorAll('.hotbar-slot');
  for(var i=0;i<slots.length;i++) slots[i].classList.toggle('selected', i===selectedBlockIndex);
}

function updatePlayer(dt){
  if(!isLocked) return;
  if(player.pos[1]<-12){ spawnPlayer(); return; }
  var fx=-Math.sin(player.yaw), fz=-Math.cos(player.yaw);
  var vx=0,vz=0;
  if(keys['KeyW']){ vx+=fx; vz+=fz; }
  if(keys['KeyS']){ vx-=fx; vz-=fz; }
  if(keys['KeyA']){ vx+=fz; vz-=fx; }
  if(keys['KeyD']){ vx-=fz; vz+=fx; }
  var len=Math.sqrt(vx*vx+vz*vz);
  if(len>0){ vx/=len; vz/=len; }
  var feet=G(Math.floor(player.pos[0]),Math.floor(player.pos[1]+0.1),Math.floor(player.pos[2]));
  var headB=G(Math.floor(player.pos[0]),Math.floor(player.pos[1]+player.eyeHeight),Math.floor(player.pos[2]));
  var inWater = feet==='water' || headB==='water';
  player.inWater = inWater;
  // sprint (Ctrl+W, needs food) + crawl (sprint under a low ceiling)
  var fxi=Math.floor(player.pos[0]), fzi=Math.floor(player.pos[2]);
  var lowCeil = isBlockSolid(G(fxi,Math.floor(player.pos[1]+1.0),fzi)) || isBlockSolid(G(fxi,Math.floor(player.pos[1]+1.7),fzi));
  var sprintKey = !!(keys['ControlLeft']||keys['ControlRight']);
  player.crawling = sprintKey && lowCeil && !inWater;
  player.sprinting = sprintKey && !!keys['KeyW'] && len>0 && player.onGround && hunger>6 && !inWater && !player.crawling && !dead;
  player.size[1] = player.crawling?1.0:1.8;
  player.eyeHeight = player.crawling?0.85:1.62;
  if(player.sprinting){ sprintDrain+=dt; if(sprintDrain>4){ sprintDrain=0; if(hunger>0){ hunger--; updateSurvivalHUD(); } } }
  else sprintDrain=0;
  var walk = inWater ? 3.0 : player.crawling ? 2.0 : player.sprinting ? 6.4 : 4.3;
  var gravity = inWater ? -6 : -22;
  var jumpV = inWater ? 4.5 : 8.2;
  player.vel[0]=vx*walk;
  player.vel[2]=vz*walk;
  player.vel[1] += gravity*dt;
  if(player.vel[1] < -30) player.vel[1] = -30;
  if(keys['Space']){
    if(inWater){ player.vel[1]=jumpV*0.7; }
    else if(player.onGround){ player.vel[1]=jumpV; player.onGround=false; }
  }
  var a=aabbFromSize(player.pos[0], player.pos[1], player.pos[2], player.size[0], player.size[1], player.size[2]);
  var m=moveAABB(a, player.vel[0]*dt, player.vel[1]*dt, player.vel[2]*dt);
  player.pos[0]=m.aabb.x0+player.size[0]/2;
  player.pos[1]=m.aabb.y0;
  player.pos[2]=m.aabb.z0+player.size[2]/2;
  player.onGround = m.collidedY<0;
  if(m.collidedY!==0) player.vel[1]=0;
  if(m.collidedX) player.vel[0]=0;
  if(m.collidedZ) player.vel[2]=0;
  camera.position.set(player.pos[0], player.pos[1]+player.eyeHeight, player.pos[2]);
  camera.rotation.set(0,0,0);
  camera.rotateY(player.yaw);
  camera.rotateX(player.pitch);
  var wantFov=player.sprinting?68:58;
  if(Math.abs(camera.fov-wantFov)>0.1){ camera.fov+=(wantFov-camera.fov)*Math.min(1,dt*8); camera.updateProjectionMatrix(); }
  updateCdUI();
}

function carveCaves(colMap, CHUNK){
  var rng=PRNG(12345);
  for(var z=4;z<CHUNK-4;z++){
    for(var x=4;x<CHUNK-4;x++){
      var col=colMap[x+z*CHUNK];
      for(var i=0;i<col.length;i+=2){
        var y=col[i];
        if(y<6||y>40) continue;
        if(rng()<0.004){
          for(var dy=-1;dy<=1;dy++){
            for(var dx=-1;dx<=1;dx++){
              for(var dz=-1;dz<=1;dz++){
                if(rng()<0.6) removeBlockAt(x+dx,y+dy,z+dz,colMap,CHUNK);
              }
            }
          }
        }
      }
    }
  }
}
function removeBlockAt(x,y,z,cm,CHUNK){
  if(x<0||x>=CHUNK||z<0||z>=CHUNK) return;
  var col=cm[x+z*CHUNK];
  for(var i=0;i<col.length;i+=2){ if(col[i]===y){ col.splice(i,2); return; } }
}

var mobs = [];
function spawnMobs(){
  mobs=[];
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var rng=PRNG(currentSeed+999);
  for(var i=0;i<4;i++){
    var x=10+rng()*CHUNK, z=10+rng()*CHUNK;
    var y=80;
    for(var j=120;j>=0;j--){ if(isSolidAt(Math.floor(x),j,Math.floor(z))){ y=j+2; break; } }
    mobs.push({pos:[x,y,z], vel:[0,-9.8,0], yaw:0, mesh:null});
  }
}
function addMobMeshes(){
  // remove old
  for(var i=0;i<mobs.length;i++){
    if(mobs[i].mesh){ scene.remove(mobs[i].mesh); if(mobs[i].mesh.geometry) mobs[i].mesh.geometry.dispose(); }
  }
  var geo=new THREE.BoxGeometry(0.6,1.6,0.6);
  var mat=new THREE.MeshLambertMaterial({color:0x8b4513});
  for(var i=0;i<mobs.length;i++){
    var m=new THREE.Mesh(geo,mat);
    m.position.set(mobs[i].pos[0], mobs[i].pos[1], mobs[i].pos[2]);
    scene.add(m); mobs[i].mesh=m;
  }
}
function updateMobs(dt){
  if(!dt || dt<=0) return;
  for(var i=0;i<mobs.length;i++){
    var mob=mobs[i];
    mob.vel[1] += -16*dt;
    if(mob.vel[1]<-30) mob.vel[1]=-30;
    var dx=player.pos[0]-mob.pos[0], dz=player.pos[2]-mob.pos[2];
    var d=Math.sqrt(dx*dx+dz*dz);
    if(d<12 && d>1.2){ mob.vel[0]=(dx/d)*2.0; mob.vel[2]=(dz/d)*2.0; }
    else{ mob.vel[0]=0; mob.vel[2]=0; }
    var a=aabbFromSize(mob.pos[0], mob.pos[1], mob.pos[2], 0.6,1.6,0.6);
    var mv=moveAABB(a, mob.vel[0]*dt, mob.vel[1]*dt, mob.vel[2]*dt);
    mob.pos[0]=mv.aabb.x0+0.3; mob.pos[1]=mv.aabb.y0; mob.pos[2]=mv.aabb.z0+0.3;
    if(mv.collidedY!==0) mob.vel[1]=0;
    if(mob.mesh){ mob.mesh.position.set(mob.pos[0], mob.pos[1]+0.8, mob.pos[2]); }
  }
}

/* Debug hook (used by automated smoke tests; harmless in production) */
window.VC = {
  get player(){ return player; },
  get cfg(){ return cfg; },
  blockAt: function(x,y,z){ return G(x,y,z); },
  setBlock: function(x,y,z,t){ return setBlock(x,y,z,t); },
  raycast: function(d){ return raycast(d||4.5); },
  spawn: function(){ return spawnPlayer(); },
  teleport: function(x,y,z){ player.pos=[x,y,z]; player.vel=[0,0,0]; fallPeak=null; wasAir=false; },
  look: function(yaw,pitch){ player.yaw=yaw; player.pitch=pitch; },
  dirtyCount: function(){ return dirtyTilesSet.size; },
  mobCount: function(){ return mobs.length; },
  mobPos: function(i){ return mobs[i] ? mobs[i].pos.slice().concat([mobs[i].type]) : null; },
  select: function(i){ selectedBlockIndex=i; updateHotbar(); }
};

/* =====================================================
   NOTCH PART 1 — textures, registry, ores, bedrock
===================================================== */
function mkOreTex(key, sn, color, n){
  var cv=makeCanv(TEX_SIZE), ctx=cv.getContext('2d'), rng=texRng(sn), T=TEX_SIZE;
  ctx.fillStyle='#888'; ctx.fillRect(0,0,T,T);
  for(var i=0;i<160;i++){ var v=100+Math.floor(rng()*80); ctx.fillStyle='rgba('+v+','+v+','+(v-5)+',0.5)'; ctx.fillRect(rng()*T,rng()*T,2,2); }
  for(var s=0;s<5;s++){ var bx=6+rng()*(T-18), by=6+rng()*(T-18);
    for(var k=0;k<(n||5);k++){ ctx.fillStyle=color; ctx.fillRect(bx+rng()*9, by+rng()*9, 3, 3); }
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillRect(bx+1,by+1,2,2);
  }
  TEXTURES[key]=mkTex(cv);
}
function buildNotchTextures(){
  mkOreTex('coal_ore', 31, '#1a1a1a', 6);
  mkOreTex('iron_ore', 32, '#d8a080', 5);
  mkOreTex('gold_ore', 33, '#f8d020', 5);
  mkOreTex('diamond_ore', 34, '#40f0e0', 4);
  (function(){ var cv=makeCanv(TEX_SIZE),ctx=cv.getContext('2d'),rng=texRng(35),T=TEX_SIZE;
    ctx.fillStyle='#222'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<220;i++){ var v=Math.floor(20+rng()*50); ctx.fillStyle='rgba('+v+','+v+','+v+',0.8)'; ctx.fillRect(rng()*T,rng()*T,2+rng()*3,2+rng()*3); }
    TEXTURES.bedrock=mkTex(cv); })();
  (function(){ var cv=makeCanv(TEX_SIZE),ctx=cv.getContext('2d'),rng=texRng(36),T=TEX_SIZE;
    ctx.fillStyle='#a0824e'; ctx.fillRect(0,0,T,T);
    for(var r=0;r<T;r+=16){ ctx.fillStyle='rgba(60,35,10,0.7)'; ctx.fillRect(0,r,T,2); }
    for(var i=0;i<120;i++){ var v=Math.floor(120+rng()*70); ctx.fillStyle='rgba('+v+','+Math.floor(v*0.75)+','+Math.floor(v*0.45)+',0.4)'; ctx.fillRect(rng()*T,rng()*T,2,2); }
    TEXTURES.planks=mkTex(cv); })();
  (function(){ var cv=makeCanv(TEX_SIZE),ctx=cv.getContext('2d'),T=TEX_SIZE;
    ctx.fillStyle='#8a6a3a'; ctx.fillRect(0,0,T,T);
    ctx.fillStyle='#3a2a12'; ctx.fillRect(0,0,T,4); ctx.fillRect(0,T-4,T,4); ctx.fillRect(0,0,4,T); ctx.fillRect(T-4,0,4,T);
    ctx.fillStyle='#2a2a2a'; ctx.fillRect(12,12,16,16); ctx.fillRect(36,36,16,16);
    ctx.fillStyle='#888'; ctx.fillRect(14,14,5,5); ctx.fillRect(38,38,5,5);
    TEXTURES.craftTable=mkTex(cv); })();
  (function(){ var cv=makeCanv(TEX_SIZE),ctx=cv.getContext('2d'),rng=texRng(38),T=TEX_SIZE;
    ctx.fillStyle='#777'; ctx.fillRect(0,0,T,T);
    for(var i=0;i<140;i++){ var v=90+Math.floor(rng()*70); ctx.fillStyle='rgba('+v+','+v+','+v+',0.5)'; ctx.fillRect(rng()*T,rng()*T,2,2); }
    ctx.fillStyle='#1a1a1a'; ctx.fillRect(14,36,36,20);
    ctx.fillStyle='#ff9020'; ctx.fillRect(20,48,24,3);
    TEXTURES.furnace=mkTex(cv); })();
}

/* Block registry: hard (seconds-ish), tool class, drop item, min pick tier, smelt result */
var BLOCKS = {
  grass:{hard:0.9, drop:'dirt'},
  dirt:{hard:0.6, drop:'dirt'},
  sand:{hard:0.6, drop:'sand'},
  snow:{hard:0.4, drop:'snow'},
  log:{hard:1.4, drop:'log'},
  pinelog:{hard:1.6, drop:'log'},
  planks:{hard:1.4, drop:'planks'},
  stone:{hard:2.4, tool:'pick', drop:'stone'},
  deep:{hard:3.2, tool:'pick', drop:'stone'},
  coal_ore:{hard:2.6, tool:'pick', drop:'coal', tier:0},
  iron_ore:{hard:3.2, tool:'pick', drop:null, smelt:'iron_ingot', tier:1},
  gold_ore:{hard:3.4, tool:'pick', drop:null, smelt:'gold_ingot', tier:2},
  diamond_ore:{hard:4.2, tool:'pick', drop:'diamond', tier:2},
  bedrock:{hard:-1, drop:null},
  craftTable:{hard:1.4, drop:'craftTable'},
  furnace:{hard:2.6, tool:'pick', drop:'furnace'},
  water:{hard:-1, drop:null},
};
function blockDef(t){
  if(!t) return null;
  if(t.indexOf('leaves')===0 || t==='leaves:pine') return {hard:0.35, drop:null};
  return BLOCKS[t] || null;
}
/* Items: tools (mult, dmg, dura), food (hunger), fuel (smelts) */
var ITEMS = {
  stick:{name:'Stick'},
  coal:{name:'Coal', fuel:4},
  diamond:{name:'Diamond'},
  iron_ingot:{name:'Iron Ingot'},
  gold_ingot:{name:'Gold Ingot'},
  raw_pork:{name:'Raw Pork', food:3},
  cooked_pork:{name:'Cooked Pork', food:8},
  wood_pick:{name:'Wood Pick', tool:'pick', tier:0, mult:2, dura:59},
  stone_pick:{name:'Stone Pick', tool:'pick', tier:1, mult:4, dura:131},
  iron_pick:{name:'Iron Pick', tool:'pick', tier:2, mult:6, dura:250},
  gold_pick:{name:'Gold Pick', tool:'pick', tier:2, mult:12, dura:32},
  diamond_pick:{name:'Diamond Pick', tool:'pick', tier:3, mult:8, dura:1561},
  wood_sword:{name:'Wood Sword', dmg:4, dura:59},
  stone_sword:{name:'Stone Sword', dmg:5, dura:131},
  iron_sword:{name:'Iron Sword', dmg:6, dura:250},
  gold_sword:{name:'Gold Sword', dmg:4, dura:32},
  diamond_sword:{name:'Diamond Sword', dmg:7, dura:1561},
};
var FUEL = {coal:4, log:2, planks:1, stick:1};
var SMELT = {iron_ore:'iron_ingot', gold_ore:'gold_ingot', raw_pork:'cooked_pork', sand:'stone'};

function placeBedrock(colMap, CHUNK, getTypeId){
  var bid=getTypeId('bedrock');
  for(var z=0;z<CHUNK;z++) for(var x=0;x<CHUNK;x++){
    var col=colMap[x+z*CHUNK];
    var has0=false;
    for(var i=0;i<col.length;i+=2){ if(col[i]===0){ col[i+1]=bid; has0=true; } }
    if(!has0) col.unshift(0, bid);
  }
}
function oreVein(colMap, CHUNK, typeNames, getTypeId, sx,sy,sz, type, size){
  var rng=PRNG(sx*733+sy*91+sz*57+7);
  var x=sx,y=sy,z=sz;
  var tid=getTypeId(type);
  for(var i=0;i<size;i++){
    if(x<1||x>=CHUNK-1||z<1||z>=CHUNK-1||y<2) break;
    var col=colMap[x+z*CHUNK];
    for(var j=0;j<col.length;j+=2){
      if(col[j]===y){
        var cur=typeNames[col[j+1]];
        if(cur==='stone'||cur==='deep') col[j+1]=tid;
        break;
      }
    }
    x+=Math.floor(rng()*3)-1; y+=Math.floor(rng()*3)-1; z+=Math.floor(rng()*3)-1;
  }
}
function sprinkleOres(colMap, CHUNK, typeNames, getTypeId){
  var rng=PRNG(4242);
  var bands=[
    {type:'coal_ore', lo:15, hi:58, p:0.020, size:5},
    {type:'iron_ore', lo:6, hi:36, p:0.012, size:4},
    {type:'gold_ore', lo:4, hi:20, p:0.006, size:4},
    {type:'diamond_ore', lo:2, hi:12, p:0.005, size:3},
  ];
  for(var z=1;z<CHUNK-1;z++) for(var x=1;x<CHUNK-1;x++){
    var col=colMap[x+z*CHUNK];
    for(var i=0;i<col.length;i+=2){
      var y=col[i], cur=typeNames[col[i+1]];
      if(cur!=='stone' && cur!=='deep') continue;
      for(var b=0;b<bands.length;b++){
        var B=bands[b];
        if(y>=B.lo && y<=B.hi && rng()<B.p){ oreVein(colMap,CHUNK,typeNames,getTypeId,x,y,z,B.type,2+Math.floor(rng()*B.size)); break; }
      }
    }
  }
}

/* =====================================================
   NOTCH PART 2 — inventory, drops, hotbar
===================================================== */

function isTool(id){ return !!(ITEMS[id] && (ITEMS[id].tool || ITEMS[id].dmg)); }
function addItem(id, count, dur){
  count = count||1;
  if(isTool(id)){
    for(var n=0;n<count;n++){
      var st={id:id,count:1,dur:(dur!=null?dur:ITEMS[id].dura)};
      if(!putStack(st)) return false;
    }
    return true;
  }
  var left=count;
  var zones=[inv.hot, inv.main];
  for(var z=0;z<2 && left>0;z++) for(var i=0;i<zones[z].length && left>0;i++){
    var st=zones[z][i];
    if(st && st.id===id && st.count<64){ var room=64-st.count, take=Math.min(room,left); st.count+=take; left-=take; }
  }
  while(left>0){ var c=Math.min(64,left); if(!putStack({id:id,count:c})) return false; left-=c; }
  return true;
}
function putStack(st){
  var zones=[inv.hot, inv.main];
  for(var z=0;z<2;z++) for(var i=0;i<zones[z].length;i++) if(!zones[z][i]){ zones[z][i]=st; return true; }
  return false;
}
function countItem(id){
  var n=0;
  for(var i=0;i<9;i++) if(inv.hot[i]&&inv.hot[i].id===id) n+=inv.hot[i].count;
  for(var j=0;j<27;j++) if(inv.main[j]&&inv.main[j].id===id) n+=inv.main[j].count;
  return n;
}
function takeItem(id, count){
  var left=count;
  var zones=[inv.main, inv.hot];
  for(var z=0;z<2 && left>0;z++) for(var i=0;i<zones[z].length && left>0;i++){
    var st=zones[z][i];
    if(st && st.id===id){ var take=Math.min(st.count,left); st.count-=take; left-=take; if(st.count<=0) zones[z][i]=null; }
  }
  return left<=0;
}
function selectedStack(){ return inv.hot[selectedBlockIndex]; }
function heldTool(){
  var st=selectedStack();
  if(st && ITEMS[st.id] && ITEMS[st.id].tool) return {id:st.id, def:ITEMS[st.id], stack:st};
  return null;
}
function heldWeaponDmg(){
  var st=selectedStack();
  if(st && ITEMS[st.id] && ITEMS[st.id].dmg) return ITEMS[st.id].dmg;
  var t=heldTool();
  if(t) return 2;
  return 1;
}

var ITEM_COLORS = {stick:'#8a6a3a',coal:'#1a1a1a',diamond:'#40f0e0',iron_ingot:'#e8e8e8',gold_ingot:'#f8d020',raw_pork:'#e09090',cooked_pork:'#a06030',wood_pick:'#9a6a30',stone_pick:'#888',iron_pick:'#e8e8e8',gold_pick:'#f8d020',diamond_pick:'#40f0e0',wood_sword:'#9a6a30',stone_sword:'#888',iron_sword:'#e8e8e8',gold_sword:'#f8d020',diamond_sword:'#40f0e0',grass:'#5d9e3f',dirt:'#8B5E3C',stone:'#888',sand:'#d4b483',log:'#6b4c2a',snow:'#eef4f7',deep:'#555',water:'#2d7dd2',planks:'#a0824e',craftTable:'#8a6a3a',furnace:'#777',bedrock:'#222',coal_ore:'#333',iron_ore:'#d8a080',gold_ore:'#f8d020',diamond_ore:'#40f0e0',leaves:'#3f8c2f'};
function itemColor(id){
  if(ITEM_COLORS[id]) return ITEM_COLORS[id];
  if(id && id.indexOf('leaves')===0) return '#3f8c2f';
  return '#666';
}
function makeSlotThumb(block){
  var T=32;
  var c=document.createElement('canvas'); c.width=c.height=T;
  var ctx=c.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  var key=block;
  if(key && key.indexOf(':')!==-1){
    var leaf=key.split(':')[1]; // 'leaves:leavesOak' -> oak icon
    key=(leaf==='pine')?'pine':(leaf==='leavesOak'?'leavesOak':'leavesOak');
    if(block.indexOf('Autumn')!==-1||block.indexOf('Mystic')!==-1||block.indexOf('Golden')!==-1||block.indexOf('Tropical')!==-1){
      // fantasy variants keep their tinted procedural swatch
      ctx.fillStyle=itemColor(block); ctx.fillRect(0,0,T,T);
      ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.strokeRect(0,0,T,T);
      return c;
    }
  }
  var img=vanillaIconCache[key];
  if(img && img.width){
    ctx.clearRect(0,0,T,T);
    ctx.drawImage(img,0,0,T,T);
    return c;
  }
  ctx.fillStyle=itemColor(block);
  ctx.fillRect(0,0,T,T);
  if(ITEMS[block]){
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText((ITEMS[block].name||'?').charAt(0), T/2, T/2+1);
  }
  ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.strokeRect(0,0,T,T);
  return c;
}
function buildHotbar(){
  var hb=$e('hotbar');
  if(!hb) return;
  hb.innerHTML='';
  for(var i=0;i<9;i++){
    (function(i){
      var slot=document.createElement('div');
      var st=inv.hot[i];
      slot.className='hotbar-slot'+(i===selectedBlockIndex?' selected':'');
      if(st){
        slot.appendChild(makeSlotThumb(st.id));
        if(!isTool(st.id) && st.count>1){ var cn=document.createElement('span'); cn.className='cnt'; cn.textContent=st.count; slot.appendChild(cn); }
        if(isTool(st.id) && ITEMS[st.id].dura){ var db=document.createElement('div'); db.className='durb'; db.style.width=Math.max(0,Math.round(st.dur/ITEMS[st.id].dura*100))+'%'; slot.appendChild(db); }
      }
      slot.addEventListener('click',function(){ selectedBlockIndex=i; updateHotbar(); });
      hb.appendChild(slot);
    })(i);
  }
}
function updateHotbar(){ buildHotbar(); }
function refreshInvUI(){ buildHotbar(); if($e('inv-modal') && $e('inv-modal').classList.contains('open')) renderInvModal(); updateSurvivalHUD(); }
function updateSurvivalHUD(){
  var hp=$e('hp-fill'), hu=$e('hunger-fill');
  if(hp) hp.style.width=Math.max(0,Math.round(health/20*100))+'%';
  if(hu) hu.style.width=Math.max(0,Math.round(hunger/20*100))+'%';
}

/* Drops */
var drops=[];
var dropGeoShared=null;
var dropTexCache={};
function dropTexture(id){
  if(dropTexCache[id]) return dropTexCache[id];
  var img=vanillaIconCache[id];
  if(!img || !img.width) return null;
  var t=new THREE.CanvasTexture(img);
  t.magFilter=t.minFilter=THREE.NearestFilter;
  dropTexCache[id]=t;
  return t;
}
function spawnDrop(id, count, x, y, z){
  if(drops.length>40) { var old=drops.shift(); if(old.mesh){ scene.remove(old.mesh); } }
  var m=null;
  try{
    var tex=dropTexture(id);
    if(tex){
      m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, alphaTest:0.4, depthWrite:false}));
      m.scale.set(0.45,0.45,1);
    } else {
      if(!dropGeoShared) dropGeoShared=new THREE.BoxGeometry(0.3,0.3,0.3);
      m=new THREE.Mesh(dropGeoShared, new THREE.MeshLambertMaterial({color:itemColor(id)}));
    }
    m.position.set(x+0.5, y+0.7, z+0.5);
    scene.add(m);
  }catch(e){ m=null; }
  drops.push({id:id, count:count, x:x+0.5, y:y+0.7, z:z+0.5, vy:0, mesh:m, age:0, sprite:!!(m&&m.isSprite)});
}
function updateDrops(dt){
  for(var i=drops.length-1;i>=0;i--){
    var d=drops[i];
    d.age+=dt;
    if(d.age>90){ if(d.mesh) scene.remove(d.mesh); drops.splice(i,1); continue; }
    d.vy += -12*dt; if(d.vy<-8) d.vy=-8;
    var ny=d.y+d.vy*dt;
    var below=G(Math.floor(d.x), Math.floor(ny-0.15), Math.floor(d.z));
    if(below && isBlockSolid(below)){ d.vy=0; }
    else d.y=ny;
    var dx=player.pos[0]-d.x, dy=(player.pos[1]+0.8)-d.y, dz=player.pos[2]-d.z;
    var dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(dist<3 && d.age>0.5){
      var sp=6*dt;
      d.x+=dx/dist*sp; d.y+=dy/dist*sp; d.z+=dz/dist*sp;
    }
    if(dist<1.2 && d.age>0.5){
      if(addItem(d.id, d.count)){ if(d.mesh) scene.remove(d.mesh); drops.splice(i,1); Sfx.play('pickup'); refreshInvUI(); continue; }
    }
    if(d.mesh){
      d.mesh.position.set(d.x,d.y+Math.sin(d.age*3)*0.05,d.z);
      if(d.sprite){ d.mesh.material.rotation+=dt*1.5; }
      else d.mesh.rotation.y+=dt*2;
    }
  }
}
function clearDrops(){
  for(var i=0;i<drops.length;i++) if(drops[i].mesh) scene.remove(drops[i].mesh);
  drops=[];
}

/* =====================================================
   CLASSIC PARTICLES — Tile.destroy 4×4×4 burst + Particle tick
   (reference/.../level/tile/Tile.java, particle/Particle.java).
   64 shards per break, gravity −0.04/tick, drag 0.98, ground
   friction 0.7, lifetime 4/(rand*0.9+0.1) ticks.
===================================================== */
var breakParticles=[];
var breakPoints=null, breakGeo=null;
var MAX_BREAK_PARTICLES=768;
function avgTexColor(texKey){
  try{
    var tex=TEXTURES[texKey];
    var img=tex&&tex.image;
    if(!img||!img.width) return [0.6,0.55,0.5];
    var cv=document.createElement('canvas'); cv.width=cv.height=8;
    var cx=cv.getContext('2d'); cx.drawImage(img,0,0,8,8);
    var d=cx.getImageData(0,0,8,8).data, r=0,g=0,b=0,n=0;
    for(var i=0;i<d.length;i+=16){ r+=d[i]; g+=d[i+1]; b+=d[i+2]; n++; }
    return [r/n/255,g/n/255,b/n/255];
  }catch(e){ return [0.6,0.55,0.5]; }
}
function spawnBreakParticles(x,y,z){
  var t=G(x,y,z);
  var texKey='dirt';
  try{ texKey=getTexKey(t||'dirt',2)||'dirt'; }catch(e){}
  var col=avgTexColor(texKey);
  var SD=4;
  for(var xx=0;xx<SD;xx++) for(var yy=0;yy<SD;yy++) for(var zz=0;zz<SD;zz++){
    if(breakParticles.length>=MAX_BREAK_PARTICLES) breakParticles.shift();
    var xp=x+(xx+0.5)/SD, yp=y+(yy+0.5)/SD, zp=z+(zz+0.5)/SD;
    var xa=xp-(x+0.5), ya=yp-(y+0.5), za=zp-(z+0.5);
    var xd=xa+(Math.random()*2-1)*0.4, yd=ya+(Math.random()*2-1)*0.4, zd=za+(Math.random()*2-1)*0.4;
    var sp=(Math.random()+Math.random()+1)*0.15;
    var dd=Math.sqrt(xd*xd+yd*yd+zd*zd)||1;
    breakParticles.push({
      x:xp,y:yp,z:zp,
      xd:xd/dd*sp*0.4, yd:yd/dd*sp*0.4+0.1, zd:zd/dd*sp*0.4,
      age:0, life:4/(Math.random()*0.9+0.1),
      r:col[0],g:col[1],b:col[2]
    });
  }
  syncBreakPoints();
}
function syncBreakPoints(){
  try{
    if(breakPoints){ scene.remove(breakPoints); breakGeo.dispose(); breakPoints=null; }
    if(!breakParticles.length) return;
    breakGeo=new THREE.BufferGeometry();
    var pos=new Float32Array(breakParticles.length*3), col=new Float32Array(breakParticles.length*3);
    for(var i=0;i<breakParticles.length;i++){
      var p=breakParticles[i];
      pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      col[i*3]=p.r; col[i*3+1]=p.g; col[i*3+2]=p.b;
    }
    breakGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    breakGeo.setAttribute('color',new THREE.BufferAttribute(col,3));
    breakPoints=new THREE.Points(breakGeo,new THREE.PointsMaterial({size:0.12,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false}));
    scene.add(breakPoints);
  }catch(e){}
}
function tickBreakParticles(dt){
  if(!breakParticles.length) return;
  var step=Math.min(4,Math.max(1,Math.round(dt*20))); // classic ticks at 20tps
  for(var s=0;s<step;s++){
    for(var i=breakParticles.length-1;i>=0;i--){
      var p=breakParticles[i];
      p.age+=0.05;
      if(p.age>=p.life){ breakParticles.splice(i,1); continue; }
      p.yd-=0.04;
      // collide against world like an Entity (cheap AABB point probe)
      var nx=p.x+p.xd, ny=p.y+p.yd, nz=p.z+p.zd;
      var solid=isSolidAt(Math.floor(nx),Math.floor(ny),Math.floor(nz));
      if(solid){ p.xd*=0.7; p.zd*=0.7; p.yd=0; }
      else { p.x+=p.xd; p.y+=p.yd; p.z+=p.zd; }
      p.xd*=0.98; p.yd*=0.98; p.zd*=0.98;
    }
  }
  syncBreakPoints();
}

/* =====================================================
   NOTCH PART 3 — mining, tools, input, tick hub
===================================================== */
function sfx(n){ try{ if(typeof Sfx!=='undefined' && Sfx) Sfx.play(n); }catch(e){} }
var lmbDown=false;
var mining={active:false,x:0,y:0,z:0,block:null,progress:0};
function mineSpeedMult(blockId){
  var def=blockDef(blockId);
  if(!def) return 1;
  var t=heldTool();
  if(def.tool==='pick') return t ? t.def.mult : 0.3;
  return 1;
}
function mineTime(blockId){
  var def=blockDef(blockId);
  if(!def || def.hard<0) return Infinity;
  return Math.max(0.15, def.hard*1.2 / mineSpeedMult(blockId));
}
function doBreak(x,y,z){
  var t=G(x,y,z);
  if(!t) return;
  var def=blockDef(t);
  if(!def || def.hard<0){ sfx('deny'); return; }
  var tool=heldTool();
  var tier=tool ? tool.def.tier : 0;
  var okTier=!(def.tier) || tier>=def.tier;
  if(tool && def.tool==='pick'){
    tool.stack.dur--;
    if(tool.stack.dur<=0){ inv.hot[selectedBlockIndex]=null; sfx('break_tool'); }
  }
  try{ spawnBreakParticles(x,y,z); }catch(e){}
  setBlock(x,y,z,null);
  if(def.drop && okTier) spawnDrop(def.drop, 1, x, y, z);
  sfx('break');
  refreshInvUI();
}
function miningTick(dt){
  if(!lmbDown || !isLocked){ mining.active=false; mining.progress=0; return; }
  var hit=raycast(4.5);
  if(!hit.hit){ mining.active=false; mining.progress=0; return; }
  if(!mining.active || mining.x!==hit.x || mining.y!==hit.y || mining.z!==hit.z){
    mining={active:true,x:hit.x,y:hit.y,z:hit.z,block:G(hit.x,hit.y,hit.z),progress:0};
  }
  var need=mineTime(mining.block);
  if(!isFinite(need)){ var bi=$e('block-info'); if(bi) bi.textContent='UNBREAKABLE'; return; }
  mining.progress+=dt/need;
  var bi2=$e('block-info');
  if(bi2) bi2.textContent=mining.block+' '+Math.min(99,Math.floor(mining.progress*100))+'%';
  if(highlightMesh){ var sc=1+mining.progress*0.06; highlightMesh.scale.set(sc,sc,sc); }
  if(mining.progress>=1){ mining.active=false; mining.progress=0; if(highlightMesh) highlightMesh.scale.set(1,1,1); doBreak(hit.x,hit.y,hit.z); }
}
function setupInput(){
  window.addEventListener('keydown', function(e){
    if(e.code==='KeyE'){
      var im=$e('inv-modal'), fm=$e('furnace-modal');
      if(fm && fm.classList.contains('open')){ fm.classList.remove('open'); try{cv.requestPointerLock();}catch(err){} return; }
      if(im && im.classList.contains('open')){ im.classList.remove('open'); try{cv.requestPointerLock();}catch(err){} }
      else { if(document.pointerLockElement) document.exitPointerLock(); openInv(); }
      return;
    }
    keys[e.code]=true;
    if(e.code==='Escape' && isLocked){ try{document.exitPointerLock();}catch(err){} }
    if(e.code.indexOf('Digit')===0){
      var n=parseInt(e.code.slice(5));
      if(n>=1 && n<=9){ selectedBlockIndex=n-1; updateHotbar(); }
    }
  });
  window.addEventListener('keyup', function(e){ keys[e.code]=false; lmbDown=false; });
  window.addEventListener('mouseup', function(e){ if(e.button===0){ lmbDown=false; mining.active=false; mining.progress=0; } });
  window.addEventListener('blur', function(){ lmbDown=false; for(var k in keys) keys[k]=false; });
  cv.addEventListener('mousedown', function(e){
    if(!isLocked){ try{cv.requestPointerLock();}catch(err){} return; }
    if(e.button===0){
      if(typeof tryAttack==='function' && tryAttack()) return;
      lmbDown=true; mining.active=false; mining.progress=0;
    }else if(e.button===2){
      var hit=raycast(4.5);
      if(hit.hit){
        var ht=G(hit.x,hit.y,hit.z);
        if(ht==='furnace' && typeof openFurnace==='function'){ openFurnace(hit.x,hit.y,hit.z); return; }
        var st=selectedStack();
        if(st && blockDef(st.id) && BLOCKS[st.id]){
          var nx=hit.x, ny=hit.y, nz=hit.z;
          if(hit.face==='x+') nx++; if(hit.face==='x-') nx--;
          if(hit.face==='y+') ny++; if(hit.face==='y-') ny--;
          if(hit.face==='z+') nz++; if(hit.face==='z-') nz--;
          if(!G(nx,ny,nz)){
            var pa=aabbFromSize(player.pos[0],player.pos[1],player.pos[2],player.size[0],player.size[1],player.size[2]);
            var ba=AABB(nx,ny,nz,nx+1,ny+1,nz+1);
            if(!aabbIntersect(pa,ba)){
              setBlock(nx,ny,nz,st.id);
              st.count--; if(st.count<=0) inv.hot[selectedBlockIndex]=null;
              sfx('place'); refreshInvUI();
            }
          }
          return;
        }
      }
      var st2=selectedStack();
      if(st2 && ITEMS[st2.id] && ITEMS[st2.id].food && typeof eatHeld==='function'){ eatHeld(); }
    }
  });
  cv.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  cv.addEventListener('wheel', function(e){
    selectedBlockIndex=(selectedBlockIndex+(e.deltaY>0?1:-1)+9)%9;
    updateHotbar();
  }, {passive:true});
  document.addEventListener('pointerlockchange', function(){
    isLocked = document.pointerLockElement===cv;
    cfg.autoRotate = !isLocked;
    var cb=$e('cb-autorotate'); if(cb) cb.checked=cfg.autoRotate;
    if(!isLocked){ lmbDown=false; mining.active=false; }
    else { try{ sf2Ensure(); }catch(e){} ensureMusic(); }
  });
  document.addEventListener('mousemove', function(e){
    if(!isLocked) return;
    player.yaw -= e.movementX*0.002;
    player.pitch -= e.movementY*0.002;
    if(player.pitch>Math.PI/2.5) player.pitch=Math.PI/2.5;
    if(player.pitch<-Math.PI/2.5) player.pitch=-Math.PI/2.5;
  });
  var rb=$e('btn-respawn');
  if(rb) rb.addEventListener('click', function(){ respawn(); });
}
function aabbIntersect(a,b){
  return !(a.x1<=b.x0||a.y1<=b.y0||a.z1<=b.z0||a.x0>=b.x1||a.y0>=b.y1||a.z0>=b.z1);
}
/* Central per-frame game hub — sub-ticks defined in later parts */
function gameTick(dt){
  try{ miningTick(dt); }catch(e){ console.error(e); }
  try{ updateDrops(dt); }catch(e){ console.error(e); }
  try{ tickBreakParticles(dt); }catch(e){ console.error(e); }
  try{ if(typeof furnaceTick==='function') furnaceTick(dt); }catch(e){ console.error(e); }
  try{ if(typeof survivalTick==='function') survivalTick(dt); }catch(e){ console.error(e); }
  try{ if(typeof spawnerTick==='function') spawnerTick(dt); }catch(e){ console.error(e); }
  try{ if(typeof saveTick==='function') saveTick(dt); }catch(e){ console.error(e); }
}

/* =====================================================
   NOTCH PART 4 — crafting + inventory UI
===================================================== */
var RECIPES = [
  {out:'planks', n:4, pat:[['log']]},
  {out:'stick', n:4, pat:[['planks'],['planks']]},
  {out:'craftTable', n:1, pat:[['planks','planks'],['planks','planks']]},
  {out:'furnace', n:1, table:true, pat:[['stone','stone','stone'],['stone','','stone'],['stone','stone','stone']]},
  {out:'wood_pick', n:1, table:true, pat:[['planks','planks','planks'],['','stick',''],['','stick','']]},
  {out:'stone_pick', n:1, table:true, pat:[['stone','stone','stone'],['','stick',''],['','stick','']]},
  {out:'iron_pick', n:1, table:true, pat:[['iron_ingot','iron_ingot','iron_ingot'],['','stick',''],['','stick','']]},
  {out:'gold_pick', n:1, table:true, pat:[['gold_ingot','gold_ingot','gold_ingot'],['','stick',''],['','stick','']]},
  {out:'diamond_pick', n:1, table:true, pat:[['diamond','diamond','diamond'],['','stick',''],['','stick','']]},
  {out:'wood_sword', n:1, table:true, pat:[['planks'],['planks'],['stick']]},
  {out:'stone_sword', n:1, table:true, pat:[['stone'],['stone'],['stick']]},
  {out:'iron_sword', n:1, table:true, pat:[['iron_ingot'],['iron_ingot'],['stick']]},
  {out:'gold_sword', n:1, table:true, pat:[['gold_ingot'],['gold_ingot'],['stick']]},
  {out:'diamond_sword', n:1, table:true, pat:[['diamond'],['diamond'],['stick']]},
];
function parsePat(rows){
  return rows.map(function(r){ return r.trim().split(/\s+/); });
}
function normGrid(g){
  var rows=g.length, cols=g[0].length;
  var r0=rows,r1=-1,c0=cols,c1=-1;
  for(var r=0;r<rows;r++) for(var c=0;c<cols;c++) if(g[r][c]){ if(r<r0)r0=r; if(r>r1)r1=r; if(c<c0)c0=c; if(c>c1)c1=c; }
  if(r1<0) return [];
  var o=[];
  for(var r=r0;r<=r1;r++){ var row=[]; for(var c=c0;c<=c1;c++) row.push(g[r][c]||''); o.push(row.join(',')); }
  return o;
}
function matchRecipe(grid){
  var ng=normGrid(grid);
  if(!ng.length) return null;
  var nearTable=nearCraftTable();
  for(var i=0;i<RECIPES.length;i++){
    var R=RECIPES[i];
    if(R.table && !nearTable) continue;
    var pg=normGrid(R.pat);
    if(pg.length!==ng.length) continue;
    var ok=true;
    for(var r=0;r<pg.length;r++) if(pg[r]!==ng[r]){ ok=false; break; }
    if(ok) return R;
  }
  return null;
}
function nearCraftTable(){
  var px=Math.floor(player.pos[0]), py=Math.floor(player.pos[1]), pz=Math.floor(player.pos[2]);
  for(var y=py-4;y<=py+4;y++) for(var x=px-5;x<=px+5;x++) for(var z=pz-5;z<=pz+5;z++){
    if(G(x,y,z)==='craftTable') return true;
  }
  return false;
}
var craftGrid=[], craftSize=2, invCursor=null, invSel=null;
function craftDim(){ return nearCraftTable()?3:2; }
function openInv(){
  craftSize=craftDim();
  craftGrid=[];
  for(var r=0;r<craftSize;r++){ craftGrid.push([]); for(var c=0;c<craftSize;c++) craftGrid[r].push(''); }
  invCursor=null; invSel=null;
  renderInvModal();
  $e('inv-modal').classList.add('open');
}
function slotDiv(st, fn){
  var d=document.createElement('div');
  d.className='cslot';
  if(st){
    d.appendChild(makeSlotThumb(st.id));
    if(!isTool(st.id) && st.count>1){ var cn=document.createElement('span'); cn.className='cnt'; cn.textContent=st.count; d.appendChild(cn); }
  }
  if(fn) d.addEventListener('click', fn);
  return d;
}
function allSlots(){
  var a=[];
  for(var i=0;i<9;i++) a.push({zone:'hot', i:i});
  for(var j=0;j<27;j++) a.push({zone:'main', i:j});
  return a;
}
function getSlot(s){ return s.zone==='hot'?inv.hot[s.i]:inv.main[s.i]; }
function setSlot(s, v){ if(s.zone==='hot') inv.hot[s.i]=v; else inv.main[s.i]=v; }
function renderInvModal(){
  var cg=$e('craft-grid');
  cg.style.gridTemplateColumns='repeat('+craftSize+',44px)';
  cg.innerHTML='';
  for(var r=0;r<craftSize;r++) for(var c=0;c<craftSize;c++){
    (function(r,c){
      var id=craftGrid[r][c];
      var d=slotDiv(id?{id:id,count:1}:null, function(){
        if(id){ if(addItem(id,1)){ craftGrid[r][c]=''; } }
        else if(invSel){ var gst=getSlot(invSel); if(gst && !isTool(gst.id)){ craftGrid[r][c]=gst.id; gst.count--; if(gst.count<=0) setSlot(invSel,null); invSel=null; } }
        renderInvModal(); refreshInvUI();
      });
      cg.appendChild(d);
    })(r,c);
  }
  $e('craft-size-note').textContent = craftSize===3?'(3x3 — near table)':'(2x2 — place a crafting table nearby for tools)';
  var out=$e('craft-out');
  out.innerHTML='';
  var R=matchRecipe(craftGrid);
  if(R){
    out.appendChild(makeSlotThumb(R.out));
    var t=document.createElement('span'); t.textContent='×'+R.n+' '+((ITEMS[R.out]&&ITEMS[R.out].name)||R.out); out.appendChild(t);
  } else out.textContent='No recipe';
  var ig=$e('inv-grid');
  ig.innerHTML='';
  var slots=allSlots();
  for(var k=0;k<slots.length;k++){
    (function(sk){
      var st=getSlot(sk);
      var d=slotDiv(st, function(){
        if(invSel && (invSel.zone!==sk.zone||invSel.i!==sk.i)){ var tmp=getSlot(sk); setSlot(sk, getSlot(invSel)); setSlot(invSel, tmp); invSel=null; }
        else if(st){ invSel=(invSel)?null:sk; }
        else invSel=null;
        renderInvModal(); refreshInvUI();
      });
      if(invSel && invSel.zone===sk.zone && invSel.i===sk.i) d.style.borderColor='#fff';
      if(k<9){ var lb=document.createElement('span'); lb.className='cnt'; lb.style.left='2px'; lb.style.right='auto'; lb.textContent=(k+1); d.appendChild(lb); }
      ig.appendChild(d);
    })(slots[k]);
  }
}
function wireInvModal(){
  $e('inv-close').addEventListener('click', function(){ $e('inv-modal').classList.remove('open'); try{cv.requestPointerLock();}catch(e){} });
  $e('btn-craft').addEventListener('click', function(){
    var R=matchRecipe(craftGrid);
    if(!R){ sfx('deny'); return; }
    for(var r=0;r<craftSize;r++) for(var c=0;c<craftSize;c++) craftGrid[r][c]='';
    addItem(R.out, R.n);
    sfx('craft'); renderInvModal(); refreshInvUI();
  });
}

/* =====================================================
   NOTCH PART 5 — furnace
===================================================== */
var furnaces={};
var furnaceUI=null, furSel=null;
function furnaceKey(x,y,z){ return x+','+y+','+z; }
function getFurnace(x,y,z){
  var k=furnaceKey(x,y,z);
  if(!furnaces[k]) furnaces[k]={fuelName:null, fuelLeft:0, input:null, progress:0, output:null};
  return furnaces[k];
}
function openFurnace(x,y,z){
  furnaceUI={x:x,y:y,z:z};
  furSel=null;
  if(document.pointerLockElement) document.exitPointerLock();
  renderFurnace();
  $e('furnace-modal').classList.add('open');
}
function furSlot(el, st, nameEl, kind){
  var box=$e(el); box.innerHTML='';
  box.appendChild(slotDiv(st, function(){
    var F=getFurnace(furnaceUI.x,furnaceUI.y,furnaceUI.z);
    var cur = kind==='in'?F.input : kind==='fuel'?{id:F.fuelName,count:1}:F.output;
    if(cur && cur.id){
      if(kind==='out'){ if(addItem(cur.id, F.output.count)){ F.output=null; sfx('pickup'); } }
      else{
        if(kind==='in'){ if(addItem(F.input.id, F.input.count)) F.input=null; }
        else { if(addItem(F.fuelName, 1)){ F.fuelName=null; } }
      }
    } else if(furSel!=null){
      var hst=inv.hot[furSel];
      if(hst && !isTool(hst.id)){
        if(kind==='in' && SMELT[hst.id]){ F.input=F.input||{id:hst.id,count:0}; if(F.input.id===hst.id){ F.input.count++; hst.count--; if(hst.count<=0) inv.hot[furSel]=null; } }
        if(kind==='fuel' && FUEL[hst.id]){ if(!F.fuelName){ F.fuelName=hst.id; hst.count--; if(hst.count<=0) inv.hot[furSel]=null; } }
      }
      furSel=null;
    }
    renderFurnace(); refreshInvUI();
  }));
  if(nameEl){
    var nm=$e(nameEl);
    if(nm) nm.textContent = st ? ((ITEMS[st.id]&&ITEMS[st.id].name)||st.id)+(st.count>1?' ×'+st.count:'') : '';
  }
}
function renderFurnace(){
  if(!furnaceUI) return;
  var F=getFurnace(furnaceUI.x,furnaceUI.y,furnaceUI.z);
  furSlot('fur-in', F.input, 'fur-in-name', 'in');
  furSlot('fur-fuel', F.fuelName?{id:F.fuelName,count:1}:null, 'fur-fuel-name', 'fuel');
  furSlot('fur-out', F.output, null, 'out');
  $e('fur-bar').style.width=Math.round(F.progress*100)+'%';
  var fi=$e('fur-inv');
  if(fi){
    fi.innerHTML='';
    for(var i=0;i<9;i++){
      (function(i){
        var d=slotDiv(inv.hot[i], function(){ furSel=(furSel===i)?null:i; renderFurnace(); });
        if(furSel===i) d.style.borderColor='#fff';
        fi.appendChild(d);
      })(i);
    }
  }
}
function wireFurnaceModal(){
  var card=$e('furnace-modal').querySelector('.inv-card');
  var dv=document.createElement('div');
  dv.id='fur-inv'; dv.style.display='flex'; dv.style.gap='4px'; dv.style.marginTop='8px';
  card.appendChild(dv);
  $e('furnace-close').addEventListener('click', function(){ $e('furnace-modal').classList.remove('open'); try{cv.requestPointerLock();}catch(e){} });
  $e('btn-smelt-take').addEventListener('click', function(){
    if(!furnaceUI) return;
    var F=getFurnace(furnaceUI.x,furnaceUI.y,furnaceUI.z);
    if(F.output && addItem(F.output.id, F.output.count)){ F.output=null; sfx('pickup'); renderFurnace(); refreshInvUI(); }
  });
}
function furnaceTick(dt){
  var keys=Object.keys(furnaces);
  for(var k=0;k<keys.length;k++){
    var parts=keys[k].split(',');
    var x=parseInt(parts[0]), y=parseInt(parts[1]), z=parseInt(parts[2]);
    if(G(x,y,z)!=='furnace'){ delete furnaces[keys[k]]; continue; }
    var F=furnaces[keys[k]];
    var outId=F.input?SMELT[F.input.id]:null;
    if(!outId || !F.input || F.input.count<=0){ F.progress=0; continue; }
    if(F.output && (F.output.id!==outId || F.output.count>=64)){ F.progress=0; continue; }
    if(F.fuelLeft<=0){
      if(F.fuelName && FUEL[F.fuelName]){ F.fuelLeft=FUEL[F.fuelName]; F.fuelName=null; }
      else { F.progress=0; continue; }
    }
    F.progress+=dt/8;
    if(F.progress>=1){
      F.progress=0; F.fuelLeft--;
      F.input.count--; if(F.input.count<=0) F.input=null;
      F.output=F.output||{id:outId,count:0}; F.output.count++;
      sfx('smelt');
      if(furnaceUI && furnaceKey(furnaceUI.x,furnaceUI.y,furnaceUI.z)===keys[k]){ renderFurnace(); refreshInvUI(); }
    }
  }
  if(furnaceUI && $e('furnace-modal').classList.contains('open')){ furAcc=(typeof furAcc==='undefined'?0:furAcc)+dt; if(furAcc>0.25){ furAcc=0; renderFurnace(); } }
}

/* =====================================================
   NOTCH PART 6 — survival, combat, mobs
===================================================== */
var health=20, hunger=20;
var dead=false;
var survAcc=0, hungerAcc=0, regenAcc=0, starveAcc=0, hudAcc=0;
var fallPeak=null, wasAir=false;
function damagePlayer(n, cause){
  if(dead || n<=0) return;
  health-=n;
  sfx('hurt');
  var f=$e('dmg-flash');
  if(f){ f.style.opacity='1'; setTimeout(function(){ f.style.opacity='0'; }, 180); }
  if(health<=0){ health=0; die(cause||'unknown'); }
  updateSurvivalHUD();
}
function die(cause){
  if(dead) return;
  dead=true;
  lmbDown=false;
  if(document.pointerLockElement) document.exitPointerLock();
  var msgs={fall:'took a fatal fall', mob:'was slain by a zombie', starve:'starved to death', void:'fell out of the world'};
  $e('death-msg').textContent='You '+ (msgs[cause]||'died') +' — inventory kept. Toughen up.';
  $e('death-screen').classList.add('open');
  sfx('death');
}
function respawn(){
  dead=false;
  health=20; hunger=20;
  $e('death-screen').classList.remove('open');
  spawnPlayer();
  updateSurvivalHUD();
  try{cv.requestPointerLock();}catch(e){}
}
function eatHeld(){
  var st=selectedStack();
  if(!st || !ITEMS[st.id] || !ITEMS[st.id].food) return;
  if(hunger>=20) return;
  hunger=Math.min(20, hunger+ITEMS[st.id].food);
  st.count--; if(st.count<=0) inv.hot[selectedBlockIndex]=null;
  sfx('eat'); refreshInvUI();
}
function survivalTick(dt){
  if(dead) return;
  hungerAcc+=dt;
  if(hungerAcc>75){ hungerAcc=0; if(hunger>0) hunger--; }
  if(hunger>=18 && health<20 && health>0){ regenAcc+=dt; if(regenAcc>3){ regenAcc=0; health=Math.min(20,health+1); } }
  if(hunger<=0){ starveAcc+=dt; if(starveAcc>4){ starveAcc=0; damagePlayer(1,'starve'); } }
  if(!player.onGround && !player.inWater){ if(fallPeak===null||player.pos[1]>fallPeak) fallPeak=player.pos[1]; wasAir=true; }
  else{
    if(wasAir && fallPeak!==null){
      var drop=fallPeak-player.pos[1];
      if(drop>3.5 && !player.inWater){ var d=Math.floor(drop-3.5); if(d>0) damagePlayer(d,'fall'); }
    }
    fallPeak=null; wasAir=false;
  }
  hudAcc+=dt;
  if(hudAcc>0.5){ hudAcc=0; updateSurvivalHUD(); }
}

var MOBTYPES={
  zombie:{hp:20, dmg:3, color:0x3f8c2f, h:1.9, hostile:true},
  pig:{hp:10, dmg:0, color:0xe090a0, h:1.0, hostile:false},
};
function mobMesh(type){
  var T=MOBTYPES[type]||MOBTYPES.zombie;
  // Classic 0.8 upload: zombies wear the authentic /char.png skin
  if(type==='zombie' && charSkinTex){
    return new THREE.Mesh(new THREE.BoxGeometry(0.6,T.h,0.6),
      new THREE.MeshLambertMaterial({map:charSkinTex}));
  }
  var m=new THREE.Mesh(new THREE.BoxGeometry(0.6,T.h,0.6), new THREE.MeshLambertMaterial({color:T.color}));
  return m;
}
function spawnMob(type, x, y, z){
  if(mobs.length>=10) return null;
  var T=MOBTYPES[type];
  var mesh=mobMesh(type);
  mesh.position.set(x, y+T.h/2, z);
  scene.add(mesh);
  var mob={type:type, pos:[x,y,z], vel:[0,0,0], hp:T.hp, maxhp:T.hp, mesh:mesh, hurtT:0, attackT:0, wanderT:0, dir:Math.random()*Math.PI*2,
    rot:Math.random()*Math.PI*2, rotA:(Math.random()+1)*0.01, timeOffs:Math.random()*1239813};
  mobs.push(mob);
  return mob;
}
function groundAt(x, z){
  for(var y=cfg.maxHeight;y>=0;y--){ var t=G(Math.floor(x),y,Math.floor(z)); if(t && isBlockSolid(t)) return y+1; }
  return cfg.waterLvl+1;
}
function spawnMobs(){
  for(var i=0;i<mobs.length;i++) if(mobs[i].mesh) scene.remove(mobs[i].mesh);
  mobs=[];
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var rng=PRNG(currentSeed+999);
  for(var k=0;k<3;k++){
    var x=CHUNK/2+(rng()-0.5)*40, z=CHUNK/2+(rng()-0.5)*40;
    spawnMob('pig', x, groundAt(x,z), z);
  }
}
function addMobMeshes(){}
function killMob(i, loot){
  var mob=mobs[i];
  if(mob.mesh) scene.remove(mob.mesh);
  if(loot){
    if(mob.type==='zombie'){
      var r=Math.random();
      if(r<0.5) spawnDrop('coal',1,mob.pos[0],mob.pos[1],mob.pos[2]);
      else if(r<0.8) spawnDrop('stick',1,mob.pos[0],mob.pos[1],mob.pos[2]);
    }else if(mob.type==='pig'){
      var n=1+Math.floor(Math.random()*2);
      spawnDrop('raw_pork',n,mob.pos[0],mob.pos[1],mob.pos[2]);
    }
  }
  mobs.splice(i,1);
  sfx('die');
}
function tryAttack(){
  var ex=player.pos[0], ey=player.pos[1]+player.eyeHeight, ez=player.pos[2];
  var vx=-Math.sin(player.yaw)*Math.cos(player.pitch);
  var vy=Math.sin(player.pitch);
  var vz=-Math.cos(player.yaw)*Math.cos(player.pitch);
  var best=-1, bestD=99;
  for(var i=0;i<mobs.length;i++){
    var mob=mobs[i];
    var T=MOBTYPES[mob.type];
    var cx=mob.pos[0]-ex, cy=(mob.pos[1]+T.h/2)-ey, cz=mob.pos[2]-ez;
    var d=Math.sqrt(cx*cx+cy*cy+cz*cz);
    if(d>3.6) continue;
    var dot=(cx*vx+cy*vy+cz*vz)/(d||1);
    if(dot<0.94) continue;
    if(d<bestD){ bestD=d; best=i; }
  }
  if(best<0) return false;
  var mob2=mobs[best];
  // attack cooldown: damage scales with recharge (swords 600ms, else 350ms)
  var nowT=(typeof performance!=='undefined')?performance.now():0;
  var cdMs=(selectedStack()&&ITEMS[selectedStack().id]&&ITEMS[selectedStack().id].dmg)?600:350;
  var prog=Math.min((nowT-lastAttackT)/cdMs,1);
  var dmg=heldWeaponDmg()*(0.25+0.75*prog*prog);
  if(prog>=1) lastAttackT=nowT;
  lastHitDmg=Math.round(dmg*10)/10;
  mob2.hp-=dmg;
  mob2.hurtT=0.25;
  mob2.vel[0]+=vx*5; mob2.vel[1]=3; mob2.vel[2]+=vz*5;
  if(mob2.type==='pig'){ mob2.dir=Math.atan2(-vx,-vz); mob2.wanderT=2; }
  try{ mob2.mesh.material.emissive=new THREE.Color(0xff0000); }catch(e){}
  sfx('hit');
  if(mob2.hp<=0) killMob(best, true);
  return true;
}
function updateMobs(dt){
  if(!dt || dt<=0) return;
  var isNight=(cfg.tod<5.5||cfg.tod>18.5);
  for(var i=mobs.length-1;i>=0;i--){
    var mob=mobs[i];
    var T=MOBTYPES[mob.type];
    if(mob.type==='zombie' && !isNight){
      mob.hp-=1*dt;
      if(mob.hp<=0){ killMob(i,false); continue; }
    }
    mob.vel[1]+=-16*dt;
    if(mob.vel[1]<-30) mob.vel[1]=-30;
    var dx=player.pos[0]-mob.pos[0], dz=player.pos[2]-mob.pos[2];
    var d=Math.sqrt(dx*dx+dz*dz);
    if(mob.type==='zombie' && !(T.hostile && !dead && d<14 && d>1.6)){
      // Authentic 0.8 Zombie.tick wander (character/Zombie.java):
      // rot drifts by rotA, rotA damps 0.99 + random walk kicks,
      // 8% hop when grounded, ground/air control 0.1/0.02, classic friction.
      mob.rot=(mob.rot||0)+(mob.rotA||0.01)*dt*20;
      mob.rotA=(mob.rotA||0.01)*Math.pow(0.99,dt*20);
      mob.rotA+=(Math.random()-Math.random())*Math.random()*Math.random()*0.08*dt*20;
      var wxa=Math.sin(mob.rot), wza=Math.cos(mob.rot);
      var ctl=mob.onGround?0.1:0.02;
      var ml=Math.sqrt(wxa*wxa+wza*wza);
      if(ml>=0.1){ var sc=ctl/Math.sqrt(ml); mob.vel[0]+=wxa*sc; mob.vel[2]+=wza*sc; }
      if(mob.onGround && Math.random()<0.08*dt*20) mob.vel[1]=8; // classic 0.5 blocks/tick hop
      var fr91=Math.pow(0.91,dt*20), fr98=Math.pow(0.98,dt*20), fr70=Math.pow(0.7,dt*20);
      mob.vel[0]*=fr91; mob.vel[2]*=fr91; mob.vel[1]*=fr98;
      if(mob.onGround){ mob.vel[0]*=fr70; mob.vel[2]*=fr70; }
      if(mob.mesh) mob.mesh.rotation.y=mob.rot;
    }
    else if(T.hostile && !dead && d<14 && d>1.6){ mob.vel[0]=(dx/d)*2.2; mob.vel[2]=(dz/d)*2.2; }
    else if(mob.type==='pig'){
      mob.wanderT-=dt;
      if(mob.wanderT<=0){ mob.wanderT=2+Math.random()*4; mob.dir=Math.random()*Math.PI*2; }
      var sp=(mob.hurtT>0||mob.wanderT>4)?2.0:0.8;
      if(dead){ sp=0.8; }
      mob.vel[0]=-Math.sin(mob.dir)*sp; mob.vel[2]=-Math.cos(mob.dir)*sp;
    } else { mob.vel[0]=0; mob.vel[2]=0; }
    var h=T.h;
    var a=aabbFromSize(mob.pos[0],mob.pos[1],mob.pos[2],0.6,h,0.6);
    var mv=moveAABB(a, mob.vel[0]*dt, mob.vel[1]*dt, mob.vel[2]*dt);
    mob.pos[0]=mv.aabb.x0+0.3; mob.pos[1]=mv.aabb.y0; mob.pos[2]=mv.aabb.z0+0.3;
    mob.onGround = mv.collidedY<0;
    if(mv.collidedY!==0) mob.vel[1]=0;
    if(mob.hurtT>0){ mob.hurtT-=dt; if(mob.hurtT<=0){ try{mob.mesh.material.emissive=new THREE.Color(0x000000);}catch(e){} } }
    mob.attackT-=dt;
    if(T.hostile && !dead && d<2.4 && mob.attackT<=0){ mob.attackT=1.2; damagePlayer(T.dmg,'mob'); }
    if(mob.mesh) mob.mesh.position.set(mob.pos[0], mob.pos[1]+h/2, mob.pos[2]);
    if(mob.pos[1]<-12){ killMob(i,false); }
  }
}
var spawnAcc=0;
function isNightNow(){ return cfg.tod<5.5||cfg.tod>18.5; }
function spawnerTick(dt){
  spawnAcc+=dt;
  if(spawnAcc<8) return;
  spawnAcc=0;
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var nz=0, np=0, k;
  for(k=0;k<mobs.length;k++){ if(mobs[k].type==='zombie') nz++; else np++; }
  if(isNightNow() && nz<5 && !dead){
    var a=Math.random()*Math.PI*2, r=18+Math.random()*10;
    var x=Math.max(2,Math.min(CHUNK-3,player.pos[0]+Math.sin(a)*r));
    var z=Math.max(2,Math.min(CHUNK-3,player.pos[2]+Math.cos(a)*r));
    var y=groundAt(x,z);
    if(y>cfg.waterLvl) spawnMob('zombie', x, y, z);
  }
  if(np<3){
    var x2=Math.max(2,Math.min(CHUNK-3,CHUNK/2+(Math.random()-0.5)*60));
    var z2=Math.max(2,Math.min(CHUNK-3,CHUNK/2+(Math.random()-0.5)*60));
    spawnMob('pig', x2, groundAt(x2,z2), z2);
  }
  // cave spawns: hostiles appear wherever light <= 7, day or night
  if(nz<6 && !dead){
    for(var t=0;t<6;t++){
      var cx0=Math.max(2,Math.min(CHUNK-3,player.pos[0]+(Math.random()-0.5)*40));
      var cz0=Math.max(2,Math.min(CHUNK-3,player.pos[2]+(Math.random()-0.5)*40));
      var sy=surfaceHeightAt(cx0,cz0);
      if(sy<9) continue;
      var cy=sy-2-Math.floor(Math.random()*Math.max(1,sy-8));
      if(cy<3||cy>=sy) continue;
      var ix0=Math.floor(cx0), iz0=Math.floor(cz0);
      if(lightAt(cx0,cy,cz0)<=7 && !G(ix0,cy,iz0) && !G(ix0,cy+1,iz0) && isBlockSolid(G(ix0,cy-1,iz0))){
        spawnMob('zombie',cx0,cy,cz0);
        break;
      }
    }
  }
}
/* Approx light model: sky 15 by day / 4 by night, -2 per block of depth */
function surfaceHeightAt(x,z){
  for(var y=cfg.maxHeight;y>=0;y--){ var t=G(Math.floor(x),y,Math.floor(z)); if(t&&isBlockSolid(t)) return y; }
  return 0;
}
function lightAt(x,y,z){
  var sky=isNightNow()?4:15;
  var s=surfaceHeightAt(x,z);
  if(y>=s) return sky;
  return Math.max(0, sky-(s-y)*2);
}

/* =====================================================
   NOTCH PART 7 — sound + save/load
===================================================== */
var Sfx={ctx:null,
  ensure:function(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(this.ctx&&this.ctx.state==='suspended'){ try{this.ctx.resume();}catch(e){} } return this.ctx; },
  tone:function(f,d,type,g,slide){
    var c=this.ensure(); if(!c) return;
    var o=c.createOscillator(), gn=c.createGain();
    o.type=type||'square'; o.frequency.setValueAtTime(f,c.currentTime);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),c.currentTime+d);
    gn.gain.setValueAtTime(g||0.12,c.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d);
    o.connect(gn); gn.connect(c.destination);
    o.start(); o.stop(c.currentTime+d);
  },
  noise:function(d,g,lp){
    var c=this.ensure(); if(!c) return;
    var len=Math.floor(c.sampleRate*d), buf=c.createBuffer(1,len,c.sampleRate), ch=buf.getChannelData(0);
    for(var i=0;i<len;i++) ch[i]=(Math.random()*2-1)*(1-i/len);
    var src=c.createBufferSource(); src.buffer=buf;
    var f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp||800;
    var gn=c.createGain(); gn.gain.value=g||0.15;
    src.connect(f); f.connect(gn); gn.connect(c.destination); src.start();
  },
  play:function(n){
    try{
      if(n==='break') this.noise(0.15,0.18,700);
      else if(n==='place') this.tone(180,0.09,'square',0.12);
      else if(n==='hit') this.tone(300,0.08,'square',0.12,150);
      else if(n==='hurt') this.tone(220,0.25,'sawtooth',0.15,90);
      else if(n==='eat'){ var s=this; [0,90,180].forEach(function(t){ setTimeout(function(){s.noise(0.07,0.12,1200);},t); }); }
      else if(n==='craft'){ this.tone(523,0.09,'square',0.1); var s2=this; setTimeout(function(){s2.tone(784,0.12,'square',0.1);},90); }
      else if(n==='smelt') this.tone(880,0.2,'sine',0.1);
      else if(n==='pickup') this.tone(660,0.06,'square',0.08);
      else if(n==='deny') this.tone(120,0.15,'square',0.1);
      else if(n==='break_tool') this.noise(0.3,0.15,500);
      else if(n==='death') this.tone(300,0.8,'sawtooth',0.15,60);
      // Uploaded SoundFont layer (assets/Minecraft.sf2, Grand Piano)
      if(cfg.piano && Sf2Piano.state==='ready'){
        if(n==='pickup') sf2Note(88,0,0.5,0.09);
        else if(n==='craft'){ sf2Note(72,0,0.8,0.09); sf2Note(76,0.09,0.8,0.09); sf2Note(79,0.18,1.0,0.09); }
        else if(n==='smelt') sf2Note(81,0,0.8,0.08);
        else if(n==='hurt') sf2Note(48,0,0.6,0.12);
        else if(n==='death'){ sf2Note(55,0,0.9,0.11); sf2Note(51,0.25,1.0,0.11); sf2Note(48,0.5,1.4,0.11); }
        else if(n==='break') sf2Note(64,0,0.3,0.05);
        else if(n==='place') sf2Note(67,0,0.3,0.05);
      }
    }catch(e){}
  }
};

var pendingLoad=null;
var autoSaveAcc=0;
function saveGame(silent){
  try{
    var data={v:1, seed:currentSeed, cfg:cfg, edits:editLog,
      player:{pos:player.pos.slice(), yaw:player.yaw, pitch:player.pitch},
      hp:{health:health, hunger:hunger}, inv:inv, tod:cfg.tod, furnaces:furnaces};
    localStorage.setItem('voxelcraft-save', JSON.stringify(data));
    if(!silent){ var bi=$e('block-info'); if(bi) bi.textContent='Game saved ('+Object.keys(editLog).length+' edits)'; sfx('craft'); }
    return true;
  }catch(e){ return false; }
}
function loadGame(){
  var raw=null;
  try{ raw=localStorage.getItem('voxelcraft-save'); }catch(e){}
  if(!raw){ sfx('deny'); var bi=$e('block-info'); if(bi) bi.textContent='No save found'; return; }
  var data=JSON.parse(raw);
  pendingLoad=data;
  Object.assign(cfg, data.cfg);
  currentSeed=data.seed;
  $e('s-seed').value=currentSeed;
  syncSidebar();
  generate(currentSeed);
}
function applyLoad(data){
  for(var k in data.edits){
    var p=k.split(','), v=data.edits[k];
    try{ setBlock(parseInt(p[0]),parseInt(p[1]),parseInt(p[2]),v); }catch(e){}
  }
  editLog=Object.assign({}, data.edits);
  inv=data.inv;
  health=data.hp.health; hunger=data.hp.hunger;
  cfg.tod=data.tod;
  furnaces=data.furnaces||{};
  player.pos=data.player.pos.slice(); player.yaw=data.player.yaw; player.pitch=data.player.pitch; player.vel=[0,0,0];
  try{ spawnMobs(); }catch(e){}
  refreshInvUI(); applyTOD();
  dirtyTilesSet.clear();
}
function syncSidebar(){
  var propMap={water:'waterLvl',maxh:'maxHeight',scale:'scale',oct:'oct',lac:'lac',gain:'gain',dscale:'dscale',dmix:'dmix',rscale:'rscale',rmix:'rmix',basemix:'basemix',exp:'exp',snow:'snowPct',treeline:'treeline',pineline:'pineline',sand:'sandPct',tspacing:'tSpacing',sparsedens:'sparseDens',cloudh:'cloudH',cloudspeed:'cloudSpeed',cloudamt:'cloudAmt',cloudsize:'cloudSize',cloudopa:'cloudOpa',tod:'tod',maxrebuild:'maxRebuildsPerFrame'};
  Object.keys(propMap).forEach(function(k){
    var el=$e('s-'+k); if(!el) return;
    el.value=cfg[propMap[k]];
    var vEl=$e('v-'+k); if(vEl) vEl.textContent=cfg[propMap[k]];
    updateSliderGrad(el);
  });
  updateZoneVis();
}
function wireSaveLoad(){
  $e('btn-save').addEventListener('click', function(){ saveGame(false); });
  $e('btn-load').addEventListener('click', function(){ loadGame(); });
}
function saveTick(dt){
  autoSaveAcc+=dt;
  if(autoSaveAcc>60){ autoSaveAcc=0; if(isLocked && !dead) saveGame(true); }
}
/* =====================================================
   SF2 PIANO — plays the uploaded assets/Minecraft.sf2
   (Grand Piano, preset 0) through WebAudio. Minimal parser:
   RIFF/sdta/smpl PCM + pdta preset→instrument→sample zones,
   key-range lookup, pitch-shifted one-shots with decay.
   Falls back silently to the retro synth if anything fails.
===================================================== */
var Sf2Piano={state:'idle', presets:null, samples:null, sampleData:null, ctxRate:44100};
function sf2ReadStr(d,o,n){ var s=''; for(var i=0;i<n;i++){ var c=d[o+i]; if(c===0) break; s+=String.fromCharCode(c); } return s; }
function sf2U16(d,o){ return d[o]|(d[o+1]<<8); }
function sf2U32(d,o){ return (d[o]|(d[o+1]<<8)|(d[o+2]<<16)|(d[o+3]<<24))>>>0; }
function sf2I16(d,o){ var v=sf2U16(d,o); return v>=0x8000?v-0x10000:v; }
async function sf2Ensure(){
  if(Sf2Piano.state==='ready') return true;
  if(Sf2Piano.state==='loading') return false;
  Sf2Piano.state='loading';
  try{
    var res=await fetch('assets/Minecraft.sf2');
    if(!res.ok) throw new Error('sf2 http '+res.status);
    var buf=new Uint8Array(await res.arrayBuffer());
    if(sf2ReadStr(buf,0,4)!=='RIFF'||sf2ReadStr(buf,8,4)!=='sfbk') throw new Error('not sfbk');
    var smpl=null, pdta={};
    var off=12;
    function walk(end){
      while(off+8<=end){
        var id=sf2ReadStr(buf,off,4), sz=sf2U32(buf,off+4);
        var body=off+8, bend=body+sz+(sz%2);
        if(id==='LIST'){
          var listType=sf2ReadStr(buf,body,4);
          var save=off; off=body+4;
          if(listType==='sdta'||listType==='pdta'){
            while(off+8<=bend){
              var sid=sf2ReadStr(buf,off,4), ssz=sf2U32(buf,off+4);
              var sbody=off+8, send=sbody+ssz+(ssz%2);
              if(listType==='sdta'&&sid==='smpl') smpl=buf.subarray(sbody,sbody+ssz);
              if(listType==='pdta'&&['phdr','pbag','pgen','inst','ibag','igen','shdr'].indexOf(sid)!==-1) pdta[sid]=buf.subarray(sbody,sbody+ssz);
              off=send;
            }
          }
          off=bend; void save;
        } else off=bend;
      }
    }
    walk(buf.length);
    if(!smpl||!pdta.phdr||!pdta.shdr) throw new Error('sf2 missing chunks');
    Sf2Piano.sampleData=smpl;
    var nSh=pdta.shdr.length/46, samples=[];
    for(var i=0;i<nSh;i++){
      var b=i*46;
      samples.push({
        name:sf2ReadStr(pdta.shdr,b,20),
        start:sf2U32(pdta.shdr,b+20), end:sf2U32(pdta.shdr,b+24),
        loopStart:sf2U32(pdta.shdr,b+28), loopEnd:sf2U32(pdta.shdr,b+32),
        rate:sf2U32(pdta.shdr,b+36), pitch:0, correction:0, link:0, type:0
      });
      samples[i].pitch=pdta.shdr[b+37];
      samples[i].correction=sf2I16(new Uint8Array([pdta.shdr[b+38],pdta.shdr[b+39]]),0);
      samples[i].link=sf2U16(pdta.shdr,b+40);
      samples[i].type=sf2U16(pdta.shdr,b+42);
    }
    Sf2Piano.samples=samples;
    // preset zones: find preset 0 bank 0
    var nPh=pdta.phdr.length/38, bag0=-1,bag1=-1;
    for(var p=0;p<nPh-1;p++){
      var pb=p*38, pn=sf2U16(pdta.phdr,pb+20), bk=sf2U16(pdta.phdr,pb+22);
      if(pn===0&&bk===0){ bag0=sf2U16(pdta.phdr,pb+24); bag1=sf2U16(pdta.phdr,pb+38+24); break; }
    }
    if(bag0<0) throw new Error('no preset 0');
    var zones=[];
    for(var bg=bag0;bg<bag1;bg++){
      var g0=sf2U32(pdta.pbag,bg*4), g1=sf2U32(pdta.pbag,bg*4+4);
      var z={inst:-1,lo:0,hi:127,coarse:0,fine:0};
      for(var g=g0;g<g1;g++){
        var gen=sf2U16(pdta.pgen,g*4), amt=sf2I16(pdta.pgen,g*4+2);
        if(gen===41) z.inst=amt;
        else if(gen===43){ z.lo=amt&0xff; z.hi=(amt>>8)&0xff; }
        else if(gen===51) z.coarse=amt;
        else if(gen===52) z.fine=amt;
      }
      if(z.inst>=0) zones.push(z);
    }
    // resolve instrument -> sample for each zone (first sample generator wins)
    var nInst=pdta.inst.length/22;
    Sf2Piano.presets=zones.map(function(z){
      var i0=sf2U16(pdta.inst,z.inst*22+20), i1=(z.inst+1<nInst)?sf2U16(pdta.inst,(z.inst+1)*22+20):pdta.ibag.length/4;
      for(var ib=i0;ib<i1;ib++){
        var q0=sf2U32(pdta.ibag,ib*4), q1=sf2U32(pdta.ibag,ib*4+4);
        var sample=-1,lo=z.lo,hi=z.hi,coarse=z.coarse,fine=z.fine;
        for(var q=q0;q<q1;q++){
          var gg=sf2U16(pdta.igen,q*4), aa=sf2I16(pdta.igen,q*4+2);
          if(gg===53) sample=aa;
          else if(gg===43){ lo=aa&0xff; hi=(aa>>8)&0xff; }
          else if(gg===51) coarse+=aa;
          else if(gg===52) fine+=aa;
        }
        if(sample>=0&&sample<samples.length) return {sample:sample,lo:lo,hi:hi,coarse:coarse,fine:fine};
      }
      return null;
    }).filter(Boolean);
    if(!Sf2Piano.presets.length) throw new Error('no zones');
    Sf2Piano.state='ready';
    return true;
  }catch(e){ Sf2Piano.state='failed'; Sf2Piano.err=String(e&&e.message||e); return false; }
}
function sf2Note(midi, delay, dur, gain){
  try{
    if(!cfg.piano) return;
    if(Sf2Piano.state!=='ready') return;
    var ac=Sfx.ensure(); if(!ac) return;
    var Z=null;
    for(var i=0;i<Sf2Piano.presets.length;i++){ var z=Sf2Piano.presets[i]; if(midi>=z.lo&&midi<=z.hi){ Z=z; break; } }
    if(!Z) Z=Sf2Piano.presets[0];
    var S=Sf2Piano.samples[Z.sample];
    var cents=(midi*100)-(S.pitch*100+S.correction)+Z.coarse*100+Z.fine;
    var rate=Math.pow(2,cents/1200)*(S.rate/ac.sampleRate);
    if(!isFinite(rate)||rate<=0.05||rate>16) return;
    var n=S.end-S.start;
    if(n<=64) return;
    var raw=Sf2Piano.sampleData;
    var len=Math.min(n, Math.floor(ac.sampleRate*(dur||1.2)*rate)+64);
    var ab=ac.createBuffer(1,len,ac.sampleRate);
    var ch=ab.getChannelData(0);
    for(var s=0;s<len;s++){
      var idx=(S.start+Math.floor(s*rate))*2;
      var v=(raw[idx]|(raw[idx+1]<<8));
      if(v>=0x8000) v-=0x10000;
      ch[s]=v/32768;
    }
    var src=ac.createBufferSource(); src.buffer=ab;
    var g=ac.createGain();
    var t=ac.currentTime+(delay||0), D=dur||1.2, gv=gain||0.12;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0011,gv),t+0.015);
    g.gain.exponentialRampToValueAtTime(0.0001,t+D);
    src.connect(g); g.connect(ac.destination);
    src.start(t); src.stop(t+D+0.05);
  }catch(e){}
}
var musicTimer=null;
function musicTick(){
  try{
    if(!cfg.music||dead) return;
    if(Sf2Piano.state!=='ready') return;
    var scale=[60,62,64,67,69,72,74,76];
    var root=scale[Math.floor(Math.random()*scale.length)];
    sf2Note(root,0,2.2,0.05);
    sf2Note(root+7,0.35,2.0,0.04);
    if(Math.random()<0.5) sf2Note(root+12,0.7,2.4,0.035);
  }catch(e){}
}
function ensureMusic(){
  if(musicTimer) return;
  musicTimer=setInterval(function(){
    if(cfg.music && !dead && isLocked) musicTick();
  },22000);
}

/* test hooks */
animate();
(function(){
  if(!window.VC) return;
  window.VC.give=function(id,n){ addItem(id,n||1); refreshInvUI(); return countItem(id); };
  window.VC.inv=function(){ return JSON.parse(JSON.stringify(inv)); };
  window.VC.craftTest=function(rows){ return matchRecipe((rows.length&&rows[0] instanceof Array)?rows:parsePat(rows)); };
  window.VC.hp=function(){ return {health:health, hunger:hunger, dead:dead}; };
  window.VC.hurt=function(n){ damagePlayer(n||5,'mob'); };
  window.VC.eat=function(){ eatHeld(); };
  window.VC.mine=function(x,y,z){ doBreak(x,y,z); return G(x,y,z); };
  window.VC.nearTable=function(){ return nearCraftTable(); };
  window.VC.furnOpen=function(x,y,z){ openFurnace(x,y,z); return $e('furnace-modal').classList.contains('open'); };
  window.VC.furnSetup=function(x,y,z,inputId,fuelLeft){ setBlock(x,y,z,'furnace'); var F=getFurnace(x,y,z); F.input={id:inputId,count:2}; F.fuelLeft=fuelLeft; F.progress=0; return true; };
  window.VC.furnRead=function(x,y,z){ return JSON.parse(JSON.stringify(getFurnace(x,y,z))); };
  window.VC.save=function(silent){ return saveGame(silent!==false); };
  window.VC.load=function(){ loadGame(); };
  window.VC.edits=function(){ return Object.keys(editLog).length; };
  window.VC.starve=function(n){ hunger=Math.max(0,hunger-(n||5)); updateSurvivalHUD(); };
  window.VC.cdProg=function(){ return attackCdProg(); };
  window.VC.lastDmg=function(){ return lastHitDmg; };
  window.VC.light=function(x,y,z){ return lightAt(x,y,z); };
  window.VC.key=function(code,down){ keys[code]=!!down; };
  window.VC.keys=function(){ var o={}; for(var k in keys) o[k]=keys[k]; return o; };
  window.VC.iconCached=function(id){ var im=vanillaIconCache[id]; return !!(im&&im.width); };
  window.VC.iconsCached=function(){ var n=0; for(var k in vanillaIconCache){ if(vanillaIconCache[k]&&vanillaIconCache[k].width) n++; } return n; };
  window.VC.waterFrames=function(){ return waterAnim?waterAnim.frames:0; };
  window.VC.pstate=function(){ return {sprinting:!!player.sprinting, crawling:!!player.crawling, h:player.size[1], eye:player.eyeHeight, onGround:player.onGround}; };
  window.VC.particles=function(){ return breakParticles.length; };
  window.VC.sf2=function(){ return {state:Sf2Piano.state, zones:Sf2Piano.presets?Sf2Piano.presets.length:0, err:Sf2Piano.err||null}; };
  window.VC.sf2note=function(m){ sf2Note(m||72,0,1.0,0.1); return Sf2Piano.state; };
  window.VC.zombieRot=function(i){ var m=mobs[i||0]; return m?{rot:m.rot,rotA:m.rotA,type:m.type}:null; };
  window.VC.bench=function(){ return JSON.parse(JSON.stringify({frames:bench.frames, frameMs:Math.round(bench.frameMsAvg*100)/100, fps:fps, tilesTotal:bench.tilesTotal, tilesLoaded:Object.keys(tileGroupsMap).length, dirty:dirtyTilesSet.size, pendingPeak:bench.pendingPeak, rebuilds:bench.rebuilds, lastMs:Math.round(bench.lastMs*100)/100, lastKey:bench.lastKey, avgMs:Math.round(bench.rebuildMsAvg*100)/100, maxMs:Math.round(bench.rebuildMsMax*100)/100, tris:bench.tris, verts:bench.verts, benchRes:bench.benchRes})); };
  window.VC.markAllDirty=function(){ markAllDirty(); return dirtyTilesSet.size; };
  window.VC.benchSync=function(){ return benchRebuildAllSync(); };
})();

/* =====================================================
   CHUNKS & REBUILD BENCHMARK (chunk borders + flash + stats)
===================================================== */
function fmtMs(v){ return (Math.round(v*100)/100)+' ms'; }
function recordTileStat(key, mesh, ms){
  if(tileStatsMap[key]){ bench.tris-=tileStatsMap[key].tris; bench.verts-=tileStatsMap[key].verts; }
  var tris=0, verts=0;
  if(mesh) mesh.traverse(function(o){
    if(o.geometry){
      var p=o.geometry.getAttribute('position');
      if(p) verts+=p.count;
      if(o.geometry.index) tris+=o.geometry.index.count/3;
      else if(p) tris+=p.count/3;
    }
  });
  tris=Math.round(tris); verts=Math.round(verts);
  tileStatsMap[key]={tris:tris, verts:verts, ms:ms};
  bench.tris+=tris; bench.verts+=verts;
  bench.rebuilds++; bench.rebuildMsTotal+=ms;
  bench.rebuildMsAvg=bench.rebuildMsTotal/bench.rebuilds;
  if(ms>bench.rebuildMsMax) bench.rebuildMsMax=ms;
  bench.lastMs=ms; bench.lastKey=key;
}
function resetBench(){
  bench.frames=0; bench.rebuilds=0; bench.rebuildMsTotal=0; bench.rebuildMsAvg=0;
  bench.rebuildMsMax=0; bench.lastMs=0; bench.lastKey=''; bench.tris=0; bench.verts=0;
  bench.pendingPeak=0;
  tileStatsMap={};
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  bench.tilesTotal=Math.ceil(CHUNK/TILE)*Math.ceil(CHUNK/TILE);
  updateChunkBorders();
  updateBenchUI();
}
function allTileKeys(){
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx], keys=[];
  for(var tz=0;tz<CHUNK;tz+=TILE) for(var tx=0;tx<CHUNK;tx+=TILE) keys.push(tx+','+tz);
  return keys;
}
function markAllDirty(){
  var keys=allTileKeys();
  for(var i=0;i<keys.length;i++) dirtyTilesSet.add(keys[i]);
  if(keys.length>bench.pendingPeak) bench.pendingPeak=keys.length;
}
function benchRebuildAllSync(){
  var keys=allTileKeys();
  var t0=performance.now();
  for(var i=0;i<keys.length;i++){ dirtyTilesSet.delete(keys[i]); rebuildTile(keys[i]); }
  var total=performance.now()-t0;
  bench.benchRes=keys.length+' tiles / '+Math.round(total)+' ms total / '+fmtMs(total/Math.max(1,keys.length))+' avg';
  updateBenchUI();
  return {tiles:keys.length, totalMs:Math.round(total*100)/100, avgMs:Math.round(total/Math.max(1,keys.length)*100)/100};
}
function benchStreamAll(){
  markAllDirty();
  bench.benchRes='streaming '+allTileKeys().length+' tiles at '+cfg.maxRebuildsPerFrame+'/frame budget…';
  updateBenchUI();
}
function clearBenchStats(){
  bench.rebuilds=0; bench.rebuildMsTotal=0; bench.rebuildMsAvg=0; bench.rebuildMsMax=0;
  bench.lastMs=0; bench.lastKey=''; bench.pendingPeak=dirtyTilesSet.size; bench.benchRes='--';
  updateBenchUI();
}
function updateBenchUI(){
  var loaded=Object.keys(tileGroupsMap).length;
  var b0=$e('bench-chunks'); if(b0) b0.textContent=loaded+'/'+bench.tilesTotal;
  var b1=$e('bench-dirty'); if(b1) b1.textContent=dirtyTilesSet.size;
  var b2=$e('bench-rebuild'); if(b2) b2.textContent=(bench.rebuilds?fmtMs(bench.lastMs)+' (avg '+fmtMs(bench.rebuildMsAvg)+')':'--');
  var b3=$e('bench-tris'); if(b3) b3.textContent=bench.tris?bench.tris.toLocaleString():'--';
  var s=function(id,v){ var el=$e(id); if(el) el.textContent=v; };
  s('b-tiles', loaded+' / '+bench.tilesTotal);
  s('b-dirty', dirtyTilesSet.size);
  s('b-peak', bench.pendingPeak);
  s('b-frame', fmtMs(bench.frameMsAvg));
  s('b-fps', (fps||'--')+' fps');
  s('b-last', bench.rebuilds?fmtMs(bench.lastMs):'--');
  s('b-lastkey', bench.lastKey?('@'+bench.lastKey):'');
  s('b-avg', bench.rebuilds?fmtMs(bench.rebuildMsAvg):'--');
  s('b-max', bench.rebuilds?fmtMs(bench.rebuildMsMax):'--');
  s('b-total', bench.rebuilds);
  s('b-tris', bench.tris?bench.tris.toLocaleString():'--');
  s('b-verts', bench.verts?bench.verts.toLocaleString():'--');
  s('b-benchres', bench.benchRes);
}
function updateChunkBorders(){
  if(chunkBorderGroup){ scene.remove(chunkBorderGroup); chunkBorderGroup.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); }); chunkBorderGroup=null; }
  if(!cfg.showChunkBorders) return;
  var CHUNK=CHUNK_SIZES[cfg.chunkIdx];
  var g=new THREE.Group();
  var mat=new THREE.LineBasicMaterial({color:0x00ff88, transparent:true, opacity:0.55});
  for(var tz=0;tz<CHUNK;tz+=TILE) for(var tx=0;tx<CHUNK;tx+=TILE){
    var tw=Math.min(TILE,CHUNK-tx), th=Math.min(TILE,CHUNK-tz);
    var y=cfg.waterLvl+1.5;
    var pts=[tx,y,tz, tx+tw,y,tz, tx+tw,y,tz, tx+tw,y,tz+th, tx+tw,y,tz+th, tx,y,tz+th, tx,y,tz+th, tx,y,tz];
    var geo=new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts,3));
    g.add(new THREE.LineSegments(geo, mat));
  }
  chunkBorderGroup=g;
  scene.add(g);
}
function flashTile(tx,tz,tw,th){
  if(cfg.showFlash===false) return;
  try{
    if(!flashGroup){ flashGroup=new THREE.Group(); scene.add(flashGroup); }
    var y=cfg.waterLvl+1.6;
    var geo=new THREE.PlaneGeometry(tw,th);
    var mat=new THREE.MeshBasicMaterial({color:0xffd040, transparent:true, opacity:0.35, depthWrite:false, side:THREE.DoubleSide});
    var m=new THREE.Mesh(geo,mat);
    m.rotation.x=-Math.PI/2;
    m.position.set(tx+tw/2, y, tz+th/2);
    flashGroup.add(m);
    flashes.push({mesh:m, life:1.2});
    if(flashes.length>24){ var o=flashes.shift(); flashGroup.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose(); }
  }catch(e){}
}
function updateFlashes(dt){
  if(!flashes.length) return;
  for(var i=flashes.length-1;i>=0;i--){
    var f=flashes[i];
    f.life-=dt;
    if(f.life<=0){ flashGroup.remove(f.mesh); f.mesh.geometry.dispose(); f.mesh.material.dispose(); flashes.splice(i,1); }
    else f.mesh.material.opacity=0.35*(f.life/1.2);
  }
}
function clearFlashes(){
  flashes=[];
  if(flashGroup){ scene.remove(flashGroup); flashGroup.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); }); flashGroup=null; }
}
function wireBench(){
  var hud=$e('cb-benchhud');
  if(hud) hud.addEventListener('change', function(){ var b=$e('bench'); if(b) b.style.display=this.checked?'block':'none'; });
  var cb=$e('cb-chunkborders');
  if(cb) cb.addEventListener('change', function(){ cfg.showChunkBorders=this.checked; updateChunkBorders(); });
  var fl=$e('cb-flash');
  if(fl) fl.addEventListener('change', function(){ cfg.showFlash=this.checked; if(!this.checked) clearFlashes(); });
  var d=$e('btn-dirtyall'); if(d) d.addEventListener('click', function(){ markAllDirty(); updateBenchUI(); });
  var s2=$e('btn-benchsync'); if(s2) s2.addEventListener('click', function(){ var r=benchRebuildAllSync(); var bi=$e('block-info'); if(bi) bi.textContent='BENCH: '+r.tiles+' tiles in '+r.totalMs+' ms ('+r.avgMs+' ms avg)'; });
  var st=$e('btn-benchstream'); if(st) st.addEventListener('click', function(){ benchStreamAll(); });
  var cl=$e('btn-benchclear'); if(cl) cl.addEventListener('click', function(){ clearBenchStats(); });
}
wireBench();
wirePerfGateBoot();

/* =====================================================
   PRE-LOAD PERFORMANCE GATE — probe the player's PC,
   recommend a preset, pre-apply it before world gen.
   The sidebar benchmark stays as the optional debug view.
===================================================== */
/* (preset data declared up top) */
function detectSpecs(){
  var sp={cores:(navigator.hardwareConcurrency||'unknown'), mem:(navigator.deviceMemory||'unknown'), dpr:window.devicePixelRatio||1, screen:(window.screen?screen.width+'×'+screen.height:'unknown'), gpu:'unknown', swift:false};
  try{
    var gl=renderer.getContext();
    var ext=gl.getExtension('WEBGL_debug_renderer_info');
    if(ext) sp.gpu=gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'unknown';
  }catch(e){}
  if(sp.gpu && /swiftshader|llvmpipe|software|basic render|angle \(google/i.test(String(sp.gpu))) sp.swift=true;
  return sp;
}
function pickPreset(pr, sp){
  if(sp.swift) return 'potato';
  if(typeof sp.mem==='number' && sp.mem<=4) return (pr.cpuMs>1200||pr.gpuMs>50)?'potato':'laptop';
  if(typeof sp.cores==='number' && sp.cores<=2) return 'potato';
  if(pr.cpuMs>2500||pr.gpuMs>100) return 'potato';
  if(pr.cpuMs>1200||pr.gpuMs>50) return 'laptop';
  if(pr.cpuMs>500||pr.gpuMs>25) return 'gaming';
  return 'beast';
}
async function runProbe(onStep){
  matCache={}; buildTextures();
  var step=onStep||function(){};
  step('Noise math…');
  var p=makeNoise(1234), acc=0;
  var n0=performance.now();
  for(var i=0;i<20000;i++){ acc+=p((i*0.13)%97,(i*0.29)%89); }
  var noiseMs=performance.now()-n0;
  step('Test world (32×32)…');
  await sleep(10);
  var keep={chunkIdx:cfg.chunkIdx, maxHeight:cfg.maxHeight, waterLvl:cfg.waterLvl, showWater:cfg.showWater};
  cfg.chunkIdx=1; cfg.maxHeight=64; cfg.waterLvl=20; cfg.showWater=true;
  var g0=performance.now();
  var res=genWorld(777);
  var genMs=performance.now()-g0;
  step('Test mesh build…');
  await sleep(10);
  var gb=makeLookup(res.colMap,res.typeNames,res.CHUNK);
  var m0=performance.now();
  var testMesh=buildTileMesh(res.colMap,res.typeNames,gb,res.CHUNK,0,0,res.CHUNK,res.CHUNK);
  var meshMs=performance.now()-m0;
  step('Test render (12 frames)…');
  scene.add(testMesh);
  var frames=0, f0=performance.now(), tStart=performance.now();
  await new Promise(function(done){
    function fr(){
      renderer.render(scene,camera);
      frames++;
      if(frames<12 && performance.now()-tStart<2000) requestAnimationFrame(fr);
      else done();
    }
    requestAnimationFrame(fr);
  });
  var gpuMs=(performance.now()-f0)/Math.max(1,frames);
  scene.remove(testMesh);
  testMesh.traverse(function(o){ if(o.geometry) o.geometry.dispose(); if(o.material && o.material.map!==undefined && !matCache[o.material.map]){/* shared */} });
  cfg.chunkIdx=keep.chunkIdx; cfg.maxHeight=keep.maxHeight; cfg.waterLvl=keep.waterLvl; cfg.showWater=keep.showWater;
  if(acc===123456789) acc=0;
  return {noiseMs:Math.round(noiseMs*10)/10, genMs:Math.round(genMs*10)/10, meshMs:Math.round(meshMs*10)/10, gpuMs:Math.round(gpuMs*10)/10, cpuMs:Math.round((noiseMs+genMs+meshMs)*10)/10};
}
function presetDetail(k){
  var P=PRESETS[k], CH=CHUNK_SIZES[P.chunkIdx];
  return P.label+' → '+CH+'×'+CH+' world, '+P.maxRebuilds+'/frame rebuilds, shadows '+(P.shadows?'on ('+P.shadowSize+')':'off')+', '+P.clouds+' clouds.';
}
function renderPerfGate(){
  var sx=$e('perf-specs');
  if(sx && perfSpecs){
    sx.innerHTML='<div>CPU cores</div><div>'+perfSpecs.cores+'</div>'+
      '<div>Device memory</div><div>'+(perfSpecs.mem==='unknown'?'unknown':perfSpecs.mem+' GB')+'</div>'+
      '<div>GPU</div><div>'+String(perfSpecs.gpu).slice(0,48)+'</div>'+
      '<div>Display</div><div>'+perfSpecs.screen+' @'+perfSpecs.dpr+'x</div>'+
      (perfProbe?'<div>Noise test</div><div>'+perfProbe.noiseMs+' ms</div><div>World+mesh test</div><div>'+perfProbe.genMs+' + '+perfProbe.meshMs+' ms</div><div>Avg frame</div><div>'+perfProbe.gpuMs+' ms</div>':'');
  }
  var box=$e('perf-presets');
  if(box){
    box.innerHTML='';
    PRESET_ORDER.forEach(function(k){
      var P=PRESETS[k];
      var b=document.createElement('button');
      b.className='perf-preset'+(k===perfPick?' selected':'')+(perfProbe&&k===perfProbe.rec?' recommended':'');
      b.innerHTML='<b>'+P.label+'</b><small>'+P.sub+'</small>';
      b.title=P.desc;
      b.addEventListener('click',function(){ perfPick=k; try{localStorage.setItem('voxelcraft-preset',k);}catch(e){} renderPerfGate(); });
      box.appendChild(b);
    });
  }
  var d=$e('perf-detail');
  if(d) d.textContent=presetDetail(perfPick)+(perfProbe&&perfPick===perfProbe.rec?' (recommended for your PC)':'');
}
function applyPreset(k){
  var P=PRESETS[k]||PRESETS.laptop;
  cfg.chunkIdx=P.chunkIdx;
  cfg.maxRebuildsPerFrame=P.maxRebuilds;
  cfg.cloudAmt=P.clouds;
  try{ renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, P.pixelRatio)); }catch(e){}
  try{
    renderer.shadowMap.enabled=P.shadows;
    sunLight.castShadow=P.shadows;
    sunLight.shadow.mapSize.width=sunLight.shadow.mapSize.height=P.shadowSize;
    if(sunLight.shadow.map){ sunLight.shadow.map.dispose(); sunLight.shadow.map=null; }
    var CH=CHUNK_SIZES[P.chunkIdx], r=Math.max(120,Math.round(CH*0.9));
    sunLight.shadow.camera.left=-r; sunLight.shadow.camera.right=r;
    sunLight.shadow.camera.top=r; sunLight.shadow.camera.bottom=-r;
    sunLight.shadow.camera.updateProjectionMatrix();
  }catch(e){}
  try{
    document.querySelectorAll('.sz-badge').forEach(function(b){ b.classList.toggle('active',parseInt(b.dataset.idx)===P.chunkIdx); });
    var sm=$e('s-maxrebuild'); if(sm){ sm.value=P.maxRebuilds; var vv=$e('v-maxrebuild'); if(vv) vv.textContent=P.maxRebuilds; updateSliderGrad(sm); }
    var sc=$e('s-cloudamt'); if(sc){ sc.value=P.clouds; var vc=$e('v-cloudamt'); if(vc) vc.textContent=P.clouds; updateSliderGrad(sc); }
  }catch(e){}
  onResize();
  try{localStorage.setItem('voxelcraft-preset',k);}catch(e){}
}
async function showPerfGate(){
  var gate=$e('perf-gate');
  if(gate) gate.classList.remove('hidden');
  var play=$e('btn-play');
  if(play) play.disabled=true;
  perfSpecs=detectSpecs();
  try{ var saved=localStorage.getItem('voxelcraft-preset'); if(saved&&PRESETS[saved]) perfPick=saved; }catch(e){}
  renderPerfGate();
  var st=$e('perf-status');
  try{
    perfProbe=await runProbe(function(msg){ if(st) st.textContent=msg; });
    perfProbe.rec=pickPreset(perfProbe, perfSpecs);
    try{ var sv=localStorage.getItem('voxelcraft-preset'); perfPick=(sv&&PRESETS[sv])?sv:perfProbe.rec; }catch(e){ perfPick=perfProbe.rec; }
    if(st) st.textContent='Done in '+Math.round(perfProbe.cpuMs+perfProbe.gpuMs*20)+' ms — pick a preset and enter.';
  }catch(err){
    if(st) st.textContent='Probe failed, defaulting to Laptop. You can change everything later in the sidebar.';
    perfPick='laptop';
  }
  renderPerfGate();
  if(play) play.disabled=false;
}
function wirePerfGate(){
  var rp=$e('btn-reprobe');
  if(rp) rp.addEventListener('click', function(){ showPerfGate(); });
  var play=$e('btn-play');
  if(play) play.addEventListener('click', function(){
    if(perfPlaying) return;
    perfPlaying=true;
    play.disabled=true;
    play.textContent='Loading…';
    applyPreset(perfPick);
    $e('perf-gate').classList.add('hidden');
    generate(currentSeed).then(function(){ perfPlaying=false; play.disabled=false; play.textContent='Enter World'; });
  });
}
function wirePerfGateBoot(){ wirePerfGate(); }
})();
