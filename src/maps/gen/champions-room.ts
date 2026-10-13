import championsroomImage from "../../assets/map/gen/champions-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { oak, rival } from "../../app/npcs";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered CHAMPIONS_ROOM - do not hand-edit.
const championsRoom: MapType = {
  name: "Champions Room",
  image: championsroomImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    2: [6, 7],
    3: [6, 7],
    4: [6, 7],
    5: [6, 7],
  },
  text: {
    14: {
      6: ["OAK: Blue!"],
    },
  },
  maps: {
    0: {
      6: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      7: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      8: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      9: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
    },
    1: {
      6: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      7: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      8: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
      9: { map: MapId.HallOfFame, pos: { x: 8, y: 15 } },
    },
    14: {
      6: { map: MapId.LancesRoom, pos: { x: 10, y: 1 } },
      7: { map: MapId.LancesRoom, pos: { x: 10, y: 1 } },
      8: { map: MapId.LancesRoom, pos: { x: 12, y: 1 } },
      9: { map: MapId.LancesRoom, pos: { x: 12, y: 1 } },
    },
    15: {
      6: { map: MapId.LancesRoom, pos: { x: 10, y: 1 } },
      7: { map: MapId.LancesRoom, pos: { x: 10, y: 1 } },
      8: { map: MapId.LancesRoom, pos: { x: 12, y: 1 } },
      9: { map: MapId.LancesRoom, pos: { x: 12, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: rival,
      rivalTier: 7,
      facing: Direction.Down,
      pokemon: [{ id: 18, level: 61 }, { id: 65, level: 59 }, { id: 112, level: 61 }, { id: 59, level: 61 }, { id: 103, level: 63 }, { id: 9, level: 65 }],
      intro: ["Rival: Hey!", "I was looking", "forward to seeing you, Blue!", "My rival should", "be strong to keep me sharp!", "While working on", "POKEDEX, I looked all over for powerful", "POKEMON!", "Not only that, I", "assembled teams that would beat any", "POKEMON type!", "And now!", "I'm the POKEMON", "LEAGUE champion!", "Blue! Do you", "know what that means?", "I'll tell you!", "I am the most", "powerful trainer in the world!"],
      outtro: ["NO!", "That can't be! You beat my best!", "After all that", "work to become LEAGUE champ?", "My reign is over", "already? It's not fair!"],
      money: 6435,
      pos: { x: 8, y: 4 },
      postGame: { message: ["Why?", "Why did I lose?", "I never made any", "mistakes raising my POKEMON...", "Darn it! You're", "the new POKEMON LEAGUE champion!", "Although I don't", "like to admit it.", "PROF.OAK: Congratulations!", "Welcome to the HALL OF FAME!"] },
    },
  ],
  npcs: [
    { npc: oak, pos: { x: 6, y: 14 }, facing: Direction.Up },
  ],
};

export default championsRoom;
