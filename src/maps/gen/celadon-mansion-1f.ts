import celadonmansion1fImage from "../../assets/map/gen/celadon-mansion-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_MANSION_1F - do not hand-edit.
const celadonMansion1f: MapType = {
  name: "Celadon Mansion 1F",
  image: celadonmansion1fImage,
  height: 12,
  width: 8,
  start: { x: 8, y: 23 },
  walls: {
    0: [2, 3],
    1: [2, 3],
  },
  text: {
    19: {
      8: ["CELADON MANSION", "Manager's Suite"],
      9: ["CELADON MANSION", "Manager's Suite"],
    },
  },
  maps: {
    2: {
      4: { map: MapId.CeladonMansion2f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion2f, pos: { x: 4, y: 3 } },
      14: { map: MapId.CeladonMansion2f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CeladonMansion2f, pos: { x: 14, y: 3 } },
    },
    3: {
      4: { map: MapId.CeladonMansion2f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion2f, pos: { x: 4, y: 3 } },
      14: { map: MapId.CeladonMansion2f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CeladonMansion2f, pos: { x: 14, y: 3 } },
    },
  },
  exits: {
    1: [8, 9],
    23: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 48, y: 19 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMansion1f;
