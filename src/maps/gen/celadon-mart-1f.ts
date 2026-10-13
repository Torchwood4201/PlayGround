import celadonmart1fImage from "../../assets/map/gen/celadon-mart-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_1F - do not hand-edit.
const celadonMart1f: MapType = {
  name: "Celadon Mart 1F",
  image: celadonmart1fImage,
  height: 8,
  width: 20,
  start: { x: 4, y: 15 },
  walls: {
    2: [6, 7, 10, 11],
    3: [6, 7, 10, 11],
  },
  text: {
    3: {
      28: ["1F: SERVICE", "COUNTER"],
      29: ["1F: SERVICE", "COUNTER"],
    },
    6: {
      16: ["Hello! Welcome to", "CELADON DEPT. STORE.", "The board on the", "right describes the store layout."],
    },
    9: {
      22: ["1F: SERVICE", "COUNTER", "2F: TRAINER'S", "MARKET", "3F: TV GAME SHOP", "4F: WISEMAN GIFTS", "5F: DRUG STORE", "ROOFTOP SQUARE:", "VENDING MACHINES"],
      23: ["1F: SERVICE", "COUNTER", "2F: TRAINER'S", "MARKET", "3F: TV GAME SHOP", "4F: WISEMAN GIFTS", "5F: DRUG STORE", "ROOFTOP SQUARE:", "VENDING MACHINES"],
    },
  },
  maps: {
    2: {
      24: { map: MapId.CeladonMart2f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart2f, pos: { x: 24, y: 3 } },
    },
    3: {
      24: { map: MapId.CeladonMart2f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart2f, pos: { x: 24, y: 3 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7, 32, 33, 34, 35],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 16, y: 27 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 16, y: 6 }, facing: Direction.Down },
  ],
};

export default celadonMart1f;
