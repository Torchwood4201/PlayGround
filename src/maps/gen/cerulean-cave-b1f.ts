import ceruleancaveb1fImage from "../../assets/map/gen/cerulean-cave-b1f.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered CERULEAN_CAVE_B1F - do not hand-edit.
const ceruleanCaveB1f: MapType = {
  name: "Cerulean Cave B1F",
  image: ceruleancaveb1fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19, 24, 25, 26, 27],
    1: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19, 24, 25, 26, 27],
    2: [0, 1, 12, 13, 18, 19, 22, 23, 28, 29],
    3: [0, 1, 12, 13, 18, 19, 22, 23, 28, 29],
    4: [0, 1, 4, 5, 8, 9, 14, 15, 22, 23, 24, 25, 28, 29],
    5: [0, 1, 4, 5, 8, 9, 14, 15, 22, 23, 24, 25, 28, 29],
    6: [10, 11, 12, 13, 14, 15, 20, 21, 24, 25],
    7: [10, 11, 12, 13, 14, 15, 20, 21, 24, 25],
    8: [8, 9, 16, 17, 18, 19],
    9: [8, 9, 16, 17, 18, 19],
    10: [2, 3, 4, 5, 8, 9, 12, 13, 16, 17],
    11: [2, 3, 4, 5, 8, 9, 12, 13, 16, 17],
    12: [26, 27],
    13: [26, 27],
    16: [10, 11, 12, 13],
    17: [10, 11, 12, 13],
  },
  text: {},
  maps: {
    12: {
      6: { map: MapId.CeruleanCave1f, pos: { x: 0, y: 13 } },
      7: { map: MapId.CeruleanCave1f, pos: { x: 0, y: 13 } },
    },
    13: {
      6: { map: MapId.CeruleanCave1f, pos: { x: 0, y: 13 } },
      7: { map: MapId.CeruleanCave1f, pos: { x: 0, y: 13 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    8: [26, 27],
    9: [26, 27],
    10: [22, 23, 24, 25, 26, 27],
    11: [22, 23, 24, 25, 26, 27],
    12: [18, 19, 22, 23],
    13: [18, 19, 22, 23],
    14: [12, 13, 14, 15, 18, 19, 22, 23],
    15: [12, 13, 14, 15, 18, 19, 22, 23],
    16: [14, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29],
    17: [14, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  items: [
    { item: ItemType.UltraBall, pos: { x: 32, y: 19 } },
    { item: ItemType.MaxRevive, pos: { x: 36, y: 3 } },
  ],
  stationary: [
    { id: 150, level: 70, pos: { x: 54, y: 26 } },
  ],
};

export default ceruleanCaveB1f;
