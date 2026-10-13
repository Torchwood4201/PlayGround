import celadonmart3fImage from "../../assets/map/gen/celadon-mart-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_3F - do not hand-edit.
const celadonMart3f: MapType = {
  name: "Celadon Mart 3F",
  image: celadonmart3fImage,
  height: 8,
  width: 20,
  start: { x: 10, y: 6 },
  walls: {
    6: [12, 13],
    7: [12, 13],
  },
  text: {
    3: {
      8: ["Red and Blue!", "Both are POKEMON!"],
      9: ["Red and Blue!", "Both are POKEMON!"],
      12: ["Red and Blue!", "Both are POKEMON!"],
      13: ["Red and Blue!", "Both are POKEMON!"],
      20: ["Red and Blue!", "Both are POKEMON!"],
      21: ["Red and Blue!", "Both are POKEMON!"],
      28: ["3F: TV GAME SHOP"],
      29: ["3F: TV GAME SHOP"],
    },
    4: {
      14: ["All right!", "My buddy's going", "to trade me his KANGASKHAN for my", "GRAVELER!"],
      16: ["Come on GRAVELER!", "I love GRAVELER!", "I collect them!", "Huh?", "GRAVELER turned", "into a different POKEMON!"],
    },
    9: {
      4: ["It's an SNES!"],
      5: ["It's an SNES!"],
      6: ["An RPG! There's", "no time for that!"],
      7: ["An RPG! There's", "no time for that!"],
      10: ["It's an SNES!"],
      11: ["It's an SNES!"],
      12: ["A sports game!", "Dad'll like that!"],
      13: ["A sports game!", "Dad'll like that!"],
    },
    10: {
      4: ["You can identify", "POKEMON you got in trades by their ID", "Numbers!"],
      32: ["..."],
    },
    12: {
      22: ["Captured POKEMON", "are registered with an ID No. and OT,", "the name of the Original Trainer that", "caught it!"],
    },
    13: {
      4: ["It's an SNES!"],
      5: ["It's an SNES!"],
      6: ["A puzzle game!", "Looks addictive!"],
      7: ["A puzzle game!", "Looks addictive!"],
      10: ["It's an SNES!"],
      11: ["It's an SNES!"],
      12: ["A fighting game!", "Looks tough!"],
      13: ["A fighting game!", "Looks tough!"],
    },
  },
  maps: {
    2: {
      24: { map: MapId.CeladonMart4f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart4f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart2f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart2f, pos: { x: 32, y: 3 } },
    },
    3: {
      24: { map: MapId.CeladonMart4f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart4f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart2f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart2f, pos: { x: 32, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 32, y: 10 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 22, y: 12 }, facing: Direction.Right },
    { npc: youngster, pos: { x: 14, y: 4 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 16, y: 4 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 4, y: 10 }, facing: Direction.Up },
  ],
};

export default celadonMart3f;
