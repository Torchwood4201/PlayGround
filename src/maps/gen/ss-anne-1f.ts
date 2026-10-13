import ssanne1fImage from "../../assets/map/gen/ss-anne-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_1F - do not hand-edit.
const ssAnne1f: MapType = {
  name: "SS Anne 1F",
  image: ssanne1fImage,
  height: 18,
  width: 40,
  start: { x: 20, y: 16 },
  walls: {
    0: [28, 29],
    1: [28, 29],
    2: [28, 29],
    3: [28, 29],
    6: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    7: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    8: [38, 39],
    9: [38, 39],
    10: [4, 5, 38, 39],
    11: [4, 5, 38, 39],
    12: [38, 39],
    13: [38, 39],
    14: [4, 5, 36, 37, 38, 39],
    15: [4, 5, 36, 37, 38, 39],
  },
  text: {},
  maps: {
    0: {
      52: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      53: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      54: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      55: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
    },
    1: {
      52: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      53: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      54: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
      55: { map: MapId.VermilionDock, pos: { x: 28, y: 5 } },
    },
    12: {
      4: { map: MapId.SsAnne2f, pos: { x: 4, y: 9 } },
      5: { map: MapId.SsAnne2f, pos: { x: 4, y: 9 } },
    },
    13: {
      4: { map: MapId.SsAnne2f, pos: { x: 4, y: 9 } },
      5: { map: MapId.SsAnne2f, pos: { x: 4, y: 9 } },
    },
    16: {
      14: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 21 } },
      15: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 21 } },
      22: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 21 } },
      23: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 21 } },
      30: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 21 } },
      31: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 21 } },
      38: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 1 } },
      39: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 1 } },
      46: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 1 } },
      47: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 1 } },
      62: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 1 } },
      63: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 1 } },
    },
    17: {
      14: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 21 } },
      15: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 21 } },
      22: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 21 } },
      23: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 21 } },
      30: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 21 } },
      31: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 21 } },
      38: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 1 } },
      39: { map: MapId.SsAnne1fRooms, pos: { x: 40, y: 1 } },
      46: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 1 } },
      47: { map: MapId.SsAnne1fRooms, pos: { x: 20, y: 1 } },
      62: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 1 } },
      63: { map: MapId.SsAnne1fRooms, pos: { x: 0, y: 1 } },
    },
    30: {
      74: { map: MapId.SsAnneB1f, pos: { x: 54, y: 11 } },
      75: { map: MapId.SsAnneB1f, pos: { x: 54, y: 11 } },
    },
    31: {
      74: { map: MapId.SsAnneB1f, pos: { x: 54, y: 11 } },
      75: { map: MapId.SsAnneB1f, pos: { x: 54, y: 11 } },
    },
    32: {
      6: { map: MapId.SsAnneKitchen, pos: { x: 12, y: 1 } },
      7: { map: MapId.SsAnneKitchen, pos: { x: 12, y: 1 } },
    },
    33: {
      6: { map: MapId.SsAnneKitchen, pos: { x: 12, y: 1 } },
      7: { map: MapId.SsAnneKitchen, pos: { x: 12, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default ssAnne1f;
