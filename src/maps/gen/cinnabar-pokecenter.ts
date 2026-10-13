import cinnabarpokecenterImage from "../../assets/map/gen/cinnabar-pokecenter.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, gentleman, lass } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CINNABAR_POKECENTER - do not hand-edit.
const cinnabarPokecenter: MapType = {
  name: "Cinnabar Pokecenter",
  image: cinnabarpokecenterImage,
  height: 8,
  width: 14,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    2: {
      6: ["..."],
    },
    4: {
      22: ["..."],
    },
    8: {
      18: ["You can cancel", "evolution.", "When a POKEMON is", "evolving, you can stop it and leave it", "the way it is."],
    },
    12: {
      4: ["Do you have any", "friends?", "POKEMON you get", "in trades grow very quickly.", "I think it's", "worth a try!"],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CinnabarIsland,
  exitReturnPos: { x: 22, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 2 }, facing: Direction.Down },
    { npc: aceTrainerFemale, pos: { x: 18, y: 8 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 4, y: 12 }, facing: Direction.Down },
    { npc: lass, pos: { x: 22, y: 4 }, facing: Direction.Down },
  ],
  pokemonCenter: { x: 6, y: 3 },
};

export default cinnabarPokecenter;
