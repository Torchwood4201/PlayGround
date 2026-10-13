import undergroundpathroute6Image from "../../assets/map/gen/underground-path-route-6.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered UNDERGROUND_PATH_ROUTE_6 - do not hand-edit.
const undergroundPathRoute6: MapType = {
  name: "Underground Path Route 6",
  image: undergroundpathroute6Image,
  height: 8,
  width: 8,
  start: { x: 6, y: 15 },
  walls: {
    2: [4, 5],
    3: [4, 5],
  },
  text: {},
  maps: {
    8: {
      8: { map: MapId.UndergroundPathNorthSouth, pos: { x: 4, y: 83 } },
      9: { map: MapId.UndergroundPathNorthSouth, pos: { x: 4, y: 83 } },
    },
    9: {
      8: { map: MapId.UndergroundPathNorthSouth, pos: { x: 4, y: 83 } },
      9: { map: MapId.UndergroundPathNorthSouth, pos: { x: 4, y: 83 } },
    },
  },
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.Route6,
  exitReturnPos: { x: 34, y: 27 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default undergroundPathRoute6;
