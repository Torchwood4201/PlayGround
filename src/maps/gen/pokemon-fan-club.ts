import pokemonfanclubImage from "../../assets/map/gen/pokemon-fan-club.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered POKEMON_FAN_CLUB - do not hand-edit.
const pokemonFanClub: MapType = {
  name: "Pokemon Fan Club",
  image: pokemonfanclubImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [6, 7],
    3: [6, 7],
    4: [4, 5],
    5: [4, 5],
  },
  text: {
    1: {
      2: ["Let's all listen", "politely to other trainers!"],
      3: ["Let's all listen", "politely to other trainers!"],
      12: ["If someone brags,", "brag right back!"],
      13: ["If someone brags,", "brag right back!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.VermilionCity,
  exitReturnPos: { x: 18, y: 27 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default pokemonFanClub;
