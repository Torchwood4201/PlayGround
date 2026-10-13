import victoryroad3fImage from "../../assets/map/gen/victory-road-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, aceTrainerMale } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered VICTORY_ROAD_3F - do not hand-edit.
const victoryRoad3f: MapType = {
  name: "Victory Road 3F",
  image: victoryroad3fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    2: [10, 11, 12, 13, 14, 15, 16, 17],
    3: [10, 11, 12, 13, 14, 15, 16, 17],
    4: [8, 9, 16, 17],
    5: [8, 9, 16, 17],
    6: [8, 9, 10, 11, 26, 27],
    7: [8, 9, 10, 11, 26, 27],
    8: [8, 9, 10, 11],
    9: [8, 9, 10, 11],
    12: [14, 15, 16, 17, 18, 19, 20, 21],
    13: [14, 15, 16, 17, 18, 19, 20, 21],
  },
  text: {},
  maps: {
    0: {
      4: { map: MapId.VictoryRoad2f, pos: { x: 2, y: 3 } },
      5: { map: MapId.VictoryRoad2f, pos: { x: 2, y: 3 } },
    },
    1: {
      4: { map: MapId.VictoryRoad2f, pos: { x: 2, y: 3 } },
      5: { map: MapId.VictoryRoad2f, pos: { x: 2, y: 3 } },
    },
    14: {
      46: { map: MapId.VictoryRoad2f, pos: { x: 46, y: 15 } },
      47: { map: MapId.VictoryRoad2f, pos: { x: 46, y: 15 } },
    },
    15: {
      46: { map: MapId.VictoryRoad2f, pos: { x: 46, y: 15 } },
      47: { map: MapId.VictoryRoad2f, pos: { x: 46, y: 15 } },
    },
    16: {
      52: { map: MapId.VictoryRoad2f, pos: { x: 54, y: 15 } },
      53: { map: MapId.VictoryRoad2f, pos: { x: 54, y: 15 } },
    },
    17: {
      52: { map: MapId.VictoryRoad2f, pos: { x: 54, y: 15 } },
      53: { map: MapId.VictoryRoad2f, pos: { x: 54, y: 15 } },
    },
    30: {
      54: { map: MapId.VictoryRoad2f, pos: { x: 50, y: 29 } },
      55: { map: MapId.VictoryRoad2f, pos: { x: 50, y: 29 } },
    },
    31: {
      54: { map: MapId.VictoryRoad2f, pos: { x: 50, y: 29 } },
      55: { map: MapId.VictoryRoad2f, pos: { x: 50, y: 29 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: aceTrainerMale,
      facing: Direction.Left,
      pokemon: [{ id: 103, level: 43 }, { id: 91, level: 43 }, { id: 59, level: 43 }],
      intro: ["I heard rumors of", "a child prodigy!"],
      outtro: ["The", "rumors were true!"],
      money: 1505,
      pos: { x: 56, y: 10 },
      postGame: { message: ["You beat GIOVANNI", "of TEAM ROCKET?"] },
    },
    {
      npc: aceTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 69, level: 43 }, { id: 70, level: 43 }, { id: 71, level: 43 }],
      intro: ["I'll show you just", "how good you are!"],
      outtro: ["I'm", "furious!"],
      money: 1505,
      pos: { x: 14, y: 26 },
      postGame: { message: ["You showed me just", "how good I was!"] },
    },
    {
      npc: aceTrainerMale,
      facing: Direction.Left,
      pokemon: [{ id: 99, level: 43 }, { id: 73, level: 43 }, { id: 9, level: 43 }],
      intro: ["Only the chosen", "can pass here!"],
      outtro: ["I", "don't believe it!"],
      money: 1505,
      pos: { x: 12, y: 28 },
      postGame: { message: ["All trainers here", "are headed to the POKEMON LEAGUE! Be", "careful!"] },
    },
    {
      npc: aceTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 47, level: 43 }, { id: 87, level: 43 }, { id: 113, level: 43 }],
      intro: ["Trainers live to", "seek stronger opponents!"],
      outtro: ["Oh!", "So strong!"],
      money: 1505,
      pos: { x: 26, y: 6 },
      postGame: { message: ["By fighting tough", "battles, you get stronger!"] },
    },
  ],
  items: [
    { item: ItemType.MaxRevive, pos: { x: 52, y: 11 } },
    { item: ItemType.Tm47, pos: { x: 14, y: 15 } },
  ],
};

export default victoryRoad3f;
