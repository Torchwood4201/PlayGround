import route3Image from "../../assets/map/gen/route-3.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { bugCatcher, lass, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_3 - do not hand-edit.
const route3: MapType = {
  name: "Route 3",
  image: route3Image,
  height: 18,
  width: 70,
  start: { x: 35, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 66, 67, 68, 69],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 66, 67, 68, 69],
    2: [0, 1, 2, 3, 4, 5, 6, 7, 30, 31, 52, 53, 66, 67, 68, 69],
    3: [0, 1, 2, 3, 4, 5, 6, 7, 30, 31, 52, 53, 66, 67, 68, 69],
    4: [0, 1, 2, 3, 4, 5, 6, 7, 30, 31, 52, 53, 60, 61, 64, 65, 66, 67, 68, 69],
    5: [0, 1, 2, 3, 4, 5, 6, 7, 30, 31, 52, 53, 60, 61, 64, 65, 66, 67, 68, 69],
    6: [38, 39, 52, 53, 68, 69],
    7: [38, 39, 52, 53, 68, 69],
    8: [40, 41, 68, 69],
    9: [40, 41, 68, 69],
    10: [40, 41, 68, 69],
    11: [40, 41, 68, 69],
    12: [40, 41, 68, 69],
    13: [40, 41, 68, 69],
    14: [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 40, 41, 44, 45, 66, 67, 68, 69],
    15: [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 40, 41, 44, 45, 66, 67, 68, 69],
    16: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 40, 41, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    17: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 40, 41, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
  },
  text: {
    19: {
      118: ["ROUTE 3", "MT.MOON AHEAD"],
      119: ["ROUTE 3", "MT.MOON AHEAD"],
    },
  },
  maps: {
    0: {
      54: { map: MapId.Route4, pos: { x: 4, y: 16 } },
      55: { map: MapId.Route4, pos: { x: 4, y: 16 } },
      56: { map: MapId.Route4, pos: { x: 6, y: 16 } },
      57: { map: MapId.Route4, pos: { x: 6, y: 16 } },
      58: { map: MapId.Route4, pos: { x: 8, y: 16 } },
      59: { map: MapId.Route4, pos: { x: 8, y: 16 } },
      60: { map: MapId.Route4, pos: { x: 10, y: 16 } },
      61: { map: MapId.Route4, pos: { x: 10, y: 16 } },
      62: { map: MapId.Route4, pos: { x: 12, y: 16 } },
      63: { map: MapId.Route4, pos: { x: 12, y: 16 } },
      64: { map: MapId.Route4, pos: { x: 14, y: 15 } },
      65: { map: MapId.Route4, pos: { x: 14, y: 15 } },
    },
    6: {
      0: MapId.PewterCity,
    },
    7: {
      0: MapId.PewterCity,
    },
    8: {
      0: MapId.PewterCity,
    },
    9: {
      0: MapId.PewterCity,
    },
    10: {
      0: MapId.PewterCity,
    },
    11: {
      0: MapId.PewterCity,
    },
    12: {
      0: MapId.PewterCity,
    },
    13: {
      0: MapId.PewterCity,
    },
    16: {
      0: MapId.PewterCity,
    },
    17: {
      0: MapId.PewterCity,
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: bugCatcher,
      facing: Direction.Right,
      pokemon: [{ id: 10, level: 10 }, { id: 13, level: 10 }, { id: 10, level: 10 }],
      intro: ["Hey! I met you in", "VIRIDIAN FOREST!"],
      outtro: ["You", "beat me again!"],
      money: 100,
      pos: { x: 20, y: 12 },
      postGame: { message: ["There are other", "kinds of POKEMON than those found in the", "forest!"] },
    },
    {
      npc: youngster,
      facing: Direction.Down,
      pokemon: [{ id: 19, level: 11 }, { id: 23, level: 11 }],
      intro: ["Hi! I like shorts!", "They're comfy and easy to wear!"],
      outtro: ["I don't", "believe it!"],
      money: 165,
      pos: { x: 28, y: 8 },
      postGame: { message: ["Are you storing", "your POKEMON on PC? Each BOX can hold 20", "POKEMON!"] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 16, level: 9 }, { id: 16, level: 9 }],
      intro: ["You looked at me,", "didn't you?"],
      outtro: ["You're", "mean!"],
      money: 135,
      pos: { x: 32, y: 18 },
      postGame: { message: ["Quit staring if", "you don't want to fight!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Down,
      pokemon: [{ id: 13, level: 9 }, { id: 14, level: 9 }, { id: 10, level: 9 }, { id: 11, level: 9 }],
      intro: ["Are you a trainer?", "Let's fight!"],
      outtro: ["If I", "had new POKEMON I would've won!"],
      money: 90,
      pos: { x: 38, y: 10 },
      postGame: { message: ["If a POKEMON BOX", "on the PC gets full, just switch to", "another BOX!"] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 19, level: 10 }, { id: 32, level: 10 }],
      intro: ["That look you", "gave me, it's so intriguing!"],
      outtro: ["Be nice!"],
      money: 150,
      pos: { x: 46, y: 8 },
      postGame: { message: ["Avoid fights by", "not letting people see you!"] },
    },
    {
      npc: youngster,
      facing: Direction.Left,
      pokemon: [{ id: 21, level: 14 }],
      intro: ["Hey! You're not", "wearing shorts!"],
      outtro: ["Lost!", "Lost! Lost!"],
      money: 210,
      pos: { x: 44, y: 18 },
      postGame: { message: ["I always wear", "shorts, even in winter!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Right,
      pokemon: [{ id: 10, level: 11 }, { id: 11, level: 11 }],
      intro: ["You can fight my", "new POKEMON!"],
      outtro: ["Done", "like dinner!"],
      money: 110,
      pos: { x: 48, y: 12 },
      postGame: { message: ["Trained POKEMON", "are stronger than the wild ones!"] },
    },
    {
      npc: lass,
      facing: Direction.Up,
      pokemon: [{ id: 39, level: 14 }],
      intro: ["Eek! Did you", "touch me?"],
      outtro: ["That's it?"],
      money: 210,
      pos: { x: 66, y: 20 },
      postGame: { message: ["ROUTE 4 is at the", "foot of MT.MOON."] },
    },
  ],
};

export default route3;
