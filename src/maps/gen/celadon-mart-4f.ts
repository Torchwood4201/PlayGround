import celadonmart4fImage from "../../assets/map/gen/celadon-mart-4f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_4F - do not hand-edit.
const celadonMart4f: MapType = {
  name: "Celadon Mart 4F",
  image: celadonmart4fImage,
  height: 8,
  width: 20,
  start: { x: 10, y: 6 },
  walls: {
    2: [4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17],
    3: [4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17],
  },
  text: {
    3: {
      28: ["Express yourself", "with gifts!", "4F: WISEMAN GIFTS", "Evolution Special!", "Element STONEs on sale now!"],
      29: ["Express yourself", "with gifts!", "4F: WISEMAN GIFTS", "Evolution Special!", "Element STONEs on sale now!"],
    },
  },
  maps: {
    2: {
      24: { map: MapId.CeladonMart3f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart3f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart5f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart5f, pos: { x: 32, y: 3 } },
    },
    3: {
      24: { map: MapId.CeladonMart3f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart3f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart5f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart5f, pos: { x: 32, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMart4f;
