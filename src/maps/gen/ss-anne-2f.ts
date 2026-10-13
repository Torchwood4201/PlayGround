import ssanne2fImage from "../../assets/map/gen/ss-anne-2f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { rival } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_2F - do not hand-edit.
const ssAnne2f: MapType = {
  name: "SS Anne 2F",
  image: ssanne2fImage,
  height: 18,
  width: 40,
  start: { x: 20, y: 16 },
  walls: {
    4: [4, 5, 38, 39],
    5: [4, 5, 38, 39],
    6: [4, 5, 38, 39],
    7: [4, 5, 38, 39],
    8: [38, 39],
    9: [38, 39],
    10: [36, 37, 38, 39],
    11: [36, 37, 38, 39],
    12: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    13: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
  },
  text: {},
  maps: {
    8: {
      4: { map: MapId.SsAnne1f, pos: { x: 4, y: 13 } },
      5: { map: MapId.SsAnne1f, pos: { x: 4, y: 13 } },
      72: { map: MapId.SsAnneCaptainsRoom, pos: { x: 0, y: 15 } },
      73: { map: MapId.SsAnneCaptainsRoom, pos: { x: 0, y: 15 } },
    },
    9: {
      4: { map: MapId.SsAnne1f, pos: { x: 4, y: 13 } },
      5: { map: MapId.SsAnne1f, pos: { x: 4, y: 13 } },
      72: { map: MapId.SsAnneCaptainsRoom, pos: { x: 0, y: 15 } },
      73: { map: MapId.SsAnneCaptainsRoom, pos: { x: 0, y: 15 } },
    },
    22: {
      18: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 11 } },
      19: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 11 } },
      26: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 11 } },
      27: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 11 } },
      34: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 11 } },
      35: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 11 } },
      42: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 31 } },
      43: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 31 } },
      50: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 31 } },
      51: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 31 } },
      58: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 31 } },
      59: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 31 } },
    },
    23: {
      18: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 11 } },
      19: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 11 } },
      26: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 11 } },
      27: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 11 } },
      34: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 11 } },
      35: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 11 } },
      42: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 31 } },
      43: { map: MapId.SsAnne2fRooms, pos: { x: 4, y: 31 } },
      50: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 31 } },
      51: { map: MapId.SsAnne2fRooms, pos: { x: 24, y: 31 } },
      58: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 31 } },
      59: { map: MapId.SsAnne2fRooms, pos: { x: 44, y: 31 } },
    },
    24: {
      4: { map: MapId.SsAnne3f, pos: { x: 38, y: 7 } },
      5: { map: MapId.SsAnne3f, pos: { x: 38, y: 7 } },
    },
    25: {
      4: { map: MapId.SsAnne3f, pos: { x: 38, y: 7 } },
      5: { map: MapId.SsAnne3f, pos: { x: 38, y: 7 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: rival,
      rivalTier: 3,
      facing: Direction.Down,
      pokemon: [{ id: 17, level: 19 }, { id: 20, level: 16 }, { id: 64, level: 18 }, { id: 8, level: 20 }],
      intro: ["Rival: Bonjour!", "Blue!", "Imagine seeing", "you here!", "Blue, were you", "really invited?", "So how's your", "POKEDEX coming?", "I already caught", "40 kinds, pal!", "Different kinds", "are everywhere!", "Crawl around in", "grassy areas!"],
      outtro: ["Humph!", "At least you're", "raising your POKEMON!"],
      money: 1300,
      pos: { x: 72, y: 8 },
      postGame: { message: ["Blue! What are", "you, seasick?", "You should shape", "up, pal!"] },
    },
  ],
};

export default ssAnne2f;
