import safarizonenorthresthouseImage from "../../assets/map/gen/safari-zone-north-rest-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, hiker, scientist } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_NORTH_REST_HOUSE - do not hand-edit.
const safariZoneNorthRestHouse: MapType = {
  name: "Safari Zone North Rest House",
  image: safarizonenorthresthouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    2: [0, 1, 2, 3],
    3: [0, 1, 2, 3],
    4: [0, 1, 2, 3],
    5: [0, 1, 2, 3],
    6: [6, 7],
    7: [6, 7],
  },
  text: {
    6: {
      12: ["You can keep any", "item you find on the ground here.", "But, you'll run", "out of time if you try for all of them", "at once!"],
    },
    8: {
      6: ["Go to the deepest", "part of the SAFARI ZONE. You will win", "a prize!"],
    },
    10: {
      2: ["My EEVEE evolved", "into FLAREON!", "But, a friend's", "EEVEE turned into a VAPOREON! I wonder", "why?"],
    },
  },
  maps: {
    14: {
      4: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      5: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      6: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      7: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
    },
    15: {
      4: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      5: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      6: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
      7: { map: MapId.SafariZoneNorth, pos: { x: 70, y: 7 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 12, y: 6 }, facing: Direction.Down },
    { npc: hiker, pos: { x: 6, y: 8 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 2, y: 10 }, facing: Direction.Down },
  ],
};

export default safariZoneNorthRestHouse;
