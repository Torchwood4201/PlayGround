import viridianschoolhouseImage from "../../assets/map/gen/viridian-school-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, beauty } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered VIRIDIAN_SCHOOL_HOUSE - do not hand-edit.
const viridianSchoolHouse: MapType = {
  name: "Viridian School House",
  image: viridianschoolhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    0: [2, 3],
    1: [2, 3],
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    2: {
      8: ["Okay!", "Be sure to read", "the blackboard carefully!"],
    },
    10: {
      6: ["Whew! I'm trying", "to memorize all my notes."],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.ViridianCity,
  exitReturnPos: { x: 42, y: 31 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 6, y: 10 }, facing: Direction.Up },
    { npc: aceTrainerFemale, pos: { x: 8, y: 2 }, facing: Direction.Down },
  ],
};

export default viridianSchoolHouse;
