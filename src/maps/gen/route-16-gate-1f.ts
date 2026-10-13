import route16gate1fImage from "../../assets/map/gen/route-16-gate-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gambler, gentleman } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_16_GATE_1F - do not hand-edit.
const route16Gate1f: MapType = {
  name: "Route 16 Gate 1F",
  image: route16gate1fImage,
  height: 14,
  width: 8,
  start: { x: 0, y: 17 },
  walls: {},
  text: {
    6: {
      8: ["How'd you get in?", "Good effort!"],
    },
    10: {
      8: ["..."],
    },
  },
  maps: {
    24: {
      12: { map: MapId.Route16Gate2f, pos: { x: 14, y: 15 } },
      13: { map: MapId.Route16Gate2f, pos: { x: 14, y: 15 } },
    },
    25: {
      12: { map: MapId.Route16Gate2f, pos: { x: 14, y: 15 } },
      13: { map: MapId.Route16Gate2f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {
    5: [0, 1, 14, 15],
    7: [0, 1, 14, 15],
    17: [0, 1, 14, 15],
    19: [0, 1, 14, 15],
  },
  exitReturnMap: MapId.Route16,
  exitReturnPos: { x: 34, y: 21 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 8, y: 10 }, facing: Direction.Down },
    { npc: gambler, pos: { x: 8, y: 6 }, facing: Direction.Down },
  ],
};

export default route16Gate1f;
