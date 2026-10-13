import route8gateImage from "../../assets/map/gen/route-8-gate.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_8_GATE - do not hand-edit.
const route8Gate: MapType = {
  name: "Route 8 Gate",
  image: route8gateImage,
  height: 8,
  width: 6,
  start: { x: 0, y: 7 },
  walls: {
    0: [0, 1],
    1: [0, 1],
  },
  text: {
    2: {
      4: ["..."],
    },
  },
  maps: {},
  exits: {
    7: [0, 1, 10, 11],
    9: [0, 1, 10, 11],
  },
  exitReturnMap: MapId.Route8,
  exitReturnPos: { x: 2, y: 19 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 4, y: 2 }, facing: Direction.Down },
  ],
};

export default route8Gate;
