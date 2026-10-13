import silphco4fImage from "../../assets/map/gen/silph-co-4f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_4F - do not hand-edit.
const silphCo4f: MapType = {
  name: "Silph Co 4F",
  image: silphco4fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    4: [28, 29],
    5: [28, 29],
    16: [0, 1, 20, 21],
    17: [0, 1, 20, 21],
  },
  text: {
    4: {
      12: ["..."],
    },
  },
  maps: {
    0: {
      48: { map: MapId.SilphCo3f, pos: { x: 48, y: 1 } },
      49: { map: MapId.SilphCo3f, pos: { x: 48, y: 1 } },
      52: { map: MapId.SilphCo5f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo5f, pos: { x: 52, y: 1 } },
    },
    1: {
      48: { map: MapId.SilphCo3f, pos: { x: 48, y: 1 } },
      49: { map: MapId.SilphCo3f, pos: { x: 48, y: 1 } },
      52: { map: MapId.SilphCo5f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo5f, pos: { x: 52, y: 1 } },
    },
    6: {
      34: { map: MapId.SilphCo6f, pos: { x: 6, y: 7 } },
      35: { map: MapId.SilphCo6f, pos: { x: 6, y: 7 } },
    },
    7: {
      34: { map: MapId.SilphCo6f, pos: { x: 6, y: 7 } },
      35: { map: MapId.SilphCo6f, pos: { x: 6, y: 7 } },
    },
    14: {
      22: { map: MapId.SilphCo10f, pos: { x: 18, y: 23 } },
      23: { map: MapId.SilphCo10f, pos: { x: 18, y: 23 } },
    },
    15: {
      22: { map: MapId.SilphCo10f, pos: { x: 18, y: 23 } },
      23: { map: MapId.SilphCo10f, pos: { x: 18, y: 23 } },
    },
    22: {
      34: { map: MapId.SilphCo10f, pos: { x: 26, y: 15 } },
      35: { map: MapId.SilphCo10f, pos: { x: 26, y: 15 } },
    },
    23: {
      34: { map: MapId.SilphCo10f, pos: { x: 26, y: 15 } },
      35: { map: MapId.SilphCo10f, pos: { x: 26, y: 15 } },
    },
    30: {
      6: { map: MapId.SilphCo10f, pos: { x: 26, y: 31 } },
      7: { map: MapId.SilphCo10f, pos: { x: 26, y: 31 } },
    },
    31: {
      6: { map: MapId.SilphCo10f, pos: { x: 26, y: 31 } },
      7: { map: MapId.SilphCo10f, pos: { x: 26, y: 31 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 66, level: 29 }, { id: 96, level: 29 }],
      intro: ["TEAM ROCKET has", "taken command of SILPH CO.!"],
      outtro: ["Arrgh!"],
      money: 870,
      pos: { x: 18, y: 28 },
      postGame: { message: ["Fwahahaha!", "My BOSS has been after this place!"] },
    },
    {
      npc: scientist,
      facing: Direction.Left,
      pokemon: [{ id: 101, level: 33 }],
      intro: ["My POKEMON are my", "loyal soldiers!"],
      outtro: ["Darn!", "You weak POKEMON!"],
      money: 1650,
      pos: { x: 28, y: 12 },
      postGame: { message: ["The doors are", "electronically locked! A CARD KEY", "opens them!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 23, level: 28 }, { id: 41, level: 28 }, { id: 104, level: 28 }],
      intro: ["Intruder spotted!"],
      outtro: ["Who", "are you?"],
      money: 840,
      pos: { x: 52, y: 20 },
      postGame: { message: ["I better tell the", "BOSS on 11F!"] },
    },
  ],
  items: [
    { item: ItemType.FullHeal, pos: { x: 6, y: 19 } },
    { item: ItemType.MaxRevive, pos: { x: 8, y: 15 } },
    { item: ItemType.EscapeRope, pos: { x: 10, y: 17 } },
  ],
  npcs: [
    { npc: scientist, pos: { x: 12, y: 4 }, facing: Direction.Down },
  ],
};

export default silphCo4f;
