import celadonchiefhouseImage from "../../assets/map/gen/celadon-chief-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, sailor, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_CHIEF_HOUSE - do not hand-edit.
const celadonChiefHouse: MapType = {
  name: "Celadon Chief House",
  image: celadonchiefhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {
    4: {
      8: ["Hehehe! The slots", "just reel in the dough, big time!"],
    },
    8: {
      2: ["CHIEF!", "We just shipped", "2000 POKEMON as slot prizes!"],
    },
    12: {
      10: ["Don't touch the", "poster at the GAME CORNER!", "There's no secret", "switch behind it!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 70, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 8, y: 4 }, facing: Direction.Down },
    { npc: teamRocketGrunt, pos: { x: 2, y: 8 }, facing: Direction.Down },
    { npc: sailor, pos: { x: 10, y: 12 }, facing: Direction.Left },
  ],
};

export default celadonChiefHouse;
