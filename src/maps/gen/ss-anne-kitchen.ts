import ssannekitchenImage from "../../assets/map/gen/ss-anne-kitchen.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_KITCHEN - do not hand-edit.
const ssAnneKitchen: MapType = {
  name: "SS Anne Kitchen",
  image: ssannekitchenImage,
  height: 16,
  width: 14,
  start: { x: 7, y: 14 },
  walls: {},
  text: {},
  maps: {
    0: {
      12: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
      13: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
    },
    1: {
      12: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
      13: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default ssAnneKitchen;
