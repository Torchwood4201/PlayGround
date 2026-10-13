import saffronpidgeyhouseImage from "../../assets/map/gen/saffron-pidgey-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, birdKeeper, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered SAFFRON_PIDGEY_HOUSE - do not hand-edit.
const saffronPidgeyHouse: MapType = {
  name: "Saffron Pidgey House",
  image: saffronpidgeyhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    2: {
      8: ["The COPYCAT is", "cute! I'm getting her a # DOLL!"],
    },
    6: {
      4: ["Thank you for", "writing. I hope to see you soon!", "Hey! Don't look", "at my letter!"],
      6: ["I was given a PP", "UP as a gift.", "It's used for", "increasing the PP of techniques!"],
    },
    8: {
      0: ["PIDGEY: Kurukkoo!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.SaffronCity,
  exitReturnPos: { x: 26, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 4, y: 6 }, facing: Direction.Right },
    { npc: birdKeeper, pos: { x: 0, y: 8 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 8, y: 2 }, facing: Direction.Down },
  ],
};

export default saffronPidgeyHouse;
