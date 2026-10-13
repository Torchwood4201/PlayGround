import billshouseImage from "../../assets/map/gen/bills-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { superNerd, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered BILLS_HOUSE - do not hand-edit.
const billsHouse: MapType = {
  name: "Bills House",
  image: billshouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    0: [0, 1],
    1: [0, 1],
  },
  text: {
    8: {
      8: ["..."],
    },
    10: {
      12: ["BILL: Look, bud,", "just check out some of my rare POKEMON on", "my PC!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.Route25,
  exitReturnPos: { x: 90, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: youngster, pos: { x: 12, y: 10 }, facing: Direction.Down },
    { npc: superNerd, pos: { x: 8, y: 8 }, facing: Direction.Down },
    { npc: superNerd, pos: { x: 12, y: 10 }, facing: Direction.Down },
  ],
};

export default billsHouse;
