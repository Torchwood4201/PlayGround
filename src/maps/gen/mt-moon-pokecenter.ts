import mtmoonpokecenterImage from "../../assets/map/gen/mt-moon-pokecenter.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, lass, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered MT_MOON_POKECENTER - do not hand-edit.
const mtMoonPokecenter: MapType = {
  name: "Mt Moon Pokecenter",
  image: mtmoonpokecenterImage,
  height: 8,
  width: 14,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    2: {
      6: ["..."],
    },
    4: {
      14: ["..."],
      22: ["..."],
    },
    6: {
      8: ["I've 6 POKE BALLs", "set in my belt.", "At most, you can", "carry 6 POKEMON."],
      14: ["TEAM ROCKET", "attacks CERULEAN citizens...", "TEAM ROCKET is", "always in the news!"],
    },
    12: {
      20: ["MAN: Hello, there!", "Have I got a deal just for you!", "I'll let you have", "a swell MAGIKARP for just ¥500! What", "do you say?"],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.Route4,
  exitReturnPos: { x: 22, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 2 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 8, y: 6 }, facing: Direction.Up },
    { npc: gentleman, pos: { x: 14, y: 6 }, facing: Direction.Up },
    { npc: gentleman, pos: { x: 20, y: 12 }, facing: Direction.Down },
    { npc: lass, pos: { x: 22, y: 4 }, facing: Direction.Down },
  ],
  pokemonCenter: { x: 6, y: 3 },
};

export default mtMoonPokecenter;
