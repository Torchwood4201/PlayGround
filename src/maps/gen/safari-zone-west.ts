import safarizonewestImage from "../../assets/map/gen/safari-zone-west.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_WEST - do not hand-edit.
const safariZoneWest: MapType = {
  name: "Safari Zone West",
  image: safarizonewestImage,
  height: 26,
  width: 30,
  start: { x: 15, y: 24 },
  walls: {
    4: [10, 11],
    5: [10, 11],
    8: [2, 3],
    9: [2, 3],
    10: [2, 3, 4, 5, 6, 7, 8, 9, 14, 15],
    11: [2, 3, 4, 5, 6, 7, 8, 9, 14, 15],
    12: [2, 3, 14, 15],
    13: [2, 3, 14, 15],
    14: [14, 15],
    15: [14, 15],
  },
  text: {
    7: {
      34: ["REQUEST NOTICE", "Please find the", "SAFARI WARDEN's lost GOLD TEETH.", "They're around here somewhere.", "Reward offered!", "Contact: WARDEN"],
      35: ["REQUEST NOTICE", "Please find the", "SAFARI WARDEN's lost GOLD TEETH.", "They're around here somewhere.", "Reward offered!", "Contact: WARDEN"],
    },
    9: {
      52: ["TRAINER TIPS", "Zone Exploration", "Campaign!", "The Search for", "the SECRET HOUSE!"],
      53: ["TRAINER TIPS", "Zone Exploration", "Campaign!", "The Search for", "the SECRET HOUSE!"],
    },
    25: {
      24: ["REST HOUSE"],
      25: ["REST HOUSE"],
    },
    45: {
      48: ["AREA 3", "EAST: CENTER AREA"],
      49: ["AREA 3", "EAST: CENTER AREA"],
    },
  },
  maps: {
    0: {
      40: { map: MapId.SafariZoneNorth, pos: { x: 4, y: 71 } },
      41: { map: MapId.SafariZoneNorth, pos: { x: 4, y: 71 } },
      42: { map: MapId.SafariZoneNorth, pos: { x: 6, y: 71 } },
      43: { map: MapId.SafariZoneNorth, pos: { x: 6, y: 71 } },
      52: { map: MapId.SafariZoneNorth, pos: { x: 16, y: 71 } },
      53: { map: MapId.SafariZoneNorth, pos: { x: 16, y: 71 } },
      54: { map: MapId.SafariZoneNorth, pos: { x: 18, y: 71 } },
      55: { map: MapId.SafariZoneNorth, pos: { x: 18, y: 71 } },
    },
    1: {
      40: { map: MapId.SafariZoneNorth, pos: { x: 4, y: 71 } },
      41: { map: MapId.SafariZoneNorth, pos: { x: 4, y: 71 } },
      42: { map: MapId.SafariZoneNorth, pos: { x: 6, y: 71 } },
      43: { map: MapId.SafariZoneNorth, pos: { x: 6, y: 71 } },
      52: { map: MapId.SafariZoneNorth, pos: { x: 16, y: 71 } },
      53: { map: MapId.SafariZoneNorth, pos: { x: 16, y: 71 } },
      54: { map: MapId.SafariZoneNorth, pos: { x: 18, y: 71 } },
      55: { map: MapId.SafariZoneNorth, pos: { x: 18, y: 71 } },
    },
    6: {
      6: { map: MapId.SafariZoneSecretHouse, pos: { x: 4, y: 15 } },
      7: { map: MapId.SafariZoneSecretHouse, pos: { x: 4, y: 15 } },
    },
    7: {
      6: { map: MapId.SafariZoneSecretHouse, pos: { x: 4, y: 15 } },
      7: { map: MapId.SafariZoneSecretHouse, pos: { x: 4, y: 15 } },
    },
    22: {
      22: { map: MapId.SafariZoneWestRestHouse, pos: { x: 4, y: 15 } },
      23: { map: MapId.SafariZoneWestRestHouse, pos: { x: 4, y: 15 } },
    },
    23: {
      22: { map: MapId.SafariZoneWestRestHouse, pos: { x: 4, y: 15 } },
      23: { map: MapId.SafariZoneWestRestHouse, pos: { x: 4, y: 15 } },
    },
    44: {
      58: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 21 } },
      59: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 21 } },
    },
    45: {
      58: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 21 } },
      59: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 21 } },
    },
    46: {
      58: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 23 } },
      59: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 23 } },
    },
    47: {
      58: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 23 } },
      59: { map: MapId.SafariZoneCenter, pos: { x: 0, y: 23 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  cut: {
    2: [16, 17],
    3: [16, 17],
  },
  items: [
    { item: ItemType.MaxPotion, pos: { x: 16, y: 41 } },
    { item: ItemType.Tm32, pos: { x: 18, y: 15 } },
    { item: ItemType.MaxRevive, pos: { x: 36, y: 37 } },
    { item: ItemType.GoldTeeth, pos: { x: 38, y: 15 } },
  ],
};

export default safariZoneWest;
