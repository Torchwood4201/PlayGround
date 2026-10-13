import loreleisroomImage from "../../assets/map/gen/loreleis-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lorelei } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered LORELEIS_ROOM - do not hand-edit.
const loreleisRoom: MapType = {
  name: "Loreleis Room",
  image: loreleisroomImage,
  height: 12,
  width: 10,
  start: { x: 5, y: 10 },
  walls: {},
  text: {},
  maps: {
    0: {
      8: { map: MapId.BrunosRoom, pos: { x: 8, y: 23 } },
      9: { map: MapId.BrunosRoom, pos: { x: 8, y: 23 } },
      10: { map: MapId.BrunosRoom, pos: { x: 10, y: 23 } },
      11: { map: MapId.BrunosRoom, pos: { x: 10, y: 23 } },
    },
    1: {
      8: { map: MapId.BrunosRoom, pos: { x: 8, y: 23 } },
      9: { map: MapId.BrunosRoom, pos: { x: 8, y: 23 } },
      10: { map: MapId.BrunosRoom, pos: { x: 10, y: 23 } },
      11: { map: MapId.BrunosRoom, pos: { x: 10, y: 23 } },
    },
    22: {
      8: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      9: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      10: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      11: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
    },
    23: {
      8: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      9: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      10: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
      11: { map: MapId.IndigoPlateauLobby, pos: { x: 16, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: lorelei,
      facing: Direction.Down,
      pokemon: [{ id: 87, level: 54 }, { id: 91, level: 53 }, { id: 80, level: 54 }, { id: 124, level: 56 }, { id: 131, level: 56 }],
      intro: ["Welcome to", "POKEMON LEAGUE!", "I am LORELEI of", "the ELITE FOUR!", "No one can best", "me when it comes to icy POKEMON!", "Freezing moves", "are powerful!", "Your POKEMON will", "be at my mercy when they are frozen", "solid!", "Hahaha!", "Are you ready?"],
      outtro: ["How", "dare you!"],
      money: 5544,
      pos: { x: 10, y: 4 },
      postGame: { message: ["You're better", "than I thought! Go on ahead!", "You only got a", "taste of POKEMON LEAGUE power!"] },
    },
  ],
};

export default loreleisRoom;
