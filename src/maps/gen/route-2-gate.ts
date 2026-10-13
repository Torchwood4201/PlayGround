import route2gateImage from "../../assets/map/gen/route-2-gate.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_2_GATE - do not hand-edit.
const route2Gate: MapType = {
  name: "Route 2 Gate",
  image: route2gateImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 1 },
  walls: {
    0: [0, 1],
    1: [0, 1],
  },
  text: {
    8: {
      2: ["..."],
      10: ["Once a POKEMON", "learns FLASH, you can get through ROCK", "TUNNEL."],
    },
  },
  maps: {},
  exits: {
    1: [8, 9, 10, 11],
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.Route2,
  exitReturnPos: { x: 32, y: 71 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 2, y: 8 }, facing: Direction.Left },
    { npc: youngster, pos: { x: 10, y: 8 }, facing: Direction.Down },
  ],
};

export default route2Gate;
