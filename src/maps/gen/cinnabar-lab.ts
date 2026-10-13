import cinnabarlabImage from "../../assets/map/gen/cinnabar-lab.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CINNABAR_LAB - do not hand-edit.
const cinnabarLab: MapType = {
  name: "Cinnabar Lab",
  image: cinnabarlabImage,
  height: 8,
  width: 18,
  start: { x: 4, y: 15 },
  walls: {
    6: [2, 3],
    7: [2, 3],
  },
  text: {
    5: {
      6: ["A photo of the", "LAB's founder, DR.FUJI!"],
      7: ["A photo of the", "LAB's founder, DR.FUJI!"],
    },
    9: {
      18: ["POKEMON LAB", "Meeting Room"],
      19: ["POKEMON LAB", "Meeting Room"],
      26: ["POKEMON LAB", "R-and-D Room"],
      27: ["POKEMON LAB", "R-and-D Room"],
      34: ["POKEMON LAB", "Testing Room"],
      35: ["POKEMON LAB", "Testing Room"],
    },
  },
  maps: {
    8: {
      16: { map: MapId.CinnabarLabTradeRoom, pos: { x: 4, y: 15 } },
      17: { map: MapId.CinnabarLabTradeRoom, pos: { x: 4, y: 15 } },
      24: { map: MapId.CinnabarLabMetronomeRoom, pos: { x: 4, y: 15 } },
      25: { map: MapId.CinnabarLabMetronomeRoom, pos: { x: 4, y: 15 } },
      32: { map: MapId.CinnabarLabFossilRoom, pos: { x: 4, y: 15 } },
      33: { map: MapId.CinnabarLabFossilRoom, pos: { x: 4, y: 15 } },
    },
    9: {
      16: { map: MapId.CinnabarLabTradeRoom, pos: { x: 4, y: 15 } },
      17: { map: MapId.CinnabarLabTradeRoom, pos: { x: 4, y: 15 } },
      24: { map: MapId.CinnabarLabMetronomeRoom, pos: { x: 4, y: 15 } },
      25: { map: MapId.CinnabarLabMetronomeRoom, pos: { x: 4, y: 15 } },
      32: { map: MapId.CinnabarLabFossilRoom, pos: { x: 4, y: 15 } },
      33: { map: MapId.CinnabarLabFossilRoom, pos: { x: 4, y: 15 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.CinnabarIsland,
  exitReturnPos: { x: 12, y: 19 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default cinnabarLab;
