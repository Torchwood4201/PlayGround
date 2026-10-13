import route15Image from "../../assets/map/gen/route-15.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, biker, birdKeeper, jrTrainerFemale } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered ROUTE_15 - do not hand-edit.
const route15: MapType = {
  name: "Route 15",
  image: route15Image,
  height: 18,
  width: 60,
  start: { x: 30, y: 16 },
  walls: {
    2: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    3: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    6: [4, 5, 6, 7, 8, 9, 12, 13],
    7: [4, 5, 6, 7, 8, 9, 12, 13],
    8: [0, 1, 2, 3, 4, 5, 6, 7, 36, 37, 40, 41],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 36, 37, 40, 41],
    12: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    13: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
  },
  text: {
    19: {
      78: ["ROUTE 15", "West to FUCHSIA CITY"],
      79: ["ROUTE 15", "West to FUCHSIA CITY"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 36 } },
    },
    1: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 8 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 36 } },
    },
    2: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 38 } },
    },
    3: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 10 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 38 } },
    },
    4: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 40 } },
    },
    5: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 12 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 40 } },
    },
    6: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 14 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 42 } },
    },
    7: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 14 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 42 } },
    },
    8: {
      59: { map: MapId.Route14, pos: { x: 1, y: 44 } },
    },
    9: {
      59: { map: MapId.Route14, pos: { x: 1, y: 44 } },
    },
    10: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 46 } },
    },
    11: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 18 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 46 } },
    },
    12: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 20 } },
    },
    13: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 20 } },
    },
    14: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 22 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 50 } },
    },
    15: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 22 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 50 } },
    },
    16: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 24 } },
      14: { map: MapId.Route15Gate1f, pos: { x: 0, y: 9 } },
      15: { map: MapId.Route15Gate1f, pos: { x: 0, y: 9 } },
      28: { map: MapId.Route15Gate1f, pos: { x: 14, y: 9 } },
      29: { map: MapId.Route15Gate1f, pos: { x: 14, y: 9 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 52 } },
    },
    17: {
      0: { map: MapId.FuchsiaCity, pos: { x: 38, y: 24 } },
      14: { map: MapId.Route15Gate1f, pos: { x: 0, y: 9 } },
      15: { map: MapId.Route15Gate1f, pos: { x: 0, y: 9 } },
      28: { map: MapId.Route15Gate1f, pos: { x: 14, y: 9 } },
      29: { map: MapId.Route15Gate1f, pos: { x: 14, y: 9 } },
      59: { map: MapId.Route14, pos: { x: 1, y: 52 } },
    },
    18: {
      14: { map: MapId.Route15Gate1f, pos: { x: 0, y: 11 } },
      15: { map: MapId.Route15Gate1f, pos: { x: 0, y: 11 } },
      28: { map: MapId.Route15Gate1f, pos: { x: 14, y: 11 } },
      29: { map: MapId.Route15Gate1f, pos: { x: 14, y: 11 } },
    },
    19: {
      14: { map: MapId.Route15Gate1f, pos: { x: 0, y: 11 } },
      15: { map: MapId.Route15Gate1f, pos: { x: 0, y: 11 } },
      28: { map: MapId.Route15Gate1f, pos: { x: 14, y: 11 } },
      29: { map: MapId.Route15Gate1f, pos: { x: 14, y: 11 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: jrTrainerFemale,
      facing: Direction.Down,
      pokemon: [{ id: 44, level: 28 }, { id: 43, level: 28 }, { id: 43, level: 28 }],
      intro: ["Let me try out the", "POKEMON I just got in a trade!"],
      outtro: ["Not", "good enough!"],
      money: 560,
      pos: { x: 82, y: 22 },
      postGame: { message: ["You can't change", "the nickname of any POKEMON you get in a", "trade.", "Only the Original", "Trainer can."] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Left,
      pokemon: [{ id: 25, level: 29 }, { id: 26, level: 29 }],
      intro: ["You look gentle,", "so I think I can beat you!"],
      outtro: ["No,", "wrong!"],
      money: 580,
      pos: { x: 106, y: 20 },
      postGame: { message: ["I'm afraid of", "BIKERs, they look so ugly and mean!"] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Up,
      pokemon: [{ id: 17, level: 26 }, { id: 83, level: 26 }, { id: 84, level: 26 }, { id: 16, level: 26 }],
      intro: ["When I whistle, I", "can summon bird POKEMON!"],
      outtro: ["Ow!", "That's tragic!"],
      money: 650,
      pos: { x: 62, y: 26 },
      postGame: { message: ["Maybe I'm not cut", "out for battles."] },
    },
    {
      npc: birdKeeper,
      facing: Direction.Up,
      pokemon: [{ id: 85, level: 28 }, { id: 84, level: 28 }, { id: 84, level: 28 }],
      intro: ["Hmm? My birds are", "shivering! You're good, aren't you?"],
      outtro: ["Just", "as I thought!"],
      money: 700,
      pos: { x: 70, y: 26 },
      postGame: { message: ["Did you know moves", "like EARTHQUAKE don't have any effect", "on birds?"] },
    },
    {
      npc: beauty,
      facing: Direction.Down,
      pokemon: [{ id: 17, level: 29 }, { id: 40, level: 29 }],
      intro: ["Oh, you're a", "little cutie!"],
      outtro: ["You looked", "so cute too!"],
      money: 2030,
      pos: { x: 106, y: 22 },
      postGame: { message: ["I forgive you!", "I can take it!"] },
    },
    {
      npc: beauty,
      facing: Direction.Right,
      pokemon: [{ id: 1, level: 29 }, { id: 2, level: 29 }],
      intro: ["I raise POKEMON", "because I live alone!"],
      outtro: ["I didn't", "ask for this!"],
      money: 2030,
      pos: { x: 82, y: 20 },
      postGame: { message: ["I just like going", "home to be with my POKEMON!"] },
    },
    {
      npc: biker,
      facing: Direction.Down,
      pokemon: [{ id: 109, level: 25 }, { id: 109, level: 25 }, { id: 110, level: 25 }, { id: 109, level: 25 }, { id: 88, level: 25 }],
      intro: ["Hey kid! C'mon!", "I just got these!"],
      outtro: ["Why", "not?"],
      money: 500,
      pos: { x: 96, y: 20 },
      postGame: { message: ["You only live", "once, so I live as an outlaw! TEAM", "ROCKET RULES!"] },
    },
    {
      npc: biker,
      facing: Direction.Down,
      pokemon: [{ id: 109, level: 28 }, { id: 88, level: 28 }, { id: 110, level: 28 }],
      intro: ["Fork over all your", "cash when you lose to me, kid!"],
      outtro: ["That", "can't be true!"],
      money: 560,
      pos: { x: 92, y: 20 },
      postGame: { message: ["I was just joking", "about the money!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 35, level: 33 }],
      intro: ["What's cool?", "Trading POKEMON!"],
      outtro: ["I", "said trade!"],
      money: 660,
      pos: { x: 74, y: 10 },
      postGame: { message: ["I trade POKEMON", "with my friends!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Up,
      pokemon: [{ id: 69, level: 29 }, { id: 43, level: 29 }, { id: 114, level: 29 }],
      intro: ["Want to play with", "my POKEMON?"],
      outtro: ["I was", "too impatient!"],
      money: 580,
      pos: { x: 36, y: 26 },
      postGame: { message: ["I'll go train with", "weaker people."] },
    },
  ],
  items: [
    { item: ItemType.Tm20, pos: { x: 36, y: 11 } },
  ],
};

export default route15;
