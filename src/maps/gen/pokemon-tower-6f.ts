import pokemontower6fImage from "../../assets/map/gen/pokemon-tower-6f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { channeler } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_6F - do not hand-edit.
const pokemonTower6f: MapType = {
  name: "Pokemon Tower 6F",
  image: pokemontower6fImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    1: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 4, 5, 18, 19],
    3: [0, 1, 2, 3, 4, 5, 18, 19],
    4: [0, 1, 12, 13],
    5: [0, 1, 12, 13],
    6: [0, 1, 12, 13],
    7: [0, 1, 12, 13],
    8: [0, 1, 4, 5],
    9: [0, 1, 4, 5],
    10: [0, 1],
    11: [0, 1],
    12: [0, 1],
    13: [0, 1],
    14: [0, 1, 2, 3, 12, 13, 18, 19],
    15: [0, 1, 2, 3, 12, 13, 18, 19],
    16: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    17: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
  },
  text: {},
  maps: {
    18: {
      36: { map: MapId.PokemonTower5f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower5f, pos: { x: 36, y: 19 } },
    },
    19: {
      36: { map: MapId.PokemonTower5f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower5f, pos: { x: 36, y: 19 } },
    },
    32: {
      18: { map: MapId.PokemonTower7f, pos: { x: 18, y: 33 } },
      19: { map: MapId.PokemonTower7f, pos: { x: 18, y: 33 } },
    },
    33: {
      18: { map: MapId.PokemonTower7f, pos: { x: 18, y: 33 } },
      19: { map: MapId.PokemonTower7f, pos: { x: 18, y: 33 } },
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
      pokemon: [{ id: 92, level: 22 }, { id: 92, level: 22 }, { id: 92, level: 22 }],
      intro: ["Give...me...", "blood..."],
      outtro: ["Groan!"],
      money: 660,
      pos: { x: 24, y: 20 },
      postGame: { message: ["I feel anemic and", "weak..."] },
    },
    {
      npc: channeler,
      facing: Direction.Down,
      pokemon: [{ id: 92, level: 24 }],
      intro: ["Urff... Kwaah!"],
      outtro: ["Some-", "thing fell out!"],
      money: 720,
      pos: { x: 18, y: 10 },
      postGame: { message: ["Hair didn't fall", "out! It was an evil spirit!"] },
    },
    {
      npc: channeler,
      facing: Direction.Left,
      pokemon: [{ id: 92, level: 24 }],
      intro: ["Ke..ke...ke...", "ke..ke...ke!!"],
      outtro: ["Keee!"],
      money: 720,
      pos: { x: 32, y: 10 },
      postGame: { message: ["What's going on", "here?"] },
    },
  ],
  items: [
    { item: ItemType.RareCandy, pos: { x: 12, y: 17 } },
    { item: ItemType.XAccuracy, pos: { x: 28, y: 29 } },
  ],
};

export default pokemonTower6f;
