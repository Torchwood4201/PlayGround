import safarizonewestresthouseImage from "../../assets/map/gen/safari-zone-west-rest-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerMale, lass, scientist } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_WEST_REST_HOUSE - do not hand-edit.
const safariZoneWestRestHouse: MapType = {
  name: "Safari Zone West Rest House",
  image: safarizonewestresthouseImage,
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
    4: {
      0: ["Using BAIT will", "make POKEMON easier to catch."],
      12: ["I hiked a lot, but", "I didn't see any POKEMON I wanted."],
    },
    8: {
      8: ["Tossing ROCKs at", "POKEMON might make them run, but they'll", "be easier to catch."],
    },
  },
  maps: {
    14: {
      4: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      5: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      6: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      7: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
    },
    15: {
      4: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      5: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      6: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
      7: { map: MapId.SafariZoneWest, pos: { x: 22, y: 23 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 8, y: 8 }, facing: Direction.Down },
    { npc: aceTrainerMale, pos: { x: 0, y: 4 }, facing: Direction.Right },
    { npc: lass, pos: { x: 12, y: 4 }, facing: Direction.Down },
  ],
};

export default safariZoneWestRestHouse;
