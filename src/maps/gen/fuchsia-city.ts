import fuchsiacityImage from "../../assets/map/gen/fuchsia-city.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered FUCHSIA_CITY - do not hand-edit.
const fuchsiaCity: MapType = {
  name: "Fuchsia City",
  image: fuchsiacityImage,
  height: 36,
  width: 40,
  start: { x: 0, y: 0 },
  walls: {
    0: [16, 17, 20, 21],
    1: [16, 17, 20, 21],
    10: [4, 5, 6, 7, 20, 21, 24, 25],
    11: [4, 5, 6, 7, 20, 21, 24, 25],
    16: [36, 37, 38, 39],
    17: [36, 37, 38, 39],
    18: [14, 15, 16, 17, 34, 35, 36, 37],
    19: [14, 15, 16, 17, 34, 35, 36, 37],
    20: [34, 35],
    21: [34, 35],
    22: [2, 3, 34, 35],
    23: [2, 3, 34, 35],
    24: [4, 5, 8, 9, 18, 19, 20, 21, 28, 29, 32, 33, 34, 35],
    25: [4, 5, 8, 9, 18, 19, 20, 21, 28, 29, 32, 33, 34, 35],
    26: [2, 3, 14, 15, 24, 25, 26, 27, 30, 31, 34, 35],
    27: [2, 3, 14, 15, 24, 25, 26, 27, 30, 31, 34, 35],
    28: [2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 30, 31, 34, 35],
    29: [2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 30, 31, 34, 35],
    30: [22, 23, 32, 33, 34, 35],
    31: [22, 23, 32, 33, 34, 35],
    32: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    33: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    34: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    35: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  },
  text: {
    11: {
      34: ["SAFARI GAME", "POKEMON-U-CATCH!"],
      35: ["SAFARI GAME", "POKEMON-U-CATCH!"],
    },
    15: {
      14: ["..."],
      15: ["..."],
      26: ["Name: KANGASKHAN", "A maternal POKEMON", "that raises its young in a pouch on", "its belly."],
      27: ["Name: KANGASKHAN", "A maternal POKEMON", "that raises its young in a pouch on", "its belly."],
      54: ["Name: VOLTORB", "The very image of", "a POKE BALL."],
      55: ["Name: VOLTORB", "The very image of", "a POKE BALL."],
      66: ["Name: CHANSEY", "Catching one is", "all up to chance."],
      67: ["Name: CHANSEY", "Catching one is", "all up to chance."],
    },
    27: {
      12: ["All your item", "needs fulfilled! POKEMON MART"],
      13: ["All your item", "needs fulfilled! POKEMON MART"],
      62: ["Name: SLOWPOKE", "Friendly and very", "slow moving."],
      63: ["Name: SLOWPOKE", "Friendly and very", "slow moving."],
    },
    31: {
      26: ["Name: LAPRAS", "A.K.A. the king", "of the seas."],
      27: ["Name: LAPRAS", "A.K.A. the king", "of the seas."],
      42: ["POKEMON PARADISE", "SAFARI ZONE"],
      43: ["POKEMON PARADISE", "SAFARI ZONE"],
      50: ["FUCHSIA CITY", "Behold! It's Passion Pink!"],
      51: ["FUCHSIA CITY", "Behold! It's Passion Pink!"],
    },
    47: {
      30: ["FUCHSIA CITY", "Behold! It's Passion Pink!"],
      31: ["FUCHSIA CITY", "Behold! It's Passion Pink!"],
    },
    55: {
      40: ["Heal Your POKEMON!", "POKEMON CENTER"],
      41: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    59: {
      10: ["FUCHSIA CITY", "POKEMON GYM LEADER: KOGA", "The Poisonous", "Ninja Master"],
      11: ["FUCHSIA CITY", "POKEMON GYM LEADER: KOGA", "The Poisonous", "Ninja Master"],
      54: ["SAFARI ZONE", "WARDEN's HOME"],
      55: ["SAFARI ZONE", "WARDEN's HOME"],
    },
  },
  maps: {
    6: {
      36: { map: MapId.SafariZoneGate, pos: { x: 6, y: 11 } },
      37: { map: MapId.SafariZoneGate, pos: { x: 6, y: 11 } },
    },
    7: {
      36: { map: MapId.SafariZoneGate, pos: { x: 6, y: 11 } },
      37: { map: MapId.SafariZoneGate, pos: { x: 6, y: 11 } },
    },
    8: {
      39: { map: MapId.Route15, pos: { x: 1, y: 0 } },
    },
    9: {
      39: { map: MapId.Route15, pos: { x: 1, y: 0 } },
    },
    10: {
      39: { map: MapId.Route15, pos: { x: 1, y: 2 } },
    },
    11: {
      39: { map: MapId.Route15, pos: { x: 1, y: 2 } },
    },
    12: {
      39: { map: MapId.Route15, pos: { x: 1, y: 4 } },
    },
    13: {
      39: { map: MapId.Route15, pos: { x: 1, y: 4 } },
    },
    14: {
      0: { map: MapId.Route18, pos: { x: 48, y: 6 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 6 } },
    },
    15: {
      0: { map: MapId.Route18, pos: { x: 48, y: 6 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 6 } },
    },
    16: {
      0: { map: MapId.Route18, pos: { x: 48, y: 8 } },
    },
    17: {
      0: { map: MapId.Route18, pos: { x: 48, y: 8 } },
    },
    18: {
      0: { map: MapId.Route18, pos: { x: 48, y: 10 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 10 } },
    },
    19: {
      0: { map: MapId.Route18, pos: { x: 48, y: 10 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 10 } },
    },
    20: {
      0: { map: MapId.Route18, pos: { x: 48, y: 12 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 12 } },
    },
    21: {
      0: { map: MapId.Route18, pos: { x: 48, y: 12 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 12 } },
    },
    22: {
      0: { map: MapId.Route18, pos: { x: 48, y: 14 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 14 } },
    },
    23: {
      0: { map: MapId.Route18, pos: { x: 48, y: 14 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 14 } },
    },
    24: {
      0: { map: MapId.Route18, pos: { x: 48, y: 16 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 16 } },
    },
    25: {
      0: { map: MapId.Route18, pos: { x: 48, y: 16 } },
      39: { map: MapId.Route15, pos: { x: 1, y: 16 } },
    },
    26: {
      10: { map: MapId.FuchsiaMart, pos: { x: 6, y: 15 } },
      11: { map: MapId.FuchsiaMart, pos: { x: 6, y: 15 } },
      44: { map: MapId.FuchsiaMeetingRoom, pos: { x: 8, y: 15 } },
      45: { map: MapId.FuchsiaMeetingRoom, pos: { x: 8, y: 15 } },
    },
    27: {
      10: { map: MapId.FuchsiaMart, pos: { x: 6, y: 15 } },
      11: { map: MapId.FuchsiaMart, pos: { x: 6, y: 15 } },
      44: { map: MapId.FuchsiaMeetingRoom, pos: { x: 8, y: 15 } },
      45: { map: MapId.FuchsiaMeetingRoom, pos: { x: 8, y: 15 } },
    },
    35: {
      10: { map: MapId.Route19, pos: { x: 0, y: 1 } },
      11: { map: MapId.Route19, pos: { x: 0, y: 1 } },
      14: { map: MapId.Route19, pos: { x: 4, y: 1 } },
      15: { map: MapId.Route19, pos: { x: 4, y: 1 } },
      26: { map: MapId.Route19, pos: { x: 16, y: 2 } },
      27: { map: MapId.Route19, pos: { x: 16, y: 2 } },
      28: { map: MapId.Route19, pos: { x: 18, y: 1 } },
      29: { map: MapId.Route19, pos: { x: 18, y: 1 } },
    },
    48: {
      62: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 1 } },
      63: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 1 } },
    },
    49: {
      62: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 1 } },
      63: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 1 } },
    },
    54: {
      10: { map: MapId.FuchsiaGym, pos: { x: 8, y: 35 } },
      11: { map: MapId.FuchsiaGym, pos: { x: 8, y: 35 } },
      22: { map: MapId.FuchsiaBillsGrandpasHouse, pos: { x: 4, y: 15 } },
      23: { map: MapId.FuchsiaBillsGrandpasHouse, pos: { x: 4, y: 15 } },
      38: { map: MapId.FuchsiaPokecenter, pos: { x: 6, y: 15 } },
      39: { map: MapId.FuchsiaPokecenter, pos: { x: 6, y: 15 } },
      54: { map: MapId.WardensHouse, pos: { x: 8, y: 15 } },
      55: { map: MapId.WardensHouse, pos: { x: 8, y: 15 } },
      62: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 15 } },
      63: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 15 } },
    },
    55: {
      10: { map: MapId.FuchsiaGym, pos: { x: 8, y: 35 } },
      11: { map: MapId.FuchsiaGym, pos: { x: 8, y: 35 } },
      22: { map: MapId.FuchsiaBillsGrandpasHouse, pos: { x: 4, y: 15 } },
      23: { map: MapId.FuchsiaBillsGrandpasHouse, pos: { x: 4, y: 15 } },
      38: { map: MapId.FuchsiaPokecenter, pos: { x: 6, y: 15 } },
      39: { map: MapId.FuchsiaPokecenter, pos: { x: 6, y: 15 } },
      54: { map: MapId.WardensHouse, pos: { x: 8, y: 15 } },
      55: { map: MapId.WardensHouse, pos: { x: 8, y: 15 } },
      62: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 15 } },
      63: { map: MapId.FuchsiaGoodRodHouse, pos: { x: 4, y: 15 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route19,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    4: [4, 5, 6, 7],
    5: [4, 5, 6, 7],
    16: [6, 7, 8, 9, 10, 11],
    17: [6, 7, 8, 9, 10, 11],
    18: [6, 7, 8, 9, 10, 11],
    19: [6, 7, 8, 9, 10, 11],
    20: [28, 29, 30, 31, 32, 33],
    21: [28, 29, 30, 31, 32, 33],
  },
  cut: {
    6: [22, 23],
    7: [22, 23],
    10: [16, 17],
    11: [16, 17],
    12: [26, 27],
    13: [26, 27],
    18: [18, 19],
    19: [18, 19],
  },
};

export default fuchsiaCity;
