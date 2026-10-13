import route6gateImage from "../../assets/map/gen/route-6-gate.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_6_GATE - do not hand-edit.
const route6Gate: MapType = {
  name: "Route 6 Gate",
  image: route6gateImage,
  height: 6,
  width: 8,
  start: { x: 6, y: 11 },
  walls: {
    2: [6, 7],
    3: [6, 7],
  },
  text: {},
  maps: {},
  exits: {
    1: [6, 7, 8, 9],
    11: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.Route6,
  exitReturnPos: { x: 18, y: 3 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default route6Gate;
