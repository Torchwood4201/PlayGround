import ssannebowImage from "../../assets/map/gen/ss-anne-bow.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerMale, sailor, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_BOW - do not hand-edit.
const ssAnneBow: MapType = {
  name: "SS Anne Bow",
  image: ssannebowImage,
  height: 14,
  width: 20,
  start: { x: 10, y: 12 },
  walls: {
    0: [0, 1, 2, 3],
    1: [0, 1, 2, 3],
    2: [0, 1, 2, 3, 12, 13],
    3: [0, 1, 2, 3, 12, 13],
    4: [0, 1, 8, 9, 10, 11],
    5: [0, 1, 8, 9, 10, 11],
    6: [4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
    7: [4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
    8: [4, 5, 8, 9, 10, 11],
    9: [4, 5, 8, 9, 10, 11],
    10: [6, 7, 8, 9, 10, 11, 12, 13],
    11: [6, 7, 8, 9, 10, 11, 12, 13],
    12: [0, 1],
    13: [0, 1],
  },
  text: {
    4: {
      10: ["The party's over.", "The ship will be departing soon."],
    },
    18: {
      8: ["Scrubbing decks", "is hard work!"],
    },
    22: {
      14: ["Urf. I feel ill.", "I stepped out to", "get some air."],
    },
  },
  maps: {
    12: {
      26: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
      27: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
    },
    13: {
      26: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
      27: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
    },
    14: {
      26: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
      27: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
    },
    15: {
      26: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
      27: { map: MapId.SsAnne3f, pos: { x: 0, y: 7 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: sailor,
      facing: Direction.Down,
      pokemon: [{ id: 66, level: 18 }, { id: 90, level: 18 }],
      intro: ["Hey matey!", "Let's do a little", "jig!"],
      outtro: ["You're", "impressive!"],
      money: 540,
      pos: { x: 8, y: 8 },
      postGame: { message: ["How many kinds of", "POKEMON do you think there are?"] },
    },
    {
      npc: sailor,
      facing: Direction.Up,
      pokemon: [{ id: 66, level: 17 }, { id: 72, level: 17 }],
      intro: ["Ahoy there!", "Are you seasick?"],
      outtro: ["I was", "just careless!"],
      money: 510,
      pos: { x: 20, y: 16 },
      postGame: { message: ["My Pa said there", "are 100 kinds of POKEMON. I think there", "are more."] },
    },
  ],
  npcs: [
    { npc: superNerd, pos: { x: 10, y: 4 }, facing: Direction.Up },
    { npc: sailor, pos: { x: 8, y: 18 }, facing: Direction.Down },
    { npc: aceTrainerMale, pos: { x: 14, y: 22 }, facing: Direction.Down },
  ],
};

export default ssAnneBow;
