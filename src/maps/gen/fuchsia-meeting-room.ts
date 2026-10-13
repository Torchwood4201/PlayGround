import fuchsiameetingroomImage from "../../assets/map/gen/fuchsia-meeting-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { hiker } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered FUCHSIA_MEETING_ROOM - do not hand-edit.
const fuchsiaMeetingRoom: MapType = {
  name: "Fuchsia Meeting Room",
  image: fuchsiameetingroomImage,
  height: 8,
  width: 14,
  start: { x: 8, y: 15 },
  walls: {
    4: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13],
    5: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13],
    6: [4, 5],
    7: [4, 5],
  },
  text: {
    2: {
      8: ["We nicknamed the", "WARDEN SLOWPOKE.", "He and SLOWPOKE", "both look vacant!"],
      20: ["SLOWPOKE came in,", "but I couldn't understand him.", "I think he's got", "a speech problem!"],
    },
    4: {
      0: ["SLOWPOKE is very", "knowledgeable about POKEMON!", "He even has some", "fossils of rare, extinct POKEMON!"],
    },
  },
  maps: {},
  exits: {
    15: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 44, y: 27 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: hiker, pos: { x: 8, y: 2 }, facing: Direction.Down },
    { npc: hiker, pos: { x: 0, y: 4 }, facing: Direction.Up },
    { npc: hiker, pos: { x: 20, y: 2 }, facing: Direction.Down },
  ],
};

export default fuchsiaMeetingRoom;
