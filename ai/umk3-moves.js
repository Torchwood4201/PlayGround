/* ==========================================================================
   UMK3 full combat move list (`ai/umk3-moves.js`).
   --------------------------------------------------------------------------
   Transcribed from the complete UMK3 SNES move list (icemantraveler.github
   numbering: 1=Up 2=Down 3=Back 4=Forward 5=Low Punch 6=High Punch
   7=Low Kick 8=High Kick 9=Block 0=Run; SNES buttons HP=Y LP=B HK=X LK=A).

   Encoding for the copilot (RetroArch SNES indices: B=0 Y=1 Select=2
   Start=3 Up=4 Down=5 Left=6 Right=7 A=8 X=9 L=10 R=11):
   - integers are emulator button indices (LP=0 HP=1 LK=8 HK=9 BL=10 RN=11)
   - 'F' / 'B' / 'D' are facing-relative tokens resolved at play time
   - [a, b, ...] nested arrays are simultaneous chords (pressed together)

   Combat moves only. Deliberately excluded, with reasons:
   - fatalities / babalities / friendships / brutalities / stage fatalities:
     finisher states the bot cannot reliably detect; firing them at random
     wastes the round
   - Mercy (hold 0, then 2,2,2): round-3-only, outside sweep range
   - hold-to-charge (Kano/Cyrax/Liu/Jax/Mileena holds, Reptile/Smoke
     invisibility, Sindel levitate): holds longer than a fight phase lasts
   - air-only (Jax backbreaker, Kano/Scorpion/Smoke air throws, Kung Lao
     dive kick, Sindel air fireball): the bot cannot confirm airborne state
   - Shang Tsung morphs: swapping identity loses the current moveset
   - Motaro / Shao Kahn: unplayable boss characters
   ========================================================================== */
(function(){
  'use strict';

  /* Move-list number -> emulator index (LP=B0 HP=Y1 LK=A8 HK=X9 BL=L10 RN=R11).
     1/Up->4 and 2/Down->5 are inlined below; 3/Back and 4/Forward stay as
     'B'/'F' tokens for facing-relative resolution. */
  var MOVES = [
    { fighter: 'Universal', name: 'Throw (close)', seq: [0] },
    { fighter: 'Universal', name: 'Uppercut', seq: [5, 1] },
    { fighter: 'Universal', name: 'Sweep', seq: ['B', 8] },
    { fighter: 'Universal', name: 'Roundhouse', seq: ['B', 9] },
    { fighter: 'Cyrax', name: 'Green Net', seq: ['B', 'B', 8] },
    { fighter: 'Cyrax', name: 'Teleport', seq: ['F', 5, 10] },
    { fighter: 'Ermac', name: 'Fireball', seq: [5, 'B', 0] },
    { fighter: 'Ermac', name: 'Teleport Punch', seq: [5, 'B', 1] },
    { fighter: 'Ermac', name: 'Telekinetic Slam', seq: ['B', 5, 'B', 9] },
    { fighter: 'Jade', name: 'Razor-Rang', seq: ['B', 'F', 0] },
    { fighter: 'Jade', name: 'Razor-Rang Up', seq: ['B', 'F', 1] },
    { fighter: 'Jade', name: 'Razor-Rang Down', seq: ['B', 'F', 8] },
    { fighter: 'Jade', name: 'Returning Razor-Rang', seq: ['B', 'B', 'F', 0] },
    { fighter: 'Jade', name: 'Shadow Kick', seq: [5, 'F', 8] },
    { fighter: 'Jade', name: 'Projectile Shield', seq: ['B', 'F', 9] },
    { fighter: 'Jax', name: 'Single Missile', seq: ['B', 'F', 1] },
    { fighter: 'Jax', name: 'Double Missiles', seq: ['F', 'F', 'B', 'B', 1] },
    { fighter: 'Jax', name: 'Gotcha Grab', seq: ['F', 'F', 0] },
    { fighter: 'Jax', name: 'Dash Punch', seq: ['F', 'F', 9] },
    { fighter: 'Kabal', name: 'Plasma Blast', seq: ['B', 'B', 1] },
    { fighter: 'Kabal', name: 'Nomad Dash', seq: ['B', 'F', 8] },
    { fighter: 'Kabal', name: 'Ground Saw', seq: ['B', 'B', 'B', 11] },
    { fighter: 'Kano', name: 'Knife Throw', seq: [5, 'B', 1] },
    { fighter: 'Kano', name: 'Knife Swipe', seq: [5, 'F', 1] },
    { fighter: 'Kano', name: 'Chokehold', seq: [5, 'F', 0] },
    { fighter: 'Kano', name: 'Upward Cannonball', seq: ['F', 5, 'F', 9] },
    { fighter: 'Kitana', name: 'Fan Throw', seq: ['F', 'F', [0, 1]] },
    { fighter: 'Kitana', name: 'Fan Lift', seq: ['B', 'B', 'B', 1] },
    { fighter: 'Kitana', name: 'Square Wave Punch', seq: [5, 'B', 1] },
    { fighter: 'Kung Lao', name: 'Hat Throw', seq: ['B', 'F', 0] },
    { fighter: 'Kung Lao', name: 'Teleport + attack', seq: [5, 4, 1] },
    { fighter: 'Kung Lao', name: 'Whirlwind Spin', seq: ['F', 5, 'F', 11] },
    { fighter: 'Liu Kang', name: 'High Fireball', seq: ['F', 'F', 1] },
    { fighter: 'Liu Kang', name: 'Low Fireball', seq: ['F', 'F', 0] },
    { fighter: 'Liu Kang', name: 'Flying Kick', seq: ['F', 'F', 9] },
    { fighter: 'Mileena', name: 'Teleport Kick', seq: ['F', 'F', 8] },
    { fighter: 'Mileena', name: 'Ground Roll', seq: ['B', 'B', 5, 9] },
    { fighter: 'Nightwolf', name: 'Spirit Arrow', seq: [5, 'B', 0] },
    { fighter: 'Nightwolf', name: 'Tomahawk Swipe', seq: [5, 'F', 1] },
    { fighter: 'Nightwolf', name: 'Shoulder Charge', seq: ['F', 'F', 8] },
    { fighter: 'Nightwolf', name: 'Projectile Reflector', seq: ['B', 'B', 'B', 9] },
    { fighter: 'Noob Saibot', name: 'Disabler Fireball', seq: [5, 'F', 0] },
    { fighter: 'Noob Saibot', name: 'Teleport Slam', seq: [5, 4, 1] },
    { fighter: 'Noob Saibot', name: 'Shadow Throw', seq: ['F', 'F', 1] },
    { fighter: 'Rain', name: 'Control Orb', seq: [5, 'F', 1] },
    { fighter: 'Rain', name: 'Lightning Lift', seq: ['B', 'B', 1] },
    { fighter: 'Rain', name: 'Super Roundhouse', seq: [['B', 9]] },
    { fighter: 'Reptile', name: 'Acid Spit', seq: ['F', 'F', 1] },
    { fighter: 'Reptile', name: 'Slow Forceball', seq: ['B', 'B', [0, 1]] },
    { fighter: 'Reptile', name: 'Fast Forceball', seq: ['F', 'F', [0, 1]] },
    { fighter: 'Reptile', name: 'Slide', seq: [['B', 0, 8, 10]] },
    { fighter: 'Reptile', name: 'Reverse Elbow', seq: ['B', 'F', 8] },
    { fighter: 'Scorpion', name: 'Spear', seq: ['B', 'B', 0] },
    { fighter: 'Scorpion', name: 'Teleport Punch', seq: [5, 'B', 1] },
    { fighter: 'Sektor', name: 'Missile', seq: ['F', 'F', 0] },
    { fighter: 'Sektor', name: 'Homing Missile', seq: ['F', 5, 'B', 1] },
    { fighter: 'Sektor', name: 'Teleport Uppercut', seq: ['F', 'F', 8] },
    { fighter: 'Shang Tsung', name: 'Single Flaming Skull', seq: ['B', 'B', 1] },
    { fighter: 'Shang Tsung', name: 'Double Flaming Skulls', seq: ['B', 'B', 'F', 1] },
    { fighter: 'Shang Tsung', name: 'Triple Flaming Skulls', seq: ['B', 'B', 'F', 'F', 1] },
    { fighter: 'Shang Tsung', name: 'Volcanic Triple Skulls', seq: ['F', 'B', 'B', 8] },
    { fighter: 'Sindel', name: 'Fireball', seq: ['F', 'F', 0] },
    { fighter: 'Sindel', name: 'Banshee Scream', seq: ['F', 'F', 'F', 1] },
    { fighter: 'Cyborg Smoke', name: 'Spear', seq: ['B', 'B', 0] },
    { fighter: 'Cyborg Smoke', name: 'Teleport Uppercut', seq: ['F', 'F', 8] },
    { fighter: 'Sonya', name: 'Energy Rings', seq: [5, 'F', 0] },
    { fighter: 'Sonya', name: 'Leg Grab', seq: [[5, 0, 10]] },
    { fighter: 'Sonya', name: 'Square Wave Punch', seq: ['F', 'B', 1] },
    { fighter: 'Sonya', name: 'Rising Bicycle Kick', seq: ['B', 'B', 5, 9] },
    { fighter: 'Stryker', name: 'Low Grenade', seq: [5, 'B', 0] },
    { fighter: 'Stryker', name: 'High Grenade', seq: [5, 'B', 1] },
    { fighter: 'Stryker', name: 'Baton Trip', seq: ['F', 'B', 0] },
    { fighter: 'Stryker', name: 'Baton Throw', seq: ['F', 'F', 9] },
    { fighter: 'Stryker', name: 'Rapid Fire Gun', seq: ['B', 'F', 1] },
    { fighter: 'Sub-Zero Unmasked', name: 'Freeze', seq: [5, 'F', 0] },
    { fighter: 'Sub-Zero Unmasked', name: 'Slide', seq: [['B', 0, 8, 10]] },
    { fighter: 'Sub-Zero Unmasked', name: 'Ice Clone', seq: [5, 'B', 0] },
    { fighter: 'Sub-Zero Unmasked', name: 'Ice Shower', seq: [5, 'F', 1] },
    { fighter: 'Sub-Zero Unmasked', name: 'Ice Shower Front', seq: [5, 'F', 'B', 1] },
    { fighter: 'Sub-Zero Unmasked', name: 'Ice Shower Behind', seq: [5, 'B', 'F', 1] },
    { fighter: 'Sub-Zero Classic', name: 'Freeze', seq: [5, 'F', 0] },
    { fighter: 'Sub-Zero Classic', name: 'Slide', seq: [['B', 0, 8, 10]] },
    { fighter: 'Sub-Zero Classic', name: 'Ground Freeze', seq: [5, 'B', 8] },
    { fighter: 'Human Smoke', name: 'Spear', seq: ['B', 'B', 0] },
    { fighter: 'Human Smoke', name: 'Teleport Punch', seq: [5, 'B', 1] }
  ];

  if(typeof window !== 'undefined') window.UMK3_MOVES = MOVES;
  if(typeof module !== 'undefined' && module.exports) module.exports = MOVES;
})();
