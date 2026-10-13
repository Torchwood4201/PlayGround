import safarizonecenterresthouseImage from "../../assets/map/gen/safari-zone-center-rest-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass, scientist } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SAFARI_ZONE_CENTER_REST_HOUSE - do not hand-edit.
const safariZoneCenterRestHouse: MapType = {
  name: "Safari Zone Center Rest House",
  image: safarizonecenterresthouseImage,
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
      6: ["SARA: Where did", "my boy friend, ERIK, go?"],
    },
    8: {
      2: ["I'm catching", "POKEMON to take home as gifts!"],
    },
  },
  maps: {
    14: {
      4: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      5: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      6: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      7: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
    },
    15: {
      4: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      5: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      6: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
      7: { map: MapId.SafariZoneCenter, pos: { x: 34, y: 39 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 4 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 2, y: 8 }, facing: Direction.Down },
  ],
};

export default safariZoneCenterRestHouse;
