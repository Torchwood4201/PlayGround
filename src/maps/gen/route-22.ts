import route22Image from "../../assets/map/gen/route-22.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_22 - do not hand-edit.
const route22: MapType = {
  name: "Route 22",
  image: route22Image,
  height: 18,
  width: 40,
  start: { x: 20, y: 16 },
  walls: {
    0: [2, 3, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 38, 39],
    1: [2, 3, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 38, 39],
    2: [38, 39],
    3: [38, 39],
    6: [26, 27],
    7: [26, 27],
    10: [2, 3, 4, 5, 38, 39],
    11: [2, 3, 4, 5, 38, 39],
    16: [0, 1, 38, 39],
    17: [0, 1, 38, 39],
  },
  text: {
    23: {
      14: ["POKEMON LEAGUE", "Front Gate"],
      15: ["POKEMON LEAGUE", "Front Gate"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.Route23, pos: { x: 0, y: 142 } },
      1: { map: MapId.Route23, pos: { x: 0, y: 142 } },
      4: { map: MapId.Route23, pos: { x: 4, y: 142 } },
      5: { map: MapId.Route23, pos: { x: 4, y: 142 } },
      6: { map: MapId.Route23, pos: { x: 6, y: 142 } },
      7: { map: MapId.Route23, pos: { x: 6, y: 142 } },
      8: { map: MapId.Route23, pos: { x: 8, y: 142 } },
      9: { map: MapId.Route23, pos: { x: 8, y: 142 } },
      10: { map: MapId.Route23, pos: { x: 10, y: 142 } },
      11: { map: MapId.Route23, pos: { x: 10, y: 142 } },
      14: { map: MapId.Route23, pos: { x: 14, y: 142 } },
      15: { map: MapId.Route23, pos: { x: 14, y: 142 } },
    },
    4: {
      39: MapId.ViridianCity,
    },
    5: {
      39: MapId.ViridianCity,
    },
    6: {
      39: MapId.ViridianCity,
    },
    7: {
      39: MapId.ViridianCity,
    },
    8: {
      39: MapId.ViridianCity,
    },
    9: {
      39: MapId.ViridianCity,
    },
    10: {
      16: { map: MapId.GateHouse, pos: { x: 8, y: 15 } },
      17: { map: MapId.GateHouse, pos: { x: 8, y: 15 } },
    },
    11: {
      16: { map: MapId.GateHouse, pos: { x: 8, y: 15 } },
      17: { map: MapId.GateHouse, pos: { x: 8, y: 15 } },
    },
    12: {
      39: MapId.ViridianCity,
    },
    13: {
      39: MapId.ViridianCity,
    },
    14: {
      39: MapId.ViridianCity,
    },
    15: {
      39: MapId.ViridianCity,
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    6: [22, 23, 24, 25],
    7: [22, 23, 24, 25],
    8: [22, 23, 24, 25],
    9: [22, 23, 24, 25],
  },
};

export default route22;
