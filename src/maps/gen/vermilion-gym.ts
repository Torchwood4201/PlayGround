import vermiliongymImage from "../../assets/map/gen/vermilion-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, ltSurge, rocker, sailor } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered VERMILION_GYM - do not hand-edit.
const vermilionGym: MapType = {
  name: "Vermilion Gym",
  image: vermiliongymImage,
  height: 18,
  width: 10,
  start: { x: 8, y: 35 },
  walls: {
    4: [2, 3, 8, 9],
    5: [2, 3, 8, 9],
    14: [2, 3],
    15: [2, 3],
  },
  text: {},
  maps: {},
  exits: {
    35: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.VermilionCity,
  exitReturnPos: { x: 24, y: 39 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: ltSurge,
      facing: Direction.Down,
      pokemon: [{ id: 100, level: 21 }, { id: 25, level: 18 }, { id: 26, level: 24 }],
      intro: ["Hey, kid! What do", "you think you're doing here?", "You won't live", "long in combat! That's for sure!", "I tell you kid,", "electric POKEMON saved me during the war!", "They zapped my", "enemies into paralysis!", "The same as I'll", "do to you!"],
      outtro: ["Whoa!", "You're the real", "deal, kid!", "Fine then, take", "the THUNDERBADGE!"],
      money: 2376,
      pos: { x: 10, y: 2 },
      postGame: { message: ["A little word of", "advice, kid!", "Electricity is", "sure powerful!", "But, it's useless", "against ground- type POKEMON!", "The THUNDERBADGE makes all POKEMON up to L50 obey!"], items: [ItemType.ThunderBadge, ItemType.Tm24] },
    },
    {
      npc: gentleman,
      facing: Direction.Left,
      pokemon: [{ id: 25, level: 23 }],
      intro: ["When I was in the", "Army, LT.SURGE was my strict CO!"],
      outtro: ["Stop!", "You're very good!"],
      money: 1610,
      pos: { x: 18, y: 12 },
      postGame: { message: ["The door won't", "open?", "LT.SURGE always", "was cautious!"] },
    },
    {
      npc: rocker,
      facing: Direction.Left,
      pokemon: [{ id: 100, level: 20 }, { id: 81, level: 20 }, { id: 100, level: 20 }],
      intro: ["I'm a lightweight,", "but I'm good with electricity!"],
      outtro: ["Fried!"],
      money: 500,
      pos: { x: 6, y: 16 },
      postGame: { message: ["OK, I'll talk!", "LT.SURGE said he", "hid door switches inside something!"] },
    },
    {
      npc: sailor,
      facing: Direction.Right,
      pokemon: [{ id: 25, level: 21 }, { id: 25, level: 21 }],
      intro: ["This is no place", "for kids!"],
      outtro: ["Wow!", "Surprised me!"],
      money: 630,
      pos: { x: 0, y: 20 },
      postGame: { message: ["LT.SURGE set up", "double locks! Here's a hint!", "When you open the", "1st lock, the 2nd lock is right next", "to it!"] },
    },
  ],
};

export default vermilionGym;
