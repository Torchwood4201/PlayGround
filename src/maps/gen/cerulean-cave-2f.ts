import ceruleancave2fImage from "../../assets/map/gen/cerulean-cave-2f.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered CERULEAN_CAVE_2F - do not hand-edit.
const ceruleanCave2f: MapType = {
  name: "Cerulean Cave 2F",
  image: ceruleancave2fImage,
  height: 18,
  width: 30,
  start: { x: 0, y: 0 },
  walls: {
    0: [4, 5, 12, 13, 14, 15, 16, 17],
    1: [4, 5, 12, 13, 14, 15, 16, 17],
    2: [4, 5, 6, 7, 8, 9],
    3: [4, 5, 6, 7, 8, 9],
    4: [2, 3, 4, 5, 6, 7, 10, 11, 14, 15],
    5: [2, 3, 4, 5, 6, 7, 10, 11, 14, 15],
    6: [4, 5, 8, 9, 10, 11],
    7: [4, 5, 8, 9, 10, 11],
    8: [4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21, 28, 29],
    9: [4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21, 28, 29],
    10: [6, 7, 8, 9, 14, 15, 16, 17, 18, 19, 20, 21],
    11: [6, 7, 8, 9, 14, 15, 16, 17, 18, 19, 20, 21],
    12: [6, 7, 18, 19, 20, 21],
    13: [6, 7, 18, 19, 20, 21],
    14: [16, 17, 18, 19],
    15: [16, 17, 18, 19],
    16: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25],
    17: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25],
  },
  text: {},
  maps: {
    2: {
      18: { map: MapId.CeruleanCave1f, pos: { x: 14, y: 3 } },
      19: { map: MapId.CeruleanCave1f, pos: { x: 14, y: 3 } },
      58: { map: MapId.CeruleanCave1f, pos: { x: 54, y: 3 } },
      59: { map: MapId.CeruleanCave1f, pos: { x: 54, y: 3 } },
    },
    3: {
      18: { map: MapId.CeruleanCave1f, pos: { x: 14, y: 3 } },
      19: { map: MapId.CeruleanCave1f, pos: { x: 14, y: 3 } },
      58: { map: MapId.CeruleanCave1f, pos: { x: 54, y: 3 } },
      59: { map: MapId.CeruleanCave1f, pos: { x: 54, y: 3 } },
    },
    6: {
      2: { map: MapId.CeruleanCave1f, pos: { x: 2, y: 7 } },
      3: { map: MapId.CeruleanCave1f, pos: { x: 2, y: 7 } },
    },
    7: {
      2: { map: MapId.CeruleanCave1f, pos: { x: 2, y: 7 } },
      3: { map: MapId.CeruleanCave1f, pos: { x: 2, y: 7 } },
    },
    12: {
      44: { map: MapId.CeruleanCave1f, pos: { x: 46, y: 15 } },
      45: { map: MapId.CeruleanCave1f, pos: { x: 46, y: 15 } },
    },
    13: {
      44: { map: MapId.CeruleanCave1f, pos: { x: 46, y: 15 } },
      45: { map: MapId.CeruleanCave1f, pos: { x: 46, y: 15 } },
    },
    14: {
      38: { map: MapId.CeruleanCave1f, pos: { x: 36, y: 19 } },
      39: { map: MapId.CeruleanCave1f, pos: { x: 36, y: 19 } },
    },
    15: {
      38: { map: MapId.CeruleanCave1f, pos: { x: 36, y: 19 } },
      39: { map: MapId.CeruleanCave1f, pos: { x: 36, y: 19 } },
    },
    22: {
      6: { map: MapId.CeruleanCave1f, pos: { x: 6, y: 23 } },
      7: { map: MapId.CeruleanCave1f, pos: { x: 6, y: 23 } },
    },
    23: {
      6: { map: MapId.CeruleanCave1f, pos: { x: 6, y: 23 } },
      7: { map: MapId.CeruleanCave1f, pos: { x: 6, y: 23 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  items: [
    { item: ItemType.PpUp, pos: { x: 58, y: 19 } },
    { item: ItemType.UltraBall, pos: { x: 8, y: 31 } },
    { item: ItemType.FullRestore, pos: { x: 26, y: 13 } },
  ],
};

export default ceruleanCave2f;
