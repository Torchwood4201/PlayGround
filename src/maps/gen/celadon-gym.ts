import celadongymImage from "../../assets/map/gen/celadon-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerFemale, beauty, erica, jrTrainerFemale, lass } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered CELADON_GYM - do not hand-edit.
const celadonGym: MapType = {
  name: "Celadon Gym",
  image: celadongymImage,
  height: 18,
  width: 10,
  start: { x: 8, y: 35 },
  walls: {
    4: [2, 3, 6, 7],
    5: [2, 3, 6, 7],
    6: [4, 5],
    7: [4, 5],
  },
  text: {},
  maps: {},
  exits: {
    35: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.CeladonCity,
  exitReturnPos: { x: 24, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: erica,
      facing: Direction.Down,
      pokemon: [{ id: 71, level: 29 }, { id: 114, level: 24 }, { id: 45, level: 29 }],
      intro: ["Hello. Lovely", "weather isn't it? It's so pleasant.", "...Oh dear...", "I must have dozed off. Welcome.", "My name is ERIKA.", "I am the LEADER of CELADON GYM.", "I teach the art of", "flower arranging. My POKEMON are of the", "grass-type.", "Oh, I'm sorry, I", "had no idea that you wished to", "challenge me.", "Very well, but I", "shall not lose."],
      outtro: ["Oh!", "I concede defeat.", "You are remarkably", "strong.", "I must confer you", "the RAINBOWBADGE."],
      money: 2871,
      pos: { x: 8, y: 6 },
      postGame: { message: ["You are cataloging", "POKEMON? I must say I'm impressed.", "I would never", "collect POKEMON if they were", "unattractive.", "The RAINBOWBADGE makes all POKEMON up to L50 obey!"], items: [ItemType.RainbowBadge, ItemType.Tm21] },
    },
    {
      npc: lass,
      facing: Direction.Right,
      pokemon: [{ id: 69, level: 23 }, { id: 70, level: 23 }],
      intro: ["Hey!", "You are not", "allowed in here!"],
      outtro: ["You're", "too rough!"],
      money: 345,
      pos: { x: 4, y: 22 },
      postGame: { message: ["Bleaah!", "I hope ERIKA wipes you out!"] },
    },
    {
      npc: beauty,
      facing: Direction.Left,
      pokemon: [{ id: 43, level: 21 }, { id: 69, level: 21 }, { id: 43, level: 21 }, { id: 69, level: 21 }],
      intro: ["I was getting", "bored."],
      outtro: ["My", "makeup!"],
      money: 1470,
      pos: { x: 14, y: 20 },
      postGame: { message: ["Grass-type POKEMON", "are tough against the water-type!", "They also have an", "edge on rock and ground POKEMON!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Down,
      pokemon: [{ id: 1, level: 24 }, { id: 2, level: 24 }],
      intro: ["Aren't you the", "peeping Tom?"],
      outtro: ["I'm", "in shock!"],
      money: 480,
      pos: { x: 18, y: 10 },
      postGame: { message: ["Oh, you weren't", "peeping? We get a lot of gawkers!"] },
    },
    {
      npc: beauty,
      facing: Direction.Down,
      pokemon: [{ id: 69, level: 24 }, { id: 69, level: 24 }],
      intro: ["Look at my grass", "POKEMON!", "They're so easy", "to raise!"],
      outtro: ["No!"],
      money: 1680,
      pos: { x: 2, y: 10 },
      postGame: { message: ["We only use grass-", "type POKEMON at our GYM!", "We also use them", "for making flower arrangements!"] },
    },
    {
      npc: lass,
      facing: Direction.Down,
      pokemon: [{ id: 43, level: 23 }, { id: 44, level: 23 }],
      intro: ["Don't bring any", "bugs or fire POKEMON in here!"],
      outtro: ["Oh!", "You!"],
      money: 345,
      pos: { x: 12, y: 6 },
      postGame: { message: ["Our LEADER, ERIKA,", "might be quiet, but she's also very", "skilled!"] },
    },
    {
      npc: beauty,
      facing: Direction.Down,
      pokemon: [{ id: 102, level: 26 }],
      intro: ["Pleased to meet", "you. My hobby is POKEMON training."],
      outtro: ["Oh!", "Splendid!"],
      money: 1820,
      pos: { x: 6, y: 6 },
      postGame: { message: ["I have a blind", "date coming up. I have to learn to be", "polite."] },
    },
    {
      npc: aceTrainerFemale,
      facing: Direction.Down,
      pokemon: [{ id: 70, level: 24 }, { id: 44, level: 24 }, { id: 2, level: 24 }],
      intro: ["Welcome to", "CELADON GYM!", "You better not", "underestimate girl power!"],
      outtro: ["Oh!", "Beaten!"],
      money: 840,
      pos: { x: 10, y: 6 },
      postGame: { message: ["I didn't bring my", "best POKEMON!", "Wait 'til next", "time!"] },
    },
  ],
};

export default celadonGym;
