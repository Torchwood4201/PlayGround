import mtmoonb2fImage from "../../assets/map/gen/mt-moon-b2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { superNerd, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered MT_MOON_B2F - do not hand-edit.
const mtMoonB2f: MapType = {
  name: "Mt Moon B2F",
  image: mtmoonb2fImage,
  height: 36,
  width: 40,
  start: { x: 20, y: 34 },
  walls: {
    0: [36, 37, 38, 39],
    1: [36, 37, 38, 39],
    2: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    3: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    6: [10, 11, 14, 15, 22, 23],
    7: [10, 11, 14, 15, 22, 23],
    8: [16, 17, 22, 23],
    9: [16, 17, 22, 23],
    10: [22, 23],
    11: [22, 23],
    12: [24, 25, 26, 27, 32, 33, 34, 35, 38, 39],
    13: [24, 25, 26, 27, 32, 33, 34, 35, 38, 39],
    14: [38, 39],
    15: [38, 39],
    16: [6, 7, 38, 39],
    17: [6, 7, 38, 39],
    18: [6, 7, 38, 39],
    19: [6, 7, 38, 39],
    20: [6, 7, 38, 39],
    21: [6, 7, 38, 39],
    22: [6, 7, 38, 39],
    23: [6, 7, 38, 39],
    24: [6, 7],
    25: [6, 7],
    26: [6, 7, 34, 35],
    27: [6, 7, 34, 35],
    28: [6, 7, 34, 35],
    29: [6, 7, 34, 35],
    30: [6, 7, 34, 35],
    31: [6, 7, 34, 35],
  },
  text: {
    12: {
      24: ["..."],
      26: ["..."],
    },
  },
  maps: {
    14: {
      10: { map: MapId.MtMoon2f, pos: { x: 46, y: 7 } },
      11: { map: MapId.MtMoon2f, pos: { x: 46, y: 7 } },
    },
    15: {
      10: { map: MapId.MtMoon2f, pos: { x: 46, y: 7 } },
      11: { map: MapId.MtMoon2f, pos: { x: 46, y: 7 } },
    },
    18: {
      50: { map: MapId.MtMoon2f, pos: { x: 34, y: 23 } },
      51: { map: MapId.MtMoon2f, pos: { x: 34, y: 23 } },
    },
    19: {
      50: { map: MapId.MtMoon2f, pos: { x: 34, y: 23 } },
      51: { map: MapId.MtMoon2f, pos: { x: 34, y: 23 } },
    },
    34: {
      42: { map: MapId.MtMoon2f, pos: { x: 42, y: 35 } },
      43: { map: MapId.MtMoon2f, pos: { x: 42, y: 35 } },
    },
    35: {
      42: { map: MapId.MtMoon2f, pos: { x: 42, y: 35 } },
      43: { map: MapId.MtMoon2f, pos: { x: 42, y: 35 } },
    },
    54: {
      30: { map: MapId.MtMoon2f, pos: { x: 26, y: 55 } },
      31: { map: MapId.MtMoon2f, pos: { x: 26, y: 55 } },
    },
    55: {
      30: { map: MapId.MtMoon2f, pos: { x: 26, y: 55 } },
      31: { map: MapId.MtMoon2f, pos: { x: 26, y: 55 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: superNerd,
      facing: Direction.Right,
      pokemon: [{ id: 88, level: 12 }, { id: 100, level: 12 }, { id: 109, level: 12 }],
      intro: ["..."],
      outtro: ["..."],
      money: 300,
      pos: { x: 24, y: 16 },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 19, level: 13 }, { id: 41, level: 13 }],
      intro: ["TEAM ROCKET will", "find the fossils, revive and sell them", "for cash!"],
      outtro: ["Urgh!", "Now I'm mad!"],
      money: 390,
      pos: { x: 22, y: 32 },
      postGame: { message: ["You made me mad!", "TEAM ROCKET will blacklist you!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 27, level: 11 }, { id: 19, level: 11 }, { id: 41, level: 11 }],
      intro: ["We, TEAM ROCKET,", "are POKEMON gangsters!"],
      outtro: ["I blew", "it!"],
      money: 330,
      pos: { x: 30, y: 44 },
      postGame: { message: ["Darn it all! My", "associates won't stand for this!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 41, level: 12 }, { id: 23, level: 12 }],
      intro: ["We're pulling a", "big job here! Get lost, kid!"],
      outtro: ["So, you", "are good."],
      money: 360,
      pos: { x: 58, y: 22 },
      postGame: { message: ["If you find a", "fossil, give it to me and scram!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 20, level: 16 }],
      intro: ["Little kids", "should leave grown-ups alone!"],
      outtro: ["I'm", "steamed!"],
      money: 480,
      pos: { x: 58, y: 34 },
      postGame: { message: ["POKEMON lived", "here long before people came."] },
    },
  ],
  items: [
    { item: ItemType.HpUp, pos: { x: 50, y: 43 } },
    { item: ItemType.Tm01, pos: { x: 58, y: 11 } },
  ],
};

export default mtMoonB2f;
