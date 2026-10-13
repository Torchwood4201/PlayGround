import gamecornerprizeroomImage from "../../assets/map/gen/game-corner-prize-room.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered GAME_CORNER_PRIZE_ROOM - do not hand-edit.
const gameCornerPrizeRoom: MapType = {
  name: "Game Corner Prize Room",
  image: gamecornerprizeroomImage,
  height: 8,
  width: 10,
  start: { x: 8, y: 15 },
  walls: {
    4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  text: {
    5: {
      4: ["..."],
      5: ["..."],
      8: ["..."],
      9: ["..."],
      12: ["..."],
      13: ["..."],
    },
  },
  maps: {},
  exits: {
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 66, y: 39 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default gameCornerPrizeRoom;
