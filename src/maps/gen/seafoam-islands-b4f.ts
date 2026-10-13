import seafoamislandsb4fImage from "../../assets/map/gen/seafoam-islands-b4f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered SEAFOAM_ISLANDS_B4F - do not hand-edit.
const seafoamIslandsB4f: MapType = {
  name: "Seafoam Islands B4F",
  image: seafoamislandsb4fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [6, 7, 8, 9, 16, 17, 18, 19, 20, 21, 24, 25],
    1: [6, 7, 8, 9, 16, 17, 18, 19, 20, 21, 24, 25],
    2: [6, 7, 14, 15, 26, 27],
    3: [6, 7, 14, 15, 26, 27],
    4: [14, 15, 22, 23],
    5: [14, 15, 22, 23],
    6: [8, 9, 12, 13, 16, 17],
    7: [8, 9, 12, 13, 16, 17],
    8: [6, 7],
    9: [6, 7],
    10: [14, 15],
    11: [14, 15],
    12: [12, 13, 14, 15],
    13: [12, 13, 14, 15],
    14: [10, 11, 16, 17],
    15: [10, 11, 16, 17],
  },
  text: {
    3: {
      46: ["DANGER", "Fast current!"],
      47: ["DANGER", "Fast current!"],
    },
    31: {
      18: ["Boulders might", "change the flow of water!"],
      19: ["Boulders might", "change the flow of water!"],
    },
  },
  maps: {
    8: {
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 9 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 9 } },
    },
    9: {
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 9 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 9 } },
    },
    14: {
      22: { map: MapId.SeafoamIslandsB3f, pos: { x: 16, y: 13 } },
      23: { map: MapId.SeafoamIslandsB3f, pos: { x: 16, y: 13 } },
    },
    15: {
      22: { map: MapId.SeafoamIslandsB3f, pos: { x: 16, y: 13 } },
      23: { map: MapId.SeafoamIslandsB3f, pos: { x: 16, y: 13 } },
    },
    34: {
      40: { map: MapId.SeafoamIslandsB3f, pos: { x: 40, y: 35 } },
      41: { map: MapId.SeafoamIslandsB3f, pos: { x: 40, y: 35 } },
      42: { map: MapId.SeafoamIslandsB3f, pos: { x: 42, y: 35 } },
      43: { map: MapId.SeafoamIslandsB3f, pos: { x: 42, y: 35 } },
    },
    35: {
      40: { map: MapId.SeafoamIslandsB3f, pos: { x: 40, y: 35 } },
      41: { map: MapId.SeafoamIslandsB3f, pos: { x: 40, y: 35 } },
      42: { map: MapId.SeafoamIslandsB3f, pos: { x: 42, y: 35 } },
      43: { map: MapId.SeafoamIslandsB3f, pos: { x: 42, y: 35 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    0: [2, 3, 12, 13],
    1: [2, 3, 12, 13],
    2: [2, 3, 12, 13],
    3: [2, 3, 12, 13],
    4: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    5: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    6: [2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    7: [2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    8: [2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    9: [2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    10: [2, 3, 4, 5, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    11: [2, 3, 4, 5, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    12: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    13: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    14: [2, 3, 4, 5, 20, 21, 24, 25, 26, 27],
    15: [2, 3, 4, 5, 20, 21, 24, 25, 26, 27],
    16: [4, 5, 20, 21],
    17: [4, 5, 20, 21],
  },
};

export default seafoamIslandsB4f;
