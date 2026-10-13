import pokemontower4fImage from "../../assets/map/gen/pokemon-tower-4f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { channeler } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_4F - do not hand-edit.
const pokemonTower4f: MapType = {
  name: "Pokemon Tower 4F",
  image: pokemontower4fImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    1: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 18, 19],
    3: [0, 1, 2, 3, 18, 19],
    4: [0, 1, 6, 7],
    5: [0, 1, 6, 7],
    6: [0, 1, 6, 7],
    7: [0, 1, 6, 7],
    8: [0, 1],
    9: [0, 1],
    10: [0, 1, 14, 15],
    11: [0, 1, 14, 15],
    12: [0, 1, 8, 9, 12, 13],
    13: [0, 1, 8, 9, 12, 13],
    14: [0, 1, 2, 3, 18, 19],
    15: [0, 1, 2, 3, 18, 19],
    16: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    17: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
  },
  text: {},
  maps: {
    18: {
      6: { map: MapId.PokemonTower5f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower5f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower3f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower3f, pos: { x: 36, y: 19 } },
    },
    19: {
      6: { map: MapId.PokemonTower5f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower5f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower3f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower3f, pos: { x: 36, y: 19 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: channeler,
      facing: Direction.Right,
      pokemon: [{ id: 92, level: 24 }],
      intro: ["GHOST! No!", "Kwaaah!"],
      outtro: ["Where", "is the GHOST?"],
      money: 720,
      pos: { x: 10, y: 20 },
      postGame: { message: ["I must have been", "dreaming..."] },
    },
    {
      npc: channeler,
      facing: Direction.Down,
      pokemon: [{ id: 92, level: 23 }, { id: 92, level: 23 }],
      intro: ["Be cursed with", "me! Kwaaah!"],
      outtro: ["What!"],
      money: 690,
      pos: { x: 30, y: 14 },
      postGame: { message: ["We can't crack", "the identity of the GHOSTs."] },
    },
    {
      npc: channeler,
      facing: Direction.Left,
      pokemon: [{ id: 92, level: 22 }],
      intro: ["Huhuhu...", "Beat me not!"],
      outtro: ["Huh?", "Who? What?"],
      money: 660,
      pos: { x: 28, y: 24 },
      postGame: { message: ["May the departed", "souls of POKEMON rest in peace..."] },
    },
  ],
  items: [
    { item: ItemType.Elixer, pos: { x: 24, y: 21 } },
    { item: ItemType.Awakening, pos: { x: 18, y: 21 } },
    { item: ItemType.HpUp, pos: { x: 24, y: 33 } },
  ],
};

export default pokemonTower4f;
