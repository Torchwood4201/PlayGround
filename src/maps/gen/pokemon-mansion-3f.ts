import pokemonmansion3fImage from "../../assets/map/gen/pokemon-mansion-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { burglar, scientist } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_MANSION_3F - do not hand-edit.
const pokemonMansion3f: MapType = {
  name: "Pokemon Mansion 3F",
  image: pokemonmansion3fImage,
  height: 18,
  width: 30,
  start: { x: 0, y: 0 },
  walls: {
    0: [14, 15],
    1: [14, 15],
    2: [22, 23],
    3: [22, 23],
    4: [8, 9, 26, 27],
    5: [8, 9, 26, 27],
    6: [20, 21],
    7: [20, 21],
    12: [8, 9, 22, 23],
    13: [8, 9, 22, 23],
    14: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    15: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    16: [0, 1, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    17: [0, 1, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  },
  text: {
    24: {
      12: ["Diary: Feb. 6", "MEW gave birth.", "We named the", "newborn MEWTWO."],
    },
  },
  maps: {
    2: {
      12: { map: MapId.PokemonMansion2f, pos: { x: 12, y: 3 } },
      13: { map: MapId.PokemonMansion2f, pos: { x: 12, y: 3 } },
    },
    3: {
      12: { map: MapId.PokemonMansion2f, pos: { x: 12, y: 3 } },
      13: { map: MapId.PokemonMansion2f, pos: { x: 12, y: 3 } },
    },
    20: {
      14: { map: MapId.PokemonMansion2f, pos: { x: 14, y: 21 } },
      15: { map: MapId.PokemonMansion2f, pos: { x: 14, y: 21 } },
    },
    21: {
      14: { map: MapId.PokemonMansion2f, pos: { x: 14, y: 21 } },
      15: { map: MapId.PokemonMansion2f, pos: { x: 14, y: 21 } },
    },
    28: {
      50: { map: MapId.PokemonMansion2f, pos: { x: 50, y: 29 } },
      51: { map: MapId.PokemonMansion2f, pos: { x: 50, y: 29 } },
    },
    29: {
      50: { map: MapId.PokemonMansion2f, pos: { x: 50, y: 29 } },
      51: { map: MapId.PokemonMansion2f, pos: { x: 50, y: 29 } },
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
      pokemon: [{ id: 38, level: 38 }],
      intro: ["This place is", "like, huge!"],
      outtro: ["Ayah!"],
      money: 3420,
      pos: { x: 10, y: 22 },
      postGame: { message: ["I wonder where", "my partner went."] },
    },
    {
      npc: scientist,
      facing: Direction.Left,
      pokemon: [{ id: 81, level: 33 }, { id: 82, level: 33 }, { id: 100, level: 33 }],
      intro: ["My mentor once", "lived here."],
      outtro: ["Whew!", "Overwhelming!"],
      money: 1650,
      pos: { x: 40, y: 22 },
      postGame: { message: ["So, you're stuck?", "Try jumping off over there!"] },
    },
  ],
  items: [
    { item: ItemType.MaxPotion, pos: { x: 2, y: 33 } },
    { item: ItemType.Iron, pos: { x: 50, y: 11 } },
  ],
};

export default pokemonMansion3f;
