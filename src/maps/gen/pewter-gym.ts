import pewtergymImage from "../../assets/map/gen/pewter-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { brock, gentleman, jrTrainerMale } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered PEWTER_GYM - do not hand-edit.
const pewterGym: MapType = {
  name: "Pewter Gym",
  image: pewtergymImage,
  height: 14,
  width: 10,
  start: { x: 8, y: 27 },
  walls: {
    10: [2, 3],
    11: [2, 3],
  },
  text: {
    20: {
      14: ["..."],
    },
  },
  maps: {},
  exits: {
    27: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.PewterCity,
  exitReturnPos: { x: 32, y: 35 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: brock,
      facing: Direction.Down,
      pokemon: [{ id: 74, level: 12 }, { id: 95, level: 14 }],
      intro: ["I'm BROCK!", "I'm PEWTER's GYM LEADER!", "I believe in rock", "hard defense and determination!", "That's why my", "POKEMON are all the rock-type!", "Do you still want", "to challenge me? Fine then! Show me", "your best!"],
      outtro: ["I took", "you for granted.", "As proof of your", "victory, here's the BOULDERBADGE!", "Blue received", "the BOULDERBADGE!"],
      money: 1386,
      pos: { x: 8, y: 2 },
      postGame: { message: ["There are all", "kinds of trainers in the world!", "You appear to be", "very gifted as a POKEMON trainer!", "Go to the GYM in", "CERULEAN and test your abilities!", "The BOULDERBADGE makes all POKEMON obey!"], items: [ItemType.BoulderBadge, ItemType.Tm34] },
    },
    {
      npc: jrTrainerMale,
      facing: Direction.Right,
      pokemon: [{ id: 50, level: 11 }, { id: 27, level: 11 }],
      intro: ["Stop right there,", "kid!", "You're still light", "years from facing BROCK!"],
      outtro: ["Darn!", "Light years isn't", "time! It measures distance!"],
      money: 220,
      pos: { x: 6, y: 12 },
      postGame: { message: ["You're pretty hot,", "but not as hot as BROCK!"] },
    },
  ],
  npcs: [
    { npc: gentleman, pos: { x: 14, y: 20 }, facing: Direction.Down },
  ],
};

export default pewterGym;
