import diglettscaveroute2Image from "../../assets/map/gen/digletts-cave-route-2.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered DIGLETTS_CAVE_ROUTE_2 - do not hand-edit.
const diglettsCaveRoute2: MapType = {
  name: "Digletts Cave Route 2",
  image: diglettscaveroute2Image,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {},
  maps: {
    8: {
      8: { map: MapId.DiglettsCave, pos: { x: 10, y: 11 } },
      9: { map: MapId.DiglettsCave, pos: { x: 10, y: 11 } },
    },
    9: {
      8: { map: MapId.DiglettsCave, pos: { x: 10, y: 11 } },
      9: { map: MapId.DiglettsCave, pos: { x: 10, y: 11 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7],
  },
  cave: true,
  exitReturnMap: MapId.DiglettsCave,
  exitReturnPos: { x: 10, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default diglettsCaveRoute2;
