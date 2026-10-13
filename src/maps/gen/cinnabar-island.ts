import cinnabarislandImage from "../../assets/map/gen/cinnabar-island.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CINNABAR_ISLAND - do not hand-edit.
const cinnabarIsland: MapType = {
  name: "Cinnabar Island",
  image: cinnabarislandImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [4, 5, 8, 9],
    1: [4, 5, 8, 9],
    2: [14, 15],
    3: [14, 15],
    6: [4, 5, 8, 9],
    7: [4, 5, 8, 9],
    8: [10, 11, 12, 13, 14, 15, 16, 17],
    9: [10, 11, 12, 13, 14, 15, 16, 17],
  },
  text: {
    7: {
      26: ["CINNABAR ISLAND", "POKEMON GYM LEADER: BLAINE", "The Hot-Headed", "Quiz Master!"],
      27: ["CINNABAR ISLAND", "POKEMON GYM LEADER: BLAINE", "The Hot-Headed", "Quiz Master!"],
    },
    11: {
      18: ["CINNABAR ISLAND", "The Fiery Town of Burning Desire"],
      19: ["CINNABAR ISLAND", "The Fiery Town of Burning Desire"],
    },
    23: {
      18: ["POKEMON LAB"],
      19: ["POKEMON LAB"],
      24: ["Heal Your POKEMON!", "POKEMON CENTER"],
      25: ["Heal Your POKEMON!", "POKEMON CENTER"],
      32: ["All your item", "needs fulfilled! POKEMON MART"],
      33: ["All your item", "needs fulfilled! POKEMON MART"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.Route21, pos: { x: 0, y: 88 } },
      1: { map: MapId.Route21, pos: { x: 0, y: 88 } },
      2: { map: MapId.Route21, pos: { x: 2, y: 88 } },
      3: { map: MapId.Route21, pos: { x: 2, y: 88 } },
      6: { map: MapId.Route21, pos: { x: 6, y: 88 } },
      7: { map: MapId.Route21, pos: { x: 6, y: 88 } },
      10: { map: MapId.Route21, pos: { x: 10, y: 87 } },
      11: { map: MapId.Route21, pos: { x: 10, y: 87 } },
      12: { map: MapId.Route21, pos: { x: 12, y: 88 } },
      13: { map: MapId.Route21, pos: { x: 12, y: 88 } },
      14: { map: MapId.Route21, pos: { x: 14, y: 88 } },
      15: { map: MapId.Route21, pos: { x: 14, y: 88 } },
      16: { map: MapId.Route21, pos: { x: 16, y: 88 } },
      17: { map: MapId.Route21, pos: { x: 16, y: 88 } },
      18: { map: MapId.Route21, pos: { x: 18, y: 88 } },
      19: { map: MapId.Route20, pos: { x: 1, y: 0 } },
    },
    1: {
      19: { map: MapId.Route20, pos: { x: 1, y: 0 } },
    },
    2: {
      19: { map: MapId.Route20, pos: { x: 1, y: 2 } },
    },
    3: {
      19: { map: MapId.Route20, pos: { x: 1, y: 2 } },
    },
    4: {
      19: { map: MapId.Route20, pos: { x: 1, y: 4 } },
    },
    5: {
      19: { map: MapId.Route20, pos: { x: 1, y: 4 } },
    },
    6: {
      12: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 55 } },
      13: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 55 } },
      19: { map: MapId.Route20, pos: { x: 1, y: 6 } },
      36: { map: MapId.CinnabarGym, pos: { x: 32, y: 35 } },
      37: { map: MapId.CinnabarGym, pos: { x: 32, y: 35 } },
    },
    7: {
      12: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 55 } },
      13: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 55 } },
      19: { map: MapId.Route20, pos: { x: 1, y: 6 } },
      36: { map: MapId.CinnabarGym, pos: { x: 32, y: 35 } },
      37: { map: MapId.CinnabarGym, pos: { x: 32, y: 35 } },
    },
    8: {
      19: { map: MapId.Route20, pos: { x: 1, y: 8 } },
    },
    9: {
      19: { map: MapId.Route20, pos: { x: 1, y: 8 } },
    },
    10: {
      19: { map: MapId.Route20, pos: { x: 1, y: 10 } },
    },
    11: {
      19: { map: MapId.Route20, pos: { x: 1, y: 10 } },
    },
    12: {
      19: { map: MapId.Route20, pos: { x: 1, y: 12 } },
    },
    13: {
      19: { map: MapId.Route20, pos: { x: 1, y: 12 } },
    },
    14: {
      19: { map: MapId.Route20, pos: { x: 1, y: 14 } },
    },
    15: {
      19: { map: MapId.Route20, pos: { x: 1, y: 14 } },
    },
    16: {
      19: { map: MapId.Route20, pos: { x: 1, y: 16 } },
    },
    17: {
      19: { map: MapId.Route20, pos: { x: 1, y: 16 } },
    },
    18: {
      12: { map: MapId.CinnabarLab, pos: { x: 4, y: 15 } },
      13: { map: MapId.CinnabarLab, pos: { x: 4, y: 15 } },
    },
    19: {
      12: { map: MapId.CinnabarLab, pos: { x: 4, y: 15 } },
      13: { map: MapId.CinnabarLab, pos: { x: 4, y: 15 } },
    },
    22: {
      22: { map: MapId.CinnabarPokecenter, pos: { x: 6, y: 15 } },
      23: { map: MapId.CinnabarPokecenter, pos: { x: 6, y: 15 } },
      30: { map: MapId.CinnabarMart, pos: { x: 6, y: 15 } },
      31: { map: MapId.CinnabarMart, pos: { x: 6, y: 15 } },
    },
    23: {
      22: { map: MapId.CinnabarPokecenter, pos: { x: 6, y: 15 } },
      23: { map: MapId.CinnabarPokecenter, pos: { x: 6, y: 15 } },
      30: { map: MapId.CinnabarMart, pos: { x: 6, y: 15 } },
      31: { map: MapId.CinnabarMart, pos: { x: 6, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  water: {
    0: [2, 3],
    1: [2, 3],
    2: [2, 3],
    3: [2, 3],
    4: [2, 3],
    5: [2, 3],
    6: [2, 3],
    7: [2, 3],
    8: [2, 3],
    9: [2, 3],
    10: [2, 3],
    11: [2, 3],
    12: [2, 3, 4, 5],
    13: [2, 3, 4, 5],
    14: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    15: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    16: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    17: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  },
};

export default cinnabarIsland;
