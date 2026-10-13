import fuchsiamartImage from "../../assets/map/gen/fuchsia-mart.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, gentleman } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered FUCHSIA_MART - do not hand-edit.
const fuchsiaMart: MapType = {
  name: "Fuchsia Mart",
  image: fuchsiamartImage,
  height: 8,
  width: 8,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    4: {
      8: ["Do you have a", "SAFARI ZONE flag?", "What about cards", "or calendars?"],
    },
    10: {
      0: ["..."],
      12: ["Did you try X", "SPEED? It speeds up a POKEMON in battle!"],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 10, y: 27 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 0, y: 10 }, facing: Direction.Right },
    { npc: gentleman, pos: { x: 8, y: 4 }, facing: Direction.Down },
    { npc: aceTrainerFemale, pos: { x: 12, y: 10 }, facing: Direction.Down },
  ],
  store: { x: 1, y: 11 },
  storeItems: [ItemType.UltraBall, ItemType.GreatBall, ItemType.SuperPotion, ItemType.Revive, ItemType.FullHeal, ItemType.SuperRepel],
};

export default fuchsiaMart;
