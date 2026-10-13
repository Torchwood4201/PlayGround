import route16flyhouseImage from "../../assets/map/gen/route-16-fly-house.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_16_FLY_HOUSE - do not hand-edit.
const route16FlyHouse: MapType = {
  name: "Route 16 Fly House",
  image: route16flyhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {},
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.Route16,
  exitReturnPos: { x: 14, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default route16FlyHouse;
