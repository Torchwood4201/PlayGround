import route25Image from "../../assets/map/gen/route-25.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { hiker, jrTrainerMale, lass, youngster } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_25 - do not hand-edit.
const route25: MapType = {
  name: "Route 25",
  image: route25Image,
  height: 18,
  width: 60,
  start: { x: 8, y: 0 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 46, 47],
    1: [0, 1, 2, 3, 4, 5, 6, 7, 46, 47],
    2: [44, 45, 54, 55],
    3: [44, 45, 54, 55],
    8: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, 45, 46, 47],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, 45, 46, 47],
    10: [44, 45, 46, 47],
    11: [44, 45, 46, 47],
    12: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    13: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
    14: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    15: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    16: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    17: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  },
  text: {
    7: {
      86: ["SEA COTTAGE", "BILL lives here!"],
      87: ["SEA COTTAGE", "BILL lives here!"],
    },
  },
  maps: {
    2: {
      0: { map: MapId.Route24, pos: { x: 18, y: 2 } },
    },
    3: {
      0: { map: MapId.Route24, pos: { x: 18, y: 2 } },
    },
    4: {
      0: { map: MapId.Route24, pos: { x: 18, y: 4 } },
    },
    5: {
      0: { map: MapId.Route24, pos: { x: 18, y: 4 } },
    },
    6: {
      0: { map: MapId.Route24, pos: { x: 18, y: 6 } },
      90: { map: MapId.BillsHouse, pos: { x: 4, y: 15 } },
      91: { map: MapId.BillsHouse, pos: { x: 4, y: 15 } },
    },
    7: {
      0: { map: MapId.Route24, pos: { x: 18, y: 6 } },
      90: { map: MapId.BillsHouse, pos: { x: 4, y: 15 } },
      91: { map: MapId.BillsHouse, pos: { x: 4, y: 15 } },
    },
    10: {
      0: { map: MapId.Route24, pos: { x: 18, y: 10 } },
    },
    11: {
      0: { map: MapId.Route24, pos: { x: 18, y: 10 } },
    },
    12: {
      0: { map: MapId.Route24, pos: { x: 18, y: 12 } },
    },
    13: {
      0: { map: MapId.Route24, pos: { x: 18, y: 12 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    2: [56, 57, 58, 59],
    3: [56, 57, 58, 59],
    4: [56, 57, 58, 59],
    5: [56, 57, 58, 59],
    6: [56, 57, 58, 59],
    7: [56, 57, 58, 59],
    8: [38, 39, 40, 41, 42, 43, 48, 49, 50, 51, 52, 53, 56, 57, 58, 59],
    9: [38, 39, 40, 41, 42, 43, 48, 49, 50, 51, 52, 53, 56, 57, 58, 59],
    10: [38, 39, 40, 41, 42, 43, 48, 49, 50, 51, 52, 53, 56, 57, 58, 59],
    11: [38, 39, 40, 41, 42, 43, 48, 49, 50, 51, 52, 53, 56, 57, 58, 59],
    12: [56, 57, 58, 59],
    13: [56, 57, 58, 59],
    14: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    15: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    16: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    17: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
  },
  cut: {
    2: [26, 27],
    3: [26, 27],
  },
  trainers: [
    {
      npc: youngster,
      facing: Direction.Down,
      pokemon: [{ id: 19, level: 15 }, { id: 21, level: 15 }],
      intro: ["Local trainers", "come here to practice!"],
      outtro: ["You're", "decent."],
      money: 225,
      pos: { x: 28, y: 4 },
      postGame: { message: ["All POKEMON have", "weaknesses. It's best to raise", "different kinds."] },
    },
    {
      npc: youngster,
      facing: Direction.Up,
      pokemon: [{ id: 79, level: 17 }],
      intro: ["Dad took me to a", "great party on S.S.ANNE at VERMILION", "CITY!"],
      outtro: ["I'm", "not mad!"],
      money: 255,
      pos: { x: 36, y: 10 },
      postGame: { message: ["On S.S.ANNE, I", "saw trainers from around the world."] },
    },
    {
      npc: jrTrainerMale,
      facing: Direction.Down,
      pokemon: [{ id: 19, level: 14 }, { id: 23, level: 14 }],
      intro: ["I'm a cool guy.", "I've got a girl friend!"],
      outtro: ["Aww,", "darn..."],
      money: 280,
      pos: { x: 48, y: 8 },
      postGame: { message: ["Oh well. My girl", "will cheer me up."] },
    },
    {
      npc: lass,
      facing: Direction.Right,
      pokemon: [{ id: 32, level: 15 }, { id: 29, level: 15 }],
      intro: ["Hi! My boy", "friend is cool!"],
      outtro: ["I was in", "bad condition!"],
      money: 225,
      pos: { x: 36, y: 16 },
      postGame: { message: ["I wish my guy was", "as good as you!"] },
    },
    {
      npc: youngster,
      facing: Direction.Left,
      pokemon: [{ id: 23, level: 14 }, { id: 27, level: 14 }],
      intro: ["I knew I had to", "fight you!"],
      outtro: ["I knew", "I'd lose too!"],
      money: 210,
      pos: { x: 64, y: 6 },
      postGame: { message: ["If your POKEMON", "gets confused or falls asleep, switch", "it!"] },
    },
    {
      npc: lass,
      facing: Direction.Down,
      pokemon: [{ id: 43, level: 13 }, { id: 16, level: 13 }, { id: 43, level: 13 }],
      intro: ["My friend has a", "cute POKEMON. I'm so jealous!"],
      outtro: ["I'm", "not so jealous!"],
      money: 195,
      pos: { x: 74, y: 8 },
      postGame: { message: ["You came from MT.", "MOON? May I have a CLEFAIRY?"] },
    },
    {
      npc: hiker,
      facing: Direction.Right,
      pokemon: [{ id: 66, level: 15 }, { id: 74, level: 15 }],
      intro: ["I just got down", "from MT.MOON, but I'm ready!"],
      outtro: ["You", "worked hard!"],
      money: 525,
      pos: { x: 16, y: 8 },
      postGame: { message: ["Drat!", "A ZUBAT bit me back in there."] },
    },
    {
      npc: hiker,
      facing: Direction.Up,
      pokemon: [{ id: 74, level: 13 }, { id: 74, level: 13 }, { id: 66, level: 13 }, { id: 74, level: 13 }],
      intro: ["I'm off to see a", "POKEMON collector at the cape!"],
      outtro: ["You", "got me."],
      money: 455,
      pos: { x: 46, y: 18 },
      postGame: { message: ["The collector has", "many rare kinds of POKEMON."] },
    },
    {
      npc: hiker,
      facing: Direction.Right,
      pokemon: [{ id: 95, level: 17 }],
      intro: ["You're going to", "see BILL? First, let's fight!"],
      outtro: ["You're", "something."],
      money: 595,
      pos: { x: 26, y: 14 },
      postGame: { message: ["The trail below", "is a shortcut to CERULEAN CITY."] },
    },
  ],
  items: [
    { item: ItemType.Tm19, pos: { x: 44, y: 5 } },
  ],
};

export default route25;
