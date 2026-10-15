/* ============================================================
   AnalogGolfSwing — EA Tiger Woods-style analog swing tempo.
   Pull down for the backswing (depth = intended power), flick up
   through for the downswing (speed + straightness = contact).
   Lateral deviation during the motion becomes draw/fade.

   Source-agnostic: feed(x, y) takes stick deflection or normalized
   pointer drag, y down-positive, roughly -1..1. The game owns gating
   (ball at rest, source locks) and maps the result into its shot.
   ============================================================ */

export class AnalogGolfSwing {
  constructor({
    backswingThreshold = 0.35,
    contactAt = -0.55,
    puttThreshold = 0.25,
    maxBackswingTime = 2500,
    downswingTimeout = 700,
    lateralSensitivity = 1.2,
    deadzone = 0.12,
  } = {}) {
    this.backswingThreshold = backswingThreshold;
    this.contactAt = contactAt;
    this.puttThreshold = puttThreshold;
    this.maxBackswingTime = maxBackswingTime;
    this.downswingTimeout = downswingTimeout;
    this.lateralSensitivity = lateralSensitivity;
    this.deadzone = deadzone;

    this.putterMode = false;
    this.source = null; // game-managed lock: 'pad' | 'mouse' | 'touch'
    this.state = 'idle';
    this.backswingY = 0;
    this.minY = 0;
    this.backswingStartTime = 0;
    this.downswingStartTime = 0;
    this.lateralDrift = 0;

    this.onSwingStart = null;
    this.onSwingUpdate = null;
    this.onSwingComplete = null;
    this.onSwingCancel = null;
  }

  setPutterMode(on) {
    this.putterMode = !!on;
  }

  entryThreshold() {
    return this.putterMode ? this.puttThreshold : this.backswingThreshold;
  }

  contactThreshold() {
    return this.putterMode ? -this.puttThreshold : this.contactAt;
  }

  dz(v) {
    return Math.abs(v) < this.deadzone ? 0 : v;
  }

  feed(rawX, rawY, now = performance.now()) {
    const x = this.dz(rawX), y = this.dz(rawY);
    if (this.state === 'idle') {
      if (y > this.entryThreshold()) this.startBackswing(x, y, now);
    } else if (this.state === 'backswing') {
      this.updateBackswing(x, y, now);
    } else if (this.state === 'downswing') {
      this.updateDownswing(x, y, now);
    }
    return this.snapshot();
  }

  startBackswing(x, y, now) {
    this.state = 'backswing';
    this.backswingY = y;
    this.minY = y;
    this.backswingStartTime = now;
    this.lateralDrift = x;
    if (this.onSwingStart) this.onSwingStart(this.snapshot());
  }

  updateBackswing(x, y, now) {
    this.backswingY = Math.max(this.backswingY, y);
    this.minY = Math.min(this.minY, y);
    this.lateralDrift = this.lateralDrift * 0.85 + x * 0.15;
    if (this.onSwingUpdate) this.onSwingUpdate(this.snapshot());
    if (now - this.backswingStartTime > this.maxBackswingTime) {
      this.cancel('backswing timed out');
      return;
    }
    // pushed firmly up = the forward flick begins; a full teleport-flick
    // straight through contact counts as a (rushed) strike, not a whiff
    if (y < -this.entryThreshold()) {
      this.state = 'downswing';
      this.downswingStartTime = now;
      if (y <= this.contactThreshold()) this.updateDownswing(x, y, now);
    }
  }

  updateDownswing(x, y, now) {
    this.minY = Math.min(this.minY, y);
    this.lateralDrift = this.lateralDrift * 0.7 + x * 0.3;
    if (this.onSwingUpdate) this.onSwingUpdate(this.snapshot());
    // whipped up through contact = strike
    if (y < this.contactThreshold()) {
      this.complete(now);
      return;
    }
    if (now - this.downswingStartTime > this.downswingTimeout) {
      this.cancel('downswing incomplete');
    }
  }

  snapshot() {
    return {
      state: this.state,
      power: Math.max(0, Math.min(1, this.backswingY)),
      lateral: this.lateralDrift,
      backswing: Math.max(0, Math.min(1, this.backswingY)),
    };
  }

  complete(endTime) {
    const result = this.calculateShot(endTime);
    this.reset();
    if (this.onSwingComplete) this.onSwingComplete(result);
    return result;
  }

  cancel(reason) {
    if (this.state === 'idle') return;
    this.reset();
    if (this.onSwingCancel) this.onSwingCancel({ reason });
  }

  calculateShot(endTime) {
    const backswing = Math.max(0, Math.min(1, this.backswingY));
    const duration = Math.max(1, endTime - this.downswingStartTime);
    // A decisive flick preserves power; a slow push leaks it. Multiplier,
    // never the sole source — a full pull always travels.
    const speedBonus = Math.max(0, Math.min(0.2, (300 - duration) / 1000));
    const power = Math.max(0.05, Math.min(1, backswing * (0.8 + speedBonus)));
    // Lateral deviation becomes curve. Negative = left/draw, positive = right/fade.
    const curveDeg = -this.lateralDrift * 22;
    const rushed = duration < 110;
    const overSwing = backswing > 0.97;
    const contactQuality = Math.max(0, Math.min(1,
      1 - Math.abs(this.lateralDrift) * 1.25 - (rushed ? 0.22 : 0)));
    let acc = Math.max(-1, Math.min(1, this.lateralDrift * this.lateralSensitivity));
    if (rushed) acc = Math.max(-1, Math.min(1, acc + (Math.random() - 0.5) * 0.3));
    return {
      power,
      acc,
      curveDeg,
      contactQuality,
      tempoScale: 0.6 + 0.4 * contactQuality,
      shotName: this.shotName(curveDeg, contactQuality),
      backswing,
      downswingMs: duration,
      rushed,
      overSwing,
      lateralDrift: this.lateralDrift,
    };
  }

  shotName(curve, contactQuality) {
    if (contactQuality < 0.45) return 'mishit';
    if (curve > 18) return 'slice';
    if (curve > 8) return 'fade';
    if (curve < -18) return 'hook';
    if (curve < -8) return 'draw';
    return 'straight';
  }

  reset() {
    this.state = 'idle';
    this.backswingY = 0;
    this.minY = 0;
    this.backswingStartTime = 0;
    this.downswingStartTime = 0;
    this.lateralDrift = 0;
  }
}
