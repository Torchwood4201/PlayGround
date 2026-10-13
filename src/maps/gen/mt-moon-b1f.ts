import mtmoonb1fImage from "../../assets/map/gen/mt-moon-b1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered MT_MOON_B1F - do not hand-edit.
const mtMoonB1f: MapType = {
  name: "Mt Moon B1F",
  image: mtmoonb1fImage,
  height: 28,
  width: 28,
  start: { x: 54, y: 7 },
  walls: {},
  text: {},
  maps: {
    6: {
      46: { map: MapId.MtMoon3f, pos: { x: 10, y: 15 } },
      47: { map: MapId.MtMoon3f, pos: { x: 10, y: 15 } },
    },
    7: {
      46: { map: MapId.MtMoon3f, pos: { x: 10, y: 15 } },
      47: { map: MapId.MtMoon3f, pos: { x: 10, y: 15 } },
    },
    10: {
      10: { map: MapId.MtMoon1f, pos: { x: 10, y: 11 } },
      11: { map: MapId.MtMoon1f, pos: { x: 10, y: 11 } },
    },
    11: {
      10: { map: MapId.MtMoon1f, pos: { x: 10, y: 11 } },
      11: { map: MapId.MtMoon1f, pos: { x: 10, y: 11 } },
    },
    18: {
      50: { map: MapId.MtMoon1f, pos: { x: 34, y: 23 } },
      51: { map: MapId.MtMoon1f, pos: { x: 34, y: 23 } },
    },
    19: {
      50: { map: MapId.MtMoon1f, pos: { x: 34, y: 23 } },
      51: { map: MapId.MtMoon1f, pos: { x: 34, y: 23 } },
    },
    22: {
      34: { map: MapId.MtMoon3f, pos: { x: 50, y: 19 } },
      35: { map: MapId.MtMoon3f, pos: { x: 50, y: 19 } },
    },
    23: {
      34: { map: MapId.MtMoon3f, pos: { x: 50, y: 19 } },
      35: { map: MapId.MtMoon3f, pos: { x: 50, y: 19 } },
    },
    30: {
      50: { map: MapId.MtMoon1f, pos: { x: 50, y: 31 } },
      51: { map: MapId.MtMoon1f, pos: { x: 50, y: 31 } },
    },
    31: {
      50: { map: MapId.MtMoon1f, pos: { x: 50, y: 31 } },
      51: { map: MapId.MtMoon1f, pos: { x: 50, y: 31 } },
    },
    34: {
      42: { map: MapId.MtMoon3f, pos: { x: 42, y: 35 } },
      43: { map: MapId.MtMoon3f, pos: { x: 42, y: 35 } },
    },
    35: {
      42: { map: MapId.MtMoon3f, pos: { x: 42, y: 35 } },
      43: { map: MapId.MtMoon3f, pos: { x: 42, y: 35 } },
    },
    54: {
      26: { map: MapId.MtMoon3f, pos: { x: 30, y: 55 } },
      27: { map: MapId.MtMoon3f, pos: { x: 30, y: 55 } },
    },
    55: {
      26: { map: MapId.MtMoon3f, pos: { x: 30, y: 55 } },
      27: { map: MapId.MtMoon3f, pos: { x: 30, y: 55 } },
    },
  },
  exits: {
    7: [54, 55],
  },
  cave: true,
  exitReturnMap: MapId.Route4,
  exitReturnPos: { x: 48, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default mtMoonB1f;
