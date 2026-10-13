import fuchsiagymImage from "../../assets/map/gen/fuchsia-gym.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, juggler, koga, tamer } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered FUCHSIA_GYM - do not hand-edit.
const fuchsiaGym: MapType = {
  name: "Fuchsia Gym",
  image: fuchsiagymImage,
  height: 18,
  width: 10,
  start: { x: 8, y: 35 },
  walls: {},
  text: {
    30: {
      14: ["..."],
    },
  },
  maps: {},
  exits: {
    35: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.FuchsiaCity,
  exitReturnPos: { x: 10, y: 55 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: koga,
      facing: Direction.Down,
      pokemon: [{ id: 109, level: 37 }, { id: 89, level: 39 }, { id: 109, level: 37 }, { id: 110, level: 43 }],
      intro: ["KOGA: Fwahahaha!", "A mere child like", "you dares to challenge me?", "Very well, I", "shall show you true terror as a ninja", "master!", "You shall feel", "the despair of poison and sleep", "techniques!"],
      outtro: ["Humph!", "You have proven your worth!", "Here! Take the", "SOULBADGE!"],
      money: 4257,
      pos: { x: 8, y: 20 },
      postGame: { message: ["When afflicted by", "TOXIC, POKEMON suffer more and more as", "battle progresses!", "It will surely", "terrorize foes!", "The SOULBADGE makes all POKEMON up to L70 obey!"], items: [ItemType.SoulBadge, ItemType.Tm06] },
    },
    {
      npc: juggler,
      facing: Direction.Down,
      pokemon: [{ id: 97, level: 38 }],
      intro: ["Strength isn't", "the key for POKEMON!", "It's strategy!", "I'll show you how", "strategy can beat brute strength!"],
      outtro: ["What?", "Extraordinary!"],
      money: 1330,
      pos: { x: 16, y: 26 },
      postGame: { message: ["So, you mix brawn", "with brains? Good strategy!"] },
    },
    {
      npc: juggler,
      facing: Direction.Right,
      pokemon: [{ id: 96, level: 31 }, { id: 96, level: 31 }, { id: 64, level: 31 }, { id: 96, level: 31 }],
      intro: ["I wanted to become", "a ninja, so I joined this GYM!"],
      outtro: ["I'm done", "for!"],
      money: 1085,
      pos: { x: 14, y: 16 },
      postGame: { message: ["I will keep on", "training under KOGA, my ninja master!"] },
    },
    {
      npc: juggler,
      facing: Direction.Down,
      pokemon: [{ id: 96, level: 34 }, { id: 64, level: 34 }],
      intro: ["Let's see you", "beat my special techniques!"],
      outtro: ["You", "had me fooled!"],
      money: 1190,
      pos: { x: 2, y: 24 },
      postGame: { message: ["I like poison and", "sleep techniques, as they linger after", "battle!"] },
    },
    {
      npc: tamer,
      facing: Direction.Up,
      pokemon: [{ id: 28, level: 34 }, { id: 24, level: 34 }],
      intro: ["Stop right there!", "Our invisible", "walls have you frustrated?"],
      outtro: ["Whoa!", "He's got it!"],
      money: 1360,
      pos: { x: 6, y: 10 },
      postGame: { message: ["You impressed me!", "Here's a hint!", "Look very closely", "for gaps in the invisible walls!"] },
    },
    {
      npc: tamer,
      facing: Direction.Down,
      pokemon: [{ id: 24, level: 33 }, { id: 28, level: 33 }, { id: 24, level: 33 }],
      intro: ["I also study the", "way of the ninja with master KOGA!", "Ninja have a long", "history of using animals!"],
      outtro: ["Awoo!"],
      money: 1320,
      pos: { x: 16, y: 4 },
      postGame: { message: ["I still have much", "to learn!"] },
    },
    {
      npc: juggler,
      facing: Direction.Left,
      pokemon: [{ id: 96, level: 34 }, { id: 97, level: 34 }],
      intro: ["Master KOGA comes", "from a long line of ninjas!", "What did you", "descend from?"],
      outtro: ["Dropped", "my balls!"],
      money: 1190,
      pos: { x: 4, y: 14 },
      postGame: { message: ["Where there is", "light, there is shadow!", "Light and shadow!", "Which do you choose?"] },
    },
  ],
  npcs: [
    { npc: gentleman, pos: { x: 14, y: 30 }, facing: Direction.Down },
  ],
};

export default fuchsiaGym;
