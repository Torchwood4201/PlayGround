import pewtercityImage from "../../assets/map/gen/pewter-city.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered PEWTER_CITY - do not hand-edit.
const pewterCity: MapType = {
  name: "Pewter City",
  image: pewtercityImage,
  height: 36,
  width: 40,
  start: { x: 20, y: 34 },
  walls: {
    0: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    1: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    2: [18, 19, 22, 23],
    3: [18, 19, 22, 23],
    4: [0, 1],
    5: [0, 1],
    6: [0, 1],
    7: [0, 1],
    8: [0, 1],
    9: [0, 1],
    10: [0, 1, 34, 35],
    11: [0, 1, 34, 35],
    12: [0, 1, 36, 37, 38, 39],
    13: [0, 1, 36, 37, 38, 39],
    14: [0, 1, 22, 23, 24, 25],
    15: [0, 1, 22, 23, 24, 25],
    16: [0, 1, 12, 13],
    17: [0, 1, 12, 13],
    18: [0, 1, 18, 19],
    19: [0, 1, 18, 19],
    20: [0, 1, 18, 19, 34, 35],
    21: [0, 1, 18, 19, 34, 35],
    22: [0, 1, 12, 13, 14, 15, 20, 21, 30, 31, 36, 37, 38, 39],
    23: [0, 1, 12, 13, 14, 15, 20, 21, 30, 31, 36, 37, 38, 39],
    24: [0, 1],
    25: [0, 1],
    26: [0, 1],
    27: [0, 1],
  },
  text: {
    19: {
      30: ["PEWTER MUSEUM", "OF SCIENCE"],
      31: ["PEWTER MUSEUM", "OF SCIENCE"],
    },
    35: {
      22: ["PEWTER CITY", "POKEMON GYM LEADER: BROCK", "The Rock Solid", "POKEMON Trainer!"],
      23: ["PEWTER CITY", "POKEMON GYM LEADER: BROCK", "The Rock Solid", "POKEMON Trainer!"],
      48: ["All your item", "needs fulfilled! POKEMON MART"],
      49: ["All your item", "needs fulfilled! POKEMON MART"],
    },
    39: {
      66: ["NOTICE!", "Thieves have been", "stealing POKEMON fossils at MT. MOON!", "Please call PEWTER POLICE with any", "info!"],
      67: ["NOTICE!", "Thieves have been", "stealing POKEMON fossils at MT. MOON!", "Please call PEWTER POLICE with any", "info!"],
    },
    47: {
      50: ["PEWTER CITY", "A Stone Gray City"],
      51: ["PEWTER CITY", "A Stone Gray City"],
    },
    51: {
      28: ["Heal Your POKEMON!", "POKEMON CENTER"],
      29: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    59: {
      38: ["TRAINER TIPS", "Any POKEMON that", "takes part in battle, however short,", "earns EXP!"],
      39: ["TRAINER TIPS", "Any POKEMON that", "takes part in battle, however short,", "earns EXP!"],
    },
  },
  maps: {
    8: {
      39: MapId.Route3,
    },
    9: {
      39: MapId.Route3,
    },
    10: {
      38: { map: MapId.PewterCityMuseum1f, pos: { x: 32, y: 15 } },
      39: MapId.Route3,
    },
    11: {
      38: { map: MapId.PewterCityMuseum1f, pos: { x: 32, y: 15 } },
      39: MapId.Route3,
    },
    14: {
      28: { map: MapId.PewterCityMuseum1f, pos: { x: 20, y: 15 } },
      29: { map: MapId.PewterCityMuseum1f, pos: { x: 20, y: 15 } },
      39: MapId.Route3,
    },
    15: {
      28: { map: MapId.PewterCityMuseum1f, pos: { x: 20, y: 15 } },
      29: { map: MapId.PewterCityMuseum1f, pos: { x: 20, y: 15 } },
      39: MapId.Route3,
    },
    16: {
      39: MapId.Route3,
    },
    17: {
      39: MapId.Route3,
    },
    18: {
      39: MapId.Route3,
    },
    19: {
      39: MapId.Route3,
    },
    20: {
      39: MapId.Route3,
    },
    21: {
      39: MapId.Route3,
    },
    24: {
      39: MapId.Route3,
    },
    25: {
      39: MapId.Route3,
    },
    26: {
      58: { map: MapId.PewterCityNpcA, pos: { x: 4, y: 15 } },
      59: { map: MapId.PewterCityNpcA, pos: { x: 4, y: 15 } },
    },
    27: {
      58: { map: MapId.PewterCityNpcA, pos: { x: 4, y: 15 } },
      59: { map: MapId.PewterCityNpcA, pos: { x: 4, y: 15 } },
    },
    34: {
      32: { map: MapId.PewterCityGym, pos: { x: 8, y: 27 } },
      33: { map: MapId.PewterCityGym, pos: { x: 8, y: 27 } },
      46: { map: MapId.PewterCityPokeMart, pos: { x: 6, y: 15 } },
      47: { map: MapId.PewterCityPokeMart, pos: { x: 6, y: 15 } },
    },
    35: {
      10: MapId.Route2,
      11: MapId.Route2,
      12: MapId.Route2,
      13: MapId.Route2,
      14: MapId.Route2,
      15: MapId.Route2,
      16: MapId.Route2,
      17: MapId.Route2,
      18: MapId.Route2,
      19: MapId.Route2,
      20: MapId.Route2,
      21: MapId.Route2,
      22: MapId.Route2,
      23: MapId.Route2,
      24: MapId.Route2,
      25: MapId.Route2,
      26: MapId.Route2,
      27: MapId.Route2,
      28: MapId.Route2,
      29: MapId.Route2,
      32: { map: MapId.PewterCityGym, pos: { x: 8, y: 27 } },
      33: { map: MapId.PewterCityGym, pos: { x: 8, y: 27 } },
      46: { map: MapId.PewterCityPokeMart, pos: { x: 6, y: 15 } },
      47: { map: MapId.PewterCityPokeMart, pos: { x: 6, y: 15 } },
    },
    50: {
      26: { map: MapId.PewterCityPokemonCenter, pos: { x: 6, y: 15 } },
      27: { map: MapId.PewterCityPokemonCenter, pos: { x: 6, y: 15 } },
    },
    51: {
      26: { map: MapId.PewterCityPokemonCenter, pos: { x: 6, y: 15 } },
      27: { map: MapId.PewterCityPokemonCenter, pos: { x: 6, y: 15 } },
    },
    58: {
      14: { map: MapId.PewterCityNpcB, pos: { x: 4, y: 15 } },
      15: { map: MapId.PewterCityNpcB, pos: { x: 4, y: 15 } },
    },
    59: {
      14: { map: MapId.PewterCityNpcB, pos: { x: 4, y: 15 } },
      15: { map: MapId.PewterCityNpcB, pos: { x: 4, y: 15 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route2,
  exitReturnPos: { x: 4, y: 2 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    4: [26, 27],
    5: [26, 27],
  },
};

export default pewterCity;
