import redshouse1fImage from "../../assets/map/gen/reds-house-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { beauty } from "../../app/npcs";
import music from "../../assets/music/maps/pallet-town.mp3";

// Generated from pret/pokered REDS_HOUSE_1F - do not hand-edit.
const redsHouse1f: MapType = {
  name: "Reds House 1F",
  image: redshouse1fImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {},
  text: {
    3: {
      6: ["..."],
      7: ["..."],
    },
    8: {
      10: ["..."],
    },
  },
  maps: {
    2: {
      14: { map: MapId.PalletTownHouseA2F, pos: { x: 14, y: 3 } },
      15: { map: MapId.PalletTownHouseA2F, pos: { x: 14, y: 3 } },
    },
    3: {
      14: { map: MapId.PalletTownHouseA2F, pos: { x: 14, y: 3 } },
      15: { map: MapId.PalletTownHouseA2F, pos: { x: 14, y: 3 } },
    },
  },
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.PalletTown,
  exitReturnPos: { x: 10, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: beauty, pos: { x: 10, y: 8 }, facing: Direction.Left },
  ],
};

export default redsHouse1f;
