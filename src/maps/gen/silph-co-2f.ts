import silphco2fImage from "../../assets/map/gen/silph-co-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass, scientist, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_2F - do not hand-edit.
const silphCo2f: MapType = {
  name: "Silph Co 2F",
  image: silphco2fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [10, 11],
    1: [10, 11],
    4: [28, 29],
    5: [28, 29],
    10: [10, 11, 22, 23],
    11: [10, 11, 22, 23],
    16: [0, 1, 22, 23],
    17: [0, 1, 22, 23],
  },
  text: {
    2: {
      20: ["..."],
    },
  },
  maps: {
    0: {
      48: { map: MapId.SilphCo1f, pos: { x: 52, y: 1 } },
      49: { map: MapId.SilphCo1f, pos: { x: 52, y: 1 } },
      52: { map: MapId.SilphCo3f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo3f, pos: { x: 52, y: 1 } },
    },
    1: {
      48: { map: MapId.SilphCo1f, pos: { x: 52, y: 1 } },
      49: { map: MapId.SilphCo1f, pos: { x: 52, y: 1 } },
      52: { map: MapId.SilphCo3f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo3f, pos: { x: 52, y: 1 } },
    },
    6: {
      6: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      7: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      26: { map: MapId.SilphCo8f, pos: { x: 6, y: 31 } },
      27: { map: MapId.SilphCo8f, pos: { x: 6, y: 31 } },
    },
    7: {
      6: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      7: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      26: { map: MapId.SilphCo8f, pos: { x: 6, y: 31 } },
      27: { map: MapId.SilphCo8f, pos: { x: 6, y: 31 } },
    },
    30: {
      18: { map: MapId.SilphCo6f, pos: { x: 46, y: 7 } },
      19: { map: MapId.SilphCo6f, pos: { x: 46, y: 7 } },
      54: { map: MapId.SilphCo8f, pos: { x: 22, y: 11 } },
      55: { map: MapId.SilphCo8f, pos: { x: 22, y: 11 } },
    },
    31: {
      18: { map: MapId.SilphCo6f, pos: { x: 46, y: 7 } },
      19: { map: MapId.SilphCo6f, pos: { x: 46, y: 7 } },
      54: { map: MapId.SilphCo8f, pos: { x: 22, y: 11 } },
      55: { map: MapId.SilphCo8f, pos: { x: 22, y: 11 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 88, level: 26 }, { id: 110, level: 26 }, { id: 109, level: 26 }, { id: 110, level: 26 }],
      intro: ["Help! I'm a SILPH", "employee."],
      outtro: ["How", "did you know I was a ROCKET?"],
      money: 1300,
      pos: { x: 10, y: 24 },
      postGame: { message: ["I work for both", "SILPH and TEAM ROCKET!"] },
    },
    {
      npc: scientist,
      facing: Direction.Left,
      pokemon: [{ id: 81, level: 28 }, { id: 100, level: 28 }, { id: 82, level: 28 }],
      intro: ["It's off limits", "here! Go home!"],
      outtro: ["You're", "good."],
      money: 1400,
      pos: { x: 48, y: 26 },
      postGame: { message: ["Can you solve the", "maze in here?"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 104, level: 29 }, { id: 41, level: 29 }],
      intro: ["No kids are", "allowed in here!"],
      outtro: ["Tough!"],
      money: 870,
      pos: { x: 32, y: 22 },
      postGame: { message: ["Diamond shaped", "tiles are teleport blocks!", "They're hi-tech", "transporters!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 42, level: 25 }, { id: 41, level: 25 }, { id: 41, level: 25 }, { id: 20, level: 25 }, { id: 41, level: 25 }],
      intro: ["Hey kid! What are", "you doing here?"],
      outtro: ["I goofed!"],
      money: 750,
      pos: { x: 48, y: 14 },
      postGame: { message: ["SILPH CO. will", "be merged with TEAM ROCKET!"] },
    },
  ],
  npcs: [
    { npc: lass, pos: { x: 20, y: 2 }, facing: Direction.Up },
  ],
};

export default silphCo2f;
