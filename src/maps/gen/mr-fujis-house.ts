import mrfujishouseImage from "../../assets/map/gen/mr-fujis-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass, oak, superNerd, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered MR_FUJIS_HOUSE - do not hand-edit.
const mrFujisHouse: MapType = {
  name: "Mr Fujis House",
  image: mrfujishouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    2: {
      6: ["..."],
    },
    6: {
      2: ["NIDORINO: Gaoo!"],
      6: ["POKEMON Monthly", "Grand Prize Drawing!", "The application", "form is...", "Gone! It's been", "clipped out!"],
      12: ["..."],
    },
    8: {
      12: ["PSYDUCK: Gwappa!"],
    },
    10: {
      6: ["..."],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.LavenderTown,
  exitReturnPos: { x: 14, y: 19 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: superNerd, pos: { x: 6, y: 10 }, facing: Direction.Down },
    { npc: lass, pos: { x: 12, y: 6 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 12, y: 8 }, facing: Direction.Up },
    { npc: youngster, pos: { x: 2, y: 6 }, facing: Direction.Down },
    { npc: oak, pos: { x: 6, y: 2 }, facing: Direction.Down },
  ],
};

export default mrFujisHouse;
