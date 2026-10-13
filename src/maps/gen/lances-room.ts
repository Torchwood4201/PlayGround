import lancesroomImage from "../../assets/map/gen/lances-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { lance } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered LANCES_ROOM - do not hand-edit.
const lancesRoom: MapType = {
  name: "Lances Room",
  image: lancesroomImage,
  height: 26,
  width: 26,
  start: { x: 13, y: 24 },
  walls: {},
  text: {},
  maps: {
    0: {
      10: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      11: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      12: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      13: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
    },
    1: {
      10: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      11: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      12: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
      13: { map: MapId.ChampionsRoom, pos: { x: 6, y: 15 } },
    },
    32: {
      48: { map: MapId.AgathasRoom, pos: { x: 8, y: 1 } },
      49: { map: MapId.AgathasRoom, pos: { x: 8, y: 1 } },
    },
    33: {
      48: { map: MapId.AgathasRoom, pos: { x: 8, y: 1 } },
      49: { map: MapId.AgathasRoom, pos: { x: 8, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: lance,
      facing: Direction.Down,
      pokemon: [{ id: 130, level: 58 }, { id: 148, level: 56 }, { id: 148, level: 56 }, { id: 142, level: 60 }, { id: 149, level: 62 }],
      intro: ["Ah! I heard about", "you Blue!", "I lead the ELITE", "FOUR! You can call me LANCE the dragon", "trainer!", "You know that", "dragons are mythical POKEMON!", "They're hard to", "catch and raise, but their powers are", "superior!", "They're virtually", "indestructible!", "Well, are you", "ready to lose?", "Your LEAGUE", "challenge ends with me, Blue!"],
      outtro: ["That's it!", "I hate to admit", "it, but you are a POKEMON master!"],
      money: 6138,
      pos: { x: 12, y: 2 },
      postGame: { message: ["I still can't", "believe my dragons lost to you,", "Blue!", "You are now the", "POKEMON LEAGUE champion!", "...Or, you would", "have been, but you have one more", "challenge ahead.", "You have to face", "another trainer! His name is...", "Rival!", "He beat the ELITE FOUR before you!", "He is the real", "POKEMON LEAGUE champion!"] },
    },
  ],
};

export default lancesRoom;
