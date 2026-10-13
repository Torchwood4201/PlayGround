import agathasroomImage from "../../assets/map/gen/agathas-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { agatha } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered AGATHAS_ROOM - do not hand-edit.
const agathasRoom: MapType = {
  name: "Agathas Room",
  image: agathasroomImage,
  height: 12,
  width: 10,
  start: { x: 5, y: 10 },
  walls: {
    4: [0, 1, 8, 9],
    5: [0, 1, 8, 9],
    8: [0, 1, 8, 9],
    9: [0, 1, 8, 9],
    10: [2, 3],
    11: [2, 3],
  },
  text: {},
  maps: {
    0: {
      8: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      9: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      10: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      11: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
    },
    1: {
      8: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      9: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      10: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
      11: { map: MapId.LancesRoom, pos: { x: 48, y: 33 } },
    },
    22: {
      8: { map: MapId.BrunosRoom, pos: { x: 8, y: 1 } },
      9: { map: MapId.BrunosRoom, pos: { x: 8, y: 1 } },
      10: { map: MapId.BrunosRoom, pos: { x: 10, y: 1 } },
      11: { map: MapId.BrunosRoom, pos: { x: 10, y: 1 } },
    },
    23: {
      8: { map: MapId.BrunosRoom, pos: { x: 8, y: 1 } },
      9: { map: MapId.BrunosRoom, pos: { x: 8, y: 1 } },
      10: { map: MapId.BrunosRoom, pos: { x: 10, y: 1 } },
      11: { map: MapId.BrunosRoom, pos: { x: 10, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: agatha,
      facing: Direction.Down,
      pokemon: [{ id: 94, level: 56 }, { id: 42, level: 56 }, { id: 93, level: 55 }, { id: 24, level: 58 }, { id: 94, level: 60 }],
      intro: ["I am AGATHA of", "the ELITE FOUR!", "OAK's taken a lot", "of interest in you, child!", "That old duff was", "once tough and handsome! That was", "decades ago!", "Now he just wants", "to fiddle with his POKEDEX! He's wrong!", "POKEMON are for fighting!", "Blue! I'll show", "you how a real trainer fights!"],
      outtro: ["Oh ho!", "You're something special, child!"],
      money: 5940,
      pos: { x: 10, y: 4 },
      postGame: { message: ["You win! I see", "what the old duff sees in you now!", "I have nothing", "else to say! Run along now, child!"] },
    },
  ],
};

export default agathasRoom;
