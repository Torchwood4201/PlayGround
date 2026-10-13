import diglettscaveroute11Image from "../../assets/map/gen/digletts-cave-route-11.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gambler } from "../../app/npcs";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered DIGLETTS_CAVE_ROUTE_11 - do not hand-edit.
const diglettsCaveRoute11: MapType = {
  name: "Digletts Cave Route 11",
  image: diglettscaveroute11Image,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {
    6: {
      4: ["What a surprise!", "DIGLETTs dug this long tunnel!", "It goes right to", "VIRIDIAN CITY!"],
    },
  },
  maps: {
    8: {
      8: { map: MapId.DiglettsCave, pos: { x: 74, y: 63 } },
      9: { map: MapId.DiglettsCave, pos: { x: 74, y: 63 } },
    },
    9: {
      8: { map: MapId.DiglettsCave, pos: { x: 74, y: 63 } },
      9: { map: MapId.DiglettsCave, pos: { x: 74, y: 63 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7],
  },
  cave: true,
  exitReturnMap: MapId.Route11,
  exitReturnPos: { x: 8, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gambler, pos: { x: 4, y: 6 }, facing: Direction.Down },
  ],
};

export default diglettsCaveRoute11;
