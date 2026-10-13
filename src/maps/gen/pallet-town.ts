import pallettownImage from "../../assets/map/gen/pallet-town.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pallet-town.mp3";

// Generated from pret/pokered PALLET_TOWN - do not hand-edit.
const palletTown: MapType = {
  name: "Pallet Town",
  image: pallettownImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [0, 1, 4, 5, 6, 7, 14, 15, 16, 17],
    1: [0, 1, 4, 5, 6, 7, 14, 15, 16, 17],
    2: [6, 7, 14, 15],
    3: [6, 7, 14, 15],
    4: [4, 5, 12, 13],
    5: [4, 5, 12, 13],
    10: [14, 15],
    11: [14, 15],
    12: [16, 17],
    13: [16, 17],
    14: [8, 9, 16, 17],
    15: [8, 9, 16, 17],
  },
  text: {
    11: {
      6: ["Blue's house"],
      7: ["Blue's house"],
      22: ["Rival's house"],
      23: ["Rival's house"],
    },
    19: {
      14: ["PALLET TOWN", "Shades of your journey await!"],
      15: ["PALLET TOWN", "Shades of your journey await!"],
    },
    27: {
      26: ["OAK POKEMON", "RESEARCH LAB"],
      27: ["OAK POKEMON", "RESEARCH LAB"],
    },
  },
  maps: {
    0: {
      2: MapId.Route1,
      3: MapId.Route1,
      8: MapId.Route1,
      9: MapId.Route1,
      10: MapId.Route1,
      11: MapId.Route1,
      12: MapId.Route1,
      13: MapId.Route1,
      18: MapId.Route1,
      19: MapId.Route1,
    },
    10: {
      10: { map: MapId.PalletTownHouseA1F, pos: { x: 4, y: 15 } },
      11: { map: MapId.PalletTownHouseA1F, pos: { x: 4, y: 15 } },
      26: { map: MapId.PalletTownHouseB, pos: { x: 4, y: 15 } },
      27: { map: MapId.PalletTownHouseB, pos: { x: 4, y: 15 } },
    },
    11: {
      10: { map: MapId.PalletTownHouseA1F, pos: { x: 4, y: 15 } },
      11: { map: MapId.PalletTownHouseA1F, pos: { x: 4, y: 15 } },
      26: { map: MapId.PalletTownHouseB, pos: { x: 4, y: 15 } },
      27: { map: MapId.PalletTownHouseB, pos: { x: 4, y: 15 } },
    },
    17: {
      0: { map: MapId.Route21, pos: { x: 0, y: 1 } },
      1: { map: MapId.Route21, pos: { x: 0, y: 1 } },
      2: { map: MapId.Route21, pos: { x: 2, y: 1 } },
      3: { map: MapId.Route21, pos: { x: 2, y: 1 } },
      4: { map: MapId.Route21, pos: { x: 4, y: 1 } },
      5: { map: MapId.Route21, pos: { x: 4, y: 1 } },
      6: { map: MapId.Route21, pos: { x: 6, y: 1 } },
      7: { map: MapId.Route21, pos: { x: 6, y: 1 } },
      8: { map: MapId.Route21, pos: { x: 8, y: 1 } },
      9: { map: MapId.Route21, pos: { x: 8, y: 1 } },
      10: { map: MapId.Route21, pos: { x: 10, y: 1 } },
      11: { map: MapId.Route21, pos: { x: 10, y: 1 } },
      12: { map: MapId.Route21, pos: { x: 12, y: 1 } },
      13: { map: MapId.Route21, pos: { x: 12, y: 1 } },
      14: { map: MapId.Route21, pos: { x: 14, y: 1 } },
      15: { map: MapId.Route21, pos: { x: 14, y: 1 } },
      16: { map: MapId.Route21, pos: { x: 16, y: 1 } },
      17: { map: MapId.Route21, pos: { x: 16, y: 1 } },
      18: { map: MapId.Route21, pos: { x: 18, y: 1 } },
      19: { map: MapId.Route21, pos: { x: 18, y: 1 } },
    },
    22: {
      24: { map: MapId.PalletTownLab, pos: { x: 10, y: 23 } },
      25: { map: MapId.PalletTownLab, pos: { x: 10, y: 23 } },
    },
    23: {
      24: { map: MapId.PalletTownLab, pos: { x: 10, y: 23 } },
      25: { map: MapId.PalletTownLab, pos: { x: 10, y: 23 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route21,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    14: [4, 5, 6, 7],
    15: [4, 5, 6, 7],
    16: [4, 5, 6, 7],
    17: [4, 5, 6, 7],
  },
};

export default palletTown;
