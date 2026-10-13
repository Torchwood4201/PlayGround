import museum2fImage from "../../assets/map/gen/museum-2f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered MUSEUM_2F - do not hand-edit.
const museum2f: MapType = {
  name: "Museum 2F",
  image: museum2fImage,
  height: 8,
  width: 14,
  start: { x: 7, y: 6 },
  walls: {},
  text: {
    5: {
      22: ["SPACE SHUTTLE", "COLUMBIA"],
      23: ["SPACE SHUTTLE", "COLUMBIA"],
    },
    11: {
      4: ["Meteorite that", "fell on MT.MOON. (MOON STONE?)"],
      5: ["Meteorite that", "fell on MT.MOON. (MOON STONE?)"],
    },
  },
  maps: {
    14: {
      14: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
    },
    15: {
      14: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default museum2f;
