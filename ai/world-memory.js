/* ==========================================================================
   WorldMemory — a poke.AI-style world model for the SNESBoy copilots.
   --------------------------------------------------------------------------
   poke.AI plays Pokemon Emerald with three ideas this module borrows:

   1. Vision-first object detection. Its RetinaNet finds NPCs, houses, gyms,
      Pokecenters, marts and exits in every frame. No trained model ships
      with this playground, so the browser-sized stand-in is a generic
      salient-blob detector over the same 32x32 RGB tap the vision loop
      already produces. Colour and shape assign a coarse kind; nothing is
      claimed to be a real Pokemon class.

   2. SLAM-inspired localization and mapping. poke.AI accumulates odometry
      from the agent's movement, converts screen-space detections to global
      coordinates, and checks every new detection against the objects it
      already remembers. Here the existing colShift/rowShift readings are
      the odometry, a global cell grid stores where the camera has been,
      and repeated landmark sightings are merged instead of duplicated.
      Re-entering a cell first seen long ago is recorded as a loop closure.

   3. Frontier-based exploration. Object memory is only useful if the agent
      seeks the edge of what it knows. When a pilot keeps scrolling through
      remembered cells, this module counts unvisited neighbours on each side
      and hands the drive loop a direction to explore.

   The module is dependency-free and read-only: it never touches the ROM,
   the emulator or the DOM. `world-memory` is intentionally separate from
   the reactive copilot, the manual priors and the recorded DQN dataset so
   all three approaches run in tandem.
   ========================================================================== */
(function(root){
  'use strict';

  var W = 32, H = 32;

  function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
  function key(x, y){ return x + ',' + y; }
  function colorDist(a, b){
    var dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }
  function luma(r, g, b){ return (r * 299 + g * 587 + b * 114) / 1000; }

  /* Coarse, honest labels. They describe the detected colour blob, not a
     guaranteed game object — the UI says so too. */
  function classify(r, g, b, area){
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var sat = mx - mn, lum = luma(r, g, b);
    if(lum >= 205 && sat < 45) return 'gate';
    if(area < 18 && sat >= 45) return 'npc';
    if(sat < 34) return 'house';
    if(r >= g + 34 && r >= b + 34) return 'center';
    if(b >= r + 28 && b >= g + 8) return 'mart';
    if(g >= r + 24 && g >= b + 24) return 'gym';
    return 'house';
  }

  function WorldMemory(options){
    options = options || {};
    this.cell = Math.max(1, options.cell || 4);        /* world units per map cell */
    this.matchRadius = options.matchRadius || 7;        /* same-object radius */
    this.maxCells = options.maxCells || 6000;
    this.maxLandmarks = options.maxLandmarks || 64;
    this.maxTrail = options.maxTrail || 48;

    this.pos = { x: 0, y: 0 };                          /* camera centre, world px */
    this.cells = Object.create(null);                    /* 'x,y' -> cell record */
    this.landmarks = [];                                 /* global object memory */
    this.trail = [{ x: 0, y: 0 }];
    this.tick = 0;
    this.lastDir = 0;
    this.lastSh = 0;
    this.lastShy = 0;
    this.lastNewCells = 0;
    this.lastNewCellTick = 0;
    this.exploring = false;
    this.forcedDir = 0;                                  /* -1 left, 1 right */
    this.forcedUntil = 0;
    this.forceStart = 0;
    this.closures = 0;
    this.lastClosure = null;
    this.revisits = 0;
  }

  WorldMemory.prototype.cellAt = function(wx, wy){
    return key(Math.round(wx / this.cell), Math.round(wy / this.cell));
  };

  WorldMemory.prototype.touchCell = function(cx, cy, now, moved){
    var k = key(cx, cy), c = this.cells[k];
    if(!c){
      c = this.cells[k] = { x: cx, y: cy, n: 1, first: now, last: now };
      this.lastNewCells++;
      this.lastNewCellTick = now;
      return c;
    }
    if(moved && now - c.last > 8) this.revisits++;
    c.n++;
    c.last = now;
    return c;
  };

  /* Walk the segment between the previous and new camera position so fast
     pans do not leave holes in the visited map. */
  WorldMemory.prototype.markSegment = function(dx, dy, now){
    var moved = Math.abs(dx) + Math.abs(dy) >= 1;
    var steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / this.cell));
    var sx = dx / steps, sy = dy / steps;
    for(var i = 1; i <= steps; i++){
      this.touchCell(Math.round((this.pos.x - dx + sx * i) / this.cell),
                     Math.round((this.pos.y - dy + sy * i) / this.cell), now, moved);
    }
  };

  WorldMemory.prototype.screenToWorld = function(sx, sy){
    return { x: this.pos.x + (sx - (W - 1) / 2), y: this.pos.y + (sy - (H - 1) / 2) };
  };

  /* Connected salient pixels -> blobs. This is the budget RetinaNet: colour
     contrast plus brightness, filtered by area and compactness. */
  WorldMemory.prototype.detectBlobs = function(rgb){
    var mask = new Uint8Array(W * H), i, x, y;
    for(i = 0; i < W * H; i++){
      var r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      mask[i] = ((mx - mn) >= 45 && luma(r, g, b) >= 45 && luma(r, g, b) <= 250) ||
                (luma(r, g, b) >= 220 && (mx - mn) < 38) ? 1 : 0;
    }
    var seen = new Uint8Array(W * H), out = [], stack = [];
    for(y = 0; y < H; y++) for(x = 0; x < W; x++){
      i = y * W + x;
      if(!mask[i] || seen[i]) continue;
      stack.length = 0; stack.push(i); seen[i] = 1;
      var area = 0, minX = W, maxX = -1, minY = H, maxY = -1;
      var rs = 0, gs = 0, bs = 0;
      while(stack.length){
        var p = stack.pop(), px = p % W, py = (p / W) | 0;
        area++;
        if(px < minX) minX = px; if(px > maxX) maxX = px;
        if(py < minY) minY = py; if(py > maxY) maxY = py;
        rs += rgb[p * 3]; gs += rgb[p * 3 + 1]; bs += rgb[p * 3 + 2];
        var nb = [p - 1, p + 1, p - W, p + W];
        for(var n = 0; n < 4; n++){
          var q = nb[n];
          if(q < 0 || q >= W * H || seen[q] || !mask[q]) continue;
          if(n === 0 && px === 0) continue;
          if(n === 1 && px === W - 1) continue;
          seen[q] = 1; stack.push(q);
        }
      }
      if(area < 5 || area > 260) continue;
      var bw = maxX - minX + 1, bh = maxY - minY + 1;
      if(bw > 18 || bh > 26 || bw / bh > 5 || bh / bw > 5) continue;
      var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      /* Top/bottom status bars are screen-fixed, not world objects; a
         naive camera transform would smear them into fake landmarks. */
      if(cy < 4.5 || cy > 27.5) continue;
      var mr = Math.round(rs / area), mg = Math.round(gs / area), mb = Math.round(bs / area);
      out.push({ cx: cx, cy: cy, area: area,
        rgb: [mr, mg, mb], kind: classify(mr, mg, mb, area),
        score: area * (0.6 + (Math.max(mr, mg, mb) - Math.min(mr, mg, mb)) / 255) });
    }
    out.sort(function(a, b){ return b.score - a.score; });
    return out.slice(0, 8);
  };

  WorldMemory.prototype.remember = function(blob, now){
    var w = this.screenToWorld(blob.cx, blob.cy);
    var best = null, bestD = Infinity;
    for(var i = 0; i < this.landmarks.length; i++){
      var lm = this.landmarks[i];
      var d = Math.sqrt(Math.pow(lm.x - w.x, 2) + Math.pow(lm.y - w.y, 2));
      if(d > this.matchRadius || d >= bestD) continue;
      if(colorDist(lm.rgb, blob.rgb) > 95) continue;
      best = lm; bestD = d;
    }
    if(best){
      var n = Math.min(best.seen + 1, 12);
      best.x += (w.x - best.x) / n;
      best.y += (w.y - best.y) / n;
      best.rgb = blob.rgb;
      best.seen++;
      best.lastTick = now;
      if(blob.score > best.bestScore) best.bestScore = blob.score;
      return best;
    }
    /* A new object is only trustworthy while the camera is moving; a
       static screen (menu, text box, standing player) would otherwise
       convert every bright pixel into a landmark. */
    if(Math.abs(this.lastSh) + Math.abs(this.lastShy) < 2) return null;
    var lmNew = { id: this.landmarks.length + 1, x: w.x, y: w.y, rgb: blob.rgb,
      kind: blob.kind, seen: 1, firstTick: now, lastTick: now,
      bestScore: blob.score, area: blob.area };
    this.landmarks.push(lmNew);
    this.pruneLandmarks();
    return lmNew;
  };

  WorldMemory.prototype.pruneLandmarks = function(){
    if(this.landmarks.length <= this.maxLandmarks) return;
    this.landmarks.sort(function(a, b){
      var sa = a.seen * 10 + a.lastTick / 1000 + a.bestScore / 100;
      var sb = b.seen * 10 + b.lastTick / 1000 + b.bestScore / 100;
      return sb - sa;
    });
    this.landmarks.length = this.maxLandmarks;
  };

  WorldMemory.prototype.pruneCells = function(now){
    var keys = Object.keys(this.cells);
    if(keys.length <= this.maxCells) return;
    keys.sort(function(a, b){ return this.cells[a].last - this.cells[b].last; }.bind(this));
    var drop = keys.length - this.maxCells;
    for(var i = 0; i < drop; i++) delete this.cells[keys[i]];
  };

  /* Unvisited neighbours in a look-ahead window on one side. */
  WorldMemory.prototype.frontierScore = function(side){
    var cx = Math.round(this.pos.x / this.cell), cy = Math.round(this.pos.y / this.cell);
    var score = 0;
    for(var dx = 1; dx <= 8; dx++) for(var dy = -2; dy <= 2; dy++){
      if(!this.cells[key(cx + side * dx, cy + dy)]) score++;
    }
    return score;
  };

  WorldMemory.prototype.suggest = function(){
    var now = this.tick;
    if(now > 0 && now < this.forcedUntil) return this.forcedDir;
    var stall = now - this.lastNewCellTick;
    if(now < 4 || stall < 6) return 0;
    var left = this.frontierScore(-1), right = this.frontierScore(1);
    var side = right === left ? (this.lastDir ? -this.lastDir : 1) : (right > left ? 1 : -1);
    if(this.frontierScore(side) === 0) side = -side;
    /* Same direction already forced and still no new ground: flip so the
       pilot does not press into a closed edge forever. */
    if(side === this.forcedDir && this.lastNewCellTick < this.forceStart) side = -side;
    this.forcedDir = side;
    this.forceStart = now;
    this.forcedUntil = now + 6;
    this.exploring = true;
    return side;
  };

  /* One perception/odometry update per sense tick.
     input: { sh, shy, rgb, mode } where sh/shy are the existing 32px
     colShift/rowShift readings and rgb is the optional 32x32 RGB tap. */
  WorldMemory.prototype.observe = function(input){
    input = input || {};
    var now = ++this.tick;
    var sh = clamp(Math.round(input.sh || 0), -8, 8);
    var shy = clamp(Math.round(input.shy || 0), -8, 8);
    this.lastSh = sh; this.lastShy = shy;
    if(sh > 1) this.lastDir = 1;
    else if(sh < -1) this.lastDir = -1;

    var beforeX = this.pos.x, beforeY = this.pos.y;
    this.pos.x += sh;
    this.pos.y += shy;
    this.lastNewCells = 0;
    /* Capture the cell's history before markSegment refreshes `last`. */
    var curKey = key(Math.round(this.pos.x / this.cell), Math.round(this.pos.y / this.cell));
    var curBefore = this.cells[curKey];
    var closed = !!(curBefore && now - curBefore.first > 12 && now - curBefore.last > 1);
    this.markSegment(this.pos.x - beforeX, this.pos.y - beforeY, now);
    if(this.lastNewCells) this.exploring = false;

    if(this.trail.length === 0 || this.trail[this.trail.length - 1].x !== this.pos.x ||
       this.trail[this.trail.length - 1].y !== this.pos.y){
      this.trail.push({ x: this.pos.x, y: this.pos.y });
      if(this.trail.length > this.maxTrail) this.trail.shift();
    }

    /* Loop closure: came back to a cell first mapped a while ago. */
    if(closed){
      this.closures++;
      this.lastClosure = { x: curBefore.x * this.cell, y: curBefore.y * this.cell, tick: now };
    }

    if(input.mode === 'play' && input.rgb){
      var blobs = this.detectBlobs(input.rgb);
      for(var i = 0; i < blobs.length; i++) this.remember(blobs[i], now);
    }
    if(now % 32 === 0) this.pruneCells(now);

    var suggestion = this.suggest();
    return { newCells: this.lastNewCells, suggested: suggestion,
      stall: now - this.lastNewCellTick, landmarks: this.landmarks.length };
  };

  WorldMemory.prototype.stableLandmarks = function(){
    var out = [];
    for(var i = 0; i < this.landmarks.length; i++){
      if(this.landmarks[i].seen >= 2) out.push(this.landmarks[i]);
    }
    return out;
  };

  WorldMemory.prototype.stats = function(){
    return { tick: this.tick, x: Math.round(this.pos.x), y: Math.round(this.pos.y),
      cells: Object.keys(this.cells).length, landmarks: this.stableLandmarks().length,
      candidates: this.landmarks.length, closures: this.closures,
      revisits: this.revisits, exploring: !!this.exploring,
      forcedDir: this.forcedDir, lastDir: this.lastDir,
      stall: Math.max(0, this.tick - this.lastNewCellTick) };
  };

  WorldMemory.prototype.export = function(options){
    options = options || {};
    var maxCells = options.maxCells || 2000;
    var keys = Object.keys(this.cells);
    if(keys.length > maxCells) keys = keys.slice(keys.length - maxCells);
    var cells = keys.map(function(k){
      var c = this.cells[k];
      return [c.x, c.y, c.n];
    }, this);
    return {
      cell: this.cell,
      pos: { x: Math.round(this.pos.x), y: Math.round(this.pos.y) },
      cells: cells,
      landmarks: this.stableLandmarks().map(function(lm){
        return { x: Math.round(lm.x), y: Math.round(lm.y), kind: lm.kind,
          seen: lm.seen, rgb: lm.rgb };
      }),
      stats: this.stats()
    };
  };

  WorldMemory.prototype.reset = function(){
    this.pos = { x: 0, y: 0 };
    this.cells = Object.create(null);
    this.landmarks = [];
    this.trail = [{ x: 0, y: 0 }];
    this.tick = 0;
    this.lastDir = 0;
    this.lastSh = this.lastShy = 0;
    this.lastNewCells = 0;
    this.lastNewCellTick = 0;
    this.exploring = false;
    this.forcedDir = 0;
    this.forcedUntil = 0;
    this.forceStart = 0;
    this.closures = 0;
    this.lastClosure = null;
    this.revisits = 0;
  };

  root.WorldMemory = WorldMemory;
  if(typeof module !== 'undefined' && module.exports) module.exports = WorldMemory;
})(typeof window !== 'undefined' ? window : globalThis);
