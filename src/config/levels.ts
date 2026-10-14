// Level pack: 7 arenas. Positions/sizes/motion per design spec; scoring,
// rotation tiers, and frames come from the AXE//VECTOR systems. name/desc/
// meta document intent (selection-screen copy if a text UI is ever added);
// in the all-3D shell each level is a distinct totem + resource digits.

export type TargetKind = 'static' | 'sliding' | 'oscillating' | 'rotating' | 'bonus';

export interface TargetSpec {
  type: TargetKind;
  pos: [number, number, number];
  radius?: number; // board radius in meters (default 0.85)
  amp?: number; // slide/oscillation amplitude (m)
  speed?: number; // slide/oscillation (rad/s visual) or rotation (rad/s)
  phase?: number;
  lifetime?: number; // bonus: visible seconds per appearance
  spawnAt?: number; // bonus: first appearance (level seconds)
  scoreMul?: number; // score multiplier for this board
}

export interface LevelDef {
  id: string;
  name: string;
  desc: string;
  time: number | null; // countdown seconds; null = untimed
  maxAxes: number | null; // throw cap; null = unlimited
  maxMisses: number | null; // endless rule; null = n/a
  meta: string;
  ramp: boolean; // motion speeds up every 30s
  targets: TargetSpec[];
}

export const BONUS_RESPAWN_GAP = 5; // seconds between bonus appearances

export const LEVELS: LevelDef[] = [
  {
    id: 'classic',
    name: 'CLASSIC RANGE',
    desc: 'Static targets at three distances. Learn the arc.',
    time: 90,
    maxAxes: null,
    maxMisses: null,
    meta: '90s · Unlimited axes',
    ramp: false,
    targets: [
      { type: 'static', pos: [0, 1.7, -5.6], radius: 0.85 },
      { type: 'static', pos: [-2.9, 1.9, -8.4], radius: 0.75 },
      { type: 'static', pos: [2.9, 1.9, -8.4], radius: 0.75 },
      { type: 'static', pos: [2.45, 3.0, -12.6], radius: 0.7 },
      { type: 'static', pos: [-5.2, 1.3, -10.5], radius: 0.65 },
      { type: 'static', pos: [5.2, 1.3, -10.5], radius: 0.65 }
    ]
  },
  {
    id: 'precision',
    name: 'PRECISION',
    desc: '10 axes only. Far targets. Every throw counts.',
    time: null,
    maxAxes: 10,
    maxMisses: null,
    meta: '10 axes · No timer',
    ramp: false,
    targets: [
      { type: 'static', pos: [0, 1.8, -7.0], radius: 0.7 },
      { type: 'static', pos: [-3, 2.0, -9.8], radius: 0.55 },
      { type: 'static', pos: [3, 2.0, -9.8], radius: 0.55 },
      { type: 'static', pos: [1.7, 2.9, -14.0], radius: 0.5 },
      { type: 'static', pos: [-2, 1.5, -11.9], radius: 0.5 },
      { type: 'static', pos: [2, 1.5, -11.9], radius: 0.5 },
      { type: 'static', pos: [-2.4, 2.7, -16.8], radius: 0.4 }
    ]
  },
  {
    id: 'movers',
    name: 'MOVING MADNESS',
    desc: 'Sliding and oscillating targets. Lead your throws.',
    time: 100,
    maxAxes: null,
    maxMisses: null,
    meta: '100s · Moving targets',
    ramp: true,
    targets: [
      { type: 'sliding', pos: [0, 1.8, -7.0], radius: 0.85, amp: 3.5, speed: 1.4, phase: 0 },
      { type: 'sliding', pos: [0, 2.0, -9.8], radius: 0.85, amp: 3.0, speed: 1.8, phase: 1.5 },
      { type: 'oscillating', pos: [-5.5, 1.2, -8.4], radius: 0.85, amp: 2.5, speed: 1.2, phase: 0 },
      { type: 'oscillating', pos: [5.5, 1.2, -8.4], radius: 0.85, amp: 2.5, speed: 1.2, phase: Math.PI },
      { type: 'static', pos: [0, 2.2, -14.0], radius: 0.6 },
      { type: 'sliding', pos: [0, 1.9, -11.9], radius: 0.85, amp: 3.0, speed: 2.2, phase: 0.8, scoreMul: 1.5 }
    ]
  },
  {
    id: 'spinners',
    name: 'SPIN CYCLE',
    desc: 'Rotating targets. Hit the face as it turns.',
    time: 90,
    maxAxes: null,
    maxMisses: null,
    meta: '90s · Rotating boards',
    ramp: true,
    targets: [
      { type: 'rotating', pos: [0, 1.8, -6.3], radius: 0.85, speed: 1.2 },
      { type: 'rotating', pos: [-3.4, 1.9, -9.1], radius: 0.85, speed: 1.6, phase: 1 },
      { type: 'rotating', pos: [4.3, 1.9, -9.1], radius: 0.85, speed: 1.6, phase: 2 },
      { type: 'rotating', pos: [2.6, 2.1, -11.9], radius: 0.85, speed: 2.0, scoreMul: 1.5 },
      { type: 'static', pos: [-6.0, 1.5, -10.5], radius: 0.55 },
      { type: 'static', pos: [6.8, 1.2, -10.5], radius: 0.55 },
      { type: 'rotating', pos: [-2.9, 2.3, -15.4], radius: 0.55, speed: 2.5, scoreMul: 2 }
    ]
  },
  {
    id: 'blitz',
    name: 'BLITZ',
    desc: 'Fast bonus targets. Keep the combo alive.',
    time: 60,
    maxAxes: null,
    maxMisses: null,
    meta: '60s · Bonus pop-ups',
    ramp: false,
    targets: [
      { type: 'static', pos: [0, 1.7, -5.6], radius: 0.7 },
      { type: 'sliding', pos: [0, 1.9, -15.8], radius: 0.85, amp: 3.5, speed: 2.0 },
      { type: 'bonus', pos: [-2, 2.0, -7.0], radius: 0.7, lifetime: 4, spawnAt: 5, scoreMul: 3 },
      { type: 'bonus', pos: [2.5, 1.8, -9.8], radius: 0.7, lifetime: 3.5, spawnAt: 12, scoreMul: 3 },
      { type: 'bonus', pos: [-2.8, 2.2, -11.2], radius: 0.7, lifetime: 3, spawnAt: 20, scoreMul: 3 },
      { type: 'bonus', pos: [-3.9, 1.9, -7.7], radius: 0.7, lifetime: 3, spawnAt: 28, scoreMul: 3 },
      { type: 'bonus', pos: [4.0, 2.1, -10.5], radius: 0.7, lifetime: 3, spawnAt: 35, scoreMul: 3 },
      { type: 'bonus', pos: [0, 2.0, -8.6], radius: 0.7, lifetime: 2.5, spawnAt: 42, scoreMul: 4 },
      { type: 'oscillating', pos: [0, 1.8, -11.9], radius: 0.85, amp: 1.2, speed: 1.5, scoreMul: 1.5 }
    ]
  },
  {
    id: 'gauntlet',
    name: 'THE GAUNTLET',
    desc: 'Everything at once. Survive the chaos.',
    time: 120,
    maxAxes: null,
    maxMisses: null,
    meta: '120s · All target types',
    ramp: true,
    targets: [
      { type: 'static', pos: [0, 1.7, -5.6], radius: 0.7 },
      { type: 'sliding', pos: [0, 1.9, -7.7], radius: 0.85, amp: 4.0, speed: 1.8 },
      { type: 'rotating', pos: [-3.2, 2.0, -9.8], radius: 0.85, speed: 1.5 },
      { type: 'rotating', pos: [3.2, 2.0, -9.8], radius: 0.85, speed: 1.5, phase: Math.PI },
      { type: 'oscillating', pos: [-5.8, 1.2, -11.2], radius: 0.85, amp: 2.5, speed: 1.3 },
      { type: 'sliding', pos: [0, 2.2, -13.3], radius: 0.85, amp: 3.5, speed: 2.4, scoreMul: 1.5 },
      { type: 'rotating', pos: [2.6, 2.0, -15.4], radius: 0.55, speed: 2.2, scoreMul: 1.75 },
      { type: 'bonus', pos: [-1.3, 2.1, -9.9], radius: 0.7, lifetime: 4, spawnAt: 15, scoreMul: 3 },
      { type: 'bonus', pos: [1.7, 2.1, -11.0], radius: 0.7, lifetime: 3.5, spawnAt: 30, scoreMul: 3 },
      { type: 'bonus', pos: [3.4, 2.3, -15.9], radius: 0.7, lifetime: 3, spawnAt: 50, scoreMul: 4 },
      { type: 'bonus', pos: [-3.6, 1.9, -5.7], radius: 0.7, lifetime: 3, spawnAt: 70, scoreMul: 3 },
      { type: 'static', pos: [5.9, 1.5, -11.6], radius: 0.5 },
      { type: 'static', pos: [-5.9, 2.9, -11.6], radius: 0.5 }
    ]
  },
  {
    id: 'endless',
    name: 'ENDLESS RANGE',
    desc: 'No timer. Three misses end the run. Chase high score.',
    time: null,
    maxAxes: null,
    maxMisses: 3,
    meta: '3 misses = end · Unlimited',
    ramp: true,
    targets: [
      { type: 'static', pos: [0, 1.8, -6.3], radius: 0.8 },
      { type: 'static', pos: [-2.8, 1.9, -9.1], radius: 0.65 },
      { type: 'static', pos: [2.8, 1.9, -9.1], radius: 0.65 },
      { type: 'sliding', pos: [0, 2.0, -11.2], radius: 0.85, amp: 3.5, speed: 1.6 },
      { type: 'rotating', pos: [-2.4, 2.7, -14.0], radius: 0.6, speed: 1.4 },
      { type: 'oscillating', pos: [-5.5, 1.2, -10.5], radius: 0.85, amp: 2.0, speed: 1.1 },
      { type: 'oscillating', pos: [5.5, 1.2, -10.5], radius: 0.85, amp: 2.0, speed: 1.1, phase: Math.PI },
      { type: 'bonus', pos: [0, 2.3, -8.4], radius: 0.7, lifetime: 5, spawnAt: 10, scoreMul: 3 },
      { type: 'bonus', pos: [-2, 2.0, -13.5], radius: 0.7, lifetime: 4, spawnAt: 25, scoreMul: 3 },
      { type: 'bonus', pos: [2, 2.0, -13.5], radius: 0.7, lifetime: 4, spawnAt: 40, scoreMul: 3 }
    ]
  }
];

export function levelById(id: string): LevelDef {
  return LEVELS.find(l => l.id === id) ?? LEVELS[0];
}
