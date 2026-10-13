import ssanne3fImage from "../../assets/map/gen/ss-anne-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { sailor } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_3F - do not hand-edit.
const ssAnne3f: MapType = {
  name: "SS Anne 3F",
  image: ssanne3fImage,
  height: 6,
  width: 20,
  start: { x: 10, y: 4 },
  walls: {
    2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  },
  text: {
    6: {
      18: ["Our CAPTAIN is a", "sword master!", "He even teaches", "CUT to POKEMON!"],
    },
  },
  maps: {
    6: {
      0: { map: MapId.SsAnneBow, pos: { x: 26, y: 13 } },
      1: { map: MapId.SsAnneBow, pos: { x: 26, y: 13 } },
      38: { map: MapId.SsAnne2f, pos: { x: 4, y: 25 } },
      39: { map: MapId.SsAnne2f, pos: { x: 4, y: 25 } },
    },
    7: {
      0: { map: MapId.SsAnneBow, pos: { x: 26, y: 13 } },
      1: { map: MapId.SsAnneBow, pos: { x: 26, y: 13 } },
      38: { map: MapId.SsAnne2f, pos: { x: 4, y: 25 } },
      39: { map: MapId.SsAnne2f, pos: { x: 4, y: 25 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: sailor, pos: { x: 18, y: 6 }, facing: Direction.Down },
  ],
};

export default ssAnne3f;
