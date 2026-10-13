import cinnabarlabmetronomeroomImage from "../../assets/map/gen/cinnabar-lab-metronome-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CINNABAR_LAB_METRONOME_ROOM - do not hand-edit.
const cinnabarLabMetronomeRoom: MapType = {
  name: "Cinnabar Lab Metronome Room",
  image: cinnabarlabmetronomeroomImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    6: [2, 3],
    7: [2, 3],
  },
  text: {
    3: {
      4: ["An amber pipe!"],
      5: ["An amber pipe!"],
    },
    4: {
      14: ["Tch-tch-tch!", "I made a cool TM!", "It can cause all", "kinds of fun!"],
    },
    6: {
      4: ["EEVEE can evolve", "into 1 of 3 kinds of POKEMON."],
    },
    9: {
      0: ["There's an e-mail", "message!", "...", "The 3 legendary", "bird POKEMON are ARTICUNO, ZAPDOS and", "MOLTRES.", "Their whereabouts", "are unknown.", "We plan to explore", "the cavern close to CERULEAN.", "From: POKEMON", "RESEARCH TEAM", "..."],
      1: ["There's an e-mail", "message!", "...", "The 3 legendary", "bird POKEMON are ARTICUNO, ZAPDOS and", "MOLTRES.", "Their whereabouts", "are unknown.", "We plan to explore", "the cavern close to CERULEAN.", "From: POKEMON", "RESEARCH TEAM", "..."],
      2: ["There's an e-mail", "message!", "...", "The 3 legendary", "bird POKEMON are ARTICUNO, ZAPDOS and", "MOLTRES.", "Their whereabouts", "are unknown.", "We plan to explore", "the cavern close to CERULEAN.", "From: POKEMON", "RESEARCH TEAM", "..."],
      3: ["There's an e-mail", "message!", "...", "The 3 legendary", "bird POKEMON are ARTICUNO, ZAPDOS and", "MOLTRES.", "Their whereabouts", "are unknown.", "We plan to explore", "the cavern close to CERULEAN.", "From: POKEMON", "RESEARCH TEAM", "..."],
    },
  },
  maps: {
    14: {
      4: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      5: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      6: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      7: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
    },
    15: {
      4: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      5: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      6: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
      7: { map: MapId.CinnabarLab, pos: { x: 24, y: 9 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: scientist, pos: { x: 14, y: 4 }, facing: Direction.Down },
    { npc: scientist, pos: { x: 4, y: 6 }, facing: Direction.Down },
  ],
};

export default cinnabarLabMetronomeRoom;
