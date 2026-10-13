import undergroundpathroute8Image from "../../assets/map/gen/underground-path-route-8.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered UNDERGROUND_PATH_ROUTE_8 - do not hand-edit.
const undergroundPathRoute8: MapType = {
  name: "Underground Path Route 8",
  image: undergroundpathroute8Image,
  height: 8,
  width: 8,
  start: { x: 6, y: 15 },
  walls: {
    2: [4, 5],
    3: [4, 5],
  },
  text: {
    8: {
      6: ["The dept. store", "in CELADON has a great selection!"],
    },
  },
  maps: {
    8: {
      8: { map: MapId.UndergroundPathWestEast, pos: { x: 94, y: 5 } },
      9: { map: MapId.UndergroundPathWestEast, pos: { x: 94, y: 5 } },
    },
    9: {
      8: { map: MapId.UndergroundPathWestEast, pos: { x: 94, y: 5 } },
      9: { map: MapId.UndergroundPathWestEast, pos: { x: 94, y: 5 } },
    },
  },
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.Route8,
  exitReturnPos: { x: 26, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 8 }, facing: Direction.Down },
  ],
};

export default undergroundPathRoute8;
