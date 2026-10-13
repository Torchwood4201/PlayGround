import rocktunnelpokecenterImage from "../../assets/map/gen/rock-tunnel-pokecenter.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { fisher, gentleman, lass } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered ROCK_TUNNEL_POKECENTER - do not hand-edit.
const rockTunnelPokecenter: MapType = {
  name: "Rock Tunnel Pokecenter",
  image: rocktunnelpokecenterImage,
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
      14: ["The element types", "of POKEMON make them stronger than some", "types and weaker than others!"],
    },
    10: {
      4: ["I sold a useless", "NUGGET for ¥5000!"],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.Route10,
  exitReturnPos: { x: 22, y: 39 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 6, y: 2 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 14, y: 6 }, facing: Direction.Down },
    { npc: fisher, pos: { x: 4, y: 10 }, facing: Direction.Down },
    { npc: lass, pos: { x: 22, y: 4 }, facing: Direction.Down },
  ],
  pokemonCenter: { x: 6, y: 3 },
};

export default rockTunnelPokecenter;
