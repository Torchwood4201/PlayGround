import route14Image from "../../assets/map/gen/route-14.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { biker, birdKeeper } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_14 - do not hand-edit.
const route14: MapType = {
  name: "Route 14",
  image: route14Image,
  height: 54,
  width: 20,
  start: { x: 10, y: 52 },
  walls: {
    0: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    1: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    4: [4, 5],
    5: [4, 5],
    6: [14, 15],
    7: [14, 15],
    8: [6, 7],
    9: [6, 7],
    10: [12, 13],
    11: [12, 13],
    12: [4, 5, 6, 7, 8, 9],
    13: [4, 5, 6, 7, 8, 9],
    14: [4, 5, 6, 7, 8, 9],
    15: [4, 5, 6, 7, 8, 9],
  },
  text: {
    27: {
      34: ["ROUTE 14", "West to FUCHSIA CITY"],
      35: ["ROUTE 14", "West to FUCHSIA CITY"],
    },
  },
  maps: {
    2: {
      19: { map: MapId.Route13, pos: { x: 1, y: 2 } },
    },
    3: {
      19: { map: MapId.Route13, pos: { x: 1, y: 2 } },
    },
    4: {
      19: { map: MapId.Route13, pos: { x: 1, y: 4 } },
    },
    5: {
      19: { map: MapId.Route13, pos: { x: 1, y: 4 } },
    },
    6: {
      19: { map: MapId.Route13, pos: { x: 1, y: 6 } },
    },
    7: {
      19: { map: MapId.Route13, pos: { x: 1, y: 6 } },
    },
    8: {
      19: { map: MapId.Route13, pos: { x: 1, y: 8 } },
    },
    9: {
      19: { map: MapId.Route13, pos: { x: 1, y: 8 } },
    },
    10: {
      19: { map: MapId.Route13, pos: { x: 1, y: 10 } },
    },
    11: {
      19: { map: MapId.Route13, pos: { x: 1, y: 10 } },
    },
    12: {
      19: { map: MapId.Route13, pos: { x: 2, y: 12 } },
    },
    13: {
      19: { map: MapId.Route13, pos: { x: 2, y: 12 } },
    },
    14: {
      19: { map: MapId.Route13, pos: { x: 1, y: 14 } },
    },
    15: {
      19: { map: MapId.Route13, pos: { x: 1, y: 14 } },
    },
    16: {
      19: { map: MapId.Route13, pos: { x: 1, y: 16 } },
    },
    17: {
      19: { map: MapId.Route13, pos: { x: 1, y: 16 } },
    },
    36: {
      0: { map: MapId.Route15, pos: { x: 58, y: 0 } },
    },
    37: {
      0: { map: MapId.Route15, pos: { x: 58, y: 0 } },
    },
    38: {
      0: { map: MapId.Route15, pos: { x: 58, y: 2 } },
    },
    39: {
      0: { map: MapId.Route15, pos: { x: 58, y: 2 } },
    },
    40: {
      0: { map: MapId.Route15, pos: { x: 58, y: 4 } },
    },
    41: {
      0: { map: MapId.Route15, pos: { x: 58, y: 4 } },
    },
    42: {
      0: { map: MapId.Route15, pos: { x: 58, y: 6 } },
    },
    43: {
      0: { map: MapId.Route15, pos: { x: 58, y: 6 } },
    },
    44: {
      0: { map: MapId.Route15, pos: { x: 58, y: 8 } },
    },
    45: {
      0: { map: MapId.Route15, pos: { x: 58, y: 8 } },
    },
    46: {
      0: { map: MapId.Route15, pos: { x: 58, y: 10 } },
    },
    47: {
      0: { map: MapId.Route15, pos: { x: 58, y: 10 } },
    },
    50: {
      0: { map: MapId.Route15, pos: { x: 58, y: 14 } },
    },
    51: {
      0: { map: MapId.Route15, pos: { x: 58, y: 14 } },
    },
    52: {
      0: { map: MapId.Route15, pos: { x: 58, y: 16 } },
    },
    53: {
      0: { map: MapId.Route15, pos: { x: 58, y: 16 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    20: [16, 17, 18, 19],
    21: [16, 17, 18, 19],
    22: [16, 17, 18, 19],
    23: [16, 17, 18, 19],
    24: [16, 17, 18, 19],
    25: [16, 17, 18, 19],
    26: [16, 17, 18, 19],
    27: [16, 17, 18, 19],
    28: [18, 19],
    29: [18, 19],
    30: [18, 19],
    31: [18, 19],
    32: [18, 19],
    33: [18, 19],
    34: [18, 19],
    35: [18, 19],
    36: [18, 19],
    37: [18, 19],
    38: [18, 19],
    39: [18, 19],
    40: [18, 19],
    41: [18, 19],
    42: [18, 19],
    43: [18, 19],
    44: [18, 19],
    45: [18, 19],
    46: [18, 19],
    47: [18, 19],
    48: [18, 19],
    49: [18, 19],
    50: [18, 19],
    51: [18, 19],
    52: [18, 19],
    53: [18, 19],
  },
  cut: {
    26: [4, 5],
    27: [4, 5],
    32: [10, 11],
    33: [10, 11],
    42: [2, 3],
    43: [2, 3],
  },
  trainers: [
    {
      npc: birdKeeper,
      facing: Direction.Down,
      pokemon: [{ id: 16, level: 28 }, { id: 84, level: 28 }, { id: 17, level: 28 }],
      intro: ["You need to use", "TMs to teach good moves to POKEMON!"],
      outtro: ["Not", "good enough!"],
      money: 700,
      pos: { x: 8, y: 8 },
      postGame: { message: ["You have some HMs", "right? POKEMON can't ever forget those", "moves."] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Down,
      pokemon: [{ id: 16, level: 26 }, { id: 21, level: 26 }, { id: 16, level: 26 }, { id: 22, level: 26 }],
      intro: ["My bird POKEMON", "should be ready for battle."],
      outtro: ["Not", "ready yet!"],
      money: 650,
      pos: { x: 30, y: 12 },
      postGame: { message: ["They need to learn", "better moves."] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Down,
      pokemon: [{ id: 17, level: 29 }, { id: 22, level: 29 }],
      intro: ["TMs are on sale", "in CELADON! But, only a few people", "have HMs!"],
      outtro: ["Aww,", "bummer!"],
      money: 725,
      pos: { x: 24, y: 22 },
      postGame: { message: ["Teach POKEMON", "moves of the same element type for", "more power."] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Up,
      pokemon: [{ id: 21, level: 28 }, { id: 84, level: 28 }, { id: 22, level: 28 }],
      intro: ["Have you taught", "your bird POKEMON how to FLY?"],
      outtro: ["Shot", "down in flames!"],
      money: 700,
      pos: { x: 28, y: 30 },
      postGame: { message: ["Bird POKEMON are", "my true love!"] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Left,
      pokemon: [{ id: 83, level: 33 }],
      intro: ["Have you heard of", "the legendary POKEMON?"],
      outtro: ["Why?", "Why'd I lose?"],
      money: 825,
      pos: { x: 30, y: 62 },
      postGame: { message: ["The 3 legendary", "POKEMON are all birds of prey."] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Up,
      pokemon: [{ id: 21, level: 29 }, { id: 22, level: 29 }],
      intro: ["I'm not into it,", "but OK! Let's go!"],
      outtro: ["I", "knew it!"],
      money: 725,
      pos: { x: 12, y: 98 },
      postGame: { message: ["Winning, losing,", "it doesn't matter in the long run!"] },
    },
    {
      npc: biker,
      facing: Direction.Down,
      pokemon: [{ id: 109, level: 26 }, { id: 109, level: 26 }, { id: 88, level: 26 }, { id: 109, level: 26 }],
      intro: ["C'mon, c'mon.", "Let's go, let's go, let's go!"],
      outtro: ["Arrg!", "Lost! Get lost!"],
      money: 520,
      pos: { x: 10, y: 78 },
      postGame: { message: ["What, what, what?", "What do you want?"] },
    },
    {
      npc: biker,
      facing: Direction.Right,
      pokemon: [{ id: 88, level: 28 }, { id: 88, level: 28 }, { id: 109, level: 28 }],
      intro: ["Perfect! I need to", "burn some time!"],
      outtro: ["What?", "You!?"],
      money: 560,
      pos: { x: 8, y: 60 },
      postGame: { message: ["Raising POKEMON", "is a drag, man."] },
    },
    {
      npc: biker,
      facing: Direction.Left,
      pokemon: [{ id: 109, level: 29 }, { id: 89, level: 29 }],
      intro: ["We ride out here", "because there's more room!"],
      outtro: ["Wipe out!"],
      money: 580,
      pos: { x: 30, y: 60 },
      postGame: { message: ["It's cool you", "made your POKEMON so strong!", "Might is right!", "And you know it!"] },
    },
    {
      npc: biker,
      facing: Direction.Right,
      pokemon: [{ id: 109, level: 29 }, { id: 88, level: 29 }],
      intro: ["POKEMON fight?", "Cool! Rumble!"],
      outtro: ["Blown", "away!"],
      money: 580,
      pos: { x: 8, y: 62 },
      postGame: { message: ["You know who'd", "win, you and me one on one!"] },
    },
  ],
};

export default route14;
