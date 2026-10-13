import pokemontower1fImage from "../../assets/map/gen/pokemon-tower-1f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_1F - do not hand-edit.
const pokemonTower1f: MapType = {
  name: "Pokemon Tower 1F",
  image: pokemontower1fImage,
  height: 18,
  width: 20,
  start: { x: 20, y: 35 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    1: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 4, 5, 18, 19],
    3: [0, 1, 2, 3, 4, 5, 18, 19],
    4: [0, 1],
    5: [0, 1],
    6: [0, 1],
    7: [0, 1],
    8: [0, 1],
    9: [0, 1],
    10: [0, 1],
    11: [0, 1],
    12: [0, 1],
    13: [0, 1],
    14: [0, 1, 2, 3, 18, 19],
    15: [0, 1, 2, 3, 18, 19],
    16: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    17: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
  },
  text: {},
  maps: {
    18: {
      36: { map: MapId.PokemonTower2f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower2f, pos: { x: 36, y: 19 } },
    },
    19: {
      36: { map: MapId.PokemonTower2f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower2f, pos: { x: 36, y: 19 } },
    },
  },
  exits: {
    35: [20, 21, 22, 23],
  },
  exitReturnMap: MapId.LavenderTown,
  exitReturnPos: { x: 28, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default pokemonTower1f;
