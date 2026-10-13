import route4Image from "../../assets/map/gen/route-4.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_4 - do not hand-edit.
const route4: MapType = {
  name: "Route 4",
  image: route4Image,
  height: 18,
  width: 90,
  start: { x: 45, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 82, 83, 84, 85, 86, 87, 88, 89],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 82, 83, 84, 85, 86, 87, 88, 89],
    2: [0, 1, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 38, 39, 50, 51, 54, 55, 60, 61, 72, 73, 74, 75, 76, 77, 78, 79],
    3: [0, 1, 10, 11, 12, 13, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 38, 39, 50, 51, 54, 55, 60, 61, 72, 73, 74, 75, 76, 77, 78, 79],
    4: [0, 1, 42, 43, 50, 51, 54, 55],
    5: [0, 1, 42, 43, 50, 51, 54, 55],
    6: [0, 1, 24, 25, 28, 29, 50, 51],
    7: [0, 1, 24, 25, 28, 29, 50, 51],
    8: [0, 1, 44, 45],
    9: [0, 1, 44, 45],
    10: [0, 1, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
    11: [0, 1, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
    12: [0, 1, 22, 23],
    13: [0, 1, 22, 23],
    14: [0, 1, 2, 3, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    15: [0, 1, 2, 3, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    16: [0, 1, 2, 3, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    17: [0, 1, 2, 3, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  },
  text: {
    11: {
      24: ["Heal Your POKEMON!", "POKEMON CENTER"],
      25: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    15: {
      34: ["MT.MOON", "Tunnel Entrance"],
      35: ["MT.MOON", "Tunnel Entrance"],
      54: ["ROUTE 4", "MT.MOON - CERULEAN CITY"],
      55: ["ROUTE 4", "MT.MOON - CERULEAN CITY"],
    },
  },
  maps: {
    2: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 10 } },
    },
    3: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 10 } },
    },
    6: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 14 } },
    },
    7: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 14 } },
    },
    8: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 16 } },
    },
    9: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 16 } },
    },
    10: {
      22: { map: MapId.Route3PokemonCenter, pos: { x: 6, y: 15 } },
      23: { map: MapId.Route3PokemonCenter, pos: { x: 6, y: 15 } },
      36: { map: MapId.MtMoon1f, pos: { x: 28, y: 71 } },
      37: { map: MapId.MtMoon1f, pos: { x: 28, y: 71 } },
      48: { map: MapId.MtMoon2f, pos: { x: 54, y: 7 } },
      49: { map: MapId.MtMoon2f, pos: { x: 54, y: 7 } },
    },
    11: {
      22: { map: MapId.Route3PokemonCenter, pos: { x: 6, y: 15 } },
      23: { map: MapId.Route3PokemonCenter, pos: { x: 6, y: 15 } },
      36: { map: MapId.MtMoon1f, pos: { x: 28, y: 71 } },
      37: { map: MapId.MtMoon1f, pos: { x: 28, y: 71 } },
      48: { map: MapId.MtMoon2f, pos: { x: 54, y: 7 } },
      49: { map: MapId.MtMoon2f, pos: { x: 54, y: 7 } },
    },
    12: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 20 } },
    },
    13: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 20 } },
    },
    14: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 22 } },
    },
    15: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 22 } },
    },
    16: {
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 24 } },
    },
    17: {
      4: MapId.Route3,
      5: MapId.Route3,
      6: MapId.Route3,
      7: MapId.Route3,
      8: MapId.Route3,
      9: MapId.Route3,
      10: MapId.Route3,
      11: MapId.Route3,
      12: MapId.Route3,
      13: MapId.Route3,
      16: MapId.Route3,
      17: MapId.Route3,
      18: MapId.Route3,
      19: MapId.Route3,
      89: { map: MapId.CeruleanCity, pos: { x: 1, y: 24 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route3,
  exitReturnPos: { x: 4, y: 2 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    6: [82, 83, 84, 85, 86, 87, 88, 89],
    7: [82, 83, 84, 85, 86, 87, 88, 89],
    8: [82, 83, 84, 85, 86, 87, 88, 89],
    9: [82, 83, 84, 85, 86, 87, 88, 89],
  },
  trainers: [
    {
      npc: lass,
      facing: Direction.Right,
      pokemon: [{ id: 46, level: 31 }, { id: 46, level: 31 }, { id: 47, level: 31 }],
      intro: ["I came to get my", "mushroom POKEMON!"],
      outtro: ["Oh! My cute", "mushroom POKEMON!"],
      money: 465,
      pos: { x: 126, y: 6 },
      postGame: { message: ["There might not", "be any more mushrooms here.", "I think I got", "them all."] },
    },
  ],
  items: [
    { item: ItemType.Tm04, pos: { x: 114, y: 7 } },
  ],
};

export default route4;
