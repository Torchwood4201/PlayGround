import ceruleanmartImage from "../../assets/map/gen/cerulean-mart.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, aceTrainerMale, gentleman } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-center.mp3";

// Generated from pret/pokered CERULEAN_MART - do not hand-edit.
const ceruleanMart: MapType = {
  name: "Cerulean Mart",
  image: ceruleanmartImage,
  height: 8,
  width: 8,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    4: {
      12: ["Have you seen any", "RARE CANDY?", "It's supposed to", "make POKEMON go up one level!"],
    },
    8: {
      6: ["Use REPEL to keep", "bugs and weak POKEMON away.", "Put your strongest", "POKEMON at the top of the list for best", "results!"],
    },
    10: {
      0: ["..."],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 50, y: 51 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 0, y: 10 }, facing: Direction.Right },
    { npc: aceTrainerMale, pos: { x: 6, y: 8 }, facing: Direction.Down },
    { npc: aceTrainerFemale, pos: { x: 12, y: 4 }, facing: Direction.Down },
  ],
  store: { x: 1, y: 11 },
  storeItems: [ItemType.PokeBall, ItemType.Potion, ItemType.Repel, ItemType.Antidote, ItemType.BurnHeal, ItemType.Awakening, ItemType.ParlyzHeal],
};

export default ceruleanMart;
