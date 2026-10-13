import cinnabargymImage from "../../assets/map/gen/cinnabar-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { blaine, burglar, gentleman, superNerd } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered CINNABAR_GYM - do not hand-edit.
const cinnabarGym: MapType = {
  name: "Cinnabar Gym",
  image: cinnabargymImage,
  height: 18,
  width: 20,
  start: { x: 32, y: 35 },
  walls: {
    10: [16, 17],
    11: [16, 17],
    14: [6, 7, 8, 9],
    15: [6, 7, 8, 9],
  },
  text: {
    26: {
      32: ["..."],
    },
  },
  maps: {},
  exits: {
    35: [32, 33, 34, 35],
  },
  exitReturnMap: MapId.CinnabarIsland,
  exitReturnPos: { x: 36, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: blaine,
      facing: Direction.Down,
      pokemon: [{ id: 58, level: 42 }, { id: 77, level: 40 }, { id: 78, level: 42 }, { id: 59, level: 47 }],
      intro: ["Hah!", "I am BLAINE! I", "am the LEADER of CINNABAR GYM!", "My fiery POKEMON", "will incinerate all challengers!", "Hah! You better", "have BURN HEAL!"],
      outtro: ["I have", "burnt out!", "You have earned", "the VOLCANOBADGE!"],
      money: 4653,
      pos: { x: 6, y: 6 },
      postGame: { message: ["FIRE BLAST is the", "ultimate fire technique!", "Don't waste it on", "water POKEMON!", "The VOLCANOBADGE makes all POKEMON obey!"], items: [ItemType.VolcanoBadge, ItemType.Tm38] },
    },
    {
      npc: superNerd,
      facing: Direction.Down,
      pokemon: [{ id: 37, level: 36 }, { id: 37, level: 36 }, { id: 38, level: 36 }],
      intro: ["Do you know how", "hot POKEMON fire breath can get?"],
      outtro: ["Yow!", "Hot, hot, hot!"],
      money: 900,
      pos: { x: 34, y: 4 },
      postGame: { message: ["Fire, or to be", "more precise, combustion...", "Blah, blah, blah,", "blah..."] },
    },
    {
      npc: burglar,
      facing: Direction.Down,
      pokemon: [{ id: 58, level: 36 }, { id: 37, level: 36 }, { id: 38, level: 36 }],
      intro: ["I was a thief, but", "I became straight as a trainer!"],
      outtro: ["I", "surrender!"],
      money: 3240,
      pos: { x: 34, y: 16 },
      postGame: { message: ["I can't help", "stealing other people's POKEMON!"] },
    },
    {
      npc: superNerd,
      facing: Direction.Down,
      pokemon: [{ id: 77, level: 34 }, { id: 4, level: 34 }, { id: 37, level: 34 }, { id: 58, level: 34 }],
      intro: ["You can't win!", "I have studied POKEMON totally!"],
      outtro: ["Waah!", "My studies!"],
      money: 850,
      pos: { x: 22, y: 8 },
      postGame: { message: ["My theories are", "too complicated for you!"] },
    },
    {
      npc: burglar,
      facing: Direction.Down,
      pokemon: [{ id: 77, level: 41 }],
      intro: ["I just like using", "fire POKEMON!"],
      outtro: ["Too hot", "to handle!"],
      money: 3690,
      pos: { x: 22, y: 16 },
      postGame: { message: ["I wish there was", "a thief POKEMON! I'd use that!"] },
    },
    {
      npc: superNerd,
      facing: Direction.Down,
      pokemon: [{ id: 78, level: 41 }],
      intro: ["I know why BLAINE", "became a trainer!"],
      outtro: ["Ow!"],
      money: 1025,
      pos: { x: 22, y: 28 },
      postGame: { message: ["BLAINE was lost", "in the mountains when a fiery bird", "POKEMON appeared.", "Its light enabled", "BLAINE to find his way down!"] },
    },
    {
      npc: burglar,
      facing: Direction.Down,
      pokemon: [{ id: 37, level: 37 }, { id: 58, level: 37 }],
      intro: ["I've been to many", "GYMs, but this is my favorite!"],
      outtro: ["Yowza!", "Too hot!"],
      money: 3330,
      pos: { x: 6, y: 28 },
      postGame: { message: ["Us fire POKEMON", "fans like PONYTA and NINETALES!"] },
    },
    {
      npc: superNerd,
      facing: Direction.Down,
      pokemon: [{ id: 58, level: 37 }, { id: 37, level: 37 }],
      intro: ["Fire is weak", "against H2O!"],
      outtro: ["Oh!", "Snuffed out!"],
      money: 925,
      pos: { x: 6, y: 16 },
      postGame: { message: ["Water beats fire!", "But, fire melts ice POKEMON!"] },
    },
  ],
  npcs: [
    { npc: gentleman, pos: { x: 32, y: 26 }, facing: Direction.Down },
  ],
};

export default cinnabarGym;
