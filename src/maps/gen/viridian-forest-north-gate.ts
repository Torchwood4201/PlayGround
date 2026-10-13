import viridianforestnorthgateImage from "../../assets/map/gen/viridian-forest-north-gate.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered VIRIDIAN_FOREST_NORTH_GATE - do not hand-edit.
const viridianForestNorthGate: MapType = {
  name: "Viridian Forest North Gate",
  image: viridianforestnorthgateImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 1 },
  walls: {},
  text: {
    4: {
      6: ["Many POKEMON live", "only in forests and caves.", "You need to look", "everywhere to get different kinds!"],
    },
    10: {
      4: ["Have you noticed", "the bushes on the roadside?", "They can be cut", "down by a special POKEMON move."],
    },
  },
  maps: {
    14: {
      8: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      9: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      10: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      11: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
    },
    15: {
      8: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      9: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      10: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
      11: { map: MapId.ViridianForrest, pos: { x: 2, y: 1 } },
    },
  },
  exits: {
    1: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.Route2,
  exitReturnPos: { x: 6, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: superNerd, pos: { x: 6, y: 4 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 4, y: 10 }, facing: Direction.Down },
  ],
};

export default viridianForestNorthGate;
