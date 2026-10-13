import copycatshouse2fImage from "../../assets/map/gen/copycats-house-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, birdKeeper, lass, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered COPYCATS_HOUSE_2F - do not hand-edit.
const copycatsHouse2f: MapType = {
  name: "Copycats House 2F",
  image: copycatshouse2fImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    0: [2, 3],
    1: [2, 3],
    6: [6, 7],
    7: [6, 7],
  },
  text: {
    0: {
      4: ["This is a rare", "POKEMON! Huh? It's only a doll!"],
    },
    2: {
      10: ["This is a rare", "POKEMON! Huh? It's only a doll!"],
    },
    3: {
      0: ["..."],
      1: ["..."],
    },
    6: {
      8: ["..."],
    },
    11: {
      6: ["A game with MARIO", "wearing a bucket on his head!"],
      7: ["A game with MARIO", "wearing a bucket on his head!"],
    },
    12: {
      2: ["This is a rare", "POKEMON! Huh? It's only a doll!"],
      8: ["DODUO: Giiih!", "MIRROR MIRROR ON", "THE WALL, WHO IS THE FAIREST ONE OF", "ALL?"],
    },
  },
  maps: {
    2: {
      14: { map: MapId.CopycatsHouse1f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CopycatsHouse1f, pos: { x: 14, y: 3 } },
    },
    3: {
      14: { map: MapId.CopycatsHouse1f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CopycatsHouse1f, pos: { x: 14, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 8, y: 6 }, facing: Direction.Down },
    { npc: birdKeeper, pos: { x: 8, y: 12 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 10, y: 2 }, facing: Direction.Down },
    { npc: birdKeeper, pos: { x: 4, y: 0 }, facing: Direction.Down },
    { npc: lass, pos: { x: 2, y: 12 }, facing: Direction.Right },
  ],
};

export default copycatsHouse2f;
