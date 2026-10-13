import safarizonecenterImage from "../../assets/map/gen/safari-zone-center.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_CENTER - do not hand-edit.
const safariZoneCenter: MapType = {
  name: "Safari Zone Center",
  image: safarizonecenterImage,
  height: 26,
  width: 30,
  start: { x: 15, y: 24 },
  walls: {
    8: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    9: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    10: [8, 9, 14, 15, 24, 25],
    11: [8, 9, 14, 15, 24, 25],
    12: [2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    13: [2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  },
  text: {
    41: {
      36: ["REST HOUSE"],
      37: ["REST HOUSE"],
    },
    45: {
      28: ["TRAINER TIPS", "Press the START", "Button to check remaining time!"],
      29: ["TRAINER TIPS", "Press the START", "Button to check remaining time!"],
    },
  },
  maps: {
    0: {
      28: { map: MapId.SafariZoneNorth, pos: { x: 40, y: 71 } },
      29: { map: MapId.SafariZoneNorth, pos: { x: 40, y: 71 } },
      30: { map: MapId.SafariZoneNorth, pos: { x: 42, y: 71 } },
      31: { map: MapId.SafariZoneNorth, pos: { x: 42, y: 71 } },
    },
    1: {
      28: { map: MapId.SafariZoneNorth, pos: { x: 40, y: 71 } },
      29: { map: MapId.SafariZoneNorth, pos: { x: 40, y: 71 } },
      30: { map: MapId.SafariZoneNorth, pos: { x: 42, y: 71 } },
      31: { map: MapId.SafariZoneNorth, pos: { x: 42, y: 71 } },
    },
    20: {
      0: { map: MapId.SafariZoneWest, pos: { x: 58, y: 45 } },
      1: { map: MapId.SafariZoneWest, pos: { x: 58, y: 45 } },
      58: { map: MapId.SafariZoneEast, pos: { x: 0, y: 45 } },
      59: { map: MapId.SafariZoneEast, pos: { x: 0, y: 45 } },
    },
    21: {
      0: { map: MapId.SafariZoneWest, pos: { x: 58, y: 45 } },
      1: { map: MapId.SafariZoneWest, pos: { x: 58, y: 45 } },
      58: { map: MapId.SafariZoneEast, pos: { x: 0, y: 45 } },
      59: { map: MapId.SafariZoneEast, pos: { x: 0, y: 45 } },
    },
    22: {
      0: { map: MapId.SafariZoneWest, pos: { x: 58, y: 47 } },
      1: { map: MapId.SafariZoneWest, pos: { x: 58, y: 47 } },
      58: { map: MapId.SafariZoneEast, pos: { x: 0, y: 47 } },
      59: { map: MapId.SafariZoneEast, pos: { x: 0, y: 47 } },
    },
    23: {
      0: { map: MapId.SafariZoneWest, pos: { x: 58, y: 47 } },
      1: { map: MapId.SafariZoneWest, pos: { x: 58, y: 47 } },
      58: { map: MapId.SafariZoneEast, pos: { x: 0, y: 47 } },
      59: { map: MapId.SafariZoneEast, pos: { x: 0, y: 47 } },
    },
    38: {
      34: { map: MapId.SafariZoneCenterRestHouse, pos: { x: 4, y: 15 } },
      35: { map: MapId.SafariZoneCenterRestHouse, pos: { x: 4, y: 15 } },
    },
    39: {
      34: { map: MapId.SafariZoneCenterRestHouse, pos: { x: 4, y: 15 } },
      35: { map: MapId.SafariZoneCenterRestHouse, pos: { x: 4, y: 15 } },
    },
    50: {
      28: { map: MapId.SafariZoneGate, pos: { x: 6, y: 1 } },
      29: { map: MapId.SafariZoneGate, pos: { x: 6, y: 1 } },
      30: { map: MapId.SafariZoneGate, pos: { x: 8, y: 1 } },
      31: { map: MapId.SafariZoneGate, pos: { x: 8, y: 1 } },
    },
    51: {
      28: { map: MapId.SafariZoneGate, pos: { x: 6, y: 1 } },
      29: { map: MapId.SafariZoneGate, pos: { x: 6, y: 1 } },
      30: { map: MapId.SafariZoneGate, pos: { x: 8, y: 1 } },
      31: { map: MapId.SafariZoneGate, pos: { x: 8, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  items: [
    { item: ItemType.Nugget, pos: { x: 28, y: 21 } },
  ],
};

export default safariZoneCenter;
