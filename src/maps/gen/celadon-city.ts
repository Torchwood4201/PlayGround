import celadoncityImage from "../../assets/map/gen/celadon-city.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { fisher, gentleman, lass, teamRocketGrunt, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_CITY - do not hand-edit.
const celadonCity: MapType = {
  name: "Celadon City",
  image: celadoncityImage,
  height: 36,
  width: 50,
  start: { x: 25, y: 34 },
  walls: {
    4: [2, 3, 4, 5, 14, 15, 18, 19, 22, 23, 26, 27],
    5: [2, 3, 4, 5, 14, 15, 18, 19, 22, 23, 26, 27],
    6: [6, 7, 12, 13, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    7: [6, 7, 12, 13, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    14: [20, 21],
    15: [20, 21],
    16: [22, 23, 26, 27, 30, 31, 32, 33, 34, 35, 38, 39, 40, 41, 42, 43, 44, 45],
    17: [22, 23, 26, 27, 30, 31, 32, 33, 34, 35, 38, 39, 40, 41, 42, 43, 44, 45],
    24: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    25: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    26: [6, 7],
    27: [6, 7],
    28: [18, 19, 20, 21],
    29: [18, 19, 20, 21],
  },
  text: {
    19: {
      42: ["CELADON MANSION"],
      43: ["CELADON MANSION"],
      84: ["Heal Your POKEMON!", "POKEMON CENTER"],
      85: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    24: {
      60: ["POLIWRATH: Ribi", "ribit!"],
      64: ["This is my trusted", "pal, POLIWRATH!", "It evolved from", "POLIWHIRL when I used WATER STONE!"],
    },
    27: {
      24: ["Find what you", "need at CELADON DEPT. STORE!"],
      25: ["Find what you", "need at CELADON DEPT. STORE!"],
    },
    28: {
      84: ["Keep out of TEAM", "ROCKET's way!"],
    },
    31: {
      38: ["CELADON CITY", "The City of Rainbow Dreams"],
      39: ["CELADON CITY", "The City of Rainbow Dreams"],
      54: ["TRAINER TIPS", "X ACCURACY boosts", "the accuracy of techniques!", "DIRE HIT jacks up", "the likelihood of critical hits!", "Get your items at", "CELADON DEPT. STORE!"],
      55: ["TRAINER TIPS", "X ACCURACY boosts", "the accuracy of techniques!", "DIRE HIT jacks up", "the likelihood of critical hits!", "Get your items at", "CELADON DEPT. STORE!"],
    },
    32: {
      44: ["Hello, there!", "I've seen you,", "but I never had a chance to talk!", "Here's a gift for", "dropping by!"],
    },
    34: {
      16: ["I got my KOFFING", "in CINNABAR!", "It's nice, but it", "breathes poison when it's angry!"],
    },
    38: {
      28: ["The GAME CORNER", "is bad for our city's image!"],
    },
    43: {
      54: ["ROCKET GAME CORNER", "The playground for grown-ups!"],
      55: ["ROCKET GAME CORNER", "The playground for grown-ups!"],
      66: ["Coins exchanged", "for prizes! PRIZE EXCHANGE"],
      67: ["Coins exchanged", "for prizes! PRIZE EXCHANGE"],
      78: ["TRAINER TIPS", "GUARD SPEC.", "protects POKEMON against SPECIAL attacks", "such as fire and water!", "Get your items at", "CELADON DEPT. STORE!"],
      79: ["TRAINER TIPS", "GUARD SPEC.", "protects POKEMON against SPECIAL attacks", "such as fire and water!", "Get your items at", "CELADON DEPT. STORE!"],
    },
    44: {
      50: ["Moan! I blew it", "all at the slots!", "I knew I should", "have cashed in my coins for prizes!"],
    },
    56: {
      22: ["Heheh! This GYM", "is great! It's full of women!"],
    },
    58: {
      64: ["What are you", "staring at?"],
    },
    59: {
      26: ["CELADON CITY", "POKEMON GYM LEADER: ERIKA", "The Nature Loving", "Princess!"],
      27: ["CELADON CITY", "POKEMON GYM LEADER: ERIKA", "The Nature Loving", "Princess!"],
    },
  },
  maps: {
    6: {
      48: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      49: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      50: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      51: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
    },
    7: {
      48: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      49: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      50: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
      51: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 1 } },
    },
    8: {
      0: { map: MapId.Route16, pos: { x: 38, y: 0 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 0 } },
    },
    9: {
      0: { map: MapId.Route16, pos: { x: 38, y: 0 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 0 } },
    },
    10: {
      0: { map: MapId.Route16, pos: { x: 38, y: 2 } },
    },
    11: {
      0: { map: MapId.Route16, pos: { x: 38, y: 2 } },
    },
    12: {
      0: { map: MapId.Route16, pos: { x: 38, y: 4 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 4 } },
    },
    13: {
      0: { map: MapId.Route16, pos: { x: 38, y: 4 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 4 } },
    },
    14: {
      0: { map: MapId.Route16, pos: { x: 38, y: 6 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 6 } },
    },
    15: {
      0: { map: MapId.Route16, pos: { x: 38, y: 6 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 6 } },
    },
    16: {
      0: { map: MapId.Route16, pos: { x: 38, y: 8 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 8 } },
    },
    17: {
      0: { map: MapId.Route16, pos: { x: 38, y: 8 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 8 } },
    },
    18: {
      0: { map: MapId.Route16, pos: { x: 38, y: 10 } },
      48: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 23 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 10 } },
      82: { map: MapId.CeladonPokecenter, pos: { x: 6, y: 15 } },
      83: { map: MapId.CeladonPokecenter, pos: { x: 6, y: 15 } },
    },
    19: {
      0: { map: MapId.Route16, pos: { x: 38, y: 10 } },
      48: { map: MapId.CeladonMansion1f, pos: { x: 8, y: 23 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 10 } },
      82: { map: MapId.CeladonPokecenter, pos: { x: 6, y: 15 } },
      83: { map: MapId.CeladonPokecenter, pos: { x: 6, y: 15 } },
    },
    20: {
      0: { map: MapId.Route16, pos: { x: 38, y: 12 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 12 } },
    },
    21: {
      0: { map: MapId.Route16, pos: { x: 38, y: 12 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 12 } },
    },
    22: {
      0: { map: MapId.Route16, pos: { x: 38, y: 14 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 14 } },
    },
    23: {
      0: { map: MapId.Route16, pos: { x: 38, y: 14 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 14 } },
    },
    24: {
      0: { map: MapId.Route16, pos: { x: 38, y: 16 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 16 } },
    },
    25: {
      0: { map: MapId.Route16, pos: { x: 38, y: 16 } },
      49: { map: MapId.Route7, pos: { x: 1, y: 16 } },
    },
    26: {
      16: { map: MapId.CeladonMart1f, pos: { x: 4, y: 15 } },
      17: { map: MapId.CeladonMart1f, pos: { x: 4, y: 15 } },
      20: { map: MapId.CeladonMart1f, pos: { x: 32, y: 15 } },
      21: { map: MapId.CeladonMart1f, pos: { x: 32, y: 15 } },
    },
    27: {
      16: { map: MapId.CeladonMart1f, pos: { x: 4, y: 15 } },
      17: { map: MapId.CeladonMart1f, pos: { x: 4, y: 15 } },
      20: { map: MapId.CeladonMart1f, pos: { x: 32, y: 15 } },
      21: { map: MapId.CeladonMart1f, pos: { x: 32, y: 15 } },
    },
    38: {
      56: { map: MapId.GameCorner, pos: { x: 30, y: 35 } },
      57: { map: MapId.GameCorner, pos: { x: 30, y: 35 } },
      66: { map: MapId.GameCornerPrizeRoom, pos: { x: 8, y: 15 } },
      67: { map: MapId.GameCornerPrizeRoom, pos: { x: 8, y: 15 } },
      78: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
      79: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
    },
    39: {
      56: { map: MapId.GameCorner, pos: { x: 30, y: 35 } },
      57: { map: MapId.GameCorner, pos: { x: 30, y: 35 } },
      66: { map: MapId.GameCornerPrizeRoom, pos: { x: 8, y: 15 } },
      67: { map: MapId.GameCornerPrizeRoom, pos: { x: 8, y: 15 } },
      78: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
      79: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
    },
    54: {
      24: { map: MapId.CeladonGym, pos: { x: 8, y: 35 } },
      25: { map: MapId.CeladonGym, pos: { x: 8, y: 35 } },
      62: { map: MapId.CeladonDiner, pos: { x: 6, y: 15 } },
      63: { map: MapId.CeladonDiner, pos: { x: 6, y: 15 } },
      70: { map: MapId.CeladonChiefHouse, pos: { x: 4, y: 15 } },
      71: { map: MapId.CeladonChiefHouse, pos: { x: 4, y: 15 } },
      86: { map: MapId.CeladonHotel, pos: { x: 6, y: 15 } },
      87: { map: MapId.CeladonHotel, pos: { x: 6, y: 15 } },
    },
    55: {
      24: { map: MapId.CeladonGym, pos: { x: 8, y: 35 } },
      25: { map: MapId.CeladonGym, pos: { x: 8, y: 35 } },
      62: { map: MapId.CeladonDiner, pos: { x: 6, y: 15 } },
      63: { map: MapId.CeladonDiner, pos: { x: 6, y: 15 } },
      70: { map: MapId.CeladonChiefHouse, pos: { x: 4, y: 15 } },
      71: { map: MapId.CeladonChiefHouse, pos: { x: 4, y: 15 } },
      86: { map: MapId.CeladonHotel, pos: { x: 6, y: 15 } },
      87: { map: MapId.CeladonHotel, pos: { x: 6, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    18: [22, 23, 24, 25],
    19: [22, 23, 24, 25],
    20: [22, 23],
    21: [22, 23],
  },
  cut: {
    20: [46, 47],
    21: [46, 47],
    32: [34, 35],
    33: [34, 35],
  },
  npcs: [
    { npc: lass, pos: { x: 16, y: 34 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 22, y: 56 }, facing: Direction.Up },
    { npc: lass, pos: { x: 28, y: 38 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 50, y: 44 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 44, y: 32 }, facing: Direction.Down },
    { npc: fisher, pos: { x: 64, y: 24 }, facing: Direction.Left },
    { npc: youngster, pos: { x: 60, y: 24 }, facing: Direction.Right },
    { npc: teamRocketGrunt, pos: { x: 64, y: 58 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 84, y: 28 }, facing: Direction.Down },
  ],
};

export default celadonCity;
