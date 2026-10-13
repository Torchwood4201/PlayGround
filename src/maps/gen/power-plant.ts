import powerplantImage from "../../assets/map/gen/power-plant.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered POWER_PLANT - do not hand-edit.
const powerPlant: MapType = {
  name: "Power Plant",
  image: powerplantImage,
  height: 36,
  width: 40,
  start: { x: 8, y: 71 },
  walls: {
    2: [12, 13],
    3: [12, 13],
    4: [28, 29],
    5: [28, 29],
    6: [12, 13, 36, 37],
    7: [12, 13, 36, 37],
    8: [12, 13, 20, 21],
    9: [12, 13, 20, 21],
    10: [34, 35],
    11: [34, 35],
    12: [28, 29],
    13: [28, 29],
    14: [12, 13, 22, 23, 34, 35, 36, 37],
    15: [12, 13, 22, 23, 34, 35, 36, 37],
    16: [8, 9],
    17: [8, 9],
    22: [2, 3, 36, 37],
    23: [2, 3, 36, 37],
    24: [30, 31],
    25: [30, 31],
    26: [22, 23, 36, 37],
    27: [22, 23, 36, 37],
    28: [26, 27, 30, 31],
    29: [26, 27, 30, 31],
    30: [4, 5],
    31: [4, 5],
    32: [6, 7, 34, 35],
    33: [6, 7, 34, 35],
    34: [0, 1, 2, 3, 8, 9, 24, 25],
    35: [0, 1, 2, 3, 8, 9, 24, 25],
  },
  text: {},
  maps: {},
  exits: {
    23: [0, 1],
    71: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.Route10,
  exitReturnPos: { x: 12, y: 79 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  items: [
    { item: ItemType.Carbos, pos: { x: 14, y: 51 } },
    { item: ItemType.HpUp, pos: { x: 56, y: 7 } },
    { item: ItemType.RareCandy, pos: { x: 68, y: 7 } },
    { item: ItemType.Tm25, pos: { x: 52, y: 65 } },
    { item: ItemType.Tm33, pos: { x: 40, y: 65 } },
  ],
};

export default powerPlant;
