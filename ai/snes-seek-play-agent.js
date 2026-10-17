/* ==========================================================================
   SnesSeekPlayAgent — SEEK/PLAY hybrid, exactly as specified.
   --------------------------------------------------------------------------
   Only adaptation from the pasted spec: the `nes` object is an adapter,
   not a JSNES instance (this app runs EmulatorJS/Snes9x, which has no
   buttonDown/buttonUp). The adapter exposes the identical interface —
   buttonDown(player, button) / buttonUp(player, button) — with the
   classic JSNES numbering translated to this core's RetroArch indices:

     JSNES 0(A) 1(B) 2(Select) 3(Start) 4(Up) 5(Down) 6(Left) 7(Right)
       →   8    0      2          3        4     5       6       7

   Everything else — tunables, vision, modes, loop — is the spec verbatim.
   Use makeEmulatorNesAdapter(driveIndex, player) to build the adapter.
   ========================================================================== */
(function(){
  'use strict';

  var JSNES_TO_RETROARCH = { 0: 8, 1: 0, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };

  function makeEmulatorNesAdapter(driveIndex, player) {
    player = (player === undefined || player === null) ? 0 : player;
    function conv(button) {
      return (button in JSNES_TO_RETROARCH) ? JSNES_TO_RETROARCH[button] : button;
    }
    return {
      buttonDown: function(p, b) {
        if(typeof p !== 'number'){ b = p; p = player; }
        driveIndex(conv(b), true, 'auto', (p === undefined || p === null) ? player : p);
      },
      buttonUp: function(p, b) {
        if(typeof p !== 'number'){ b = p; p = player; }
        driveIndex(conv(b), false, 'auto', (p === undefined || p === null) ? player : p);
      }
    };
  }

  class SnesSeekPlayAgent {
    constructor(nes, canvas, options = {}) {
      this.nes = nes;                    // JSNES instance (or adapter — see above)
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");

      // Tunables
      this.interval = options.interval ?? 1600;      // ms between decisions
      this.diffThreshold = options.diffThreshold ?? 7.0;
      this.seekSelectEvery = options.seekSelectEvery ?? 3;
      this.playActionChance = options.playActionChance ?? 0.18;

      // Internal
      this.lastSmall = null;
      this.seekCount = 0;
      this.mode = "SEEK";
      this.timer = null;
      this.running = false;
    }

    // ---------- Core vision ----------
    getSmallFrame() {
      // Downscale current canvas to 32×32 grayscale
      const w = 32, h = 32;
      const tmp = document.createElement("canvas");
      tmp.width = w;
      tmp.height = h;
      const tctx = tmp.getContext("2d");
      tctx.drawImage(this.canvas, 0, 0, w, h);

      const img = tctx.getImageData(0, 0, w, h).data;
      const gray = new Float32Array(w * h);

      for (let i = 0, j = 0; i < img.length; i += 4, j++) {
        // luminance
        gray[j] = 0.299 * img[i] + 0.587 * img[i + 1] + 0.114 * img[i + 2];
      }
      return gray;
    }

    frameDiff(curr) {
      if (!this.lastSmall) {
        this.lastSmall = curr;
        return 0;
      }
      let sum = 0;
      for (let i = 0; i < curr.length; i++) {
        sum += Math.abs(curr[i] - this.lastSmall[i]);
      }
      const avg = sum / curr.length;
      this.lastSmall = curr;
      return avg;
    }

    // ---------- Button helpers ----------
    clearButtons() {
      for (let b = 0; b <= 7; b++) {
        this.nes.buttonUp(1, b);
      }
    }

    press(button, duration = 80) {
      this.nes.buttonDown(1, button);
      setTimeout(() => this.nes.buttonUp(1, button), duration);
    }

    hold(button) {
      this.nes.buttonDown(1, button);
    }

    // ---------- Modes ----------
    doSeek() {
      this.clearButtons();
      this.seekCount++;

      if (this.seekCount % this.seekSelectEvery === 0) {
        console.log("[SEEK] START");
        this.press(3); // Start
      } else {
        console.log("[SEEK] SELECT");
        this.press(2); // Select
      }
    }

    doPlay() {
      this.clearButtons();

      // Generic side-scroller bias
      this.hold(7); // Right
      this.hold(1); // B (often run)

      if (Math.random() < this.playActionChance) {
        console.log("[PLAY] + action");
        this.press(0, 70); // A = jump / action
      } else {
        console.log("[PLAY] holding Right + run");
      }
    }

    // ---------- Main loop ----------
    tick() {
      const small = this.getSmallFrame();
      const diff = this.frameDiff(small);
      console.log(`diff=${diff.toFixed(2)}  mode=${this.mode}`);

      if (diff < this.diffThreshold) {
        this.mode = "SEEK";
        this.doSeek();
      } else {
        this.mode = "PLAY";
        this.doPlay();
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      console.log("JSNES SEEK/PLAY agent started");
      this.timer = setInterval(() => this.tick(), this.interval);
    }

    stop() {
      this.running = false;
      clearInterval(this.timer);
      this.clearButtons();
      console.log("Agent stopped");
    }
  }

  if(typeof window !== 'undefined'){
    window.SnesSeekPlayAgent = SnesSeekPlayAgent;
    window.makeEmulatorNesAdapter = makeEmulatorNesAdapter;
    window.JSNES_TO_RETROARCH = JSNES_TO_RETROARCH;
  }
  if(typeof module !== 'undefined' && module.exports){
    module.exports = { SnesSeekPlayAgent, makeEmulatorNesAdapter, JSNES_TO_RETROARCH };
  }
})();
