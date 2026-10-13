import seafoamislandsb2fImage from "../../assets/map/gen/seafoam-islands-b2f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered SEAFOAM_ISLANDS_B2F - do not hand-edit.
const seafoamIslandsB2f: MapType = {
  name: "Seafoam Islands B2F",
  image: seafoamislandsb2fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    4: [12, 13, 24, 25],
    5: [12, 13, 24, 25],
    6: [14, 15],
    7: [14, 15],
    8: [4, 5, 6, 7, 8, 9, 16, 17, 18, 19],
    9: [4, 5, 6, 7, 8, 9, 16, 17, 18, 19],
    10: [20, 21],
    11: [20, 21],
    12: [16, 17, 22, 23, 26, 27],
    13: [16, 17, 22, 23, 26, 27],
  },
  text: {},
  maps: {
    6: {
      10: { map: MapId.SeafoamIslandsB1f, pos: { x: 8, y: 5 } },
      11: { map: MapId.SeafoamIslandsB1f, pos: { x: 8, y: 5 } },
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 7 } },
    },
    7: {
      10: { map: MapId.SeafoamIslandsB1f, pos: { x: 8, y: 5 } },
      11: { map: MapId.SeafoamIslandsB1f, pos: { x: 8, y: 5 } },
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 7 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 7 } },
    },
    14: {
      26: { map: MapId.SeafoamIslandsB1f, pos: { x: 26, y: 15 } },
      27: { map: MapId.SeafoamIslandsB1f, pos: { x: 26, y: 15 } },
    },
    15: {
      26: { map: MapId.SeafoamIslandsB1f, pos: { x: 26, y: 15 } },
      27: { map: MapId.SeafoamIslandsB1f, pos: { x: 26, y: 15 } },
    },
    22: {
      50: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 23 } },
      51: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 23 } },
    },
    23: {
      50: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 23 } },
      51: { map: MapId.SeafoamIslandsB1f, pos: { x: 50, y: 23 } },
    },
    26: {
      10: { map: MapId.SeafoamIslandsB3f, pos: { x: 10, y: 25 } },
      11: { map: MapId.SeafoamIslandsB3f, pos: { x: 10, y: 25 } },
    },
    27: {
      10: { map: MapId.SeafoamIslandsB3f, pos: { x: 10, y: 25 } },
      11: { map: MapId.SeafoamIslandsB3f, pos: { x: 10, y: 25 } },
    },
    28: {
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 29 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 29 } },
    },
    29: {
      50: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 29 } },
      51: { map: MapId.SeafoamIslandsB3f, pos: { x: 50, y: 29 } },
    },
    30: {
      38: { map: MapId.SeafoamIslandsB1f, pos: { x: 38, y: 31 } },
      39: { map: MapId.SeafoamIslandsB1f, pos: { x: 38, y: 31 } },
    },
    31: {
      38: { map: MapId.SeafoamIslandsB1f, pos: { x: 38, y: 31 } },
      39: { map: MapId.SeafoamIslandsB1f, pos: { x: 38, y: 31 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default seafoamIslandsB2f;
