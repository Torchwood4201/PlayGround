import safarizonegateImage from "../../assets/map/gen/safari-zone-gate.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered SAFARI_ZONE_GATE - do not hand-edit.
const safariZoneGate: MapType = {
  name: "Safari Zone Gate",
  image: safarizonegateImage,
  height: 6,
  width: 8,
  start: { x: 6, y: 11 },
  walls: {
    2: [6, 7],
    3: [6, 7],
  },
  text: {},
  maps: {
    0: {
      6: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 51 } },
      7: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 51 } },
      8: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 51 } },
      9: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 51 } },
    },
    1: {
      6: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 51 } },
      7: { map: MapId.SafariZoneCenter, pos: { x: 28, y: 51 } },
      8: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 51 } },
      9: { map: MapId.SafariZoneCenter, pos: { x: 30, y: 51 } },
    },
  },
  exits: {
    11: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 36, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default safariZoneGate;
