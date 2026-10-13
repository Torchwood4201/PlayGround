import route9Image from "../../assets/map/gen/route-9.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { bugCatcher, hiker, jrTrainerFemale, jrTrainerMale } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_9 - do not hand-edit.
const route9: MapType = {
  name: "Route 9",
  image: route9Image,
  height: 18,
  width: 60,
  start: { x: 30, y: 16 },
  walls: {
    0: [54, 55, 56, 57],
    1: [54, 55, 56, 57],
    2: [26, 27, 54, 55, 56, 57],
    3: [26, 27, 54, 55, 56, 57],
    4: [16, 17, 46, 47, 54, 55, 56, 57],
    5: [16, 17, 46, 47, 54, 55, 56, 57],
    6: [0, 1, 2, 3, 20, 21, 22, 23, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 50, 51],
    7: [0, 1, 2, 3, 20, 21, 22, 23, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 50, 51],
    8: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 30, 31, 34, 35, 36, 37, 40, 41, 42, 43, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    9: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 30, 31, 34, 35, 36, 37, 40, 41, 42, 43, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    10: [6, 7, 20, 21, 22, 23, 24, 25, 26, 27, 48, 49, 54, 55],
    11: [6, 7, 20, 21, 22, 23, 24, 25, 26, 27, 48, 49, 54, 55],
    12: [24, 25, 56, 57, 58, 59],
    13: [24, 25, 56, 57, 58, 59],
    14: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 56, 57, 58, 59],
    15: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 56, 57, 58, 59],
    16: [8, 9, 24, 25, 26, 27, 54, 55, 56, 57, 58, 59],
    17: [8, 9, 24, 25, 26, 27, 54, 55, 56, 57, 58, 59],
  },
  text: {
    15: {
      50: ["ROUTE 9", "CERULEAN CITY- ROCK TUNNEL"],
      51: ["ROUTE 9", "CERULEAN CITY- ROCK TUNNEL"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 0 } },
    },
    1: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 0 } },
    },
    2: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 2 } },
    },
    3: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 2 } },
    },
    4: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 4 } },
    },
    5: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 4 } },
    },
    6: {
      59: { map: MapId.Route10, pos: { x: 1, y: 6 } },
    },
    7: {
      59: { map: MapId.Route10, pos: { x: 1, y: 6 } },
    },
    8: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 16 } },
    },
    9: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 16 } },
    },
    10: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 10 } },
    },
    11: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.Route10, pos: { x: 1, y: 10 } },
    },
    12: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 20 } },
    },
    13: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 20 } },
    },
    14: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 22 } },
    },
    15: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 22 } },
    },
    16: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 24 } },
    },
    17: {
      0: { map: MapId.CeruleanCity, pos: { x: 38, y: 24 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    8: [4, 5],
    9: [4, 5],
  },
  trainers: [
    {
      npc: jrTrainerFemale,
      facing: Direction.Left,
      pokemon: [{ id: 43, level: 18 }, { id: 69, level: 18 }, { id: 43, level: 18 }, { id: 69, level: 18 }],
      intro: ["You have POKEMON", "with you! You're mine!"],
      outtro: ["You", "deceived me!"],
      money: 360,
      pos: { x: 26, y: 20 },
      postGame: { message: ["You need light to", "get through that dark tunnel ahead."] },
    },
    {
      npc: jrTrainerMale,
      facing: Direction.Left,
      pokemon: [{ id: 58, level: 21 }, { id: 4, level: 21 }],
      intro: ["Who's that walking", "with those good looking POKEMON?"],
      outtro: ["Out", "like a light!"],
      money: 420,
      pos: { x: 48, y: 14 },
      postGame: { message: ["Keep walking!"] },
    },
    {
      npc: jrTrainerMale,
      facing: Direction.Right,
      pokemon: [{ id: 19, level: 19 }, { id: 50, level: 19 }, { id: 23, level: 19 }, { id: 27, level: 19 }],
      intro: ["I'm taking ROCK", "TUNNEL to go to LAVENDER..."],
      outtro: ["Can't", "measure up!"],
      money: 380,
      pos: { x: 62, y: 14 },
      postGame: { message: ["Are you off to", "ROCK TUNNEL too?"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 52, level: 23 }],
      intro: ["Don't you dare", "condescend me!"],
      outtro: ["No!", "You're too much!"],
      money: 460,
      pos: { x: 96, y: 16 },
      postGame: { message: ["You're obviously", "talented! Good luck to you!"] },
    },
    {
      npc: hiker,
      facing: Direction.Left,
      pokemon: [{ id: 66, level: 20 }, { id: 95, level: 20 }],
      intro: ["Bwahaha!", "Great! I was bored, eh!"],
      outtro: ["Keep it", "coming, eh!", "Oh wait. I'm out", "of POKEMON!"],
      money: 700,
      pos: { x: 32, y: 30 },
      postGame: { message: ["You sure had guts", "standing up to me there, eh?"] },
    },
    {
      npc: hiker,
      facing: Direction.Left,
      pokemon: [{ id: 74, level: 20 }, { id: 66, level: 20 }, { id: 74, level: 20 }],
      intro: ["Hahaha!", "Aren't you a little toughie!"],
      outtro: ["What's", "that?"],
      money: 700,
      pos: { x: 86, y: 6 },
      postGame: { message: ["Hahaha! Kids", "should be tough!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Down,
      pokemon: [{ id: 15, level: 19 }, { id: 15, level: 19 }],
      intro: ["I got up early", "every day to raise my POKEMON from", "cocoons!"],
      outtro: ["WHAT?", "What a total", "waste of time!"],
      money: 190,
      pos: { x: 44, y: 4 },
      postGame: { message: ["I have to collect", "more than bugs to get stronger..."] },
    },
    {
      npc: hiker,
      facing: Direction.Right,
      pokemon: [{ id: 74, level: 21 }, { id: 95, level: 21 }],
      intro: ["Hahahaha!", "Come on, dude!"],
      outtro: ["Hahahaha!", "You beat me fair!"],
      money: 735,
      pos: { x: 90, y: 30 },
      postGame: { message: ["Hahahaha!", "Us hearty guys always laugh!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Right,
      pokemon: [{ id: 10, level: 20 }, { id: 13, level: 20 }, { id: 48, level: 20 }],
      intro: ["Go, my super bug", "POKEMON!"],
      outtro: ["My", "bugs..."],
      money: 200,
      pos: { x: 80, y: 16 },
      postGame: { message: ["If you don't like", "bug POKEMON, you bug me!"] },
    },
  ],
  items: [
    { item: ItemType.Tm30, pos: { x: 20, y: 31 } },
  ],
};

export default route9;
