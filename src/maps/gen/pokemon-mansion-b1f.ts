import pokemonmansionb1fImage from "../../assets/map/gen/pokemon-mansion-b1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { burglar, scientist } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_MANSION_B1F - do not hand-edit.
const pokemonMansionB1f: MapType = {
  name: "Pokemon Mansion B1F",
  image: pokemonmansionb1fImage,
  height: 28,
  width: 30,
  start: { x: 15, y: 26 },
  walls: {
    0: [8, 9, 28, 29],
    1: [8, 9, 28, 29],
    2: [22, 23, 24, 25, 26, 27],
    3: [22, 23, 24, 25, 26, 27],
    4: [10, 11, 22, 23],
    5: [10, 11, 22, 23],
    8: [8, 9, 24, 25],
    9: [8, 9, 24, 25],
    26: [0, 1, 20, 21],
    27: [0, 1, 20, 21],
  },
  text: {
    40: {
      32: ["Diary; Sept. 1", "MEWTWO is far too powerful.", "We have failed to", "curb its vicious tendencies..."],
    },
  },
  maps: {
    44: {
      46: { map: MapId.PokemonMansion1f, pos: { x: 42, y: 47 } },
      47: { map: MapId.PokemonMansion1f, pos: { x: 42, y: 47 } },
    },
    45: {
      46: { map: MapId.PokemonMansion1f, pos: { x: 42, y: 47 } },
      47: { map: MapId.PokemonMansion1f, pos: { x: 42, y: 47 } },
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
      pokemon: [{ id: 58, level: 34 }, { id: 77, level: 34 }],
      intro: ["Uh-oh. Where am", "I now?"],
      outtro: ["Awooh!"],
      money: 3060,
      pos: { x: 32, y: 46 },
      postGame: { message: ["You can find stuff", "lying around."] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 81, level: 34 }, { id: 101, level: 34 }],
      intro: ["This place is", "ideal for a lab."],
      outtro: ["What", "was that for?"],
      money: 1700,
      pos: { x: 54, y: 22 },
      postGame: { message: ["I like it here!", "It's conducive to my studies!"] },
    },
  ],
  items: [
    { item: ItemType.RareCandy, pos: { x: 20, y: 5 } },
    { item: ItemType.FullRestore, pos: { x: 2, y: 45 } },
    { item: ItemType.Tm14, pos: { x: 38, y: 51 } },
    { item: ItemType.Tm22, pos: { x: 10, y: 9 } },
    { item: ItemType.SecretKey, pos: { x: 10, y: 27 } },
  ],
};

export default pokemonMansionB1f;
