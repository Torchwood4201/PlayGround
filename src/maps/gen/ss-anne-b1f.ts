import ssanneb1fImage from "../../assets/map/gen/ss-anne-b1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_B1F - do not hand-edit.
const ssAnneB1f: MapType = {
  name: "SS Anne B1F",
  image: ssanneb1fImage,
  height: 8,
  width: 30,
  start: { x: 15, y: 6 },
  walls: {
    4: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    5: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  text: {},
  maps: {
    6: {
      14: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 11 } },
      15: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 11 } },
      22: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 11 } },
      23: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 11 } },
      30: { map: MapId.SsAnneB1fRooms, pos: { x: 44, y: 11 } },
      31: { map: MapId.SsAnneB1fRooms, pos: { x: 44, y: 11 } },
      38: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 31 } },
      39: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 31 } },
      46: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 31 } },
      47: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 31 } },
    },
    7: {
      14: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 11 } },
      15: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 11 } },
      22: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 11 } },
      23: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 11 } },
      30: { map: MapId.SsAnneB1fRooms, pos: { x: 44, y: 11 } },
      31: { map: MapId.SsAnneB1fRooms, pos: { x: 44, y: 11 } },
      38: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 31 } },
      39: { map: MapId.SsAnneB1fRooms, pos: { x: 4, y: 31 } },
      46: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 31 } },
      47: { map: MapId.SsAnneB1fRooms, pos: { x: 24, y: 31 } },
    },
    10: {
      54: { map: MapId.SsAnne1f, pos: { x: 74, y: 31 } },
      55: { map: MapId.SsAnne1f, pos: { x: 74, y: 31 } },
    },
    11: {
      54: { map: MapId.SsAnne1f, pos: { x: 74, y: 31 } },
      55: { map: MapId.SsAnne1f, pos: { x: 74, y: 31 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default ssAnneB1f;
