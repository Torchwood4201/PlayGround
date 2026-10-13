import silphco1fImage from "../../assets/map/gen/silph-co-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_1F - do not hand-edit.
const silphCo1f: MapType = {
  name: "Silph Co 1F",
  image: silphco1fImage,
  height: 18,
  width: 30,
  start: { x: 20, y: 35 },
  walls: {
    2: [2, 3, 4, 5],
    3: [2, 3, 4, 5],
    6: [8, 9],
    7: [8, 9],
    16: [0, 1, 8, 9],
    17: [0, 1, 8, 9],
  },
  text: {
    4: {
      8: ["Welcome!", "The PRESIDENT is", "in the boardroom on 11F!"],
    },
  },
  maps: {
    0: {
      52: { map: MapId.SilphCo2f, pos: { x: 48, y: 1 } },
      53: { map: MapId.SilphCo2f, pos: { x: 48, y: 1 } },
    },
    1: {
      52: { map: MapId.SilphCo2f, pos: { x: 48, y: 1 } },
      53: { map: MapId.SilphCo2f, pos: { x: 48, y: 1 } },
    },
    20: {
      32: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      33: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
    },
    21: {
      32: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
      33: { map: MapId.SilphCo3f, pos: { x: 54, y: 7 } },
    },
  },
  exits: {
    35: [20, 21, 22, 23],
  },
  exitReturnMap: MapId.SaffronCity,
  exitReturnPos: { x: 36, y: 43 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 8, y: 4 }, facing: Direction.Down },
  ],
};

export default silphCo1f;
