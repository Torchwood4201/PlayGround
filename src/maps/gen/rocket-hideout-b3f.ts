import rockethideoutb3fImage from "../../assets/map/gen/rocket-hideout-b3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered ROCKET_HIDEOUT_B3F - do not hand-edit.
const rocketHideoutB3f: MapType = {
  name: "Rocket Hideout B3F",
  image: rockethideoutb3fImage,
  height: 28,
  width: 30,
  start: { x: 15, y: 26 },
  walls: {
    4: [28, 29],
    5: [28, 29],
    8: [24, 25],
    9: [24, 25],
    10: [10, 11, 12, 13, 16, 17],
    11: [10, 11, 12, 13, 16, 17],
    12: [12, 13, 14, 15],
    13: [12, 13, 14, 15],
    14: [12, 13, 18, 19],
    15: [12, 13, 18, 19],
    26: [8, 9],
    27: [8, 9],
  },
  text: {},
  maps: {
    12: {
      50: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 17 } },
      51: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 17 } },
    },
    13: {
      50: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 17 } },
      51: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 17 } },
    },
    36: {
      38: { map: MapId.RocketHideoutB4f, pos: { x: 38, y: 21 } },
      39: { map: MapId.RocketHideoutB4f, pos: { x: 38, y: 21 } },
    },
    37: {
      38: { map: MapId.RocketHideoutB4f, pos: { x: 38, y: 21 } },
      39: { map: MapId.RocketHideoutB4f, pos: { x: 38, y: 21 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 19, level: 20 }, { id: 20, level: 20 }, { id: 96, level: 20 }],
      intro: ["Stop meddling in", "TEAM ROCKET's affairs!"],
      outtro: ["Oof!", "Taken down!"],
      money: 600,
      pos: { x: 20, y: 44 },
      postGame: { message: ["SILPH SCOPE?", "The machine the BOSS stole. It's here", "somewhere."] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 66, level: 21 }, { id: 66, level: 21 }],
      intro: ["We got word from", "upstairs that you were coming!"],
      outtro: ["What?", "I lost? No!"],
      money: 630,
      pos: { x: 52, y: 24 },
      postGame: { message: ["Go ahead and go!", "But, you need the LIFT KEY to run the", "elevator!"] },
    },
  ],
  items: [
    { item: ItemType.Tm10, pos: { x: 52, y: 35 } },
    { item: ItemType.RareCandy, pos: { x: 40, y: 29 } },
  ],
};

export default rocketHideoutB3f;
