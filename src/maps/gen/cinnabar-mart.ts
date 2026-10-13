import cinnabarmartImage from "../../assets/map/gen/cinnabar-mart.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, lass, scientist } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CINNABAR_MART - do not hand-edit.
const cinnabarMart: MapType = {
  name: "Cinnabar Mart",
  image: cinnabarmartImage,
  height: 8,
  width: 8,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    4: {
      12: ["Don't they have X", "ATTACK? It's good for battles!"],
    },
    8: {
      6: ["It never hurts to", "have extra items!"],
    },
    10: {
      0: ["..."],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CinnabarIsland,
  exitReturnPos: { x: 30, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 0, y: 10 }, facing: Direction.Right },
    { npc: lass, pos: { x: 12, y: 4 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 6, y: 8 }, facing: Direction.Down },
  ],
  store: { x: 1, y: 11 },
  storeItems: [ItemType.UltraBall, ItemType.GreatBall, ItemType.HyperPotion, ItemType.MaxRepel, ItemType.EscapeRope, ItemType.FullHeal, ItemType.Revive],
};

export default cinnabarMart;
