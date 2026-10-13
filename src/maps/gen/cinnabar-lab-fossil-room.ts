import cinnabarlabfossilroomImage from "../../assets/map/gen/cinnabar-lab-fossil-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CINNABAR_LAB_FOSSIL_ROOM - do not hand-edit.
const cinnabarLabFossilRoom: MapType = {
  name: "Cinnabar Lab Fossil Room",
  image: cinnabarlabfossilroomImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    0: [4, 5],
    1: [4, 5],
    6: [2, 3],
    7: [2, 3],
  },
  text: {
    4: {
      10: ["Hiya!", "I am important", "doctor!", "I study here rare", "POKEMON fossils!", "You! Have you a", "fossil for me?"],
    },
    12: {
      14: ["..."],
    },
  },
  maps: {
    14: {
      4: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      5: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      6: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      7: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
    },
    15: {
      4: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      5: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      6: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
      7: { map: MapId.CinnabarLab, pos: { x: 32, y: 9 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 10, y: 4 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 14, y: 12 }, facing: Direction.Up },
  ],
};

export default cinnabarLabFossilRoom;
