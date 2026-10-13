import fuchsiabillsgrandpashouseImage from "../../assets/map/gen/fuchsia-bills-grandpas-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, gambler, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered FUCHSIA_BILLS_GRANDPAS_HOUSE - do not hand-edit.
const fuchsiaBillsGrandpasHouse: MapType = {
  name: "Fuchsia Bills Grandpas House",
  image: fuchsiabillsgrandpashouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    4: {
      14: ["Hmm? You've met", "BILL?", "He's my grandson!", "He always liked", "collecting things even as a child!"],
    },
    6: {
      4: ["SAFARI ZONE's", "WARDEN is old, but still active!", "All his teeth are", "false, though."],
    },
    10: {
      10: ["BILL files his", "own POKEMON data on his PC!", "Did he show you?"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 22, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 4, y: 6 }, facing: Direction.Right },
    { npc: gambler, pos: { x: 14, y: 4 }, facing: Direction.Up },
    { npc: youngster, pos: { x: 10, y: 10 }, facing: Direction.Down },
  ],
};

export default fuchsiaBillsGrandpasHouse;
