import route18Image from "../../assets/map/gen/route-18.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { birdKeeper } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_18 - do not hand-edit.
const route18: MapType = {
  name: "Route 18",
  image: route18Image,
  height: 18,
  width: 50,
  start: { x: 25, y: 16 },
  walls: {
    0: [6, 7, 8, 9, 10, 11, 12, 13, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    1: [6, 7, 8, 9, 10, 11, 12, 13, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    2: [6, 7, 12, 13, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    3: [6, 7, 12, 13, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    4: [6, 7, 12, 13, 34, 35, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    5: [6, 7, 12, 13, 34, 35, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    6: [6, 7, 12, 13],
    7: [6, 7, 12, 13],
    8: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    9: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    16: [36, 37, 38, 39, 40, 41, 44, 45, 46, 47],
    17: [36, 37, 38, 39, 40, 41, 44, 45, 46, 47],
  },
  text: {
    11: {
      66: ["CYCLING ROAD", "No pedestrians permitted!"],
      67: ["CYCLING ROAD", "No pedestrians permitted!"],
    },
    15: {
      86: ["ROUTE 18", "CELADON CITY - FUCHSIA CITY"],
      87: ["ROUTE 18", "CELADON CITY - FUCHSIA CITY"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.Route17, pos: { x: 0, y: 142 } },
      1: { map: MapId.Route17, pos: { x: 0, y: 142 } },
      2: { map: MapId.Route17, pos: { x: 2, y: 142 } },
      3: { map: MapId.Route17, pos: { x: 2, y: 142 } },
      4: { map: MapId.Route17, pos: { x: 4, y: 142 } },
      5: { map: MapId.Route17, pos: { x: 4, y: 142 } },
      14: { map: MapId.Route17, pos: { x: 14, y: 142 } },
      15: { map: MapId.Route17, pos: { x: 14, y: 142 } },
      16: { map: MapId.Route17, pos: { x: 16, y: 142 } },
      17: { map: MapId.Route17, pos: { x: 16, y: 142 } },
      18: { map: MapId.Route17, pos: { x: 18, y: 142 } },
      19: { map: MapId.Route17, pos: { x: 18, y: 142 } },
    },
    6: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 14 } },
    },
    7: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 14 } },
    },
    8: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 16 } },
    },
    9: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 16 } },
    },
    10: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 18 } },
    },
    11: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 18 } },
    },
    12: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 20 } },
    },
    13: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 20 } },
    },
    14: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 22 } },
    },
    15: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 22 } },
    },
    16: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 24 } },
      66: { map: MapId.Route18Gate1f, pos: { x: 0, y: 9 } },
      67: { map: MapId.Route18Gate1f, pos: { x: 0, y: 9 } },
      80: { map: MapId.Route18Gate1f, pos: { x: 14, y: 9 } },
      81: { map: MapId.Route18Gate1f, pos: { x: 14, y: 9 } },
    },
    17: {
      49: { map: MapId.FuchsiaCity, pos: { x: 1, y: 24 } },
      66: { map: MapId.Route18Gate1f, pos: { x: 0, y: 9 } },
      67: { map: MapId.Route18Gate1f, pos: { x: 0, y: 9 } },
      80: { map: MapId.Route18Gate1f, pos: { x: 14, y: 9 } },
      81: { map: MapId.Route18Gate1f, pos: { x: 14, y: 9 } },
    },
    18: {
      66: { map: MapId.Route18Gate1f, pos: { x: 0, y: 11 } },
      67: { map: MapId.Route18Gate1f, pos: { x: 0, y: 11 } },
      80: { map: MapId.Route18Gate1f, pos: { x: 14, y: 11 } },
      81: { map: MapId.Route18Gate1f, pos: { x: 14, y: 11 } },
    },
    19: {
      66: { map: MapId.Route18Gate1f, pos: { x: 0, y: 11 } },
      67: { map: MapId.Route18Gate1f, pos: { x: 0, y: 11 } },
      80: { map: MapId.Route18Gate1f, pos: { x: 14, y: 11 } },
      81: { map: MapId.Route18Gate1f, pos: { x: 14, y: 11 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    0: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 22, 23],
    1: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 22, 23],
    2: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    3: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    4: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    5: [2, 3, 4, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    6: [2, 3, 4, 5],
    7: [2, 3, 4, 5],
    8: [2, 3, 4, 5],
    9: [2, 3, 4, 5],
    10: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    11: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    12: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    13: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    14: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    15: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    16: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    17: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  },
  trainers: [
    {
      npc: birdKeeper,
      facing: Direction.Right,
      pokemon: [{ id: 21, level: 29 }, { id: 22, level: 29 }],
      intro: ["I always check", "every grassy area for new POKEMON."],
      outtro: ["Tch!"],
      money: 725,
      pos: { x: 72, y: 22 },
      postGame: { message: ["I wish I had a", "BIKE!"] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Left,
      pokemon: [{ id: 85, level: 34 }],
      intro: ["Kurukkoo!", "How do you like my bird call?"],
      outtro: ["I", "had to bug you!"],
      money: 850,
      pos: { x: 80, y: 30 },
      postGame: { message: ["I also collect sea", "POKEMON on weekends!"] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Left,
      pokemon: [{ id: 21, level: 26 }, { id: 21, level: 26 }, { id: 22, level: 26 }, { id: 21, level: 26 }],
      intro: ["This is my turf!", "Get out of here!"],
      outtro: ["Darn!"],
      money: 650,
      pos: { x: 84, y: 26 },
      postGame: { message: ["This is my fave", "POKEMON hunting area!"] },
    },
  ],
};

export default route18;
