import celadonmart5fImage from "../../assets/map/gen/celadon-mart-5f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, sailor } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_5F - do not hand-edit.
const celadonMart5f: MapType = {
  name: "Celadon Mart 5F",
  image: celadonmart5fImage,
  height: 8,
  width: 20,
  start: { x: 10, y: 6 },
  walls: {
    2: [4, 5, 6, 7, 10, 11, 12, 13, 16, 17, 18, 19],
    3: [4, 5, 6, 7, 10, 11, 12, 13, 16, 17, 18, 19],
  },
  text: {
    3: {
      28: ["5F: DRUG STORE"],
      29: ["5F: DRUG STORE"],
    },
    6: {
      10: ["..."],
      12: ["..."],
    },
    10: {
      28: ["POKEMON ability", "enhancers can be bought only here.", "Use CALCIUM to", "increase SPECIAL abilities.", "Use CARBOS to", "increase SPEED."],
    },
    12: {
      4: ["I'm here for", "POKEMON ability enhancers.", "PROTEIN increases", "ATTACK power.", "IRON increases", "DEFENSE!"],
    },
  },
  maps: {
    2: {
      24: { map: MapId.CeladonMartRoof, pos: { x: 30, y: 5 } },
      25: { map: MapId.CeladonMartRoof, pos: { x: 30, y: 5 } },
      32: { map: MapId.CeladonMart4f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart4f, pos: { x: 32, y: 3 } },
    },
    3: {
      24: { map: MapId.CeladonMartRoof, pos: { x: 30, y: 5 } },
      25: { map: MapId.CeladonMartRoof, pos: { x: 30, y: 5 } },
      32: { map: MapId.CeladonMart4f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart4f, pos: { x: 32, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 28, y: 10 }, facing: Direction.Down },
    { npc: sailor, pos: { x: 4, y: 12 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 10, y: 6 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 12, y: 6 }, facing: Direction.Down },
  ],
};

export default celadonMart5f;
