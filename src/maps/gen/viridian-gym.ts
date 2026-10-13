import viridiangymImage from "../../assets/map/gen/viridian-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { aceTrainerMale, blackBelt, gentleman, giovanni, tamer } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered VIRIDIAN_GYM - do not hand-edit.
const viridianGym: MapType = {
  name: "Viridian Gym",
  image: viridiangymImage,
  height: 18,
  width: 20,
  start: { x: 32, y: 35 },
  walls: {
    0: [4, 5],
    1: [4, 5],
    4: [16, 17],
    5: [16, 17],
    6: [6, 7, 16, 17],
    7: [6, 7, 16, 17],
    8: [4, 5, 6, 7, 14, 15, 16, 17],
    9: [4, 5, 6, 7, 14, 15, 16, 17],
    10: [6, 7],
    11: [6, 7],
  },
  text: {
    30: {
      32: ["..."],
    },
  },
  maps: {},
  exits: {
    35: [32, 33, 34, 35],
  },
  exitReturnMap: MapId.ViridianCity,
  exitReturnPos: { x: 64, y: 15 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: giovanni,
      facing: Direction.Down,
      pokemon: [{ id: 111, level: 45 }, { id: 51, level: 42 }, { id: 31, level: 44 }, { id: 34, level: 45 }, { id: 112, level: 50 }],
      intro: ["Fwahahaha! This is", "my hideout!", "I planned to", "resurrect TEAM ROCKET here!", "But, you have", "caught me again! So be it! This time,", "I'm not holding back!", "Once more, you", "shall face GIOVANNI, the greatest", "trainer!"],
      outtro: ["Ha!", "That was a truly intense fight! You", "have won! As proof, here is the", "EARTHBADGE!"],
      money: 4950,
      pos: { x: 4, y: 2 },
      postGame: { message: ["Having lost, I", "cannot face my underlings! TEAM ROCKET", "is finished forever!", "I will dedicate my", "life to the study of POKEMON!", "Let us meet again", "some day! Farewell!", "The EARTHBADGE makes all POKEMON obey!"], items: [ItemType.EarthBadge, ItemType.Tm27] },
    },
    {
      npc: aceTrainerMale,
      facing: Direction.Down,
      pokemon: [{ id: 28, level: 39 }, { id: 51, level: 39 }],
      intro: ["Heh! You must be", "running out of steam by now!"],
      outtro: ["I", "ran out of gas!"],
      money: 1365,
      pos: { x: 24, y: 14 },
      postGame: { message: ["You need power to", "keep up with our GYM LEADER!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Up,
      pokemon: [{ id: 66, level: 40 }, { id: 67, level: 40 }],
      intro: ["Rrrroar! I'm", "working myself into a rage!"],
      outtro: ["Wargh!"],
      money: 1000,
      pos: { x: 22, y: 22 },
      postGame: { message: ["I'm still not", "worthy!"] },
    },
    {
      npc: tamer,
      facing: Direction.Down,
      pokemon: [{ id: 111, level: 43 }],
      intro: ["POKEMON and I, we", "make wonderful music together!"],
      outtro: ["You are in", "perfect harmony!"],
      money: 1720,
      pos: { x: 20, y: 14 },
      postGame: { message: ["Do you know the", "identity of our GYM LEADER?"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Left,
      pokemon: [{ id: 67, level: 43 }],
      intro: ["Karate is the", "ultimate form of martial arts!"],
      outtro: ["Atcho!"],
      money: 1075,
      pos: { x: 6, y: 14 },
      postGame: { message: ["If my POKEMON", "were as good at Karate as I..."] },
    },
    {
      npc: aceTrainerMale,
      facing: Direction.Right,
      pokemon: [{ id: 111, level: 43 }],
      intro: ["The truly talented", "win with style!"],
      outtro: ["I", "lost my grip!"],
      money: 1505,
      pos: { x: 26, y: 10 },
      postGame: { message: ["The LEADER will", "scold me!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Down,
      pokemon: [{ id: 67, level: 38 }, { id: 66, level: 38 }, { id: 67, level: 38 }],
      intro: ["I'm the KARATE", "KING! Your fate rests with me!"],
      outtro: ["Ayah!"],
      money: 950,
      pos: { x: 20, y: 2 },
      postGame: { message: ["POKEMON LEAGUE?", "You? Don't get cocky!"] },
    },
    {
      npc: tamer,
      facing: Direction.Right,
      pokemon: [{ id: 24, level: 39 }, { id: 128, level: 39 }],
      intro: ["Your POKEMON will", "cower at the crack of my whip!"],
      outtro: ["Yowch!", "Whiplash!"],
      money: 1560,
      pos: { x: 4, y: 32 },
      postGame: { message: ["Wait! I was just", "careless!"] },
    },
    {
      npc: aceTrainerMale,
      facing: Direction.Down,
      pokemon: [{ id: 33, level: 39 }, { id: 34, level: 39 }],
      intro: ["VIRIDIAN GYM was", "closed for a long time, but now our", "LEADER is back!"],
      outtro: ["I", "was beaten?"],
      money: 1365,
      pos: { x: 12, y: 10 },
      postGame: { message: ["You can go onto", "POKEMON LEAGUE only by defeating our GYM", "LEADER!"] },
    },
  ],
  items: [
    { item: ItemType.Revive, pos: { x: 32, y: 19 } },
  ],
  npcs: [
    { npc: gentleman, pos: { x: 32, y: 30 }, facing: Direction.Down },
  ],
};

export default viridianGym;
