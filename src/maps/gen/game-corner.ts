import gamecornerImage from "../../assets/map/gen/game-corner.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, fisher, gambler, gentleman, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered GAME_CORNER - do not hand-edit.
const gameCorner: MapType = {
  name: "Game Corner",
  image: gamecornerImage,
  height: 18,
  width: 20,
  start: { x: 30, y: 35 },
  walls: {
    6: [8, 9, 10, 11],
    7: [8, 9, 10, 11],
    8: [2, 3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17],
    9: [2, 3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17],
    14: [0, 1, 6, 7, 12, 13, 18, 19],
    15: [0, 1, 6, 7, 12, 13, 18, 19],
    16: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
    17: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 18, 19],
  },
  text: {
    9: {
      18: ["..."],
      19: ["..."],
    },
    12: {
      4: ["Welcome!", "You can exchange", "your coins for fabulous prizes next", "door."],
      10: ["..."],
    },
    20: {
      4: ["Keep this quiet.", "It's rumored that", "this place is run by TEAM ROCKET."],
    },
    22: {
      10: ["..."],
      16: ["I'm having a", "wonderful time!"],
      28: ["..."],
    },
    26: {
      4: ["I think these", "machines have different odds."],
      34: ["..."],
    },
    28: {
      16: ["..."],
    },
    30: {
      22: ["Games are scary!", "It's so easy to get hooked!"],
    },
  },
  maps: {
    8: {
      34: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 5 } },
      35: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 5 } },
    },
    9: {
      34: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 5 } },
      35: { map: MapId.RocketHideoutB1f, pos: { x: 42, y: 5 } },
    },
  },
  exits: {
    35: [30, 31, 32, 33],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 56, y: 39 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 20, level: 20 }, { id: 41, level: 20 }],
      intro: ["I'm guarding this", "poster! Go away, or else!"],
      outtro: ["Dang!"],
      money: 600,
      pos: { x: 18, y: 10 },
      postGame: { message: ["Our hideout might", "be discovered! I better tell BOSS!"] },
    },
  ],
  npcs: [
    { npc: beauty, pos: { x: 4, y: 12 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 10, y: 12 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 4, y: 20 }, facing: Direction.Left },
    { npc: beauty, pos: { x: 4, y: 26 }, facing: Direction.Left },
    { npc: fisher, pos: { x: 10, y: 22 }, facing: Direction.Right },
    { npc: beauty, pos: { x: 16, y: 22 }, facing: Direction.Left },
    { npc: gentleman, pos: { x: 16, y: 28 }, facing: Direction.Left },
    { npc: gambler, pos: { x: 22, y: 30 }, facing: Direction.Right },
    { npc: gentleman, pos: { x: 28, y: 22 }, facing: Direction.Left },
    { npc: gentleman, pos: { x: 34, y: 26 }, facing: Direction.Right },
  ],
};

export default gameCorner;
