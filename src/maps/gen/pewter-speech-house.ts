import pewterspeechhouseImage from "../../assets/map/gen/pewter-speech-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gambler, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered PEWTER_SPEECH_HOUSE - do not hand-edit.
const pewterSpeechHouse: MapType = {
  name: "Pewter Speech House",
  image: pewterspeechhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    6: {
      4: ["POKEMON learn new", "techniques as they grow!", "But, some moves", "must be taught by the trainer!"],
    },
    10: {
      8: ["POKEMON become", "easier to catch when they are hurt or", "asleep!", "But, it's not a", "sure thing!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.PewterCity,
  exitReturnPos: { x: 14, y: 59 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gambler, pos: { x: 4, y: 6 }, facing: Direction.Right },
    { npc: youngster, pos: { x: 8, y: 10 }, facing: Direction.Down },
  ],
};

export default pewterSpeechHouse;
