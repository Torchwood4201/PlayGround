import celadondinerImage from "../../assets/map/gen/celadon-diner.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, fisher, gentleman } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_DINER - do not hand-edit.
const celadonDiner: MapType = {
  name: "Celadon Diner",
  image: celadondinerImage,
  height: 8,
  width: 10,
  start: { x: 6, y: 15 },
  walls: {
    2: [2, 3, 6, 7],
    3: [2, 3, 6, 7],
    4: [2, 3, 6, 7],
    5: [2, 3, 6, 7],
  },
  text: {
    2: {
      0: ["..."],
    },
    4: {
      14: ["My POKEMON are", "weak, so I often have to go to the", "DRUG STORE."],
    },
    6: {
      10: ["Munch...", "The man at that", "table lost it all at the slots."],
    },
    8: {
      2: ["Psst! There's a", "basement under the GAME CORNER."],
    },
    10: {
      16: ["Hi!", "We're taking a", "break now."],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 62, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 16, y: 10 }, facing: Direction.Down },
    { npc: beauty, pos: { x: 14, y: 4 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 2, y: 8 }, facing: Direction.Down },
    { npc: fisher, pos: { x: 10, y: 6 }, facing: Direction.Right },
    { npc: gentleman, pos: { x: 0, y: 2 }, facing: Direction.Down },
  ],
};

export default celadonDiner;
