import pokemontower3fImage from "../../assets/map/gen/pokemon-tower-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { channeler } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_3F - do not hand-edit.
const pokemonTower3f: MapType = {
  name: "Pokemon Tower 3F",
  image: pokemontower3fImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    1: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    2: [0, 1, 2, 3, 4, 5, 18, 19],
    3: [0, 1, 2, 3, 4, 5, 18, 19],
    4: [0, 1, 6, 7],
    5: [0, 1, 6, 7],
    6: [0, 1, 14, 15],
    7: [0, 1, 14, 15],
    8: [0, 1, 10, 11],
    9: [0, 1, 10, 11],
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
      6: { map: MapId.PokemonTower2f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower2f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower4f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower4f, pos: { x: 36, y: 19 } },
    },
    19: {
      6: { map: MapId.PokemonTower2f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower2f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower4f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower4f, pos: { x: 36, y: 19 } },
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
      pokemon: [{ id: 92, level: 23 }],
      intro: ["Urrg...Awaa...", "Huhu...graa.."],
      outtro: ["Hwa!", "I'm saved!"],
      money: 690,
      pos: { x: 24, y: 6 },
      postGame: { message: ["The GHOSTs can be", "identified by the SILPH SCOPE."] },
    },
    {
      npc: channeler,
      facing: Direction.Down,
      pokemon: [{ id: 92, level: 24 }],
      intro: ["Kekeke....", "Kwaaah!"],
      outtro: ["Hmm?", "What am I doing?"],
      money: 720,
      pos: { x: 18, y: 16 },
      postGame: { message: ["Sorry! I was", "possessed!"] },
    },
    {
      npc: channeler,
      facing: Direction.Down,
      pokemon: [{ id: 92, level: 22 }],
      intro: ["Be gone!", "Evil spirit!"],
      outtro: ["Whew!", "The spirit left!"],
      money: 660,
      pos: { x: 20, y: 26 },
      postGame: { message: ["My friends were", "possessed too!"] },
    },
  ],
  items: [
    { item: ItemType.EscapeRope, pos: { x: 24, y: 3 } },
  ],
};

export default pokemonTower3f;
