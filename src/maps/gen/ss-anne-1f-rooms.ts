import ssanne1froomsImage from "../../assets/map/gen/ss-anne-1f-rooms.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, lass, youngster } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_1F_ROOMS - do not hand-edit.
const ssAnne1fRooms: MapType = {
  name: "SS Anne 1F Rooms",
  image: ssanne1froomsImage,
  height: 16,
  width: 24,
  start: { x: 12, y: 14 },
  walls: {},
  text: {
    6: {
      44: ["Waiter, I would", "like a cherry pie please!"],
    },
    22: {
      4: ["I always travel", "with WIGGLYTUFF!"],
      6: ["WIGGLYTUFF: Puup", "pupuu!"],
    },
    26: {
      20: ["We are cruising", "around the world."],
      42: ["Ssh! I'm a GLOBAL", "POLICE agent!", "I'm on the trail", "of TEAM ROCKET!"],
    },
    28: {
      0: ["A cruise is so", "elegant yet cozy!"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.SsAnne1f, pos: { x: 62, y: 17 } },
      1: { map: MapId.SsAnne1f, pos: { x: 62, y: 17 } },
      20: { map: MapId.SsAnne1f, pos: { x: 46, y: 17 } },
      21: { map: MapId.SsAnne1f, pos: { x: 46, y: 17 } },
      40: { map: MapId.SsAnne1f, pos: { x: 38, y: 17 } },
      41: { map: MapId.SsAnne1f, pos: { x: 38, y: 17 } },
    },
    1: {
      0: { map: MapId.SsAnne1f, pos: { x: 62, y: 17 } },
      1: { map: MapId.SsAnne1f, pos: { x: 62, y: 17 } },
      20: { map: MapId.SsAnne1f, pos: { x: 46, y: 17 } },
      21: { map: MapId.SsAnne1f, pos: { x: 46, y: 17 } },
      40: { map: MapId.SsAnne1f, pos: { x: 38, y: 17 } },
      41: { map: MapId.SsAnne1f, pos: { x: 38, y: 17 } },
    },
    20: {
      0: { map: MapId.SsAnne1f, pos: { x: 30, y: 17 } },
      1: { map: MapId.SsAnne1f, pos: { x: 30, y: 17 } },
      20: { map: MapId.SsAnne1f, pos: { x: 22, y: 17 } },
      21: { map: MapId.SsAnne1f, pos: { x: 22, y: 17 } },
      40: { map: MapId.SsAnne1f, pos: { x: 14, y: 17 } },
      41: { map: MapId.SsAnne1f, pos: { x: 14, y: 17 } },
    },
    21: {
      0: { map: MapId.SsAnne1f, pos: { x: 30, y: 17 } },
      1: { map: MapId.SsAnne1f, pos: { x: 30, y: 17 } },
      20: { map: MapId.SsAnne1f, pos: { x: 22, y: 17 } },
      21: { map: MapId.SsAnne1f, pos: { x: 22, y: 17 } },
      40: { map: MapId.SsAnne1f, pos: { x: 14, y: 17 } },
      41: { map: MapId.SsAnne1f, pos: { x: 14, y: 17 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: gentleman,
      facing: Direction.Left,
      pokemon: [{ id: 58, level: 18 }, { id: 58, level: 18 }],
      intro: ["I travel alone", "on my journeys!", "My POKEMON are my", "only friends!"],
      outtro: ["My, my", "friends..."],
      money: 1260,
      pos: { x: 4, y: 6 },
      postGame: { message: ["You should be", "nice to friends!"] },
    },
    {
      npc: gentleman,
      facing: Direction.Up,
      pokemon: [{ id: 32, level: 19 }, { id: 29, level: 19 }],
      intro: ["You pup! How dare", "you barge in!"],
      outtro: ["Humph!", "You rude child!"],
      money: 1330,
      pos: { x: 22, y: 8 },
      postGame: { message: ["I wish to be left", "alone! Get out!"] },
    },
    {
      npc: youngster,
      facing: Direction.Up,
      pokemon: [{ id: 32, level: 21 }],
      intro: ["I love POKEMON!", "Do you?"],
      outtro: ["Wow!", "You're great!"],
      money: 315,
      pos: { x: 22, y: 28 },
      postGame: { message: ["Let me be your", "friend, OK?", "Then we can trade", "POKEMON!"] },
    },
    {
      npc: lass,
      facing: Direction.Left,
      pokemon: [{ id: 16, level: 18 }, { id: 29, level: 18 }],
      intro: ["I collected these", "POKEMON from all around the world!"],
      outtro: ["Oh no!", "I went around the world for these!"],
      money: 270,
      pos: { x: 26, y: 22 },
      postGame: { message: ["You hurt my poor", "worldly POKEMON!", "I demand that you", "heal them at a POKEMON CENTER!"] },
    },
  ],
  items: [
    { item: ItemType.Tm08, pos: { x: 24, y: 31 } },
  ],
  npcs: [
    { npc: lass, pos: { x: 44, y: 6 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 0, y: 28 }, facing: Direction.Down },
    { npc: lass, pos: { x: 4, y: 22 }, facing: Direction.Down },
    { npc: lass, pos: { x: 6, y: 22 }, facing: Direction.Down },
    { npc: lass, pos: { x: 20, y: 26 }, facing: Direction.Right },
    { npc: gentleman, pos: { x: 42, y: 26 }, facing: Direction.Down },
  ],
};

export default ssAnne1fRooms;
