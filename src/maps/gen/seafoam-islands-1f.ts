import seafoamislands1fImage from "../../assets/map/gen/seafoam-islands-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered SEAFOAM_ISLANDS_1F - do not hand-edit.
const seafoamIslands1f: MapType = {
  name: "Seafoam Islands 1F",
  image: seafoamislands1fImage,
  height: 18,
  width: 30,
  start: { x: 8, y: 35 },
  walls: {
    2: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    3: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    4: [2, 3, 20, 21],
    5: [2, 3, 20, 21],
    6: [2, 3, 10, 11],
    7: [2, 3, 10, 11],
    8: [2, 3, 10, 11],
    9: [2, 3, 10, 11],
  },
  text: {
    14: {
      52: ["This requires", "STRENGTH to move!"],
    },
    20: {
      36: ["This requires", "STRENGTH to move!"],
    },
  },
  maps: {
    6: {
      50: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 7 } },
    },
    7: {
      50: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 7 } },
    },
    10: {
      14: { map: MapId.SeafoamIslandsB1f, pos: { x: 14, y: 11 } },
      15: { map: MapId.SeafoamIslandsB1f, pos: { x: 14, y: 11 } },
    },
    11: {
      14: { map: MapId.SeafoamIslandsB1f, pos: { x: 14, y: 11 } },
      15: { map: MapId.SeafoamIslandsB1f, pos: { x: 14, y: 11 } },
    },
    30: {
      46: { map: MapId.SeafoamIslandsB1f, pos: { x: 46, y: 31 } },
      47: { map: MapId.SeafoamIslandsB1f, pos: { x: 46, y: 31 } },
    },
    31: {
      46: { map: MapId.SeafoamIslandsB1f, pos: { x: 46, y: 31 } },
      47: { map: MapId.SeafoamIslandsB1f, pos: { x: 46, y: 31 } },
    },
  },
  exits: {
    35: [8, 9, 10, 11, 52, 53, 54, 55],
  },
  cave: true,
  exitReturnMap: MapId.Route20,
  exitReturnPos: { x: 96, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default seafoamIslands1f;
