import ceruleangymImage from "../../assets/map/gen/cerulean-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, jrTrainerFemale, misty, swimmer } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered CERULEAN_GYM - do not hand-edit.
const ceruleanGym: MapType = {
  name: "Cerulean Gym",
  image: ceruleangymImage,
  height: 14,
  width: 10,
  start: { x: 8, y: 27 },
  walls: {
    2: [8, 9],
    3: [8, 9],
    4: [8, 9],
    5: [8, 9],
    6: [8, 9],
    7: [8, 9],
    8: [8, 9],
    9: [8, 9],
    10: [6, 7, 8, 9],
    11: [6, 7, 8, 9],
  },
  text: {
    20: {
      14: ["..."],
    },
  },
  maps: {},
  exits: {
    27: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.CeruleanCity,
  exitReturnPos: { x: 60, y: 39 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: misty,
      facing: Direction.Down,
      pokemon: [{ id: 120, level: 18 }, { id: 121, level: 21 }],
      intro: ["Hi, you're a new", "face!", "Trainers who want", "to turn pro have to have a policy", "about POKEMON!", "What is your", "approach when you catch POKEMON?", "My policy is an", "all-out offensive with water-type", "POKEMON!"],
      outtro: ["Wow!", "You're too much!", "All right!", "You can have the", "CASCADEBADGE to show you beat me!"],
      money: 2079,
      pos: { x: 8, y: 4 },
      postGame: { message: ["TM11 teaches", "BUBBLEBEAM!", "Use it on an", "aquatic POKEMON!", "The CASCADEBADGE makes all POKEMON up to L30 obey!"], items: [ItemType.CascadeBadge, ItemType.Tm11] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 118, level: 19 }],
      intro: ["I'm more than good", "enough for you!", "MISTY can wait!"],
      outtro: ["You", "overwhelmed me!"],
      money: 380,
      pos: { x: 4, y: 6 },
      postGame: { message: ["You have to face", "other trainers to find out how good", "you really are."] },
    },
    {
      npc: swimmer,
      facing: Direction.Left,
      pokemon: [{ id: 116, level: 16 }, { id: 90, level: 16 }],
      intro: ["Splash!", "I'm first up!", "Let's do it!"],
      outtro: ["That", "can't be!"],
      money: 80,
      pos: { x: 16, y: 14 },
      postGame: { message: ["MISTY is going to", "keep improving!", "She won't lose to", "someone like you!"] },
    },
  ],
  npcs: [
    { npc: gentleman, pos: { x: 14, y: 20 }, facing: Direction.Down },
  ],
};

export default ceruleanGym;
