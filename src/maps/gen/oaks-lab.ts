import oakslabImage from "../../assets/map/gen/oaks-lab.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass, oak, scientist } from "../../app/npcs";
import music from "../../assets/music/maps/oaks-laboratory.mp3";

// Generated from pret/pokered OAKS_LAB - do not hand-edit.
const oaksLab: MapType = {
  name: "Oaks Lab",
  image: oakslabImage,
  height: 12,
  width: 10,
  start: { x: 8, y: 23 },
  walls: {},
  text: {
    2: {
      4: ["It's encyclopedia-", "like, but the pages are blank!"],
      6: ["It's encyclopedia-", "like, but the pages are blank!"],
    },
    4: {
      10: ["..."],
    },
    18: {
      2: ["PROF.OAK is the", "authority on POKEMON!", "Many POKEMON", "trainers hold him in high regard!"],
    },
    20: {
      4: ["I study POKEMON as", "PROF.OAK's AIDE."],
      10: ["?"],
      16: ["I study POKEMON as", "PROF.OAK's AIDE."],
    },
  },
  maps: {},
  exits: {
    23: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.PalletTown,
  exitReturnPos: { x: 24, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: oak, pos: { x: 10, y: 4 }, facing: Direction.Down },
    { npc: oak, pos: { x: 10, y: 20 }, facing: Direction.Up },
    { npc: lass, pos: { x: 2, y: 18 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 4, y: 20 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 16, y: 20 }, facing: Direction.Down },
  ],
};

export default oaksLab;
