import victoryroad2fImage from "../../assets/map/gen/victory-road-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { blackBelt, juggler, pokeManiac, tamer } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered VICTORY_ROAD_2F - do not hand-edit.
const victoryRoad2f: MapType = {
  name: "Victory Road 2F",
  image: victoryroad2fImage,
  height: 18,
  width: 30,
  start: { x: 58, y: 15 },
  walls: {
    4: [2, 3, 18, 19, 20, 21, 22, 23],
    5: [2, 3, 18, 19, 20, 21, 22, 23],
    8: [8, 9, 10, 11, 12, 13],
    9: [8, 9, 10, 11, 12, 13],
    10: [14, 15, 24, 25, 26, 27, 28, 29],
    11: [14, 15, 24, 25, 26, 27, 28, 29],
    12: [12, 13, 16, 17, 18, 19, 20, 21, 24, 25],
    13: [12, 13, 16, 17, 18, 19, 20, 21, 24, 25],
    14: [14, 15, 20, 21],
    15: [14, 15, 20, 21],
  },
  text: {
    10: {
      10: ["This requires", "STRENGTH to move!"],
    },
    28: {
      8: ["This requires", "STRENGTH to move!"],
    },
    32: {
      46: ["This requires", "STRENGTH to move!"],
    },
  },
  maps: {
    2: {
      2: { map: MapId.VictoryRoad3f, pos: { x: 4, y: 1 } },
      3: { map: MapId.VictoryRoad3f, pos: { x: 4, y: 1 } },
    },
    3: {
      2: { map: MapId.VictoryRoad3f, pos: { x: 4, y: 1 } },
      3: { map: MapId.VictoryRoad3f, pos: { x: 4, y: 1 } },
    },
    14: {
      46: { map: MapId.VictoryRoad3f, pos: { x: 46, y: 15 } },
      47: { map: MapId.VictoryRoad3f, pos: { x: 46, y: 15 } },
      54: { map: MapId.VictoryRoad3f, pos: { x: 52, y: 17 } },
      55: { map: MapId.VictoryRoad3f, pos: { x: 52, y: 17 } },
    },
    15: {
      46: { map: MapId.VictoryRoad3f, pos: { x: 46, y: 15 } },
      47: { map: MapId.VictoryRoad3f, pos: { x: 46, y: 15 } },
      54: { map: MapId.VictoryRoad3f, pos: { x: 52, y: 17 } },
      55: { map: MapId.VictoryRoad3f, pos: { x: 52, y: 17 } },
    },
    16: {
      0: { map: MapId.VictoryRoad1f, pos: { x: 2, y: 3 } },
      1: { map: MapId.VictoryRoad1f, pos: { x: 2, y: 3 } },
    },
    17: {
      0: { map: MapId.VictoryRoad1f, pos: { x: 2, y: 3 } },
      1: { map: MapId.VictoryRoad1f, pos: { x: 2, y: 3 } },
    },
    28: {
      50: { map: MapId.VictoryRoad3f, pos: { x: 54, y: 31 } },
      51: { map: MapId.VictoryRoad3f, pos: { x: 54, y: 31 } },
    },
    29: {
      50: { map: MapId.VictoryRoad3f, pos: { x: 54, y: 31 } },
      51: { map: MapId.VictoryRoad3f, pos: { x: 54, y: 31 } },
    },
  },
  exits: {
    15: [58, 59],
    17: [58, 59],
  },
  cave: true,
  exitReturnMap: MapId.Route23,
  exitReturnPos: { x: 28, y: 63 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: blackBelt,
      facing: Direction.Left,
      pokemon: [{ id: 67, level: 43 }, { id: 66, level: 43 }, { id: 67, level: 43 }],
      intro: ["VICTORY ROAD is", "the final test for trainers!"],
      outtro: ["Aiyah!"],
      money: 1075,
      pos: { x: 24, y: 18 },
      postGame: { message: ["If you get stuck,", "try moving some boulders around!"] },
    },
    {
      npc: juggler,
      facing: Direction.Left,
      pokemon: [{ id: 96, level: 41 }, { id: 97, level: 41 }, { id: 64, level: 41 }, { id: 64, level: 41 }],
      intro: ["Ah, so you wish", "to challenge the ELITE FOUR?"],
      outtro: ["You", "got me!"],
      money: 1435,
      pos: { x: 42, y: 26 },
      postGame: { message: ["Rival also came", "through here!"] },
    },
    {
      npc: tamer,
      facing: Direction.Down,
      pokemon: [{ id: 53, level: 44 }, { id: 55, level: 44 }],
      intro: ["Come on!", "I'll whip you!"],
      outtro: ["I got", "whipped!"],
      money: 1760,
      pos: { x: 38, y: 16 },
      postGame: { message: ["You earned the", "right to be on VICTORY ROAD!"] },
    },
    {
      npc: pokeManiac,
      facing: Direction.Down,
      pokemon: [{ id: 5, level: 40 }, { id: 131, level: 40 }, { id: 108, level: 40 }],
      intro: ["If you can get", "through here, you can go meet the", "ELITE FOUR!"],
      outtro: ["No!", "Unbelievable!"],
      money: 2000,
      pos: { x: 8, y: 4 },
      postGame: { message: ["I can beat you", "when it comes to knowledge about POKEMON!"] },
    },
    {
      npc: juggler,
      facing: Direction.Left,
      pokemon: [{ id: 122, level: 48 }],
      intro: ["Is VICTORY ROAD", "too tough?"],
      outtro: ["Well", "done!"],
      money: 1680,
      pos: { x: 52, y: 6 },
      postGame: { message: ["Many trainers give", "up the challenge here."] },
    },
  ],
  items: [
    { item: ItemType.Tm17, pos: { x: 54, y: 11 } },
    { item: ItemType.FullHeal, pos: { x: 36, y: 19 } },
    { item: ItemType.Tm05, pos: { x: 18, y: 23 } },
    { item: ItemType.GuardSpec, pos: { x: 22, y: 1 } },
  ],
  stationary: [
    { id: 146, level: 50, pos: { x: 22, y: 10 } },
  ],
};

export default victoryRoad2f;
