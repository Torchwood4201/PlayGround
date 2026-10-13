import pokemontower2fImage from "../../assets/map/gen/pokemon-tower-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { channeler, rival } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_2F - do not hand-edit.
const pokemonTower2f: MapType = {
  name: "Pokemon Tower 2F",
  image: pokemontower2fImage,
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
    6: [0, 1, 8, 9],
    7: [0, 1, 8, 9],
    8: [0, 1, 6, 7, 8, 9, 12, 13, 14, 15],
    9: [0, 1, 6, 7, 8, 9, 12, 13, 14, 15],
    10: [0, 1, 8, 9],
    11: [0, 1, 8, 9],
    12: [0, 1, 6, 7, 8, 9, 10, 11],
    13: [0, 1, 6, 7, 8, 9, 10, 11],
    14: [0, 1, 2, 3, 18, 19],
    15: [0, 1, 2, 3, 18, 19],
    16: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
    17: [0, 1, 2, 3, 4, 5, 16, 17, 18, 19],
  },
  text: {
    14: {
      6: ["Even we could not", "identify the wayward GHOSTs!", "A SILPH SCOPE", "might be able to unmask them."],
    },
  },
  maps: {
    18: {
      6: { map: MapId.PokemonTower3f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower3f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower1f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower1f, pos: { x: 36, y: 19 } },
    },
    19: {
      6: { map: MapId.PokemonTower3f, pos: { x: 6, y: 19 } },
      7: { map: MapId.PokemonTower3f, pos: { x: 6, y: 19 } },
      36: { map: MapId.PokemonTower1f, pos: { x: 36, y: 19 } },
      37: { map: MapId.PokemonTower1f, pos: { x: 36, y: 19 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: rival,
      rivalTier: 4,
      facing: Direction.Down,
      pokemon: [{ id: 17, level: 25 }, { id: 58, level: 23 }, { id: 102, level: 22 }, { id: 64, level: 20 }, { id: 8, level: 25 }],
      intro: ["Rival: Hey,", "Blue! What brings you here? Your", "POKEMON don't look dead!", "I can at least", "make them faint! Let's go, pal!"],
      outtro: ["What?", "You stinker!", "I took it easy on", "you too!"],
      money: 1625,
      pos: { x: 28, y: 10 },
      postGame: { message: ["Rival: Well,", "look at all your wimpy POKEMON!", "Toughen them up a", "bit more!"] },
    },
  ],
  npcs: [
    { npc: channeler, pos: { x: 6, y: 14 }, facing: Direction.Right },
  ],
};

export default pokemonTower2f;
