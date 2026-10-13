import seafoamislandsb1fImage from "../../assets/map/gen/seafoam-islands-b1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered SEAFOAM_ISLANDS_B1F - do not hand-edit.
const seafoamIslandsB1f: MapType = {
  name: "Seafoam Islands B1F",
  image: seafoamislandsb1fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [12, 13, 14, 15, 16, 17],
    1: [12, 13, 14, 15, 16, 17],
    2: [10, 11, 16, 17],
    3: [10, 11, 16, 17],
    4: [10, 11, 14, 15],
    5: [10, 11, 14, 15],
    6: [4, 5, 10, 11, 14, 15],
    7: [4, 5, 10, 11, 14, 15],
    8: [14, 15],
    9: [14, 15],
    10: [8, 9, 16, 17],
    11: [8, 9, 16, 17],
    12: [16, 17],
    13: [16, 17],
  },
  text: {
    12: {
      34: ["This requires", "STRENGTH to move!"],
      44: ["This requires", "STRENGTH to move!"],
    },
  },
  maps: {
    4: {
      8: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 7 } },
      9: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 7 } },
    },
    5: {
      8: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 7 } },
      9: { map: MapId.SeafoamIslandsB2f, pos: { x: 10, y: 7 } },
    },
    6: {
      50: { map: MapId.SeafoamIslands1f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslands1f, pos: { x: 50, y: 7 } },
    },
    7: {
      50: { map: MapId.SeafoamIslands1f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslands1f, pos: { x: 50, y: 7 } },
    },
    10: {
      14: { map: MapId.SeafoamIslands1f, pos: { x: 14, y: 11 } },
      15: { map: MapId.SeafoamIslands1f, pos: { x: 14, y: 11 } },
    },
    11: {
      14: { map: MapId.SeafoamIslands1f, pos: { x: 14, y: 11 } },
      15: { map: MapId.SeafoamIslands1f, pos: { x: 14, y: 11 } },
    },
    14: {
      26: { map: MapId.SeafoamIslandsB2f, pos: { x: 26, y: 15 } },
      27: { map: MapId.SeafoamIslandsB2f, pos: { x: 26, y: 15 } },
    },
    15: {
      26: { map: MapId.SeafoamIslandsB2f, pos: { x: 26, y: 15 } },
      27: { map: MapId.SeafoamIslandsB2f, pos: { x: 26, y: 15 } },
    },
    22: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 23 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 23 } },
    },
    23: {
      50: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 23 } },
      51: { map: MapId.SeafoamIslandsB2f, pos: { x: 50, y: 23 } },
    },
    30: {
      38: { map: MapId.SeafoamIslandsB2f, pos: { x: 38, y: 31 } },
      39: { map: MapId.SeafoamIslandsB2f, pos: { x: 38, y: 31 } },
      46: { map: MapId.SeafoamIslands1f, pos: { x: 46, y: 31 } },
      47: { map: MapId.SeafoamIslands1f, pos: { x: 46, y: 31 } },
    },
    31: {
      38: { map: MapId.SeafoamIslandsB2f, pos: { x: 38, y: 31 } },
      39: { map: MapId.SeafoamIslandsB2f, pos: { x: 38, y: 31 } },
      46: { map: MapId.SeafoamIslands1f, pos: { x: 46, y: 31 } },
      47: { map: MapId.SeafoamIslands1f, pos: { x: 46, y: 31 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default seafoamIslandsB1f;
