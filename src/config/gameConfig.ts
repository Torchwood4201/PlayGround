// AXE//VECTOR tuning. Spin rates are rad/s (readable rotation);
// doc §4.2 ranges are interpreted as angular velocity for legibility.

export const GAME_CONFIG = {
  gravity: -9.81,
  fixedStep: 1 / 60,
  matchThrows: 10,

  camera: {
    fov: 70,
    near: 0.1,
    far: 200,
    eyeHeight: 1.65,
    maxYaw: 35,
    minPitch: -10,
    maxPitch: 20,
    sensitivity: 0.0022
  },

  throw: {
    arcCompensation: 0.08,
    maxOverchargeSeconds: 1.0,
    maxLateralErrorDegrees: 3
  },

  rotation: {
    perfectWindowDegrees: 18,
    angledWindowDegrees: 42,
    grazeWindowDegrees: 65,
    grazeExtraSpeed: 6
  },

  scoring: {
    killshotPoints: 8,
    rotationBonus: 1,
    vectorLockBonus: 2,
    vectorLockStreak: 3
  }
} as const;

export interface ScoringZone {
  radius: number;
  points: number;
  color: number;
}

// Outer → bullseye (doc §5.1). Radii in meters.
export const SCORING_ZONES: ScoringZone[] = [
  { radius: 1.35, points: 1, color: 0x00ffcc },
  { radius: 1.05, points: 2, color: 0x00ffcc },
  { radius: 0.78, points: 3, color: 0x00ccaa },
  { radius: 0.52, points: 4, color: 0xffcc00 },
  { radius: 0.28, points: 5, color: 0xffcc00 },
  { radius: 0.12, points: 6, color: 0xffffff }
];

export const KILLSHOT_RADIUS = 0.09;
export const KILLSHOT_OFFSET: ReadonlyArray<readonly [number, number]> = [
  [-0.95, 0.95],
  [0.95, 0.95]
];

export interface AxeFrameConfig {
  id: string;
  minSpeed: number;
  maxSpeed: number;
  chargeTime: number;
  spinRate: number;
  stickThreshold: number;
  grazeDiscount: number;
  color: number;
  trailColor: number;
}

// Doc §8.3 frames (starting set: Standard / Dart / Anchor).
export const AXE_FRAMES: AxeFrameConfig[] = [
  {
    id: 'standard',
    minSpeed: 16, maxSpeed: 28, chargeTime: 0.85,
    spinRate: 12, stickThreshold: 7.5, grazeDiscount: 0,
    color: 0xffffff, trailColor: 0x66ffff
  },
  {
    id: 'dart',
    minSpeed: 18, maxSpeed: 32, chargeTime: 0.7,
    spinRate: 17, stickThreshold: 8.5, grazeDiscount: 0,
    color: 0x66ffff, trailColor: 0x00ffcc
  },
  {
    id: 'anchor',
    minSpeed: 15, maxSpeed: 26, chargeTime: 1.0,
    spinRate: 8.5, stickThreshold: 6.0, grazeDiscount: 2,
    color: 0xffcc00, trailColor: 0xff8866
  }
];
