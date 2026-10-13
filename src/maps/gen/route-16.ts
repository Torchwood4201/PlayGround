import route16Image from "../../assets/map/gen/route-16.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { biker, cueBall } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_16 - do not hand-edit.
const route16: MapType = {
  name: "Route 16",
  image: route16Image,
  height: 18,
  width: 40,
  start: { x: 20, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    2: [18, 19, 22, 23],
    3: [18, 19, 22, 23],
    6: [18, 19, 22, 23],
    7: [18, 19, 22, 23],
    10: [2, 3, 8, 9, 10, 11, 12, 13, 16, 17],
    11: [2, 3, 8, 9, 10, 11, 12, 13, 16, 17],
    12: [2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    13: [2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    14: [2, 3, 8, 9, 10, 11],
    15: [2, 3, 8, 9, 10, 11],
    16: [2, 3, 6, 7, 8, 9],
    17: [2, 3, 6, 7, 8, 9],
  },
  text: {
    23: {
      54: ["Enjoy the slope!", "CYCLING ROAD"],
      55: ["Enjoy the slope!", "CYCLING ROAD"],
    },
    35: {
      10: ["ROUTE 16", "CELADON CITY - FUCHSIA CITY"],
      11: ["ROUTE 16", "CELADON CITY - FUCHSIA CITY"],
    },
  },
  maps: {
    0: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 8 } },
    },
    1: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 8 } },
    },
    2: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 10 } },
    },
    3: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 10 } },
    },
    4: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 12 } },
    },
    5: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 12 } },
    },
    6: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 14 } },
    },
    7: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 14 } },
    },
    8: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 5 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 5 } },
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 16 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 5 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 5 } },
    },
    9: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 5 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 5 } },
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 16 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 5 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 5 } },
    },
    10: {
      14: { map: MapId.Route16FlyHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.Route16FlyHouse, pos: { x: 4, y: 15 } },
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 7 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 7 } },
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 18 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 7 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 7 } },
    },
    11: {
      14: { map: MapId.Route16FlyHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.Route16FlyHouse, pos: { x: 4, y: 15 } },
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 7 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 7 } },
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 18 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 7 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 7 } },
    },
    12: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 20 } },
    },
    13: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 20 } },
    },
    14: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 22 } },
    },
    15: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 22 } },
    },
    16: {
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 24 } },
    },
    17: {
      0: { map: MapId.Route17, pos: { x: 0, y: 1 } },
      1: { map: MapId.Route17, pos: { x: 0, y: 1 } },
      4: { map: MapId.Route17, pos: { x: 4, y: 1 } },
      5: { map: MapId.Route17, pos: { x: 4, y: 1 } },
      10: { map: MapId.Route17, pos: { x: 10, y: 1 } },
      11: { map: MapId.Route17, pos: { x: 10, y: 1 } },
      12: { map: MapId.Route17, pos: { x: 12, y: 1 } },
      13: { map: MapId.Route17, pos: { x: 12, y: 1 } },
      14: { map: MapId.Route17, pos: { x: 14, y: 1 } },
      15: { map: MapId.Route17, pos: { x: 14, y: 1 } },
      16: { map: MapId.Route17, pos: { x: 16, y: 1 } },
      17: { map: MapId.Route17, pos: { x: 16, y: 1 } },
      18: { map: MapId.Route17, pos: { x: 18, y: 1 } },
      19: { map: MapId.Route17, pos: { x: 18, y: 1 } },
      39: { map: MapId.CeladonCity, pos: { x: 1, y: 24 } },
    },
    20: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 17 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 17 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 17 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 17 } },
    },
    21: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 17 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 17 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 17 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 17 } },
    },
    22: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 19 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 19 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 19 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 19 } },
    },
    23: {
      34: { map: MapId.Route16Gate1f, pos: { x: 0, y: 19 } },
      35: { map: MapId.Route16Gate1f, pos: { x: 0, y: 19 } },
      48: { map: MapId.Route16Gate1f, pos: { x: 14, y: 19 } },
      49: { map: MapId.Route16Gate1f, pos: { x: 14, y: 19 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route17,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    16: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    17: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  trainers: [
    {
      npc: biker,
      facing: Direction.Left,
      pokemon: [{ id: 88, level: 29 }, { id: 109, level: 29 }],
      intro: ["What do you want?"],
      outtro: ["Don't you", "dare laugh!"],
      money: 580,
      pos: { x: 34, y: 24 },
      postGame: { message: ["We like just", "hanging here, what's it to you?"] },
    },
    {
      npc: cueBall,
      facing: Direction.Right,
      pokemon: [{ id: 66, level: 28 }, { id: 56, level: 28 }, { id: 66, level: 28 }],
      intro: ["Nice BIKE!", "Hand it over!"],
      outtro: ["Knock", "out!"],
      money: 700,
      pos: { x: 28, y: 26 },
      postGame: { message: ["Forget it, who", "needs your BIKE!"] },
    },
    {
      npc: cueBall,
      facing: Direction.Up,
      pokemon: [{ id: 56, level: 29 }, { id: 66, level: 29 }],
      intro: ["Come out and play,", "little mouse!"],
      outtro: ["You", "little rat!"],
      money: 725,
      pos: { x: 22, y: 24 },
      postGame: { message: ["I hate losing!", "Get away from me!"] },
    },
    {
      npc: biker,
      facing: Direction.Left,
      pokemon: [{ id: 110, level: 33 }],
      intro: ["Hey, you just", "bumped me!"],
      outtro: ["Kaboom!"],
      money: 660,
      pos: { x: 18, y: 22 },
      postGame: { message: ["You can also get", "to FUCHSIA from VERMILION using a", "coastal road."] },
    },
    {
      npc: cueBall,
      facing: Direction.Right,
      pokemon: [{ id: 66, level: 33 }],
      intro: ["I'm feeling", "hungry and mean!"],
      outtro: ["Bad,", "bad, bad!"],
      money: 825,
      pos: { x: 12, y: 20 },
      postGame: { message: ["I like my POKEMON", "ferocious! They tear up enemies!"] },
    },
    {
      npc: biker,
      facing: Direction.Right,
      pokemon: [{ id: 88, level: 26 }, { id: 88, level: 26 }, { id: 88, level: 26 }, { id: 88, level: 26 }],
      intro: ["Sure, I'll go!"],
      outtro: ["Don't make", "me mad!"],
      money: 520,
      pos: { x: 6, y: 24 },
      postGame: { message: ["I like harassing", "people with my vicious POKEMON!"] },
    },
  ],
};

export default route16;
