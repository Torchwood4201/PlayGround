import ceruleanmartImage from "../../assets/map/gen/cerulean-mart.png";
import { MapId, MapType } from "../map-types";
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
  text: {},
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 50, y: 51 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  store: { x: 1, y: 11 },
  storeItems: [ItemType.PokeBall, ItemType.Potion, ItemType.Repel, ItemType.Antidote, ItemType.BurnHeal, ItemType.Awakening, ItemType.ParlyzHeal],
};

export default ceruleanMart;
