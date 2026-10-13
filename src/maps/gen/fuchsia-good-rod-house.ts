import fuchsiagoodrodhouseImage from "../../assets/map/gen/fuchsia-good-rod-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { fisher } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered FUCHSIA_GOOD_ROD_HOUSE - do not hand-edit.
const fuchsiaGoodRodHouse: MapType = {
  name: "Fuchsia Good Rod House",
  image: fuchsiagoodrodhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 1 },
  walls: {},
  text: {
    6: {
      10: ["I'm the FISHING", "GURU's older brother!", "I simply Looove", "fishing!", "Do you like to", "fish?"],
    },
  },
  maps: {},
  exits: {
    1: [4, 5],
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 62, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: fisher, pos: { x: 10, y: 6 }, facing: Direction.Right },
  ],
};

export default fuchsiaGoodRodHouse;
