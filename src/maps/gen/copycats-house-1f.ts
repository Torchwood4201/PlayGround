import copycatshouse1fImage from "../../assets/map/gen/copycats-house-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered COPYCATS_HOUSE_1F - do not hand-edit.
const copycatsHouse1f: MapType = {
  name: "Copycats House 1F",
  image: copycatshouse1fImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {},
  maps: {
    2: {
      14: { map: MapId.CopycatsHouse2f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CopycatsHouse2f, pos: { x: 14, y: 3 } },
    },
    3: {
      14: { map: MapId.CopycatsHouse2f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CopycatsHouse2f, pos: { x: 14, y: 3 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.SaffronCity,
  exitReturnPos: { x: 14, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default copycatsHouse1f;
