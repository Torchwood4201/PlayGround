import rockethideoutb2fImage from "../../assets/map/gen/rocket-hideout-b2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered ROCKET_HIDEOUT_B2F - do not hand-edit.
const rocketHideoutB2f: MapType = {
  name: "Rocket Hideout B2F",
  image: rockethideoutb2fImage,
  height: 28,
  width: 30,
  start: { x: 15, y: 26 },
  walls: {
    6: [22, 23, 28, 29],
    7: [22, 23, 28, 29],
    8: [2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 18, 19],
    9: [2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 18, 19],
    10: [8, 9],
    11: [8, 9],
    12: [10, 11, 16, 17],
    13: [10, 11, 16, 17],
    14: [14, 15],
    15: [14, 15],
    16: [28, 29],
    17: [28, 29],
    18: [2, 3, 4, 5, 8, 9, 18, 19],
    19: [2, 3, 4, 5, 8, 9, 18, 19],
    20: [4, 5, 8, 9, 14, 15],
    21: [4, 5, 8, 9, 14, 15],
    22: [2, 3, 14, 15],
    23: [2, 3, 14, 15],
    24: [2, 3, 4, 5, 14, 15, 16, 17],
    25: [2, 3, 4, 5, 14, 15, 16, 17],
    26: [0, 1, 18, 19],
    27: [0, 1, 18, 19],
  },
  text: {},
  maps: {
    16: {
      42: { map: MapId.RocketHideoutB3f, pos: { x: 50, y: 13 } },
      43: { map: MapId.RocketHideoutB3f, pos: { x: 50, y: 13 } },
      54: { map: MapId.RocketHideoutB1f, pos: { x: 46, y: 5 } },
      55: { map: MapId.RocketHideoutB1f, pos: { x: 46, y: 5 } },
    },
    17: {
      42: { map: MapId.RocketHideoutB3f, pos: { x: 50, y: 13 } },
      43: { map: MapId.RocketHideoutB3f, pos: { x: 50, y: 13 } },
      54: { map: MapId.RocketHideoutB1f, pos: { x: 46, y: 5 } },
      55: { map: MapId.RocketHideoutB1f, pos: { x: 46, y: 5 } },
    },
    44: {
      42: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 49 } },
      43: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 49 } },
    },
    45: {
      42: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 49 } },
      43: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 49 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 41, level: 17 }, { id: 109, level: 17 }, { id: 88, level: 17 }, { id: 41, level: 17 }, { id: 20, level: 17 }],
      intro: ["BOSS said you can", "see GHOSTs with the SILPH SCOPE!"],
      outtro: ["I", "surrender!"],
      money: 510,
      pos: { x: 40, y: 24 },
      postGame: { message: ["The TEAM ROCKET", "HQ has 4 basement floors. Can you", "reach the BOSS?"] },
    },
  ],
  items: [
    { item: ItemType.MoonStone, pos: { x: 2, y: 23 } },
    { item: ItemType.Nugget, pos: { x: 32, y: 17 } },
    { item: ItemType.Tm07, pos: { x: 12, y: 25 } },
    { item: ItemType.SuperPotion, pos: { x: 6, y: 43 } },
  ],
};

export default rocketHideoutB2f;
