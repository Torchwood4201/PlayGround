import silphco9fImage from "../../assets/map/gen/silph-co-9f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_9F - do not hand-edit.
const silphCo9f: MapType = {
  name: "Silph Co 9F",
  image: silphco9fImage,
  height: 18,
  width: 26,
  start: { x: 13, y: 16 },
  walls: {
    0: [10, 11],
    1: [10, 11],
    4: [10, 11],
    5: [10, 11],
    8: [10, 11],
    9: [10, 11],
    10: [8, 9, 22, 23],
    11: [8, 9, 22, 23],
    12: [4, 5, 6, 7],
    13: [4, 5, 6, 7],
    14: [2, 3, 4, 5, 6, 7],
    15: [2, 3, 4, 5, 6, 7],
    16: [0, 1, 8, 9, 14, 15],
    17: [0, 1, 8, 9, 14, 15],
  },
  text: {},
  maps: {
    0: {
      28: { map: MapId.SilphCo10f, pos: { x: 16, y: 1 } },
      29: { map: MapId.SilphCo10f, pos: { x: 16, y: 1 } },
      32: { map: MapId.SilphCo8f, pos: { x: 32, y: 1 } },
      33: { map: MapId.SilphCo8f, pos: { x: 32, y: 1 } },
    },
    1: {
      28: { map: MapId.SilphCo10f, pos: { x: 16, y: 1 } },
      29: { map: MapId.SilphCo10f, pos: { x: 16, y: 1 } },
      32: { map: MapId.SilphCo8f, pos: { x: 32, y: 1 } },
      33: { map: MapId.SilphCo8f, pos: { x: 32, y: 1 } },
    },
    6: {
      18: { map: MapId.SilphCo3f, pos: { x: 6, y: 23 } },
      19: { map: MapId.SilphCo3f, pos: { x: 6, y: 23 } },
    },
    7: {
      18: { map: MapId.SilphCo3f, pos: { x: 6, y: 23 } },
      19: { map: MapId.SilphCo3f, pos: { x: 6, y: 23 } },
    },
    30: {
      34: { map: MapId.SilphCo5f, pos: { x: 18, y: 31 } },
      35: { map: MapId.SilphCo5f, pos: { x: 18, y: 31 } },
    },
    31: {
      34: { map: MapId.SilphCo5f, pos: { x: 18, y: 31 } },
      35: { map: MapId.SilphCo5f, pos: { x: 18, y: 31 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 96, level: 28 }, { id: 88, level: 28 }, { id: 66, level: 28 }],
      intro: ["Your POKEMON seem", "to adore you, kid!"],
      outtro: ["Ghaaah!"],
      money: 840,
      pos: { x: 4, y: 8 },
      postGame: { message: ["If I had started", "as a trainer at your age..."] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 100, level: 28 }, { id: 109, level: 28 }, { id: 82, level: 28 }],
      intro: ["Your POKEMON have", "weak points! I can nail them!"],
      outtro: ["You", "hammered me!"],
      money: 1400,
      pos: { x: 42, y: 26 },
      postGame: { message: ["Exploiting weak", "spots does work! Think about element", "types!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 42, level: 28 }, { id: 96, level: 28 }, { id: 97, level: 28 }],
      intro: ["I am one of the 4", "ROCKET BROTHERS!"],
      outtro: ["Warg!", "Brothers, I lost!"],
      money: 840,
      pos: { x: 26, y: 32 },
      postGame: { message: ["My brothers will", "avenge me!"] },
    },
  ],
  pokemonCenter: { x: 6, y: 29 },
};

export default silphCo9f;
