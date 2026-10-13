import silphco7fImage from "../../assets/map/gen/silph-co-7f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { rival, scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_7F - do not hand-edit.
const silphCo7f: MapType = {
  name: "Silph Co 7F",
  image: silphco7fImage,
  height: 18,
  width: 26,
  start: { x: 13, y: 16 },
  walls: {
    0: [12, 13, 14, 15],
    1: [12, 13, 14, 15],
    2: [8, 9, 10, 11],
    3: [8, 9, 10, 11],
    4: [24, 25],
    5: [24, 25],
    6: [14, 15],
    7: [14, 15],
    12: [24, 25],
    13: [24, 25],
    14: [6, 7],
    15: [6, 7],
    16: [0, 1],
    17: [0, 1],
  },
  text: {},
  maps: {
    0: {
      32: { map: MapId.SilphCo8f, pos: { x: 28, y: 1 } },
      33: { map: MapId.SilphCo8f, pos: { x: 28, y: 1 } },
      44: { map: MapId.SilphCo6f, pos: { x: 32, y: 1 } },
      45: { map: MapId.SilphCo6f, pos: { x: 32, y: 1 } },
    },
    1: {
      32: { map: MapId.SilphCo8f, pos: { x: 28, y: 1 } },
      33: { map: MapId.SilphCo8f, pos: { x: 28, y: 1 } },
      44: { map: MapId.SilphCo6f, pos: { x: 32, y: 1 } },
      45: { map: MapId.SilphCo6f, pos: { x: 32, y: 1 } },
    },
    6: {
      10: { map: MapId.SilphCo3f, pos: { x: 22, y: 23 } },
      11: { map: MapId.SilphCo3f, pos: { x: 22, y: 23 } },
    },
    7: {
      10: { map: MapId.SilphCo3f, pos: { x: 22, y: 23 } },
      11: { map: MapId.SilphCo3f, pos: { x: 22, y: 23 } },
    },
    14: {
      10: { map: MapId.SilphCo11f, pos: { x: 6, y: 5 } },
      11: { map: MapId.SilphCo11f, pos: { x: 6, y: 5 } },
    },
    15: {
      10: { map: MapId.SilphCo11f, pos: { x: 6, y: 5 } },
      11: { map: MapId.SilphCo11f, pos: { x: 6, y: 5 } },
    },
    30: {
      42: { map: MapId.SilphCo5f, pos: { x: 54, y: 7 } },
      43: { map: MapId.SilphCo5f, pos: { x: 54, y: 7 } },
    },
    31: {
      42: { map: MapId.SilphCo5f, pos: { x: 54, y: 7 } },
      43: { map: MapId.SilphCo5f, pos: { x: 54, y: 7 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 20, level: 26 }, { id: 24, level: 26 }, { id: 109, level: 26 }, { id: 42, level: 26 }],
      intro: ["Oh ho! I smell a", "little rat!"],
      outtro: ["Lights", "out!"],
      money: 780,
      pos: { x: 26, y: 2 },
      postGame: { message: ["You won't find my", "BOSS by just scurrying around!"] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 101, level: 29 }, { id: 89, level: 29 }],
      intro: ["Heheh!", "You mistook me for", "a SILPH worker?"],
      outtro: ["I'm", "done!"],
      money: 1450,
      pos: { x: 4, y: 26 },
      postGame: { message: ["Despite your age,", "you are a skilled trainer!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 104, level: 29 }, { id: 104, level: 29 }],
      intro: ["I am one of the 4", "ROCKET BROTHERS!"],
      outtro: ["Aack!", "Brothers, I lost!"],
      money: 870,
      pos: { x: 40, y: 4 },
      postGame: { message: ["Doesn't matter.", "My brothers will repay the favor!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 27, level: 29 }, { id: 28, level: 29 }],
      intro: ["A child intruder?", "That must be you!"],
      outtro: ["Fine!", "I lost!"],
      money: 870,
      pos: { x: 38, y: 28 },
      postGame: { message: ["Go on home", "before my BOSS gets ticked off!"] },
    },
    {
      npc: rival,
      rivalTier: 5,
      facing: Direction.Up,
      pokemon: [{ id: 18, level: 37 }, { id: 58, level: 38 }, { id: 102, level: 35 }, { id: 65, level: 35 }, { id: 9, level: 40 }],
      intro: ["Rival: What", "kept you Blue?"],
      outtro: ["Oh ho!", "So, you are ready for BOSS ROCKET!"],
      money: 2600,
      pos: { x: 6, y: 14 },
      postGame: { message: ["Rival: How can", "I put this?", "You're not good", "enough to play with us big boys!"] },
    },
  ],
  items: [
    { item: ItemType.Calcium, pos: { x: 2, y: 19 } },
    { item: ItemType.Tm03, pos: { x: 48, y: 23 } },
  ],
};

export default silphCo7f;
