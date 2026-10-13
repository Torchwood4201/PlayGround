import pokemontower7fImage from "../../assets/map/gen/pokemon-tower-7f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered POKEMON_TOWER_7F - do not hand-edit.
const pokemonTower7f: MapType = {
  name: "Pokemon Tower 7F",
  image: pokemontower7fImage,
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
    32: {
      18: { map: MapId.PokemonTower6f, pos: { x: 18, y: 33 } },
      19: { map: MapId.PokemonTower6f, pos: { x: 18, y: 33 } },
    },
    33: {
      18: { map: MapId.PokemonTower6f, pos: { x: 18, y: 33 } },
      19: { map: MapId.PokemonTower6f, pos: { x: 18, y: 33 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 41, level: 25 }, { id: 41, level: 25 }, { id: 42, level: 25 }],
      intro: ["What do you want?", "Why are you here?"],
      outtro: ["I give up!"],
      money: 750,
      pos: { x: 18, y: 22 },
      postGame: { message: ["I'm not going to", "forget this!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 109, level: 26 }, { id: 96, level: 26 }],
      intro: ["This old guy came", "and complained about us harming", "useless POKEMON!", "We're talking it", "over as adults!"],
      outtro: ["Please!", "No more!"],
      money: 780,
      pos: { x: 24, y: 18 },
      postGame: { message: ["POKEMON are only", "good for making money!", "Stay out of our", "business!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 41, level: 23 }, { id: 19, level: 23 }, { id: 20, level: 23 }, { id: 41, level: 23 }],
      intro: ["You're not saving", "anyone, kid!"],
      outtro: ["Don't", "fight us ROCKETs!"],
      money: 690,
      pos: { x: 18, y: 14 },
      postGame: { message: ["You're not getting", "away with this!"] },
    },
  ],
};

export default pokemonTower7f;
