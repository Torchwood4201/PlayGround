import ceruleanbadgehouseImage from "../../assets/map/gen/cerulean-badge-house.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CERULEAN_BADGE_HOUSE - do not hand-edit.
const ceruleanBadgeHouse: MapType = {
  name: "Cerulean Badge House",
  image: ceruleanbadgehouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 1 },
  walls: {},
  text: {},
  maps: {},
  exits: {
    1: [4, 5],
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 18, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default ceruleanBadgeHouse;
