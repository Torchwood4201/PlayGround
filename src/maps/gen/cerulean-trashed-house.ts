import ceruleantrashedhouseImage from "../../assets/map/gen/cerulean-trashed-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { fisher, lass } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CERULEAN_TRASHED_HOUSE - do not hand-edit.
const ceruleanTrashedHouse: MapType = {
  name: "Cerulean Trashed House",
  image: ceruleantrashedhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {
    1: {
      6: ["TEAM ROCKET left", "a way out!"],
      7: ["TEAM ROCKET left", "a way out!"],
    },
    2: {
      4: ["..."],
    },
    12: {
      10: ["TEAM ROCKET must", "be trying to DIG their way into no", "good!"],
    },
  },
  maps: {},
  exits: {
    1: [6, 7],
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 54, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: fisher, pos: { x: 4, y: 2 }, facing: Direction.Down },
    { npc: lass, pos: { x: 10, y: 12 }, facing: Direction.Down },
  ],
};

export default ceruleanTrashedHouse;
