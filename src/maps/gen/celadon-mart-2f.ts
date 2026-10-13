import celadonmart2fImage from "../../assets/map/gen/celadon-mart-2f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CELADON_MART_2F - do not hand-edit.
const celadonMart2f: MapType = {
  name: "Celadon Mart 2F",
  image: celadonmart2fImage,
  height: 8,
  width: 20,
  start: { x: 10, y: 6 },
  walls: {
    2: [4, 5, 6, 7, 10, 11, 12, 13, 16, 17, 18, 19],
    3: [4, 5, 6, 7, 10, 11, 12, 13, 16, 17, 18, 19],
  },
  text: {
    3: {
      28: ["Top Grade Items", "for Trainers!", "2F: TRAINER'S", "MARKET"],
      29: ["Top Grade Items", "for Trainers!", "2F: TRAINER'S", "MARKET"],
    },
  },
  maps: {
    2: {
      24: { map: MapId.CeladonMart1f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart1f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart3f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart3f, pos: { x: 32, y: 3 } },
    },
    3: {
      24: { map: MapId.CeladonMart1f, pos: { x: 24, y: 3 } },
      25: { map: MapId.CeladonMart1f, pos: { x: 24, y: 3 } },
      32: { map: MapId.CeladonMart3f, pos: { x: 32, y: 3 } },
      33: { map: MapId.CeladonMart3f, pos: { x: 32, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMart2f;
