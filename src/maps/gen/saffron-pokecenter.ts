import saffronpokecenterImage from "../../assets/map/gen/saffron-pokecenter.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, gentleman, lass } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered SAFFRON_POKECENTER - do not hand-edit.
const saffronPokecenter: MapType = {
  name: "Saffron Pokecenter",
  image: saffronpokecenterImage,
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
    6: {
      16: ["SILPH CO. is very", "famous. That's why it attracted TEAM", "ROCKET!"],
    },
    10: {
      10: ["POKEMON growth", "rates differ from specie to specie."],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.SaffronCity,
  exitReturnPos: { x: 18, y: 59 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 2 }, facing: Direction.Down },
    { npc: beauty, pos: { x: 10, y: 10 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 16, y: 6 }, facing: Direction.Down },
    { npc: lass, pos: { x: 22, y: 4 }, facing: Direction.Down },
  ],
  pokemonCenter: { x: 6, y: 3 },
};

export default saffronPokecenter;
