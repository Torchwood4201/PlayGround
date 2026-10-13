import seafoamislandsb3fImage from "../../assets/map/gen/seafoam-islands-b3f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered SEAFOAM_ISLANDS_B3F - do not hand-edit.
const seafoamIslandsB3f: MapType = {
  name: "Seafoam Islands B3F",
  image: seafoamislandsb3fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [2, 3, 4, 5, 6, 7, 22, 23, 24, 25, 26, 27],
    1: [2, 3, 4, 5, 6, 7, 22, 23, 24, 25, 26, 27],
    2: [0, 1, 8, 9, 20, 21, 28, 29],
    3: [0, 1, 8, 9, 20, 21, 28, 29],
    4: [0, 1, 12, 13, 14, 15],
    5: [0, 1, 12, 13, 14, 15],
    6: [0, 1, 4, 5, 10, 11, 14, 15, 22, 23, 24, 25, 26, 27],
    7: [0, 1, 4, 5, 10, 11, 14, 15, 22, 23, 24, 25, 26, 27],
    8: [0, 1, 6, 7, 8, 9, 12, 13, 22, 23, 28, 29],
    9: [0, 1, 6, 7, 8, 9, 12, 13, 22, 23, 28, 29],
    10: [0, 1, 12, 13, 24, 25, 28, 29],
    11: [0, 1, 12, 13, 24, 25, 28, 29],
    12: [10, 11, 14, 15, 28, 29],
    13: [10, 11, 14, 15, 28, 29],
  },
  text: {
    12: {
      36: ["This requires", "STRENGTH to move!"],
      38: ["This requires", "STRENGTH to move!"],
    },
    28: {
      10: ["This requires", "STRENGTH to move!"],
      16: ["This requires", "STRENGTH to move!"],
      18: ["This requires", "STRENGTH to move!"],
    },
    30: {
      6: ["This requires", "STRENGTH to move!"],
    },
  },
  maps: {
    6: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 7 } },
    },
    7: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 7 } },
    },
    8: {
      50: { map: MapId.SeafoamIslandsB4f, pos: { x: 50, y: 9 } },
      51: { map: MapId.SeafoamIslandsB4f, pos: { x: 50, y: 9 } },
    },
    9: {
      50: { map: MapId.SeafoamIslandsB4f, pos: { x: 50, y: 9 } },
      51: { map: MapId.SeafoamIslandsB4f, pos: { x: 50, y: 9 } },
    },
    12: {
      16: { map: MapId.SeafoamIslandsB4f, pos: { x: 22, y: 15 } },
      17: { map: MapId.SeafoamIslandsB4f, pos: { x: 22, y: 15 } },
    },
    13: {
      16: { map: MapId.SeafoamIslandsB4f, pos: { x: 22, y: 15 } },
      17: { map: MapId.SeafoamIslandsB4f, pos: { x: 22, y: 15 } },
    },
    24: {
      10: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 27 } },
      11: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 27 } },
    },
    25: {
      10: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 27 } },
      11: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 27 } },
    },
    28: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 29 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 29 } },
    },
    29: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 29 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 29 } },
    },
    34: {
      40: { map: MapId.SeafoamIslandsB4f, pos: { x: 40, y: 35 } },
      41: { map: MapId.SeafoamIslandsB4f, pos: { x: 40, y: 35 } },
      42: { map: MapId.SeafoamIslandsB4f, pos: { x: 42, y: 35 } },
      43: { map: MapId.SeafoamIslandsB4f, pos: { x: 42, y: 35 } },
    },
    35: {
      40: { map: MapId.SeafoamIslandsB4f, pos: { x: 40, y: 35 } },
      41: { map: MapId.SeafoamIslandsB4f, pos: { x: 40, y: 35 } },
      42: { map: MapId.SeafoamIslandsB4f, pos: { x: 42, y: 35 } },
      43: { map: MapId.SeafoamIslandsB4f, pos: { x: 42, y: 35 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    0: [14, 15],
    1: [14, 15],
    2: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    3: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    4: [18, 19],
    5: [18, 19],
    6: [18, 19],
    7: [18, 19],
    8: [14, 15, 16, 17, 18, 19],
    9: [14, 15, 16, 17, 18, 19],
    10: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    11: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    12: [20, 21],
    13: [20, 21],
    14: [20, 21],
    15: [20, 21],
    16: [20, 21],
    17: [20, 21],
  },
};

export default seafoamIslandsB3f;
