import route12gate1fImage from "../../assets/map/gen/route-12-gate-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_12_GATE_1F - do not hand-edit.
const route12Gate1f: MapType = {
  name: "Route 12 Gate 1F",
  image: route12gate1fImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 1 },
  walls: {
    2: [8, 9],
    3: [8, 9],
    4: [6, 7],
    5: [6, 7],
    6: [6, 7],
    7: [6, 7],
  },
  text: {
    6: {
      2: ["There's a lookout", "spot upstairs."],
    },
  },
  maps: {
    12: {
      16: { map: MapId.Route12Gate2f, pos: { x: 14, y: 15 } },
      17: { map: MapId.Route12Gate2f, pos: { x: 14, y: 15 } },
    },
    13: {
      16: { map: MapId.Route12Gate2f, pos: { x: 14, y: 15 } },
      17: { map: MapId.Route12Gate2f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {
    1: [8, 9, 10, 11],
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.Route12,
  exitReturnPos: { x: 20, y: 31 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 2, y: 6 }, facing: Direction.Down },
  ],
};

export default route12Gate1f;
