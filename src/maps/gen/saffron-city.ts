import saffroncityImage from "../../assets/map/gen/saffron-city.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { birdKeeper, gentleman, lass, rocker, scientist, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered SAFFRON_CITY - do not hand-edit.
const saffronCity: MapType = {
  name: "Saffron City",
  image: saffroncityImage,
  height: 36,
  width: 40,
  start: { x: 20, y: 34 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 38, 39],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 38, 39],
    2: [4, 5, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 28, 29, 36, 37, 38, 39],
    3: [4, 5, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 28, 29, 36, 37, 38, 39],
    4: [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 20, 21, 22, 23, 30, 31],
    5: [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 20, 21, 22, 23, 30, 31],
    6: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    7: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    8: [6, 7, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 31, 34, 35],
    9: [6, 7, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 31, 34, 35],
    10: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 22, 23, 28, 29, 30, 31, 32, 33, 34, 35],
    11: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 22, 23, 28, 29, 30, 31, 32, 33, 34, 35],
    12: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    13: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    16: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    17: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    18: [4, 5, 14, 15],
    19: [4, 5, 14, 15],
    22: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35],
    23: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35],
    26: [6, 7, 8, 9, 10, 11, 14, 15, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35],
    27: [6, 7, 8, 9, 10, 11, 14, 15, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35],
    28: [4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 32, 33, 34, 35],
    29: [4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 32, 33, 34, 35],
    30: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    31: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    32: [0, 1, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 20, 21, 22, 23, 26, 27, 30, 31, 34, 35, 36, 37, 38, 39],
    33: [0, 1, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 20, 21, 22, 23, 26, 27, 30, 31, 34, 35, 36, 37, 38, 39],
    34: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    35: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
  },
  text: {
    8: {
      68: ["Get out of the", "way!"],
    },
    11: {
      34: ["SAFFRON CITY", "Shining, Golden Land of Commerce"],
      35: ["SAFFRON CITY", "Shining, Golden Land of Commerce"],
      54: ["FIGHTING DOJO"],
      55: ["FIGHTING DOJO"],
      70: ["SAFFRON CITY", "POKEMON GYM LEADER: SABRINA", "The Master of", "Psychic POKEMON!"],
      71: ["SAFFRON CITY", "POKEMON GYM LEADER: SABRINA", "The Master of", "Psychic POKEMON!"],
    },
    12: {
      14: ["What do you want?", "Get lost!"],
    },
    16: {
      36: ["I saw ROCKET", "BOSS escaping SILPH's building."],
      40: ["BOSS said he'll", "take this town!"],
    },
    23: {
      52: ["All your item", "needs fulfilled! POKEMON MART"],
      53: ["All your item", "needs fulfilled! POKEMON MART"],
    },
    24: {
      26: ["SAFFRON belongs", "to TEAM ROCKET!"],
      60: ["I flew here on my", "PIDGEOT when I read about SILPH.", "It's already over?", "I missed the media action."],
      62: ["PIDGEOT: Bi bibii!"],
    },
    26: {
      64: ["Ow! Watch where", "you're walking!"],
    },
    28: {
      16: ["You beat TEAM", "ROCKET all alone? That's amazing!"],
    },
    39: {
      2: ["SILPH's latest", "product!", "Release to be", "determined..."],
      3: ["SILPH's latest", "product!", "Release to be", "determined..."],
      78: ["TRAINER TIPS", "FULL HEAL cures", "all ailments like sleep and burns.", "It costs a bit", "more, but it's more convenient."],
      79: ["TRAINER TIPS", "FULL HEAL cures", "all ailments like sleep and burns.", "It costs a bit", "more, but it's more convenient."],
    },
    43: {
      10: ["TRAINER TIPS", "New GREAT BALL", "offers improved capture rates.", "Try it on those", "hard-to-catch POKEMON."],
      11: ["TRAINER TIPS", "New GREAT BALL", "offers improved capture rates.", "Try it on those", "hard-to-catch POKEMON."],
      30: ["SILPH CO.", "OFFICE BUILDING"],
      31: ["SILPH CO.", "OFFICE BUILDING"],
    },
    44: {
      36: ["I'm a security", "guard.", "Suspicious kids I", "don't allow in!"],
      38: ["...", "Snore...", "Hah! He's taking", "a snooze!"],
    },
    46: {
      46: ["Yeah! TEAM ROCKET", "is gone! It's safe to go out again!"],
    },
    50: {
      22: ["Being evil makes", "me feel so alive!"],
    },
    59: {
      20: ["Heal Your POKEMON!", "POKEMON CENTER"],
      21: ["Heal Your POKEMON!", "POKEMON CENTER"],
      54: ["MR.PSYCHIC's", "HOUSE"],
      55: ["MR.PSYCHIC's", "HOUSE"],
    },
    60: {
      34: ["People should be", "flocking back to SAFFRON now."],
      36: ["With SILPH under", "control, we can exploit POKEMON around", "the world!"],
    },
  },
  maps: {
    0: {
      10: { map: MapId.Route5, pos: { x: 0, y: 34 } },
      11: { map: MapId.Route5, pos: { x: 0, y: 34 } },
      22: { map: MapId.Route5, pos: { x: 12, y: 34 } },
      23: { map: MapId.Route5, pos: { x: 12, y: 34 } },
      24: { map: MapId.Route5, pos: { x: 14, y: 34 } },
      25: { map: MapId.Route5, pos: { x: 14, y: 34 } },
      26: { map: MapId.Route5, pos: { x: 16, y: 34 } },
      27: { map: MapId.Route5, pos: { x: 16, y: 34 } },
      28: { map: MapId.Route5, pos: { x: 18, y: 34 } },
      29: { map: MapId.Route5, pos: { x: 18, y: 34 } },
    },
    6: {
      52: { map: MapId.FightingDojo, pos: { x: 8, y: 23 } },
      53: { map: MapId.FightingDojo, pos: { x: 8, y: 23 } },
      68: { map: MapId.SaffronGym, pos: { x: 16, y: 35 } },
      69: { map: MapId.SaffronGym, pos: { x: 16, y: 35 } },
    },
    7: {
      52: { map: MapId.FightingDojo, pos: { x: 8, y: 23 } },
      53: { map: MapId.FightingDojo, pos: { x: 8, y: 23 } },
      68: { map: MapId.SaffronGym, pos: { x: 16, y: 35 } },
      69: { map: MapId.SaffronGym, pos: { x: 16, y: 35 } },
    },
    8: {
      0: { map: MapId.Route7, pos: { x: 18, y: 0 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 0 } },
    },
    9: {
      0: { map: MapId.Route7, pos: { x: 18, y: 0 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 0 } },
    },
    10: {
      0: { map: MapId.Route7, pos: { x: 18, y: 2 } },
      14: { map: MapId.CopycatsHouse1f, pos: { x: 4, y: 15 } },
      15: { map: MapId.CopycatsHouse1f, pos: { x: 4, y: 15 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 2 } },
    },
    11: {
      0: { map: MapId.Route7, pos: { x: 18, y: 2 } },
      14: { map: MapId.CopycatsHouse1f, pos: { x: 4, y: 15 } },
      15: { map: MapId.CopycatsHouse1f, pos: { x: 4, y: 15 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 2 } },
    },
    12: {
      0: { map: MapId.Route7, pos: { x: 18, y: 4 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 4 } },
    },
    13: {
      0: { map: MapId.Route7, pos: { x: 18, y: 4 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 4 } },
    },
    14: {
      0: { map: MapId.Route7, pos: { x: 18, y: 6 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 6 } },
    },
    15: {
      0: { map: MapId.Route7, pos: { x: 18, y: 6 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 6 } },
    },
    16: {
      0: { map: MapId.Route7, pos: { x: 18, y: 8 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 8 } },
    },
    17: {
      0: { map: MapId.Route7, pos: { x: 18, y: 8 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 8 } },
    },
    18: {
      0: { map: MapId.Route7, pos: { x: 18, y: 10 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 10 } },
    },
    19: {
      0: { map: MapId.Route7, pos: { x: 18, y: 10 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 10 } },
    },
    20: {
      0: { map: MapId.Route7, pos: { x: 18, y: 12 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 12 } },
    },
    21: {
      0: { map: MapId.Route7, pos: { x: 18, y: 12 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 12 } },
    },
    22: {
      0: { map: MapId.Route7, pos: { x: 18, y: 14 } },
      26: { map: MapId.SaffronPidgeyHouse, pos: { x: 4, y: 15 } },
      27: { map: MapId.SaffronPidgeyHouse, pos: { x: 4, y: 15 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 14 } },
      50: { map: MapId.SaffronMart, pos: { x: 6, y: 15 } },
      51: { map: MapId.SaffronMart, pos: { x: 6, y: 15 } },
    },
    23: {
      0: { map: MapId.Route7, pos: { x: 18, y: 14 } },
      26: { map: MapId.SaffronPidgeyHouse, pos: { x: 4, y: 15 } },
      27: { map: MapId.SaffronPidgeyHouse, pos: { x: 4, y: 15 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 14 } },
      50: { map: MapId.SaffronMart, pos: { x: 6, y: 15 } },
      51: { map: MapId.SaffronMart, pos: { x: 6, y: 15 } },
    },
    24: {
      0: { map: MapId.Route7, pos: { x: 18, y: 16 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 16 } },
    },
    25: {
      0: { map: MapId.Route7, pos: { x: 18, y: 16 } },
      39: { map: MapId.Route8, pos: { x: 1, y: 16 } },
    },
    35: {
      20: { map: MapId.Route6, pos: { x: 10, y: 1 } },
      21: { map: MapId.Route6, pos: { x: 10, y: 1 } },
      22: { map: MapId.Route6, pos: { x: 12, y: 1 } },
      23: { map: MapId.Route6, pos: { x: 12, y: 1 } },
    },
    42: {
      36: { map: MapId.SilphCo1f, pos: { x: 20, y: 35 } },
      37: { map: MapId.SilphCo1f, pos: { x: 20, y: 35 } },
    },
    43: {
      36: { map: MapId.SilphCo1f, pos: { x: 20, y: 35 } },
      37: { map: MapId.SilphCo1f, pos: { x: 20, y: 35 } },
    },
    58: {
      18: { map: MapId.SaffronPokecenter, pos: { x: 6, y: 15 } },
      19: { map: MapId.SaffronPokecenter, pos: { x: 6, y: 15 } },
      58: { map: MapId.MrPsychicsHouse, pos: { x: 4, y: 15 } },
      59: { map: MapId.MrPsychicsHouse, pos: { x: 4, y: 15 } },
    },
    59: {
      18: { map: MapId.SaffronPokecenter, pos: { x: 6, y: 15 } },
      19: { map: MapId.SaffronPokecenter, pos: { x: 6, y: 15 } },
      58: { map: MapId.MrPsychicsHouse, pos: { x: 4, y: 15 } },
      59: { map: MapId.MrPsychicsHouse, pos: { x: 4, y: 15 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route6,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: teamRocketGrunt, pos: { x: 14, y: 12 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 40, y: 16 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 68, y: 8 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 26, y: 24 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 22, y: 50 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 64, y: 26 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 36, y: 60 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 16, y: 28 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 46, y: 46 }, facing: Direction.Down },
    { npc: lass, pos: { x: 34, y: 60 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 60, y: 24 }, facing: Direction.Down },
    { npc: birdKeeper, pos: { x: 62, y: 24 }, facing: Direction.Down },
    { npc: rocker, pos: { x: 36, y: 16 }, facing: Direction.Up },
    { npc: teamRocketGrunt, pos: { x: 36, y: 44 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 38, y: 44 }, facing: Direction.Down },
  ],
};

export default saffronCity;
