import silphco10fImage from "../../assets/map/gen/silph-co-10f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_10F - do not hand-edit.
const silphCo10f: MapType = {
  name: "Silph Co 10F",
  image: silphco10fImage,
  height: 18,
  width: 16,
  start: { x: 8, y: 16 },
  walls: {
    4: [14, 15],
    5: [14, 15],
    8: [6, 7, 14, 15],
    9: [6, 7, 14, 15],
    16: [0, 1],
    17: [0, 1],
  },
  text: {},
  maps: {
    0: {
      16: { map: MapId.SilphCo9f, pos: { x: 28, y: 1 } },
      17: { map: MapId.SilphCo9f, pos: { x: 28, y: 1 } },
      20: { map: MapId.SilphCo11f, pos: { x: 18, y: 1 } },
      21: { map: MapId.SilphCo11f, pos: { x: 18, y: 1 } },
    },
    1: {
      16: { map: MapId.SilphCo9f, pos: { x: 28, y: 1 } },
      17: { map: MapId.SilphCo9f, pos: { x: 28, y: 1 } },
      20: { map: MapId.SilphCo11f, pos: { x: 18, y: 1 } },
      21: { map: MapId.SilphCo11f, pos: { x: 18, y: 1 } },
    },
    14: {
      26: { map: MapId.SilphCo4f, pos: { x: 34, y: 23 } },
      27: { map: MapId.SilphCo4f, pos: { x: 34, y: 23 } },
    },
    15: {
      26: { map: MapId.SilphCo4f, pos: { x: 34, y: 23 } },
      27: { map: MapId.SilphCo4f, pos: { x: 34, y: 23 } },
    },
    22: {
      18: { map: MapId.SilphCo4f, pos: { x: 22, y: 15 } },
      19: { map: MapId.SilphCo4f, pos: { x: 22, y: 15 } },
    },
    23: {
      18: { map: MapId.SilphCo4f, pos: { x: 22, y: 15 } },
      19: { map: MapId.SilphCo4f, pos: { x: 22, y: 15 } },
    },
    30: {
      26: { map: MapId.SilphCo4f, pos: { x: 6, y: 31 } },
      27: { map: MapId.SilphCo4f, pos: { x: 6, y: 31 } },
    },
    31: {
      26: { map: MapId.SilphCo4f, pos: { x: 6, y: 31 } },
      27: { map: MapId.SilphCo4f, pos: { x: 6, y: 31 } },
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
      pokemon: [{ id: 67, level: 33 }],
      intro: ["Welcome to the", "10F! So good of you to join me!"],
      outtro: ["I'm", "stunned!"],
      money: 990,
      pos: { x: 2, y: 18 },
      postGame: { message: ["Nice try, but the", "boardroom is up one more floor!"] },
    },
    {
      npc: scientist,
      facing: Direction.Left,
      pokemon: [{ id: 81, level: 29 }, { id: 109, level: 29 }],
      intro: ["Enough of your", "silly games!"],
      outtro: ["No", "continues left!"],
      money: 1450,
      pos: { x: 20, y: 4 },
      postGame: { message: ["Are you satisfied", "with beating me? Then go on home!"] },
    },
  ],
  items: [
    { item: ItemType.Tm26, pos: { x: 4, y: 25 } },
    { item: ItemType.RareCandy, pos: { x: 8, y: 29 } },
    { item: ItemType.Carbos, pos: { x: 10, y: 23 } },
  ],
};

export default silphCo10f;
