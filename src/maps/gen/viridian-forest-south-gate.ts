import viridianforestsouthgateImage from "../../assets/map/gen/viridian-forest-south-gate.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered VIRIDIAN_FOREST_SOUTH_GATE - do not hand-edit.
const viridianForestSouthGate: MapType = {
  name: "Viridian Forest South Gate",
  image: viridianforestsouthgateImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 15 },
  walls: {},
  text: {},
  maps: {
    0: {
      8: { map: MapId.ViridianForrest, pos: { x: 32, y: 95 } },
      9: { map: MapId.ViridianForrest, pos: { x: 32, y: 95 } },
      10: { map: MapId.ViridianForrest, pos: { x: 34, y: 95 } },
      11: { map: MapId.ViridianForrest, pos: { x: 34, y: 95 } },
    },
    1: {
      8: { map: MapId.ViridianForrest, pos: { x: 32, y: 95 } },
      9: { map: MapId.ViridianForrest, pos: { x: 32, y: 95 } },
      10: { map: MapId.ViridianForrest, pos: { x: 34, y: 95 } },
      11: { map: MapId.ViridianForrest, pos: { x: 34, y: 95 } },
    },
  },
  exits: {
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.Route2,
  exitReturnPos: { x: 6, y: 87 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default viridianForestSouthGate;
