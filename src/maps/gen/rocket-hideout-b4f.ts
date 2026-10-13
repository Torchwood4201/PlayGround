import rockethideoutb4fImage from "../../assets/map/gen/rocket-hideout-b4f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { giovanni, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered ROCKET_HIDEOUT_B4F - do not hand-edit.
const rocketHideoutB4f: MapType = {
  name: "Rocket Hideout B4F",
  image: rockethideoutb4fImage,
  height: 24,
  width: 30,
  start: { x: 15, y: 22 },
  walls: {
    0: [20, 21, 28, 29],
    1: [20, 21, 28, 29],
    4: [16, 17],
    5: [16, 17],
    10: [22, 23],
    11: [22, 23],
    22: [8, 9],
    23: [8, 9],
  },
  text: {},
  maps: {
    20: {
      38: { map: MapId.RocketHideoutB3f, pos: { x: 38, y: 37 } },
      39: { map: MapId.RocketHideoutB3f, pos: { x: 38, y: 37 } },
    },
    21: {
      38: { map: MapId.RocketHideoutB3f, pos: { x: 38, y: 37 } },
      39: { map: MapId.RocketHideoutB3f, pos: { x: 38, y: 37 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: giovanni,
      facing: Direction.Down,
      pokemon: [{ id: 95, level: 25 }, { id: 111, level: 24 }, { id: 115, level: 29 }],
      intro: ["So! I must say, I", "am impressed you got here!"],
      outtro: ["WHAT!", "This cannot be!"],
      money: 2871,
      pos: { x: 50, y: 6 },
      postGame: { message: ["I see that you", "raise POKEMON with utmost care.", "A child like you", "would never understand what I hope to", "achieve.", "I shall step", "aside this time!", "I hope we meet", "again..."] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 27, level: 23 }, { id: 23, level: 23 }, { id: 28, level: 23 }],
      intro: ["I know you! You", "ruined our plans at MT.MOON!"],
      outtro: ["Burned", "again!"],
      money: 690,
      pos: { x: 46, y: 24 },
      postGame: { message: ["Do you have", "something against TEAM ROCKET?"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 23, level: 23 }, { id: 27, level: 23 }, { id: 24, level: 23 }],
      intro: ["How can you not", "see the beauty of our evil?"],
      outtro: ["Ayaya!"],
      money: 690,
      pos: { x: 52, y: 24 },
      postGame: { message: ["BOSS! I'm sorry I", "failed you!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 109, level: 21 }, { id: 41, level: 21 }],
      intro: ["The elevator", "doesn't work? Who has the LIFT KEY?"],
      outtro: ["No!"],
      money: 630,
      pos: { x: 22, y: 4 },
      postGame: { message: ["Oh no! I dropped", "the LIFT KEY!"] },
    },
  ],
  items: [
    { item: ItemType.HpUp, pos: { x: 20, y: 25 } },
    { item: ItemType.Tm02, pos: { x: 18, y: 9 } },
    { item: ItemType.Iron, pos: { x: 24, y: 41 } },
    { item: ItemType.SilphScope, pos: { x: 50, y: 5 } },
    { item: ItemType.LiftKey, pos: { x: 20, y: 5 } },
  ],
};

export default rocketHideoutB4f;
