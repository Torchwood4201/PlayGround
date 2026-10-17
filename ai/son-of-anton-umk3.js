/* ==========================================================================
   SonOfAntonGameplayEngine — UMK3 autonomous engine, as specified.
   --------------------------------------------------------------------------
   Class structure, movebook, decision order, tick cadence, and log lines
   are the spec verbatim. Documented adapter deltas (required because a
   browser has no RAM access and no `fs`):

   1. runMatch({ press, sense }) instead of runMatch() — press(btn, ms)
      routes to the real controller (driveIndex); sense() returns live
      { diff, mode, ocrHits } from the copilot. No fake positions/health.
   2. Distance/run-meter branches are guarded on non-null: when the sense
      callback cannot supply them they are skipped, never defaulted (the
      spec's 0/100 defaults would lock one branch forever).
   3. The 5-entry movebook entries carry `seq` in copilot tokens so the
      existing fightTapSeq can execute them unchanged.
   4. No `require('fs')` — browser file. No auto-start on load.

   Movebook button key (spec): HP=Y(1) LP=B(0) HK=A(8) LK=X(9) RN=R(11).
   D/B/F tokens resolve facing-relative at play time like UMK3_MOVEBOOK.
   ========================================================================== */
(function(){
  'use strict';

  class SonOfAntonGameplayEngine {
    constructor(options = {}) {
      this.aggressiveness = options.aggressiveness || 0.9;
      this.targetFPS = 60;
      this.frameTicks = 0;
      this.playerState = {
        health: 100,
        runMeter: 100,
        position: { x: 0, y: 0 },
        isCrouching: false,
        isBlocking: false,
        isJumping: false,
        currentComboSequence: []
      };
      this.opponentState = {
        health: 100,
        position: { x: 100, y: 0 },
        currentAction: 'IDLE'
      };
      this._press = (options && options.press) || null;
      this._sense = (options && options.sense) || null;
      this._interval = null;
      this.running = false;
    }

    log(message) {
      const timestamp = new Date().toISOString();
      const line = `[SON OF ANTON - UMK3] ${timestamp} - ${message}`;
      try{ console.log(line); }catch(e){}
      try{
        if(typeof antonLog === 'function') antonLog(line);
      }catch(e){}
      return line;
    }

    /**
     * Parses directional inputs and attack codes from the instruction manual mapping.
     * Handles button translation: HP (High Punch), LP (Low Punch), HK (High Kick), LK (Low Kick), RN (Run), BL (Block).
     * Each entry carries `seq` in copilot tokens for direct execution.
     */
    translateSpecialMove(moveName) {
      const movebook = {
        "Kano_Knife": { inputs: ['DOWN', 'BACK', 'HP'], type: 'SPECIAL', seq: ['D', 'B', 1] },
        "Cyrax_Bomb": { inputs: ['HOLD_LK', 'BACK', 'BACK', 'HK'], type: 'SPECIAL', seq: [9, 'B', 'B', 8] },
        "LiuKang_Fireball": { inputs: ['FORWARD', 'FORWARD', 'HP'], type: 'SPECIAL', seq: ['F', 'F', 1] },
        "SubZero_Freeze": { inputs: ['DOWN', 'FORWARD', 'LP'], type: 'SPECIAL', seq: ['D', 'F', 0] },
        "Kabal_GroundRazor": { inputs: ['BACK', 'BACK', 'BACK', 'RN'], type: 'SPECIAL', seq: ['B', 'B', 'B', 11] }
      };
      return movebook[moveName] || { inputs: ['HP'], type: 'BASIC', seq: [1] };
    }

    moveNames() {
      return ["Kano_Knife", "Cyrax_Bomb", "LiuKang_Fireball", "SubZero_Freeze", "Kabal_GroundRazor"];
    }

    /**
     * Evaluates distance and health delta to choose optimal attack or defense.
     * Distance/run branches require sensed numbers; when the sense callback
     * cannot supply them they are skipped (never defaulted — defaults would
     * pin one branch). Opponent-action counters use sensed action only.
     */
    calculateTacticalResponse(sense) {
      sense = sense || {};
      const hasDistance = (typeof sense.distanceX === 'number');
      const distanceX = hasDistance ? Math.abs(sense.distanceX) : null;
      const runMeter = (typeof sense.runMeter === 'number')
        ? sense.runMeter : this.playerState.runMeter;
      const oppAction = sense.opponentAction || this.opponentState.currentAction;

      // Klose Quarters optimization (Throws and Knees)
      if (hasDistance && distanceX <= 15) {
        this.log("Klose quarters threshold breached. Executing optimal frame-trap: Knee / Throw sequence.");
        return { action: "THROW_OR_KNEE", button: "LP", seq: [0] };
      }

      // Run Meter Management (UMK3 specific rule: time-sensitive green bar)
      if (hasDistance && runMeter > 50 && distanceX > 40) {
        this.log("Run meter active. Engaging rapid-closing routine via R Button + Forward.");
        return { action: "RUN_CLOSE", button: "R_FORWARD", seq: ['F', 11] };
      }

      // Defensive Crouching Uppercut calculation
      if (oppAction === 'JUMPING') {
        this.log("Aerial approach detected. Executing crouch-uppercut counter.");
        return { action: "CROUCH_UPPERCUT", button: "DOWN_Y", seq: [5, 1] };
      }

      // Default offensive zoning
      return { action: "PROJECTILE_ZONING", button: "FORWARD_FORWARD_HP", seq: ['F', 'F', 1] };
    }

    senseNow() {
      if(typeof this._sense === 'function'){
        try{ return this._sense() || {}; }catch(e){ return {}; }
      }
      return {};
    }

    pressSeq(seq, pl) {
      const press = this._press;
      if(typeof press !== 'function') return;
      (seq || []).forEach(function(btn, i){
        setTimeout(function(){
          press(btn, pl, 120);
        }, i * 150);
      });
    }

    /**
     * Main game-loop simulation tick matching SNES 60Hz timing.
     * NOTE: the copilot drives on its own sense/drive cadence; this tick
     * runs only when the engine is started standalone via runMatch().
     */
    tick() {
      this.frameTicks++;

      // Assess opponent threat (sensed where available, defaults otherwise)
      const tacticalDecision = this.calculateTacticalResponse(this.senseNow());

      // Act on the decision through the real controller
      if(tacticalDecision && tacticalDecision.seq && typeof this._press === 'function'){
        const seq = tacticalDecision.seq;
        const self = this;
        seq.forEach(function(btn, i){
          setTimeout(function(){ self._press(btn, 0, 120); }, i * 150);
        });
      }

      // Log tactical state every 60 frames (1 second)
      if (this.frameTicks % 60 === 0) {
        this.log(`Tick ${this.frameTicks} | Player HP: ${this.playerState.health}% | Opponent HP: ${this.opponentState.health}% | Action: ${tacticalDecision.action}`);
      }

      // Auto-terminate simulation if match concludes
      if (this.playerState.health <= 0 || this.opponentState.health <= 0) {
        this.log("Kombat round concluded. Finalizing metrics.");
        return false;
      }

      return true;
    }

    runMatch(hooks) {
      hooks = hooks || {};
      if(typeof hooks.press === 'function') this._press = hooks.press;
      if(typeof hooks.sense === 'function') this._sense = hooks.sense;
      if(this.running) return;
      this.running = true;
      this.log("Initializing Ultimate Mortal Kombat 3 Autonomous Bot Engine...");
      this.log("Reading secret kodes and loading fighter vectors from manual parameters.");

      let active = true;
      this._interval = setInterval(() => {
        active = this.tick();
        if (!active) {
          clearInterval(this._interval);
          this._interval = null;
          this.running = false;
          this.log("Engine halted. Victory is mathematically absolute.");
        }
      }, 16.66); // ~60 FPS frame delay
    }

    stop() {
      if(this._interval){ clearInterval(this._interval); this._interval = null; }
      this.running = false;
    }
  }

  if(typeof window !== 'undefined') window.SonOfAntonGameplayEngine = SonOfAntonGameplayEngine;
  if(typeof module !== 'undefined' && module.exports) module.exports = { SonOfAntonGameplayEngine };
})();
