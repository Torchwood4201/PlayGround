import bikeshopImage from "../../assets/map/gen/bike-shop.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, gentleman, youngster } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered BIKE_SHOP - do not hand-edit.
const bikeShop: MapType = {
  name: "Bike Shop",
  image: bikeshopImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {
    4: {
      12: ["..."],
    },
    6: {
      2: ["..."],
    },
    12: {
      10: ["A plain city BIKE", "is good enough for me!", "You can't put a", "shopping basket on an MTB!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 26, y: 51 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 12, y: 4 }, facing: Direction.Down },
    { npc: beauty, pos: { x: 10, y: 12 }, facing: Direction.Down },
    { npc: youngster, pos: { x: 2, y: 6 }, facing: Direction.Up },
  ],
};

export default bikeShop;
