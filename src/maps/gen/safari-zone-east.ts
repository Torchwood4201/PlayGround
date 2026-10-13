import safarizoneeastImage from "../../assets/map/gen/safari-zone-east.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_EAST - do not hand-edit.
const safariZoneEast: MapType = {
  name: "Safari Zone East",
  image: safarizoneeastImage,
  height: 26,
  width: 30,
  start: { x: 15, y: 24 },
  walls: {
    10: [8, 9, 12, 13, 14, 15, 16, 17, 18, 19],
    11: [8, 9, 12, 13, 14, 15, 16, 17, 18, 19],
    14: [12, 13, 14, 15],
    15: [12, 13, 14, 15],
    16: [20, 21],
    17: [20, 21],
  },
  text: {
    9: {
      12: ["TRAINER TIPS", "The remaining time", "declines only while you walk!"],
      13: ["TRAINER TIPS", "The remaining time", "declines only while you walk!"],
    },
    21: {
      52: ["REST HOUSE"],
      53: ["REST HOUSE"],
    },
    47: {
      10: ["CENTER AREA", "NORTH: AREA 2"],
      11: ["CENTER AREA", "NORTH: AREA 2"],
    },
  },
  maps: {
    8: {
      0: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 61 } },
      1: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 61 } },
    },
    9: {
      0: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 61 } },
      1: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 61 } },
    },
    10: {
      0: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 63 } },
      1: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 63 } },
    },
    11: {
      0: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 63 } },
      1: { map: MapId.SafariZoneNorth, pos: { x: 78, y: 63 } },
    },
    18: {
      50: { map: MapId.SafariZoneEastRestHouse, pos: { x: 4, y: 15 } },
      51: { map: MapId.SafariZoneEastRestHouse, pos: { x: 4, y: 15 } },
    },
    19: {
      50: { map: MapId.SafariZoneEastRestHouse, pos: { x: 4, y: 15 } },
      51: { map: MapId.SafariZoneEastRestHouse, pos: { x: 4, y: 15 } },
    },
    44: {
      0: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
      1: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
    },
    45: {
      0: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
      1: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
    },
    46: {
      0: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
      1: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
    },
    47: {
      0: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
      1: { map: MapId.SafariZoneCenter, pos: { x: 58, y: 21 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    22: [4, 5],
    23: [4, 5],
  },
  items: [
    { item: ItemType.FullRestore, pos: { x: 42, y: 21 } },
    { item: ItemType.MaxPotion, pos: { x: 6, y: 15 } },
    { item: ItemType.Carbos, pos: { x: 40, y: 27 } },
    { item: ItemType.Tm37, pos: { x: 30, y: 25 } },
  ],
};

export default safariZoneEast;
