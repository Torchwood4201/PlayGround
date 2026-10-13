import undergroundpathwesteastImage from "../../assets/map/gen/underground-path-west-east.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-1.mp3";

// Generated from pret/pokered UNDERGROUND_PATH_WEST_EAST - do not hand-edit.
const undergroundPathWestEast: MapType = {
  name: "Underground Path West East",
  image: undergroundpathwesteastImage,
  height: 8,
  width: 50,
  start: { x: 25, y: 6 },
  walls: {
    0: [48, 49],
    1: [48, 49],
    2: [48, 49],
    3: [48, 49],
    4: [48, 49],
    5: [48, 49],
  },
  text: {},
  maps: {
    4: {
      94: { map: MapId.UndergroundPathRoute8, pos: { x: 8, y: 9 } },
      95: { map: MapId.UndergroundPathRoute8, pos: { x: 8, y: 9 } },
    },
    5: {
      94: { map: MapId.UndergroundPathRoute8, pos: { x: 8, y: 9 } },
      95: { map: MapId.UndergroundPathRoute8, pos: { x: 8, y: 9 } },
    },
    10: {
      4: { map: MapId.UndergroundPathRoute7, pos: { x: 8, y: 9 } },
      5: { map: MapId.UndergroundPathRoute7, pos: { x: 8, y: 9 } },
    },
    11: {
      4: { map: MapId.UndergroundPathRoute7, pos: { x: 8, y: 9 } },
      5: { map: MapId.UndergroundPathRoute7, pos: { x: 8, y: 9 } },
    },
  },
  exits: {},
  cave: true,
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default undergroundPathWestEast;
