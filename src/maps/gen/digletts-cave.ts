import diglettscaveImage from "../../assets/map/gen/digletts-cave.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered DIGLETTS_CAVE - do not hand-edit.
const diglettsCave: MapType = {
  name: "Digletts Cave",
  image: diglettscaveImage,
  height: 36,
  width: 40,
  start: { x: 20, y: 34 },
  walls: {
    4: [2, 3, 6, 7],
    5: [2, 3, 6, 7],
    6: [2, 3, 6, 7],
    7: [2, 3, 6, 7],
    8: [2, 3, 6, 7],
    9: [2, 3, 6, 7],
    10: [2, 3, 6, 7],
    11: [2, 3, 6, 7],
    12: [2, 3],
    13: [2, 3],
    14: [2, 3, 10, 11],
    15: [2, 3, 10, 11],
    16: [2, 3],
    17: [2, 3],
    18: [4, 5, 14, 15],
    19: [4, 5, 14, 15],
    20: [6, 7, 14, 15],
    21: [6, 7, 14, 15],
    22: [8, 9, 14, 15],
    23: [8, 9, 14, 15],
    24: [10, 11],
    25: [10, 11],
    26: [10, 11, 26, 27],
    27: [10, 11, 26, 27],
    28: [10, 11],
    29: [10, 11],
    30: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 38, 39],
    31: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 38, 39],
    32: [24, 25, 26, 27, 28, 29, 30, 31, 38, 39],
    33: [24, 25, 26, 27, 28, 29, 30, 31, 38, 39],
    34: [34, 35, 36, 37],
    35: [34, 35, 36, 37],
  },
  text: {},
  maps: {
    10: {
      10: { map: MapId.DiglettsCaveRoute2, pos: { x: 8, y: 9 } },
      11: { map: MapId.DiglettsCaveRoute2, pos: { x: 8, y: 9 } },
    },
    11: {
      10: { map: MapId.DiglettsCaveRoute2, pos: { x: 8, y: 9 } },
      11: { map: MapId.DiglettsCaveRoute2, pos: { x: 8, y: 9 } },
    },
    62: {
      74: { map: MapId.DiglettsCaveRoute11, pos: { x: 8, y: 9 } },
      75: { map: MapId.DiglettsCaveRoute11, pos: { x: 8, y: 9 } },
    },
    63: {
      74: { map: MapId.DiglettsCaveRoute11, pos: { x: 8, y: 9 } },
      75: { map: MapId.DiglettsCaveRoute11, pos: { x: 8, y: 9 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default diglettsCave;
