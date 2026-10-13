import pokemonmansion1fImage from "../../assets/map/gen/pokemon-mansion-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_MANSION_1F - do not hand-edit.
const pokemonMansion1f: MapType = {
  name: "Pokemon Mansion 1F",
  image: pokemonmansion1fImage,
  height: 28,
  width: 30,
  start: { x: 8, y: 55 },
  walls: {
    0: [28, 29],
    1: [28, 29],
    2: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    3: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    6: [4, 5, 14, 15, 20, 21, 22, 23],
    7: [4, 5, 14, 15, 20, 21, 22, 23],
    8: [6, 7],
    9: [6, 7],
    10: [2, 3, 16, 17, 18, 19, 20, 21, 26, 27],
    11: [2, 3, 16, 17, 18, 19, 20, 21, 26, 27],
    12: [2, 3, 20, 21],
    13: [2, 3, 20, 21],
    14: [2, 3],
    15: [2, 3],
    16: [2, 3, 18, 19, 22, 23],
    17: [2, 3, 18, 19, 22, 23],
    18: [2, 3, 24, 25],
    19: [2, 3, 24, 25],
    20: [2, 3],
    21: [2, 3],
    22: [2, 3],
    23: [2, 3],
    24: [2, 3],
    25: [2, 3],
    26: [0, 1, 2, 3],
    27: [0, 1, 2, 3],
  },
  text: {},
  maps: {
    20: {
      10: { map: MapId.PokemonMansion2f, pos: { x: 10, y: 21 } },
      11: { map: MapId.PokemonMansion2f, pos: { x: 10, y: 21 } },
    },
    21: {
      10: { map: MapId.PokemonMansion2f, pos: { x: 10, y: 21 } },
      11: { map: MapId.PokemonMansion2f, pos: { x: 10, y: 21 } },
    },
    46: {
      42: { map: MapId.PokemonMansionB1f, pos: { x: 46, y: 45 } },
      43: { map: MapId.PokemonMansionB1f, pos: { x: 46, y: 45 } },
    },
    47: {
      42: { map: MapId.PokemonMansionB1f, pos: { x: 46, y: 45 } },
      43: { map: MapId.PokemonMansionB1f, pos: { x: 46, y: 45 } },
    },
  },
  exits: {
    55: [8, 9, 10, 11, 12, 13, 14, 15, 52, 53, 54, 55],
  },
  exitReturnMap: MapId.CinnabarIsland,
  exitReturnPos: { x: 12, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: scientist,
      facing: Direction.Left,
      pokemon: [{ id: 101, level: 29 }, { id: 110, level: 29 }],
      intro: ["Who are you? There", "shouldn't be anyone here."],
      outtro: ["Ouch!"],
      money: 1450,
      pos: { x: 34, y: 34 },
      postGame: { message: ["A key? I don't", "know what you're talking about."] },
    },
  ],
  items: [
    { item: ItemType.EscapeRope, pos: { x: 28, y: 7 } },
    { item: ItemType.Carbos, pos: { x: 36, y: 43 } },
  ],
};

export default pokemonMansion1f;
