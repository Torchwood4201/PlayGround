/* ==========================================================================
   AntonCore — one agent built from three earlier layers.
   --------------------------------------------------------------------------
   This is the single per-pilot brain the SNESBoy autopilot now uses. It
   composes, rather than replaces, the three experiments already in the app:

     poke.AI        WorldMemory  — salient-object detection, scroll odometry,
                                   global cells, landmark merging, loop
                                   closure and frontier exploration.
     mario-ai       Policy       — the pixel-reactive action scorer, its
                                   per-action reward history and a bounded
                                   replay buffer of (action, reward, explored)
                                   transitions, the same shape as the DQN's
                                   replay memory.
     Son of Anton   Governor     — the live screen watcher that widens the
                                   motion deadband when modes flap, lowers the
                                   bar when menus stall, rotates seek taps and
                                   changes hop cadence when progress stops.

   The loop is deliberately linear and has one owner for every decision:

       SEE      perceive()  -> world.observe(rgb + scroll)
       REMEMBER choose()    -> policy scores + replay + frontier heading
       ACT      drive loop  -> one direction, one action button
       JUDGE    reward()    -> reward, replay push, new-cell bonus
       HEAL     govern()    -> live threshold/cadence tuning

   Everything is dependency-free and DOM-free; script.js owns timers, the
   controller and the UI. Keeping the three layers behind one object means
   the pilots, recordings and public API all describe one agent instead of
   three unrelated features.
   ========================================================================== */
(function(root){
  'use strict';

  function AntonCore(options){
    options = options || {};
    this.world = (typeof root.WorldMemory === 'function')
      ? new root.WorldMemory(options.world || {}) : null;

    this.policy = {
      score: {}, tries: {}, total: 0, pending: null, sig: ''
    };
    this.replay = [];
    this.replayCap = options.replayCap || 192;
    this.loop = {
      mode: 'seek', tick: 0, lastAction: null, lastReward: 0,
      lastExplored: 0, lastChoice: null, lastPhase: 'SEEK'
    };
    this.health = {
      hist: [], lastModes: '', cool: 0, seekStuck: 0, playStall: 0,
      adjustments: 0, lastAdjust: '', verdict: 'IDLE'
    };
  }

  /* ---------------- SEE + REMEMBER: poke.AI world layer ---------------- */
  AntonCore.prototype.perceive = function(input){
    this.loop.tick++;
    if(input && input.mode) this.loop.mode = input.mode;
    if(!this.world) return { newCells: 0, suggested: 0, stall: 0, landmarks: 0 };
    return this.world.observe(input);
  };

  AntonCore.prototype.resetWorld = function(){
    if(this.world) this.world.reset();
  };

  /* ---------------- mario-ai policy + replay memory ---------------- */
  AntonCore.prototype.clearReplay = function(){
    this.replay = [];
  };

  AntonCore.prototype.pick = function(pool, options){
    options = options || {};
    pool = (pool && pool.length) ? pool : [8, 0, 9];
    var l = this.policy;
    var n = l.total || 0, best = pool[0], bestScore = -1e9;
    for(var i = 0; i < pool.length; i++){
      var b = pool[i], tries = l.tries[b] || 0;
      var avg = (l.score[b] || 0) / (tries + 1);
      var prior = 0.15 + (pool.length - i) * 0.04;
      var explore = (options.explore || 1.15) * Math.sqrt(Math.log(n + 2) / (tries + 1));
      var s = avg + prior + explore + ((options.hopN || 0) + i * 5) % 7 * 0.001;
      /* Manual semantics are not just a score prior: when the booklet says
         this button is jump, the unified brain gives it a real edge over
         buttons that merely happen to have been pressed before. */
      if(options.prefer != null && b === options.prefer) s += 0.5;
      if(options.avoid != null && b === options.avoid) s -= 0.75;
      if(s > bestScore){ bestScore = s; best = b; }
    }
    l.pending = { btn: best, t: Date.now() };
    this.loop.lastChoice = best;
    this.loop.lastPool = pool.slice();
    this.loop.lastPrefer = (options.prefer == null ? null : options.prefer);
    this.loop.history = this.loop.history || [];
    this.loop.history.push({ b: best, t: Date.now() });
    if(this.loop.history.length > 40) this.loop.history.shift();
    return best;
  };

  /* One reward update ties the reactive pixel signal, the map's new-cell
     signal and the replay memory together. Returns the scalar reward. */
  AntonCore.prototype.reward = function(ev){
    ev = ev || {};
    var l = this.policy, p = l.pending;
    if(!p) return 0;
    var moved = (ev.motion || 0) >= Math.max(1, ev.loThresh || 4) ||
      Math.abs(ev.scroll || 0) >= 2 || Math.abs(ev.scrollY || 0) >= 2 ||
      (ev.explored || 0) > 0;
    var r = (moved ? 1 : -0.25) + (ev.explored ? 0.3 : 0);
    /* Manual compliance is itself evidence: if the booklet says this is
       jump, a jump that the camera did not visibly reward is still better
       than a random action. Never let the pixel signal train it away. */
    if(ev.manual) r = Math.max(r, 0.2);
    l.tries[p.btn] = (l.tries[p.btn] || 0) + 1;
    l.score[p.btn] = (l.score[p.btn] || 0) + r;
    l.total = (l.total || 0) + 1;
    l.pending = null;
    this.loop.lastAction = p.btn;
    this.loop.lastReward = Math.round(r * 100) / 100;
    this.loop.lastExplored = ev.explored || 0;
    this.replay.push({ a: p.btn, r: Math.round(r * 100) / 100,
      e: ev.explored || 0, t: Date.now() });
    if(this.replay.length > this.replayCap) this.replay.shift();
    return r;
  };

  AntonCore.prototype.topActions = function(limit){
    var l = this.policy, out = [];
    Object.keys(l.score).forEach(function(b){
      var tries = l.tries[b] || 0;
      out.push({ btn: +b, score: Math.round((l.score[b] || 0) * 100) / 100,
        tries: tries, avg: Math.round(((l.score[b] || 0) / (tries + 1)) * 100) / 100 });
    });
    out.sort(function(a, b){ return b.avg - a.avg || b.score - a.score; });
    return out.slice(0, limit || 3);
  };

  /* ---------------- Son of Anton live governor ---------------- */
  /* ctx: { label, mode, diff, stillMs, progressEma, lastSh, lastShy,
            brain, cycle }. Mutates brain/cycle exactly like the standalone
            governor did, and returns the message for the HUD ('' if none). */
  AntonCore.prototype.govern = function(ctx){
    var a = this.health, b = ctx.brain;
    if(!b) return '';
    var modes = ctx.label + ':' + ctx.mode;
    if(modes !== a.lastModes){ a.hist.push(1); a.lastModes = modes; }
    else a.hist.push(0);
    if(a.hist.length > 8) a.hist.shift();
    if(a.cool > 0){ a.cool--; return ''; }

    var flips = 0, i;
    for(i = 0; i < a.hist.length; i++) flips += a.hist[i];
    if(flips >= 3 && a.hist.length >= 6){
      b.hiThresh = Math.min(40, Math.round((b.hiThresh + 1) * 2) / 2);
      b.loThresh = Math.max(0.5, Math.round((b.loThresh - 0.5) * 2) / 2);
      a.hist = []; a.cool = 4;
      a.verdict = 'TUNING';
      return this.adjust('flapping — widened deadband (motion>' + b.hiThresh + ' still<' + b.loThresh + ')');
    }

    if(ctx.mode !== 'play'){
      a.seekStuck++; a.playStall = 0;
      if(a.seekStuck >= 8 && ctx.stillMs >= Math.max(4000, b.tapMs)){
        var before = b.hiThresh;
        b.hiThresh = Math.max(3, Math.round((b.hiThresh - 1) * 2) / 2);
        if(ctx.cycle && ctx.cycle.length > 1) ctx.cycle.push(ctx.cycle.shift());
        a.seekStuck = 0; a.cool = 4;
        a.verdict = 'TUNING';
        return this.adjust('screen still ' + (ctx.stillMs / 1000).toFixed(1) +
          's — rotated seek taps, motion bar ' + before + '→' + b.hiThresh);
      }
      if(a.seekStuck >= 12){
        b.hiThresh = Math.max(3, Math.round((b.hiThresh - 1) * 2) / 2);
        a.seekStuck = 0; a.cool = 4;
        a.verdict = 'TUNING';
        return this.adjust('stuck in menus — lowered motion bar to ' + b.hiThresh);
      }
      return '';
    }

    a.seekStuck = 0;
    var scrollMag = Math.max(Math.abs(ctx.lastSh || 0), Math.abs(ctx.lastShy || 0));
    if(ctx.diff < b.hiThresh || scrollMag < 2){
      a.playStall++;
      if(a.playStall >= 8){
        b.hopEvery = Math.max(1, b.hopEvery - 1);
        a.playStall = 0; a.cool = 4;
        a.verdict = 'TUNING';
        return this.adjust('no screen progress — hopping every ' + b.hopEvery + ' beats');
      }
    }else{
      a.playStall = 0;
      if(ctx.progressEma >= 3 && b.hopEvery < 4){
        b.hopEvery = Math.min(4, b.hopEvery + 1);
        a.cool = 10;
        a.verdict = 'TUNING';
        return this.adjust('steady scroll ' + ctx.progressEma.toFixed(1) +
          ' — hopping every ' + b.hopEvery + ' beats');
      }
    }
    if(a.verdict !== 'TUNING') a.verdict = 'HEALTHY';
    return '';
  };

  AntonCore.prototype.adjust = function(message){
    this.health.adjustments++;
    this.health.lastAdjust = message;
    return message;
  };

  AntonCore.prototype.noteLoop = function(mode){
    this.loop.mode = mode;
    this.loop.lastPhase = mode === 'play' ? 'PLAY' : 'SEEK';
  };

  /* ---------------- one status for all three layers ---------------- */
  AntonCore.prototype.status = function(){
    return {
      loop: {
        tick: this.loop.tick, mode: this.loop.mode,
        lastAction: this.loop.lastAction, lastReward: this.loop.lastReward,
        lastExplored: this.loop.lastExplored, lastPool: this.loop.lastPool,
        lastPrefer: this.loop.lastPrefer,
        history: (this.loop.history || []).slice(-10)
      },
      world: this.world ? this.world.stats() : null,
      policy: {
        total: this.policy.total, replay: this.replay.length,
        top: this.topActions(3)
      },
      health: {
        verdict: this.health.verdict, adjustments: this.health.adjustments,
        lastAdjust: this.health.lastAdjust, seekStuck: this.health.seekStuck,
        playStall: this.health.playStall
      }
    };
  };

  AntonCore.prototype.snapshot = function(maxReplay){
    var out = this.status();
    out.replay = this.replay.slice(-(maxReplay || 48));
    out.worldMap = this.world ? this.world.export({ maxCells: 1200 }) : null;
    return out;
  };

  AntonCore.prototype.reset = function(){
    /* Mutate in place: script.js keeps aliases to policy/health/world so
       reset must not swap the objects out from under the pilots. */
    var p = this.policy;
    p.score = {}; p.tries = {}; p.total = 0; p.pending = null; p.sig = '';
    this.replay = [];
    var l = this.loop;
    l.mode = 'seek'; l.tick = 0; l.lastAction = null; l.lastReward = 0;
    l.lastExplored = 0; l.lastChoice = null; l.lastPhase = 'SEEK';
    var h = this.health;
    h.hist = []; h.lastModes = ''; h.cool = 0; h.seekStuck = 0; h.playStall = 0;
    h.adjustments = 0; h.lastAdjust = ''; h.verdict = 'IDLE';
    if(this.world) this.world.reset();
  };

  root.AntonCore = AntonCore;
  if(typeof module !== 'undefined' && module.exports) module.exports = AntonCore;
})(typeof window !== 'undefined' ? window : globalThis);
