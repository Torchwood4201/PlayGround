import lavendertownImage from "../../assets/map/gen/lavender-town.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerMale, lass, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered LAVENDER_TOWN - do not hand-edit.
const lavenderTown: MapType = {
  name: "Lavender Town",
  image: lavendertownImage,
  height: 18,
  width: 20,
  start: { x: 9, y: 16 },
  walls: {
    0: [18, 19],
    1: [18, 19],
    2: [2, 3, 4, 5, 18, 19],
    3: [2, 3, 4, 5, 18, 19],
    10: [14, 15, 16, 17],
    11: [14, 15, 16, 17],
    16: [10, 11, 18, 19],
    17: [10, 11, 18, 19],
  },
  text: {
    7: {
      18: ["New SILPH SCOPE!", "Make the Invisible", "Plain to See!", "SILPH CO."],
      19: ["New SILPH SCOPE!", "Make the Invisible", "Plain to See!", "SILPH CO."],
    },
    11: {
      8: ["Heal Your POKEMON!", "POKEMON CENTER"],
      9: ["Heal Your POKEMON!", "POKEMON CENTER"],
    },
    14: {
      16: ["GHOSTs appeared", "in POKEMON TOWER.", "I think they're", "the spirits of POKEMON that the ROCKETs", "killed."],
    },
    15: {
      34: ["May the Souls of", "POKEMON Rest Easy POKEMON TOWER"],
      35: ["May the Souls of", "POKEMON Rest Easy POKEMON TOWER"],
    },
    18: {
      30: ["..."],
    },
    19: {
      10: ["LAVENDER VOLUNTEER", "POKEMON HOUSE"],
      11: ["LAVENDER VOLUNTEER", "POKEMON HOUSE"],
      22: ["LAVENDER TOWN", "The Noble Purple Town"],
      23: ["LAVENDER TOWN", "The Noble Purple Town"],
    },
    20: {
      18: ["This town is known", "as the grave site of POKEMON.", "Memorial services", "are held in POKEMON TOWER."],
    },
    27: {
      32: ["All your item", "needs fulfilled! POKEMON MART"],
      33: ["All your item", "needs fulfilled! POKEMON MART"],
    },
  },
  maps: {
    0: {
      0: { map: MapId.Route8, pos: { x: 58, y: 0 } },
      4: { map: MapId.Route10, pos: { x: 4, y: 70 } },
      5: { map: MapId.Route10, pos: { x: 4, y: 70 } },
      6: { map: MapId.Route10, pos: { x: 6, y: 70 } },
      7: { map: MapId.Route10, pos: { x: 6, y: 70 } },
      8: { map: MapId.Route10, pos: { x: 8, y: 69 } },
      9: { map: MapId.Route10, pos: { x: 8, y: 69 } },
      10: { map: MapId.Route10, pos: { x: 10, y: 69 } },
      11: { map: MapId.Route10, pos: { x: 10, y: 69 } },
      12: { map: MapId.Route10, pos: { x: 12, y: 70 } },
      13: { map: MapId.Route10, pos: { x: 12, y: 70 } },
      14: { map: MapId.Route10, pos: { x: 14, y: 70 } },
      15: { map: MapId.Route10, pos: { x: 14, y: 70 } },
      16: { map: MapId.Route10, pos: { x: 16, y: 70 } },
      17: { map: MapId.Route10, pos: { x: 16, y: 70 } },
    },
    1: {
      0: { map: MapId.Route8, pos: { x: 58, y: 0 } },
    },
    2: {
      0: { map: MapId.Route8, pos: { x: 58, y: 2 } },
    },
    3: {
      0: { map: MapId.Route8, pos: { x: 58, y: 2 } },
    },
    4: {
      0: { map: MapId.Route8, pos: { x: 58, y: 4 } },
    },
    5: {
      0: { map: MapId.Route8, pos: { x: 58, y: 4 } },
    },
    6: {
      0: { map: MapId.Route8, pos: { x: 58, y: 6 } },
    },
    7: {
      0: { map: MapId.Route8, pos: { x: 58, y: 6 } },
    },
    8: {
      0: { map: MapId.Route8, pos: { x: 58, y: 8 } },
    },
    9: {
      0: { map: MapId.Route8, pos: { x: 58, y: 8 } },
    },
    10: {
      0: { map: MapId.Route8, pos: { x: 58, y: 10 } },
      6: { map: MapId.LavenderPokecenter, pos: { x: 6, y: 15 } },
      7: { map: MapId.LavenderPokecenter, pos: { x: 6, y: 15 } },
      28: { map: MapId.PokemonTower1f, pos: { x: 20, y: 35 } },
      29: { map: MapId.PokemonTower1f, pos: { x: 20, y: 35 } },
    },
    11: {
      0: { map: MapId.Route8, pos: { x: 58, y: 10 } },
      6: { map: MapId.LavenderPokecenter, pos: { x: 6, y: 15 } },
      7: { map: MapId.LavenderPokecenter, pos: { x: 6, y: 15 } },
      28: { map: MapId.PokemonTower1f, pos: { x: 20, y: 35 } },
      29: { map: MapId.PokemonTower1f, pos: { x: 20, y: 35 } },
    },
    12: {
      0: { map: MapId.Route8, pos: { x: 58, y: 12 } },
    },
    13: {
      0: { map: MapId.Route8, pos: { x: 58, y: 12 } },
    },
    14: {
      0: { map: MapId.Route8, pos: { x: 58, y: 14 } },
    },
    15: {
      0: { map: MapId.Route8, pos: { x: 58, y: 14 } },
    },
    16: {
      0: { map: MapId.Route8, pos: { x: 55, y: 16 } },
    },
    17: {
      0: { map: MapId.Route8, pos: { x: 55, y: 16 } },
      2: { map: MapId.Route12, pos: { x: 2, y: 2 } },
      3: { map: MapId.Route12, pos: { x: 2, y: 2 } },
      4: { map: MapId.Route12, pos: { x: 4, y: 2 } },
      5: { map: MapId.Route12, pos: { x: 4, y: 2 } },
      6: { map: MapId.Route12, pos: { x: 6, y: 1 } },
      7: { map: MapId.Route12, pos: { x: 6, y: 1 } },
      12: { map: MapId.Route12, pos: { x: 12, y: 2 } },
      13: { map: MapId.Route12, pos: { x: 12, y: 2 } },
      14: { map: MapId.Route12, pos: { x: 14, y: 2 } },
      15: { map: MapId.Route12, pos: { x: 14, y: 2 } },
      16: { map: MapId.Route12, pos: { x: 16, y: 2 } },
      17: { map: MapId.Route12, pos: { x: 16, y: 2 } },
    },
    18: {
      14: { map: MapId.MrFujisHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.MrFujisHouse, pos: { x: 4, y: 15 } },
    },
    19: {
      14: { map: MapId.MrFujisHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.MrFujisHouse, pos: { x: 4, y: 15 } },
    },
    26: {
      6: { map: MapId.LavenderCuboneHouse, pos: { x: 4, y: 15 } },
      7: { map: MapId.LavenderCuboneHouse, pos: { x: 4, y: 15 } },
      14: { map: MapId.NameRatersHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.NameRatersHouse, pos: { x: 4, y: 15 } },
      30: { map: MapId.LavenderMart, pos: { x: 6, y: 15 } },
      31: { map: MapId.LavenderMart, pos: { x: 6, y: 15 } },
    },
    27: {
      6: { map: MapId.LavenderCuboneHouse, pos: { x: 4, y: 15 } },
      7: { map: MapId.LavenderCuboneHouse, pos: { x: 4, y: 15 } },
      14: { map: MapId.NameRatersHouse, pos: { x: 4, y: 15 } },
      15: { map: MapId.NameRatersHouse, pos: { x: 4, y: 15 } },
      30: { map: MapId.LavenderMart, pos: { x: 6, y: 15 } },
      31: { map: MapId.LavenderMart, pos: { x: 6, y: 15 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route12,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: lass, pos: { x: 30, y: 18 }, facing: Direction.Down },
    { npc: aceTrainerMale, pos: { x: 18, y: 20 }, facing: Direction.Down },
    { npc: superNerd, pos: { x: 16, y: 14 }, facing: Direction.Down },
  ],
};

export default lavenderTown;
