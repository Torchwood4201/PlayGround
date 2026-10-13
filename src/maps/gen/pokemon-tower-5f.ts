import pokemontower5fImage from "../../assets/map/gen/pokemon-tower-5f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { channeler } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_5F - do not hand-edit.
const pokemonTower5f: MapType = {
  name: "Pokemon Tower 5F",
  image: pokemontower5fImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    1: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 4, 5, 18, 19],
    3: [0, 1, 2, 3, 4, 5, 18, 19],
    4: [0, 1],
    5: [0, 1],
    6: [0, 1],
    7: [0, 1],
    8: [0, 1, 6, 7, 14, 15],
    9: [0, 1, 6, 7, 14, 15],
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
      6: { map: MapId.PokemonTower4f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower4f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower6f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower6f, pos: { x: 36, y: 19 } },
    },
    19: {
      6: { map: MapId.PokemonTower4f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower4f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower6f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower6f, pos: { x: 36, y: 19 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: channeler,
      facing: Direction.Left,
      pokemon: [{ id: 93, level: 23 }],
      intro: ["Give...me...", "your...soul..."],
      outtro: ["Gasp!"],
      money: 690,
      pos: { x: 34, y: 14 },
      postGame: { message: ["I was under", "possession!"] },
    },
    {
      npc: channeler,
      facing: Direction.Left,
      pokemon: [{ id: 92, level: 22 }],
      intro: ["You...shall...", "join...us..."],
      outtro: ["What", "a nightmare!"],
      money: 660,
      pos: { x: 28, y: 6 },
      postGame: { message: ["I was possessed!"] },
    },
    {
      npc: channeler,
      facing: Direction.Right,
      pokemon: [{ id: 92, level: 24 }],
      intro: ["Zombies!"],
      outtro: ["Ha?"],
      money: 720,
      pos: { x: 12, y: 20 },
      postGame: { message: ["I regained my", "senses!"] },
    },
    {
      npc: channeler,
      facing: Direction.Right,
      pokemon: [{ id: 93, level: 22 }],
      intro: ["Urgah...", "Urff...."],
      outtro: ["Whoo!"],
      money: 660,
      pos: { x: 18, y: 32 },
      postGame: { message: ["I fell to evil", "spirits despite my training!"] },
    },
  ],
  items: [
    { item: ItemType.Nugget, pos: { x: 12, y: 29 } },
  ],
};

export default pokemonTower5f;
