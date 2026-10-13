import celadonhotelImage from "../../assets/map/gen/celadon-hotel.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_HOTEL - do not hand-edit.
const celadonHotel: MapType = {
  name: "Celadon Hotel",
  image: celadonhotelImage,
  height: 8,
  width: 14,
  start: { x: 6, y: 15 },
  walls: {},
  text: {
    2: {
      6: ["POKEMON? No, this", "is a hotel for people.", "We're full up."],
    },
    8: {
      4: ["I'm on vacation", "with my brother and boy friend.", "CELADON is such a", "pretty city!"],
      16: ["Why did she bring", "her brother?"],
    },
  },
  maps: {},
  exits: {
    15: [6, 7, 8, 9],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 86, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 6, y: 2 }, facing: Direction.Down },
    { npc: beauty, pos: { x: 4, y: 8 }, facing: Direction.Down },
    { npc: superNerd, pos: { x: 16, y: 8 }, facing: Direction.Down },
  ],
};

export default celadonHotel;
