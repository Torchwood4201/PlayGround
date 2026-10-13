import route16gate2fImage from "../../assets/map/gen/route-16-gate-2f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered ROUTE_16_GATE_2F - do not hand-edit.
const route16Gate2f: MapType = {
  name: "Route 16 Gate 2F",
  image: route16gate2fImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    2: [6, 7],
    3: [6, 7],
    4: [0, 1, 2, 3, 4, 5, 6, 7],
    5: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  text: {
    5: {
      2: ["Looked into the", "binoculars.", "It's CELADON DEPT.", "STORE!"],
      3: ["Looked into the", "binoculars.", "It's CELADON DEPT.", "STORE!"],
      12: ["Looked into the", "binoculars.", "There's a long", "path over water!"],
      13: ["Looked into the", "binoculars.", "There's a long", "path over water!"],
    },
  },
  maps: {
    14: {
      14: { map: MapId.Route16Gate1f, pos: { x: 12, y: 25 } },
      15: { map: MapId.Route16Gate1f, pos: { x: 12, y: 25 } },
    },
    15: {
      14: { map: MapId.Route16Gate1f, pos: { x: 12, y: 25 } },
      15: { map: MapId.Route16Gate1f, pos: { x: 12, y: 25 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default route16Gate2f;
