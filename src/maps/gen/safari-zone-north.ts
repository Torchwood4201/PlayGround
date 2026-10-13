import safarizonenorthImage from "../../assets/map/gen/safari-zone-north.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_NORTH - do not hand-edit.
const safariZoneNorth: MapType = {
  name: "Safari Zone North",
  image: safarizonenorthImage,
  height: 36,
  width: 40,
  start: { x: 20, y: 34 },
  walls: {
    8: [8, 9, 10, 11],
    9: [8, 9, 10, 11],
    10: [8, 9],
    11: [8, 9],
    12: [8, 9],
    13: [8, 9],
    14: [4, 5, 6, 7],
    15: [4, 5, 6, 7],
    16: [4, 5, 36, 37],
    17: [4, 5, 36, 37],
    18: [4, 5, 36, 37],
    19: [4, 5, 36, 37],
    20: [36, 37],
    21: [36, 37],
    22: [14, 15, 36, 37],
    23: [14, 15, 36, 37],
    24: [8, 9, 10, 11, 14, 15],
    25: [8, 9, 10, 11, 14, 15],
    26: [8, 9],
    27: [8, 9],
    28: [8, 9],
    29: [8, 9],
    34: [12, 13, 14, 15, 16, 17],
    35: [12, 13, 14, 15, 16, 17],
  },
  text: {
    9: {
      72: ["REST HOUSE"],
      73: ["REST HOUSE"],
    },
    51: {
      8: ["TRAINER TIPS", "The SECRET HOUSE", "is still ahead!"],
      9: ["TRAINER TIPS", "The SECRET HOUSE", "is still ahead!"],
    },
    57: {
      52: ["TRAINER TIPS", "Win a free HM for", "finding the SECRET HOUSE!"],
      53: ["TRAINER TIPS", "Win a free HM for", "finding the SECRET HOUSE!"],
    },
    63: {
      26: ["AREA 2"],
      27: ["AREA 2"],
    },
    67: {
      38: ["TRAINER TIPS", "POKEMON hide in", "tall grass!", "Zigzag through", "grassy areas to flush them out."],
      39: ["TRAINER TIPS", "POKEMON hide in", "tall grass!", "Zigzag through", "grassy areas to flush them out."],
    },
  },
  maps: {
    6: {
      70: { map: MapId.SafariZoneNorthRestHouse, pos: { x: 4, y: 15 } },
      71: { map: MapId.SafariZoneNorthRestHouse, pos: { x: 4, y: 15 } },
    },
    7: {
      70: { map: MapId.SafariZoneNorthRestHouse, pos: { x: 4, y: 15 } },
      71: { map: MapId.SafariZoneNorthRestHouse, pos: { x: 4, y: 15 } },
    },
    60: {
      78: { map: MapId.SafariZoneEast, pos: { x: 0, y: 9 } },
      79: { map: MapId.SafariZoneEast, pos: { x: 0, y: 9 } },
    },
    61: {
      78: { map: MapId.SafariZoneEast, pos: { x: 0, y: 9 } },
      79: { map: MapId.SafariZoneEast, pos: { x: 0, y: 9 } },
    },
    62: {
      78: { map: MapId.SafariZoneEast, pos: { x: 0, y: 11 } },
      79: { map: MapId.SafariZoneEast, pos: { x: 0, y: 11 } },
    },
    63: {
      78: { map: MapId.SafariZoneEast, pos: { x: 0, y: 11 } },
      79: { map: MapId.SafariZoneEast, pos: { x: 0, y: 11 } },
    },
    70: {
      4: { map: MapId.SafariZoneWest, pos: { x: 40, y: 1 } },
      5: { map: MapId.SafariZoneWest, pos: { x: 40, y: 1 } },
      6: { map: MapId.SafariZoneWest, pos: { x: 42, y: 1 } },
      7: { map: MapId.SafariZoneWest, pos: { x: 42, y: 1 } },
      16: { map: MapId.SafariZoneWest, pos: { x: 52, y: 1 } },
      17: { map: MapId.SafariZoneWest, pos: { x: 52, y: 1 } },
      18: { map: MapId.SafariZoneWest, pos: { x: 54, y: 1 } },
      19: { map: MapId.SafariZoneWest, pos: { x: 54, y: 1 } },
      40: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 1 } },
      41: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 1 } },
      42: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 1 } },
      43: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 1 } },
    },
    71: {
      4: { map: MapId.SafariZoneWest, pos: { x: 40, y: 1 } },
      5: { map: MapId.SafariZoneWest, pos: { x: 40, y: 1 } },
      6: { map: MapId.SafariZoneWest, pos: { x: 42, y: 1 } },
      7: { map: MapId.SafariZoneWest, pos: { x: 42, y: 1 } },
      16: { map: MapId.SafariZoneWest, pos: { x: 52, y: 1 } },
      17: { map: MapId.SafariZoneWest, pos: { x: 52, y: 1 } },
      18: { map: MapId.SafariZoneWest, pos: { x: 54, y: 1 } },
      19: { map: MapId.SafariZoneWest, pos: { x: 54, y: 1 } },
      40: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 1 } },
      41: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 1 } },
      42: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 1 } },
      43: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    10: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    11: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    30: [12, 13],
    31: [12, 13],
    32: [18, 19],
    33: [18, 19],
  },
  items: [
    { item: ItemType.Protein, pos: { x: 50, y: 3 } },
    { item: ItemType.Tm40, pos: { x: 38, y: 15 } },
  ],
};

export default safariZoneNorth;
