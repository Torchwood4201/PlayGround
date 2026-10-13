import silphco3fImage from "../../assets/map/gen/silph-co-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_3F - do not hand-edit.
const silphCo3f: MapType = {
  name: "Silph Co 3F",
  image: silphco3fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    4: [8, 9, 16, 17],
    5: [8, 9, 16, 17],
    10: [24, 25, 26, 27],
    11: [24, 25, 26, 27],
    16: [0, 1],
    17: [0, 1],
  },
  text: {
    16: {
      48: ["..."],
    },
  },
  maps: {
    0: {
      48: { map: MapId.SilphCo4f, pos: { x: 48, y: 1 } },
      49: { map: MapId.SilphCo4f, pos: { x: 48, y: 1 } },
      52: { map: MapId.SilphCo2f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo2f, pos: { x: 52, y: 1 } },
    },
    1: {
      48: { map: MapId.SilphCo4f, pos: { x: 48, y: 1 } },
      49: { map: MapId.SilphCo4f, pos: { x: 48, y: 1 } },
      52: { map: MapId.SilphCo2f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo2f, pos: { x: 52, y: 1 } },
    },
    6: {
      6: { map: MapId.SilphCo5f, pos: { x: 22, y: 11 } },
      7: { map: MapId.SilphCo5f, pos: { x: 22, y: 11 } },
      54: { map: MapId.SilphCo2f, pos: { x: 6, y: 7 } },
      55: { map: MapId.SilphCo2f, pos: { x: 6, y: 7 } },
    },
    7: {
      6: { map: MapId.SilphCo5f, pos: { x: 22, y: 11 } },
      7: { map: MapId.SilphCo5f, pos: { x: 22, y: 11 } },
      54: { map: MapId.SilphCo2f, pos: { x: 6, y: 7 } },
      55: { map: MapId.SilphCo2f, pos: { x: 6, y: 7 } },
    },
    22: {
      6: { map: MapId.SilphCo9f, pos: { x: 18, y: 7 } },
      7: { map: MapId.SilphCo9f, pos: { x: 18, y: 7 } },
      22: { map: MapId.SilphCo7f, pos: { x: 10, y: 7 } },
      23: { map: MapId.SilphCo7f, pos: { x: 10, y: 7 } },
      46: { map: MapId.SilphCo3f, pos: { x: 54, y: 31 } },
      47: { map: MapId.SilphCo3f, pos: { x: 54, y: 31 } },
    },
    23: {
      6: { map: MapId.SilphCo9f, pos: { x: 18, y: 7 } },
      7: { map: MapId.SilphCo9f, pos: { x: 18, y: 7 } },
      22: { map: MapId.SilphCo7f, pos: { x: 10, y: 7 } },
      23: { map: MapId.SilphCo7f, pos: { x: 10, y: 7 } },
      46: { map: MapId.SilphCo3f, pos: { x: 54, y: 31 } },
      47: { map: MapId.SilphCo3f, pos: { x: 54, y: 31 } },
    },
    30: {
      6: { map: MapId.SilphCo5f, pos: { x: 6, y: 31 } },
      7: { map: MapId.SilphCo5f, pos: { x: 6, y: 31 } },
      54: { map: MapId.SilphCo3f, pos: { x: 46, y: 23 } },
      55: { map: MapId.SilphCo3f, pos: { x: 46, y: 23 } },
    },
    31: {
      6: { map: MapId.SilphCo5f, pos: { x: 6, y: 31 } },
      7: { map: MapId.SilphCo5f, pos: { x: 6, y: 31 } },
      54: { map: MapId.SilphCo3f, pos: { x: 46, y: 23 } },
      55: { map: MapId.SilphCo3f, pos: { x: 46, y: 23 } },
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
      pokemon: [{ id: 20, level: 28 }, { id: 97, level: 28 }, { id: 20, level: 28 }],
      intro: ["Quit messing with", "us, kid!"],
      outtro: ["I give", "up!"],
      money: 840,
      pos: { x: 40, y: 14 },
      postGame: { message: ["A hint? You can", "open doors with a CARD KEY!"] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 101, level: 29 }, { id: 110, level: 29 }],
      intro: ["I support TEAM", "ROCKET more than I support SILPH!"],
      outtro: ["You", "really got me!"],
      money: 1450,
      pos: { x: 14, y: 18 },
      postGame: { message: ["Humph...", "TEAM ROCKET said", "that if I helped them, they'd let me", "study POKEMON!"] },
    },
  ],
  items: [
    { item: ItemType.HyperPotion, pos: { x: 16, y: 11 } },
  ],
  npcs: [
    { npc: scientist, pos: { x: 48, y: 16 }, facing: Direction.Down },
  ],
};

export default silphCo3f;
