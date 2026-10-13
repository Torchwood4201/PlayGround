import route11gate1fImage from "../../assets/map/gen/route-11-gate-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_11_GATE_1F - do not hand-edit.
const route11Gate1f: MapType = {
  name: "Route 11 Gate 1F",
  image: route11gate1fImage,
  height: 10,
  width: 8,
  start: { x: 0, y: 9 },
  walls: {
    0: [0, 1],
    1: [0, 1],
  },
  text: {},
  maps: {
    16: {
      12: { map: MapId.Route11Gate2f, pos: { x: 14, y: 15 } },
      13: { map: MapId.Route11Gate2f, pos: { x: 14, y: 15 } },
    },
    17: {
      12: { map: MapId.Route11Gate2f, pos: { x: 14, y: 15 } },
      13: { map: MapId.Route11Gate2f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {
    9: [0, 1, 14, 15],
    11: [0, 1, 14, 15],
  },
  exitReturnMap: MapId.Route11,
  exitReturnPos: { x: 98, y: 17 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default route11Gate1f;
