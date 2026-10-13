import celadonmartroofImage from "../../assets/map/gen/celadon-mart-roof.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_ROOF - do not hand-edit.
const celadonMartRoof: MapType = {
  name: "Celadon Mart Roof",
  image: celadonmartroofImage,
  height: 8,
  width: 20,
  start: { x: 10, y: 6 },
  walls: {
    0: [2, 3, 4, 5, 6, 7, 8, 9],
    1: [2, 3, 4, 5, 6, 7, 8, 9],
    2: [8, 9, 10, 11],
    3: [8, 9, 10, 11],
    4: [2, 3, 4, 5, 12, 13, 14, 15, 16, 17],
    5: [2, 3, 4, 5, 12, 13, 14, 15, 16, 17],
  },
  text: {
    3: {
      20: ["..."],
      21: ["..."],
      22: ["..."],
      23: ["..."],
    },
    5: {
      24: ["..."],
      25: ["..."],
      26: ["ROOFTOP SQUARE:", "VENDING MACHINES"],
      27: ["ROOFTOP SQUARE:", "VENDING MACHINES"],
    },
  },
  maps: {
    4: {
      30: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
      31: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
    },
    5: {
      30: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
      31: { map: MapId.CeladonMart5f, pos: { x: 24, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMartRoof;
