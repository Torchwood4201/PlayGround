import museum2fImage from "../../assets/map/gen/museum-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, gentleman, hiker, scientist, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered MUSEUM_2F - do not hand-edit.
const museum2f: MapType = {
  name: "Museum 2F",
  image: museum2fImage,
  height: 8,
  width: 14,
  start: { x: 7, y: 6 },
  walls: {},
  text: {
    5: {
      22: ["SPACE SHUTTLE", "COLUMBIA"],
      23: ["SPACE SHUTTLE", "COLUMBIA"],
    },
    10: {
      0: ["July 20, 1969!", "The 1st lunar", "landing!", "I bought a color", "TV to watch it!"],
      14: ["We have a space", "exhibit now."],
      22: ["I want a PIKACHU!", "It's so cute!", "I asked my Daddy", "to catch me one!"],
      24: ["Yeah, a PIKACHU", "soon, I promise!"],
    },
    11: {
      4: ["Meteorite that", "fell on MT.MOON. (MOON STONE?)"],
      5: ["Meteorite that", "fell on MT.MOON. (MOON STONE?)"],
    },
    14: {
      2: ["MOON STONE?", "What's so special", "about it?"],
    },
  },
  maps: {
    14: {
      14: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
    },
    15: {
      14: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
      15: { map: MapId.PewterCityMuseum1f, pos: { x: 14, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: youngster, pos: { x: 2, y: 14 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 0, y: 10 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 14, y: 10 }, facing: Direction.Down },
    { npc: beauty, pos: { x: 22, y: 10 }, facing: Direction.Down },
    { npc: hiker, pos: { x: 24, y: 10 }, facing: Direction.Down },
  ],
};

export default museum2f;
