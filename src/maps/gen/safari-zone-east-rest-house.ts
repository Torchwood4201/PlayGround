import safarizoneeastresthouseImage from "../../assets/map/gen/safari-zone-east-rest-house.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_EAST_REST_HOUSE - do not hand-edit.
const safariZoneEastRestHouse: MapType = {
  name: "Safari Zone East Rest House",
  image: safarizoneeastresthouseImage,
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
  text: {},
  maps: {
    14: {
      4: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      5: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      6: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      7: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
    },
    15: {
      4: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      5: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      6: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
      7: { map: MapId.SafariZoneEast, pos: { x: 50, y: 19 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default safariZoneEastRestHouse;
