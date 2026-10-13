import blueshouseImage from "../../assets/map/gen/blues-house.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lass } from "../../app/npcs";
import music from "../../assets/music/maps/pallet-town.mp3";

// Generated from pret/pokered BLUES_HOUSE - do not hand-edit.
const bluesHouse: MapType = {
  name: "Blues House",
  image: blueshouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 15 },
  walls: {
    2: [2, 3],
    3: [2, 3],
  },
  text: {
    6: {
      4: ["..."],
      6: ["It's a big map!", "This is useful!"],
    },
    8: {
      12: ["POKEMON are living", "things! If they get tired, give them a", "rest!"],
    },
  },
  maps: {},
  exits: {
    15: [4, 5, 6, 7],
  },
  exitReturnMap: MapId.PalletTown,
  exitReturnPos: { x: 26, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 4, y: 6 }, facing: Direction.Right },
    { npc: lass, pos: { x: 12, y: 8 }, facing: Direction.Down },
  ],
};

export default bluesHouse;
