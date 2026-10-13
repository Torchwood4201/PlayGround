import viridianCityImage from "../assets/map/viridian-city.png";
import { MapId, MapType } from "./map-types";
import {
  fisher,
  gambler,
  gentleman,
  lass,
  youngster,
} from "../app/npcs";
import { Direction } from "../state/state-types";

import music from "../assets/music/maps/pewter-city.mp3";
import getEncounterData from "./get-location-data";

const viridianCity: MapType = {
  name: "Viridian City",
  image: viridianCityImage,
  height: 36,
  width: 40,
  start: {
    x: 20,
    y: 34,
  },
  walls: {
    0: [16, 20],
    1: [16, 19, 20, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    2: [16, 20, 23, 36],
    3: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 36],
    4: [5, 14, 28, 29, 30, 31, 32, 33, 36],
    5: [5, 8, 9, 10, 11, 12, 13, 14, 15, 28, 29, 30, 31, 32, 33, 36],
    6: [5, 7, 16, 20, 28, 29, 30, 31, 32, 33, 36],
    7: [5, 7, 16, 20, 27, 28, 29, 30, 31, 33, 36],
    8: [5, 7, 16, 20, 21, 22, 23, 36],
    9: [5, 7, 16, 20, 22, 23, 36],
    10: [5, 7, 16, 36],
    11: [5, 7, 16, 36],
    12: [5, 7, 16, 36],
    13: [
      0, 1, 2, 3, 4, 5, 7, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      32, 33, 34, 35, 36,
    ],
    14: [7, 16, 20, 21, 22, 23, 36],
    15: [7, 16, 20, 22, 23, 36],
    16: [8, 9, 10, 11, 12, 13, 14, 15, 28, 29, 30, 31, 36],
    17: [17, 20, 21, 22, 23, 28, 29, 30, 31, 36],
    18: [0, 1, 2, 3, 28, 29, 30, 31, 36],
    19: [3, 28, 30, 31, 36],
    20: [3, 36],
    21: [3, 4, 5, 6, 7, 36],
    22: [3, 8, 22, 23, 24, 25, 36],
    23: [3, 8, 9, 22, 23, 24, 25, 36],
    24: [3, 8, 9, 10, 11, 12, 13, 22, 23, 24, 25, 36],
    25: [3, 8, 9, 10, 11, 12, 13, 22, 24, 25, 36],
    26: [3, 8, 9, 10, 11, 12, 13, 36],
    27: [3, 8, 9, 10, 11, 12, 13, 36],
    28: [3, 36],
    29: [3, 21, 36],
    30: [3, 36],
    31: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    ],
    32: [19, 22],
    33: [19, 22],
    34: [19, 22],
    35: [19, 22],
  },
  fences: {
    9: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    27: [
      4, 5, 6, 7, 14, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      31, 32, 33, 34, 35,
    ],
  },
  text: {
    29: {
      21: [
        "TRAINER TIPS",
        "The battle moves of POKEMON are",
        "limited by their POWER POINTs, PP.",
        "To replenish PP, rest your tired",
        "POKEMON at a POKEMON CENTER!",
      ],
    },
    25: {
      24: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    19: {
      30: ["All your item needs fulfilled!", "POKEMON MART"],
    },
    17: {
      17: ["VIRIDIAN CITY", "The Eternally Green Paradise"],
    },
    7: {
      27: ["VIRIDIAN CITY", "POKEMON GYM"],
    },
    1: {
      19: [
        "TRAINER TIPS",
        "Catch POKEMON and expand your",
        "collection!",
        "The more you have, the easier",
        "it is to fight!",
      ],
    },
    8: {
      30: [
        "This POKEMON GYM is always closed.",
        "I wonder who the LEADER is?",
      ],
    },
    10: {
      15: [
        "You can't go through here!",
        "This is private property!",
      ],
      18: [
        "Oh Grandpa! Don't be so mean!",
        "He hasn't had his coffee yet.",
        "When I go shop in PEWTER CITY, I have to take the winding trail in VIRIDIAN FOREST.",
      ],
    },
    11: {
      15: [
        "Ahh, I've had my coffee now and I feel great!",
        "Sure you can go through!",
        "When you catch a POKEMON, POKEDEX is automatically updated.",
      ],
    },
    20: {
      24: [
        "You want to know about the 2 kinds of caterpillar POKEMON?",
        "CATERPIE has no poison, but WEEDLE does.",
        "Watch out for its POISON STING!",
      ],
    },
    26: {
      14: [
        "Yawn! I must have dozed off in the sun.",
        "I had this dream about a DROWZEE eating my dream.",
      ],
    },
    33: {
      20: [
        "Those POKE BALLs at your waist! You have POKEMON!",
        "It's great that you can carry and use POKEMON any time, anywhere!",
      ],
    },
  },
  maps: {
    0: {
      17: MapId.Route2,
      18: MapId.Route2,
      19: MapId.Route2,
    },
    7: {
      32: MapId.ViridianCityGym,
    },
    9: {
      21: MapId.ViridianCityNpcHouse,
    },
    14: {
      0: MapId.Route22,
    },
    15: {
      0: MapId.Route22,
      21: MapId.ViridianCityPokemonAcadamy,
    },
    16: {
      0: MapId.Route22,
    },
    17: {
      0: MapId.Route22,
    },
    19: {
      29: MapId.ViridianCityPokeMart,
    },
    25: {
      23: MapId.ViridianCityPokemonCenter,
    },
  },
  exits: {
    35: [20, 21],
  },
  music,
  grass: {},
  encounters: getEncounterData("viridian-city-area"),
  recoverLocation: { x: 23, y: 26 },
  exitReturnMap: MapId.Route1,
  exitReturnPos: {
    x: 11,
    y: 1,
  },
  trainers: [],
  npcs: [
    { npc: youngster, pos: { x: 20, y: 33 }, facing: Direction.Down },
    { npc: gambler, pos: { x: 30, y: 8 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 24, y: 20 }, facing: Direction.Down },
    { npc: lass, pos: { x: 18, y: 10 }, facing: Direction.Down },
    { npc: gambler, pos: { x: 15, y: 10 }, facing: Direction.Down },
    { npc: fisher, pos: { x: 14, y: 26 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 15, y: 11 }, facing: Direction.Down },
  ],
};

export default viridianCity;
