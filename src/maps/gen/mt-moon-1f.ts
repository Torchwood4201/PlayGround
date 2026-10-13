import mtmoon1fImage from "../../assets/map/gen/mt-moon-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { bugCatcher, hiker, lass, superNerd, youngster } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered MT_MOON_1F - do not hand-edit.
const mtMoon1f: MapType = {
  name: "Mt Moon 1F",
  image: mtmoon1fImage,
  height: 36,
  width: 40,
  start: { x: 28, y: 71 },
  walls: {
    0: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    1: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    8: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    9: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    18: [2, 3, 4, 5, 6, 7],
    19: [2, 3, 4, 5, 6, 7],
    20: [10, 11, 12, 13, 14, 15, 16, 17],
    21: [10, 11, 12, 13, 14, 15, 16, 17],
    22: [14, 15],
    23: [14, 15],
    26: [20, 21, 22, 23],
    27: [20, 21, 22, 23],
    28: [16, 17, 18, 19, 26, 27, 28, 29],
    29: [16, 17, 18, 19, 26, 27, 28, 29],
    30: [16, 17, 18, 19],
    31: [16, 17, 18, 19],
    32: [10, 11, 12, 13, 16, 17, 18, 19],
    33: [10, 11, 12, 13, 16, 17, 18, 19],
    34: [2, 3, 4, 5, 6, 7, 8, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    35: [2, 3, 4, 5, 6, 7, 8, 9, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
  },
  text: {
    47: {
      30: ["Beware! ZUBAT is", "a blood sucker!"],
      31: ["Beware! ZUBAT is", "a blood sucker!"],
    },
  },
  maps: {
    10: {
      10: { map: MapId.MtMoon2f, pos: { x: 10, y: 11 } },
      11: { map: MapId.MtMoon2f, pos: { x: 10, y: 11 } },
    },
    11: {
      10: { map: MapId.MtMoon2f, pos: { x: 10, y: 11 } },
      11: { map: MapId.MtMoon2f, pos: { x: 10, y: 11 } },
    },
    22: {
      34: { map: MapId.MtMoon2f, pos: { x: 50, y: 19 } },
      35: { map: MapId.MtMoon2f, pos: { x: 50, y: 19 } },
    },
    23: {
      34: { map: MapId.MtMoon2f, pos: { x: 50, y: 19 } },
      35: { map: MapId.MtMoon2f, pos: { x: 50, y: 19 } },
    },
    30: {
      50: { map: MapId.MtMoon2f, pos: { x: 50, y: 31 } },
      51: { map: MapId.MtMoon2f, pos: { x: 50, y: 31 } },
    },
    31: {
      50: { map: MapId.MtMoon2f, pos: { x: 50, y: 31 } },
      51: { map: MapId.MtMoon2f, pos: { x: 50, y: 31 } },
    },
  },
  exits: {
    71: [28, 29, 30, 31],
  },
  cave: true,
  exitReturnMap: MapId.Route4,
  exitReturnPos: { x: 36, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: hiker,
      facing: Direction.Down,
      pokemon: [{ id: 74, level: 10 }, { id: 74, level: 10 }, { id: 95, level: 10 }],
      intro: ["WHOA! You shocked", "me! Oh, you're just a kid!"],
      outtro: ["Wow!", "Shocked again!"],
      money: 350,
      pos: { x: 10, y: 12 },
      postGame: { message: ["Kids like you", "shouldn't be here!"] },
    },
    {
      npc: youngster,
      facing: Direction.Right,
      pokemon: [{ id: 19, level: 10 }, { id: 19, level: 10 }, { id: 41, level: 10 }],
      intro: ["Did you come to", "explore too?"],
      outtro: ["Losing", "stinks!"],
      money: 150,
      pos: { x: 24, y: 32 },
      postGame: { message: ["I came down here", "to show off to girls."] },
    },
    {
      npc: lass,
      facing: Direction.Down,
      pokemon: [{ id: 43, level: 11 }, { id: 69, level: 11 }],
      intro: ["Wow! It's way", "bigger in here than I thought!"],
      outtro: ["Oh!", "I lost it!"],
      money: 165,
      pos: { x: 60, y: 8 },
      postGame: { message: ["How do you get", "out of here?"] },
    },
    {
      npc: superNerd,
      facing: Direction.Up,
      pokemon: [{ id: 81, level: 11 }, { id: 100, level: 11 }],
      intro: ["What! Don't sneak", "up on me!"],
      outtro: ["My", "POKEMON won't do!"],
      money: 275,
      pos: { x: 48, y: 62 },
      postGame: { message: ["I have to find", "stronger POKEMON."] },
    },
    {
      npc: lass,
      facing: Direction.Down,
      pokemon: [{ id: 35, level: 14 }],
      intro: ["What? I'm waiting", "for my friends to find me here."],
      outtro: ["I lost?"],
      money: 210,
      pos: { x: 32, y: 46 },
      postGame: { message: ["I heard there are", "some very rare fossils here."] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Down,
      pokemon: [{ id: 13, level: 11 }, { id: 14, level: 11 }],
      intro: ["Suspicious men", "are in the cave. What about you?"],
      outtro: ["You", "got me!"],
      money: 110,
      pos: { x: 14, y: 44 },
      postGame: { message: ["I saw them! I'm", "sure they're from TEAM ROCKET!"] },
    },
    {
      npc: bugCatcher,
      facing: Direction.Right,
      pokemon: [{ id: 10, level: 10 }, { id: 11, level: 10 }, { id: 10, level: 10 }],
      intro: ["Go through this", "cave to get to CERULEAN CITY!"],
      outtro: ["I", "lost."],
      money: 100,
      pos: { x: 60, y: 54 },
      postGame: { message: ["ZUBAT is tough!", "But, it can be useful if you catch", "one."] },
    },
  ],
  items: [
    { item: ItemType.Potion, pos: { x: 4, y: 41 } },
    { item: ItemType.MoonStone, pos: { x: 4, y: 5 } },
    { item: ItemType.RareCandy, pos: { x: 70, y: 63 } },
    { item: ItemType.EscapeRope, pos: { x: 72, y: 47 } },
    { item: ItemType.Potion, pos: { x: 40, y: 67 } },
    { item: ItemType.Tm12, pos: { x: 10, y: 65 } },
  ],
};

export default mtMoon1f;
