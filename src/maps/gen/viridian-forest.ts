import viridianforestImage from "../../assets/map/gen/viridian-forest.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { bugCatcher } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered VIRIDIAN_FOREST - do not hand-edit.
const viridianForest: MapType = {
  name: "Viridian Forest",
  image: viridianforestImage,
  height: 48,
  width: 34,
  start: { x: 17, y: 46 },
  walls: {
    0: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    1: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    2: [0, 1],
    3: [0, 1],
    4: [0, 1, 10, 11, 30, 31],
    5: [0, 1, 10, 11, 30, 31],
    6: [30, 31],
    7: [30, 31],
    10: [24, 25],
    11: [24, 25],
    12: [24, 25],
    13: [24, 25],
    14: [24, 25],
    15: [24, 25],
    16: [24, 25],
    17: [24, 25],
    18: [10, 11, 24, 25],
    19: [10, 11, 24, 25],
    20: [30, 31],
    21: [30, 31],
    22: [30, 31],
    23: [30, 31],
    24: [0, 1, 30, 31],
    25: [0, 1, 30, 31],
    26: [10, 11, 30, 31],
    27: [10, 11, 30, 31],
    28: [10, 11, 30, 31],
    29: [10, 11, 30, 31],
    30: [30, 31],
    31: [30, 31],
    44: [14, 15],
    45: [14, 15],
    46: [14, 15],
    47: [14, 15],
  },
  text: {
    3: {
      4: ["LEAVING", "VIRIDIAN FOREST PEWTER CITY AHEAD"],
      5: ["LEAVING", "VIRIDIAN FOREST PEWTER CITY AHEAD"],
    },
    35: {
      52: ["TRAINER TIPS", "Contact PROF.OAK", "via PC to get your POKEDEX evaluated!"],
      53: ["TRAINER TIPS", "Contact PROF.OAK", "via PC to get your POKEDEX evaluated!"],
    },
    49: {
      8: ["TRAINER TIPS", "No stealing of", "POKEMON from other trainers! Catch only", "wild POKEMON!"],
      9: ["TRAINER TIPS", "No stealing of", "POKEMON from other trainers! Catch only", "wild POKEMON!"],
    },
    65: {
      32: ["For poison, use", "ANTIDOTE! Get it at POKEMON MARTs!"],
      33: ["For poison, use", "ANTIDOTE! Get it at POKEMON MARTs!"],
    },
    81: {
      48: ["TRAINER TIPS", "If you want to", "avoid battles, stay away from grassy", "areas!"],
      49: ["TRAINER TIPS", "If you want to", "avoid battles, stay away from grassy", "areas!"],
    },
    91: {
      36: ["TRAINER TIPS", "Weaken POKEMON", "before attempting capture!", "When healthy,", "they may escape!"],
      37: ["TRAINER TIPS", "Weaken POKEMON", "before attempting capture!", "When healthy,", "they may escape!"],
    },
  },
  maps: {
    0: {
      2: { map: MapId.Route2GateNorth, pos: { x: 8, y: 15 } },
      3: { map: MapId.Route2GateNorth, pos: { x: 8, y: 15 } },
      4: { map: MapId.Route2GateNorth, pos: { x: 10, y: 15 } },
      5: { map: MapId.Route2GateNorth, pos: { x: 10, y: 15 } },
    },
    1: {
      2: { map: MapId.Route2GateNorth, pos: { x: 8, y: 15 } },
      3: { map: MapId.Route2GateNorth, pos: { x: 8, y: 15 } },
      4: { map: MapId.Route2GateNorth, pos: { x: 10, y: 15 } },
      5: { map: MapId.Route2GateNorth, pos: { x: 10, y: 15 } },
    },
    94: {
      30: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      31: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      32: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      33: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      34: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      35: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      36: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      37: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
    },
    95: {
      30: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      31: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      32: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      33: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      34: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      35: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      36: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
      37: { map: MapId.Route2Gate, pos: { x: 10, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    2: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    3: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  trainers: [
    {
      npc: bugCatcher,
      facing: Direction.Left,
      pokemon: [{ id: 13, level: 6 }, { id: 10, level: 6 }],
      intro: ["Hey! You have", "POKEMON! Come on! Let's battle'em!"],
      outtro: ["No!", "CATERPIE can't cut it!"],
      money: 60,
      pos: { x: 60, y: 66 },
      postGame: { message: ["Ssh! You'll scare", "the bugs away!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Left,
      pokemon: [{ id: 13, level: 7 }, { id: 14, level: 7 }, { id: 13, level: 7 }],
      intro: ["Yo! You can't jam", "out if you're a POKEMON trainer!"],
      outtro: ["Huh?", "I ran out of POKEMON!"],
      money: 70,
      pos: { x: 60, y: 38 },
      postGame: { message: ["Darn! I'm going", "to catch some stronger ones!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Left,
      pokemon: [{ id: 13, level: 9 }],
      intro: ["Hey, wait up!", "What's the hurry?"],
      outtro: ["I", "give! You're good at this!"],
      money: 90,
      pos: { x: 4, y: 36 },
      postGame: { message: ["Sometimes, you", "can find stuff on the ground!", "I'm looking for", "the stuff I dropped!"] },
    },
  ],
  items: [
    { item: ItemType.Antidote, pos: { x: 50, y: 23 } },
    { item: ItemType.Potion, pos: { x: 24, y: 59 } },
    { item: ItemType.PokeBall, pos: { x: 2, y: 63 } },
  ],
};

export default viridianForest;
