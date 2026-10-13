import ceruleancave1fImage from "../../assets/map/gen/cerulean-cave-1f.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered CERULEAN_CAVE_1F - do not hand-edit.
const ceruleanCave1f: MapType = {
  name: "Cerulean Cave 1F",
  image: ceruleancave1fImage,
  height: 18,
  width: 30,
  start: { x: 48, y: 35 },
  walls: {
    0: [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25],
    1: [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25],
    6: [24, 25],
    7: [24, 25],
    8: [2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 20, 21, 24, 25],
    9: [2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 20, 21, 24, 25],
    10: [0, 1, 10, 11, 18, 19],
    11: [0, 1, 10, 11, 18, 19],
    12: [18, 19],
    13: [18, 19],
    14: [4, 5, 6, 7, 16, 17, 26, 27, 28, 29],
    15: [4, 5, 6, 7, 16, 17, 26, 27, 28, 29],
    16: [8, 9, 10, 11, 12, 13, 20, 21, 22, 23],
    17: [8, 9, 10, 11, 12, 13, 20, 21, 22, 23],
  },
  text: {},
  maps: {
    2: {
      14: { map: MapId.CeruleanCave2f, pos: { x: 18, y: 3 } },
      15: { map: MapId.CeruleanCave2f, pos: { x: 18, y: 3 } },
      54: { map: MapId.CeruleanCave2f, pos: { x: 58, y: 3 } },
      55: { map: MapId.CeruleanCave2f, pos: { x: 58, y: 3 } },
    },
    3: {
      14: { map: MapId.CeruleanCave2f, pos: { x: 18, y: 3 } },
      15: { map: MapId.CeruleanCave2f, pos: { x: 18, y: 3 } },
      54: { map: MapId.CeruleanCave2f, pos: { x: 58, y: 3 } },
      55: { map: MapId.CeruleanCave2f, pos: { x: 58, y: 3 } },
    },
    6: {
      2: { map: MapId.CeruleanCave2f, pos: { x: 2, y: 7 } },
      3: { map: MapId.CeruleanCave2f, pos: { x: 2, y: 7 } },
    },
    7: {
      2: { map: MapId.CeruleanCave2f, pos: { x: 2, y: 7 } },
      3: { map: MapId.CeruleanCave2f, pos: { x: 2, y: 7 } },
    },
    12: {
      0: { map: MapId.CeruleanCaveB1f, pos: { x: 6, y: 13 } },
      1: { map: MapId.CeruleanCaveB1f, pos: { x: 6, y: 13 } },
    },
    13: {
      0: { map: MapId.CeruleanCaveB1f, pos: { x: 6, y: 13 } },
      1: { map: MapId.CeruleanCaveB1f, pos: { x: 6, y: 13 } },
    },
    14: {
      46: { map: MapId.CeruleanCave2f, pos: { x: 44, y: 13 } },
      47: { map: MapId.CeruleanCave2f, pos: { x: 44, y: 13 } },
    },
    15: {
      46: { map: MapId.CeruleanCave2f, pos: { x: 44, y: 13 } },
      47: { map: MapId.CeruleanCave2f, pos: { x: 44, y: 13 } },
    },
    18: {
      36: { map: MapId.CeruleanCave2f, pos: { x: 38, y: 15 } },
      37: { map: MapId.CeruleanCave2f, pos: { x: 38, y: 15 } },
    },
    19: {
      36: { map: MapId.CeruleanCave2f, pos: { x: 38, y: 15 } },
      37: { map: MapId.CeruleanCave2f, pos: { x: 38, y: 15 } },
    },
    22: {
      6: { map: MapId.CeruleanCave2f, pos: { x: 6, y: 23 } },
      7: { map: MapId.CeruleanCave2f, pos: { x: 6, y: 23 } },
    },
    23: {
      6: { map: MapId.CeruleanCave2f, pos: { x: 6, y: 23 } },
      7: { map: MapId.CeruleanCave2f, pos: { x: 6, y: 23 } },
    },
  },
  exits: {
    35: [48, 49, 50, 51],
  },
  cave: true,
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 8, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    4: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    5: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    6: [8, 9, 10, 11, 12, 13, 14, 15, 28, 29],
    7: [8, 9, 10, 11, 12, 13, 14, 15, 28, 29],
    8: [8, 9, 28, 29],
    9: [8, 9, 28, 29],
    10: [8, 9, 24, 25, 26, 27, 28, 29],
    11: [8, 9, 24, 25, 26, 27, 28, 29],
    12: [8, 9],
    13: [8, 9],
    14: [8, 9, 10, 11],
    15: [8, 9, 10, 11],
  },
  items: [
    { item: ItemType.FullRestore, pos: { x: 14, y: 27 } },
    { item: ItemType.MaxElixer, pos: { x: 38, y: 7 } },
    { item: ItemType.Nugget, pos: { x: 10, y: 1 } },
  ],
};

export default ceruleanCave1f;
