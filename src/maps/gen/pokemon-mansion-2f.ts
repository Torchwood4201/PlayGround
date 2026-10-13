import pokemonmansion2fImage from "../../assets/map/gen/pokemon-mansion-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { burglar } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_MANSION_2F - do not hand-edit.
const pokemonMansion2f: MapType = {
  name: "Pokemon Mansion 2F",
  image: pokemonmansion2fImage,
  height: 28,
  width: 30,
  start: { x: 15, y: 26 },
  walls: {
    0: [8, 9, 14, 15],
    1: [8, 9, 14, 15],
    4: [16, 17],
    5: [16, 17],
    6: [4, 5, 6, 7, 22, 23],
    7: [4, 5, 6, 7, 22, 23],
    12: [18, 19],
    13: [18, 19],
    16: [4, 5, 16, 17],
    17: [4, 5, 16, 17],
    18: [6, 7, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    19: [6, 7, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    20: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    21: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    22: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    23: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    24: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    25: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    26: [0, 1, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    27: [0, 1, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  text: {},
  maps: {
    2: {
      12: { map: MapId.PokemonMansion3f, pos: { x: 12, y: 3 } },
      13: { map: MapId.PokemonMansion3f, pos: { x: 12, y: 3 } },
    },
    3: {
      12: { map: MapId.PokemonMansion3f, pos: { x: 12, y: 3 } },
      13: { map: MapId.PokemonMansion3f, pos: { x: 12, y: 3 } },
    },
    20: {
      10: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 21 } },
      11: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 21 } },
      14: { map: MapId.PokemonMansion3f, pos: { x: 14, y: 21 } },
      15: { map: MapId.PokemonMansion3f, pos: { x: 14, y: 21 } },
    },
    21: {
      10: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 21 } },
      11: { map: MapId.PokemonMansion1f, pos: { x: 10, y: 21 } },
      14: { map: MapId.PokemonMansion3f, pos: { x: 14, y: 21 } },
      15: { map: MapId.PokemonMansion3f, pos: { x: 14, y: 21 } },
    },
    28: {
      50: { map: MapId.PokemonMansion3f, pos: { x: 50, y: 29 } },
      51: { map: MapId.PokemonMansion3f, pos: { x: 50, y: 29 } },
    },
    29: {
      50: { map: MapId.PokemonMansion3f, pos: { x: 50, y: 29 } },
      51: { map: MapId.PokemonMansion3f, pos: { x: 50, y: 29 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: burglar,
      facing: Direction.Down,
      pokemon: [{ id: 4, level: 34 }, { id: 5, level: 34 }],
      intro: ["I can't get out!", "This old place is one big puzzle!"],
      outtro: ["Oh no!", "My bag of loot!"],
      money: 3060,
      pos: { x: 6, y: 34 },
      postGame: { message: ["Switches open and", "close alternating sets of doors!"] },
    },
  ],
  items: [
    { item: ItemType.Calcium, pos: { x: 56, y: 15 } },
  ],
};

export default pokemonMansion2f;
