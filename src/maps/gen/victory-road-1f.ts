import victoryroad1fImage from "../../assets/map/gen/victory-road-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, aceTrainerMale } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered VICTORY_ROAD_1F - do not hand-edit.
const victoryRoad1f: MapType = {
  name: "Victory Road 1F",
  image: victoryroad1fImage,
  height: 18,
  width: 20,
  start: { x: 16, y: 35 },
  walls: {
    0: [2, 3],
    1: [2, 3],
    4: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    5: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    6: [6, 7, 14, 15],
    7: [6, 7, 14, 15],
    8: [10, 11, 12, 13],
    9: [10, 11, 12, 13],
    10: [4, 5, 10, 11, 12, 13, 16, 17],
    11: [4, 5, 10, 11, 12, 13, 16, 17],
    14: [2, 3],
    15: [2, 3],
  },
  text: {
    4: {
      28: ["This requires", "STRENGTH to move!"],
    },
    20: {
      4: ["This requires", "STRENGTH to move!"],
    },
    30: {
      10: ["This requires", "STRENGTH to move!"],
    },
  },
  maps: {
    2: {
      2: { map: MapId.VictoryRoad2f, pos: { x: 0, y: 17 } },
      3: { map: MapId.VictoryRoad2f, pos: { x: 0, y: 17 } },
    },
    3: {
      2: { map: MapId.VictoryRoad2f, pos: { x: 0, y: 17 } },
      3: { map: MapId.VictoryRoad2f, pos: { x: 0, y: 17 } },
    },
  },
  exits: {
    35: [16, 17, 18, 19],
  },
  cave: true,
  exitReturnMap: MapId.Route23,
  exitReturnPos: { x: 8, y: 63 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: aceTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 53, level: 44 }, { id: 38, level: 44 }],
      intro: ["I wonder if you", "are good enough for me!"],
      outtro: ["I", "lost out!"],
      money: 1540,
      pos: { x: 14, y: 10 },
      postGame: { message: ["I never wanted to", "lose to anybody!"] },
    },
    {
      npc: aceTrainerMale,
      facing: Direction.Down,
      pokemon: [{ id: 2, level: 42 }, { id: 8, level: 42 }, { id: 5, level: 42 }, { id: 6, level: 42 }],
      intro: ["I can see you're", "good! Let me see exactly how good!"],
      outtro: ["I", "had a chance..."],
      money: 1470,
      pos: { x: 6, y: 4 },
      postGame: { message: ["I concede, you're", "better than me!"] },
    },
  ],
  items: [
    { item: ItemType.Tm43, pos: { x: 22, y: 1 } },
    { item: ItemType.RareCandy, pos: { x: 18, y: 5 } },
  ],
};

export default victoryRoad1f;
