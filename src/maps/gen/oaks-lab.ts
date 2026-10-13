import oakslabImage from "../../assets/map/gen/oaks-lab.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/oaks-laboratory.mp3";

// Generated from pret/pokered OAKS_LAB - do not hand-edit.
const oaksLab: MapType = {
  name: "Oaks Lab",
  image: oakslabImage,
  height: 12,
  width: 10,
  start: { x: 8, y: 23 },
  walls: {},
  text: {},
  maps: {},
  exits: {
    23: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.PalletTown,
  exitReturnPos: { x: 24, y: 23 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default oaksLab;
