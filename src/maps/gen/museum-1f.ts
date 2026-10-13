import museum1fImage from "../../assets/map/gen/museum-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gambler, scientist } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered MUSEUM_1F - do not hand-edit.
const museum1f: MapType = {
  name: "Museum 1F",
  image: museum1fImage,
  height: 8,
  width: 20,
  start: { x: 20, y: 15 },
  walls: {},
  text: {
    4: {
      30: ["..."],
      32: ["The AMBER is", "clear and gold!"],
    },
    8: {
      2: ["That is one", "magnificent fossil!"],
      24: ["..."],
      34: ["We are proud of 2", "fossils of very rare, prehistoric", "POKEMON!"],
    },
  },
  maps: {
    14: {
      14: { map: MapId.PewterCityMuseum2f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum2f, pos: { x: 14, y: 15 } },
    },
    15: {
      14: { map: MapId.PewterCityMuseum2f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum2f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {
    15: [20, 21, 22, 23, 32, 33, 34, 35],
  },
  exitReturnMap: MapId.PewterCity,
  exitReturnPos: { x: 28, y: 15 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 24, y: 8 }, facing: Direction.Left },
    { npc: gambler, pos: { x: 2, y: 8 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 30, y: 4 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 34, y: 8 }, facing: Direction.Down },
  ],
};

export default museum1f;
