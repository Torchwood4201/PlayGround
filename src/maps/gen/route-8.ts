import route8Image from "../../assets/map/gen/route-8.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gambler, lass, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_8 - do not hand-edit.
const route8: MapType = {
  name: "Route 8",
  image: route8Image,
  height: 18,
  width: 60,
  start: { x: 30, y: 16 },
  walls: {
    0: [6, 7, 8, 9],
    1: [6, 7, 8, 9],
    4: [18, 19, 20, 21, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    5: [18, 19, 20, 21, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    6: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    7: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    8: [2, 3, 6, 7, 18, 19, 20, 21],
    9: [2, 3, 6, 7, 18, 19, 20, 21],
    10: [56, 57],
    11: [56, 57],
    14: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    15: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    16: [4, 5, 56, 57, 58, 59],
    17: [4, 5, 56, 57, 58, 59],
  },
  text: {
    7: {
      34: ["UNDERGROUND PATH", "CELADON CITY - LAVENDER TOWN"],
      35: ["UNDERGROUND PATH", "CELADON CITY - LAVENDER TOWN"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 0 } },
    },
    1: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 0 } },
    },
    2: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 2 } },
    },
    3: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 2 } },
    },
    4: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 4 } },
    },
    5: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 4 } },
    },
    6: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 14 } },
      26: { map: MapId.UndergroundPathRoute8, pos: { x: 6, y: 15 } },
      27: { map: MapId.UndergroundPathRoute8, pos: { x: 6, y: 15 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 6 } },
    },
    7: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 14 } },
      26: { map: MapId.UndergroundPathRoute8, pos: { x: 6, y: 15 } },
      27: { map: MapId.UndergroundPathRoute8, pos: { x: 6, y: 15 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 6 } },
    },
    8: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 16 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 8 } },
    },
    9: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 16 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 8 } },
    },
    10: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 10 } },
    },
    11: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 10 } },
    },
    12: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 20 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 12 } },
    },
    13: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 20 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 12 } },
    },
    14: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 22 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 14 } },
    },
    15: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 22 } },
      59: { map: MapId.LavenderTown, pos: { x: 1, y: 14 } },
    },
    16: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 24 } },
    },
    17: {
      0: { map: MapId.SaffronCity, pos: { x: 38, y: 24 } },
    },
    18: {
      2: { map: MapId.Route8Gate, pos: { x: 0, y: 7 } },
      3: { map: MapId.Route8Gate, pos: { x: 0, y: 7 } },
      16: { map: MapId.Route8Gate, pos: { x: 10, y: 7 } },
      17: { map: MapId.Route8Gate, pos: { x: 10, y: 7 } },
    },
    19: {
      2: { map: MapId.Route8Gate, pos: { x: 0, y: 7 } },
      3: { map: MapId.Route8Gate, pos: { x: 0, y: 7 } },
      16: { map: MapId.Route8Gate, pos: { x: 10, y: 7 } },
      17: { map: MapId.Route8Gate, pos: { x: 10, y: 7 } },
    },
    20: {
      2: { map: MapId.Route8Gate, pos: { x: 0, y: 9 } },
      3: { map: MapId.Route8Gate, pos: { x: 0, y: 9 } },
      16: { map: MapId.Route8Gate, pos: { x: 10, y: 9 } },
      17: { map: MapId.Route8Gate, pos: { x: 10, y: 9 } },
    },
    21: {
      2: { map: MapId.Route8Gate, pos: { x: 0, y: 9 } },
      3: { map: MapId.Route8Gate, pos: { x: 0, y: 9 } },
      16: { map: MapId.Route8Gate, pos: { x: 10, y: 9 } },
      17: { map: MapId.Route8Gate, pos: { x: 10, y: 9 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    10: [40, 41],
    11: [40, 41],
    12: [28, 29],
    13: [28, 29],
  },
  trainers: [
    {
      npc: superNerd,
      facing: Direction.Right,
      pokemon: [{ id: 100, level: 20 }, { id: 109, level: 20 }, { id: 100, level: 20 }, { id: 81, level: 20 }],
      intro: ["You look good at", "POKEMON, but how's your chem?"],
      outtro: ["Ow!", "Meltdown!"],
      money: 500,
      pos: { x: 16, y: 10 },
      postGame: { message: ["I am better at", "school than this!"] },
    },
    {
      npc: gambler,
      facing: Direction.Up,
      pokemon: [{ id: 60, level: 22 }, { id: 60, level: 22 }, { id: 61, level: 22 }],
      intro: ["All right! Let's", "roll the dice!"],
      outtro: ["Drat!", "Came up short!"],
      money: 1540,
      pos: { x: 26, y: 18 },
      postGame: { message: ["Lady Luck's not", "with me today!"] },
    },
    {
      npc: superNerd,
      facing: Direction.Up,
      pokemon: [{ id: 88, level: 22 }, { id: 89, level: 22 }, { id: 88, level: 22 }],
      intro: ["You need strategy", "to win at this!"],
      outtro: ["It's", "not logical!"],
      money: 550,
      pos: { x: 84, y: 12 },
      postGame: { message: ["Go with GRIMER", "first...and... ...and...then..."] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 29, level: 23 }, { id: 30, level: 23 }],
      intro: ["I like NIDORAN, so", "I collect them!"],
      outtro: ["Why? Why??"],
      money: 345,
      pos: { x: 52, y: 6 },
      postGame: { message: ["When POKEMON grow", "up they get ugly! They shouldn't", "evolve!"] },
    },
    {
      npc: superNerd,
      facing: Direction.Right,
      pokemon: [{ id: 109, level: 26 }],
      intro: ["School is fun, but", "so are POKEMON."],
      outtro: ["I'll", "stay with school."],
      money: 650,
      pos: { x: 52, y: 8 },
      postGame: { message: ["We're stuck here", "because of the gates at SAFFRON."] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 52, level: 24 }, { id: 52, level: 24 }, { id: 52, level: 24 }],
      intro: ["MEOWTH is so cute,", "meow, meow, meow!"],
      outtro: ["Meow!"],
      money: 360,
      pos: { x: 52, y: 10 },
      postGame: { message: ["I think PIDGEY", "and RATTATA are cute too!"] },
    },
    {
      npc: lass,
      facing: Direction.Right,
      pokemon: [{ id: 16, level: 19 }, { id: 19, level: 19 }, { id: 32, level: 19 }, { id: 52, level: 19 }, { id: 25, level: 19 }],
      intro: ["We must look", "silly standing here like this!"],
      outtro: ["Look what", "you did!"],
      money: 285,
      pos: { x: 52, y: 12 },
      postGame: { message: ["SAFFRON's gate", "keeper won't let us through. He's so", "mean!"] },
    },
    {
      npc: gambler,
      facing: Direction.Down,
      pokemon: [{ id: 58, level: 24 }, { id: 37, level: 24 }],
      intro: ["I'm a rambling,", "gambling dude!"],
      outtro: ["Missed", "the big score!"],
      money: 1680,
      pos: { x: 92, y: 26 },
      postGame: { message: ["Gambling and", "POKEMON are like eating peanuts! Just", "can't stop!"] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 35, level: 22 }, { id: 35, level: 22 }],
      intro: ["What's a cute,", "round and fluffy POKEMON?"],
      outtro: ["Stop!", "Don't be so mean", "to my CLEFAIRY!"],
      money: 330,
      pos: { x: 102, y: 24 },
      postGame: { message: ["I heard that", "CLEFAIRY evolves when it's exposed to", "a MOON STONE."] },
    },
  ],
};

export default route8;
