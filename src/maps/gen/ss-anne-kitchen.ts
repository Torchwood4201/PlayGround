import ssannekitchenImage from "../../assets/map/gen/ss-anne-kitchen.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_KITCHEN - do not hand-edit.
const ssAnneKitchen: MapType = {
  name: "SS Anne Kitchen",
  image: ssannekitchenImage,
  height: 16,
  width: 14,
  start: { x: 7, y: 14 },
  walls: {},
  text: {
    12: {
      26: ["Hum-de-hum-de-", "ho...", "I peel spuds", "every day! Hum-hum..."],
    },
    14: {
      18: ["I'm so busy I'm", "getting dizzy!"],
    },
    16: {
      2: ["You, mon petit!", "We're busy here! Out of the way!"],
      10: ["I saw an odd ball", "in the trash."],
      26: ["Did you hear about", "SNORLAX?", "All it does is", "eat and sleep!"],
    },
    20: {
      26: ["Snivel...Sniff...", "I only get to", "peel onions... Snivel..."],
    },
    26: {
      22: ["..."],
    },
  },
  maps: {
    0: {
      12: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
      13: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
    },
    1: {
      12: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
      13: { map: MapId.SsAnne1f, pos: { x: 6, y: 33 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 2, y: 16 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 10, y: 16 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 18, y: 14 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 26, y: 12 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 26, y: 16 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 26, y: 20 }, facing: Direction.Down },
    { npc: gentleman, pos: { x: 22, y: 26 }, facing: Direction.Up },
  ],
};

export default ssAnneKitchen;
