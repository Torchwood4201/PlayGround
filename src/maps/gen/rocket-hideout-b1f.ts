import rockethideoutb1fImage from "../../assets/map/gen/rocket-hideout-b1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered ROCKET_HIDEOUT_B1F - do not hand-edit.
const rocketHideoutB1f: MapType = {
  name: "Rocket Hideout B1F",
  image: rockethideoutb1fImage,
  height: 28,
  width: 30,
  start: { x: 15, y: 26 },
  walls: {
    0: [24, 25],
    1: [24, 25],
    4: [28, 29],
    5: [28, 29],
    8: [14, 15, 28, 29],
    9: [14, 15, 28, 29],
    16: [22, 23, 28, 29],
    17: [22, 23, 28, 29],
    26: [8, 9],
    27: [8, 9],
  },
  text: {},
  maps: {
    4: {
      42: { map: MapId.GameCorner, pos: { x: 34, y: 9 } },
      43: { map: MapId.GameCorner, pos: { x: 34, y: 9 } },
      46: { map: MapId.RocketHideoutB2f, pos: { x: 54, y: 17 } },
      47: { map: MapId.RocketHideoutB2f, pos: { x: 54, y: 17 } },
    },
    5: {
      42: { map: MapId.GameCorner, pos: { x: 34, y: 9 } },
      43: { map: MapId.GameCorner, pos: { x: 34, y: 9 } },
      46: { map: MapId.RocketHideoutB2f, pos: { x: 54, y: 17 } },
      47: { map: MapId.RocketHideoutB2f, pos: { x: 54, y: 17 } },
    },
    48: {
      42: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 45 } },
      43: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 45 } },
    },
    49: {
      42: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 45 } },
      43: { map: MapId.RocketHideoutB2f, pos: { x: 42, y: 45 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 96, level: 21 }, { id: 66, level: 21 }],
      intro: ["Who are you? How", "did you get here?"],
      outtro: ["Oww!", "Beaten!"],
      money: 630,
      pos: { x: 52, y: 16 },
      postGame: { message: ["Are you dissing", "TEAM ROCKET?"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 20, level: 21 }, { id: 20, level: 21 }],
      intro: ["You broke into", "our operation?"],
      outtro: ["Burnt!"],
      money: 630,
      pos: { x: 24, y: 12 },
      postGame: { message: ["You're not going", "to get away with this, brat!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Down,
      pokemon: [{ id: 88, level: 20 }, { id: 109, level: 20 }, { id: 109, level: 20 }],
      intro: ["Intruder alert!"],
      outtro: ["I", "can't do it!"],
      money: 600,
      pos: { x: 36, y: 34 },
      postGame: { message: ["SILPH SCOPE?", "I don't know where it is!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 19, level: 19 }, { id: 20, level: 19 }, { id: 20, level: 19 }, { id: 19, level: 19 }],
      intro: ["Why did you come", "here?"],
      outtro: ["This", "won't do!"],
      money: 570,
      pos: { x: 30, y: 50 },
      postGame: { message: ["OK, I'll talk!", "Take the elevator to see my BOSS!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 88, level: 22 }, { id: 109, level: 22 }],
      intro: ["Are you lost, you", "little rat?"],
      outtro: ["Why...?"],
      money: 660,
      pos: { x: 56, y: 36 },
      postGame: { message: ["Uh-oh, that fight", "opened the door!"] },
    },
  ],
  items: [
    { item: ItemType.EscapeRope, pos: { x: 22, y: 29 } },
    { item: ItemType.HyperPotion, pos: { x: 18, y: 35 } },
  ],
};

export default rocketHideoutB1f;
