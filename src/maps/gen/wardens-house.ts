import wardenshouseImage from "../../assets/map/gen/wardens-house.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered WARDENS_HOUSE - do not hand-edit.
const wardensHouse: MapType = {
  name: "Wardens House",
  image: wardenshouseImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 15 },
  walls: {
    2: [8, 9],
    3: [8, 9],
    6: [4, 5],
    7: [4, 5],
  },
  text: {
    7: {
      8: ["..."],
      9: ["..."],
      10: ["..."],
      11: ["..."],
    },
  },
  maps: {},
  exits: {
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 54, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  items: [
    { item: ItemType.RareCandy, pos: { x: 16, y: 7 } },
  ],
};

export default wardensHouse;
