import route7Image from "../../assets/map/gen/route-7.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_7 - do not hand-edit.
const route7: MapType = {
  name: "Route 7",
  image: route7Image,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    2: [0, 1, 2, 3, 4, 5],
    3: [0, 1, 2, 3, 4, 5],
    4: [2, 3, 4, 5],
    5: [2, 3, 4, 5],
    6: [10, 11, 12, 13, 14, 15],
    7: [10, 11, 12, 13, 14, 15],
    8: [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17],
    9: [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17],
    10: [4, 5, 6, 7],
    11: [4, 5, 6, 7],
    12: [8, 9, 10, 11, 12, 13, 14, 15],
    13: [8, 9, 10, 11, 12, 13, 14, 15],
    14: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    15: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  text: {
    27: {
      6: ["UNDERGROUND PATH", "CELADON CITY - LAVENDER TOWN"],
      7: ["UNDERGROUND PATH", "CELADON CITY - LAVENDER TOWN"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 8 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 8 } },
    },
    1: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 8 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 8 } },
    },
    2: {
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 10 } },
    },
    3: {
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 10 } },
    },
    4: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 12 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 12 } },
    },
    5: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 12 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 12 } },
    },
    6: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 14 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 14 } },
    },
    7: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 14 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 14 } },
    },
    8: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 16 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 16 } },
    },
    9: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 16 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 16 } },
    },
    10: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 18 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 18 } },
    },
    11: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 18 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 18 } },
    },
    12: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 20 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 20 } },
    },
    13: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 20 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 20 } },
    },
    14: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 22 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 22 } },
    },
    15: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 22 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 22 } },
    },
    16: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 24 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 24 } },
    },
    17: {
      0: { map: MapId.CeladonCity, pos: { x: 48, y: 24 } },
      19: { map: MapId.SaffronCity, pos: { x: 1, y: 24 } },
    },
    18: {
      22: { map: MapId.Route7Gate, pos: { x: 0, y: 7 } },
      23: { map: MapId.Route7Gate, pos: { x: 0, y: 7 } },
      36: { map: MapId.Route7Gate, pos: { x: 10, y: 7 } },
      37: { map: MapId.Route7Gate, pos: { x: 10, y: 7 } },
    },
    19: {
      22: { map: MapId.Route7Gate, pos: { x: 0, y: 7 } },
      23: { map: MapId.Route7Gate, pos: { x: 0, y: 7 } },
      36: { map: MapId.Route7Gate, pos: { x: 10, y: 7 } },
      37: { map: MapId.Route7Gate, pos: { x: 10, y: 7 } },
    },
    20: {
      22: { map: MapId.Route7Gate, pos: { x: 0, y: 9 } },
      23: { map: MapId.Route7Gate, pos: { x: 0, y: 9 } },
      36: { map: MapId.Route7Gate, pos: { x: 10, y: 9 } },
      37: { map: MapId.Route7Gate, pos: { x: 10, y: 9 } },
    },
    21: {
      22: { map: MapId.Route7Gate, pos: { x: 0, y: 9 } },
      23: { map: MapId.Route7Gate, pos: { x: 0, y: 9 } },
      36: { map: MapId.Route7Gate, pos: { x: 10, y: 9 } },
      37: { map: MapId.Route7Gate, pos: { x: 10, y: 9 } },
    },
    26: {
      10: { map: MapId.UndergroundPathRoute7, pos: { x: 6, y: 15 } },
      11: { map: MapId.UndergroundPathRoute7, pos: { x: 6, y: 15 } },
    },
    27: {
      10: { map: MapId.UndergroundPathRoute7, pos: { x: 6, y: 15 } },
      11: { map: MapId.UndergroundPathRoute7, pos: { x: 6, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default route7;
