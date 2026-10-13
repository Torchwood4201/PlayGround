import silphco8fImage from "../../assets/map/gen/silph-co-8f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_8F - do not hand-edit.
const silphCo8f: MapType = {
  name: "Silph Co 8F",
  image: silphco8fImage,
  height: 18,
  width: 26,
  start: { x: 13, y: 16 },
  walls: {
    0: [6, 7],
    1: [6, 7],
    4: [24, 25],
    5: [24, 25],
    6: [18, 19, 20, 21],
    7: [18, 19, 20, 21],
    12: [16, 17, 18, 19],
    13: [16, 17, 18, 19],
    16: [0, 1],
    17: [0, 1],
  },
  text: {
    4: {
      8: ["..."],
    },
  },
  maps: {
    0: {
      28: { map: MapId.SilphCo7f, pos: { x: 32, y: 1 } },
      29: { map: MapId.SilphCo7f, pos: { x: 32, y: 1 } },
      32: { map: MapId.SilphCo9f, pos: { x: 32, y: 1 } },
      33: { map: MapId.SilphCo9f, pos: { x: 32, y: 1 } },
    },
    1: {
      28: { map: MapId.SilphCo7f, pos: { x: 32, y: 1 } },
      29: { map: MapId.SilphCo7f, pos: { x: 32, y: 1 } },
      32: { map: MapId.SilphCo9f, pos: { x: 32, y: 1 } },
      33: { map: MapId.SilphCo9f, pos: { x: 32, y: 1 } },
    },
    10: {
      22: { map: MapId.SilphCo2f, pos: { x: 54, y: 31 } },
      23: { map: MapId.SilphCo2f, pos: { x: 54, y: 31 } },
    },
    11: {
      22: { map: MapId.SilphCo2f, pos: { x: 54, y: 31 } },
      23: { map: MapId.SilphCo2f, pos: { x: 54, y: 31 } },
    },
    18: {
      22: { map: MapId.SilphCo8f, pos: { x: 6, y: 23 } },
      23: { map: MapId.SilphCo8f, pos: { x: 6, y: 23 } },
    },
    19: {
      22: { map: MapId.SilphCo8f, pos: { x: 6, y: 23 } },
      23: { map: MapId.SilphCo8f, pos: { x: 6, y: 23 } },
    },
    22: {
      6: { map: MapId.SilphCo8f, pos: { x: 22, y: 19 } },
      7: { map: MapId.SilphCo8f, pos: { x: 22, y: 19 } },
    },
    23: {
      6: { map: MapId.SilphCo8f, pos: { x: 22, y: 19 } },
      7: { map: MapId.SilphCo8f, pos: { x: 22, y: 19 } },
    },
    30: {
      6: { map: MapId.SilphCo2f, pos: { x: 26, y: 7 } },
      7: { map: MapId.SilphCo2f, pos: { x: 26, y: 7 } },
    },
    31: {
      6: { map: MapId.SilphCo2f, pos: { x: 26, y: 7 } },
      7: { map: MapId.SilphCo2f, pos: { x: 26, y: 7 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 20, level: 26 }, { id: 41, level: 26 }, { id: 42, level: 26 }, { id: 19, level: 26 }],
      intro: ["That's as far as", "you'll go!"],
      outtro: ["Not", "enough grit!"],
      money: 780,
      pos: { x: 38, y: 4 },
      postGame: { message: ["If you don't turn", "back, I'll call for backup!"] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 88, level: 29 }, { id: 101, level: 29 }],
      intro: ["You're causing us", "problems!"],
      outtro: ["Huh?", "I lost?"],
      money: 1450,
      pos: { x: 20, y: 4 },
      postGame: { message: ["So, what do you", "think of SILPH BUILDING's maze?"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 110, level: 28 }, { id: 42, level: 28 }, { id: 109, level: 28 }],
      intro: ["I am one of the 4", "ROCKET BROTHERS!"],
      outtro: ["Whoo!", "Oh brothers!"],
      money: 840,
      pos: { x: 24, y: 30 },
      postGame: { message: ["I'll leave you up", "to my brothers!"] },
    },
  ],
  npcs: [
    { npc: scientist, pos: { x: 8, y: 4 }, facing: Direction.Down },
  ],
};

export default silphCo8f;
