import fightingdojoImage from "../../assets/map/gen/fighting-dojo.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { blackBelt } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered FIGHTING_DOJO - do not hand-edit.
const fightingDojo: MapType = {
  name: "Fighting Dojo",
  image: fightingdojoImage,
  height: 12,
  width: 10,
  start: { x: 8, y: 23 },
  walls: {},
  text: {},
  maps: {},
  exits: {
    23: [8, 9, 10, 11],
  },
  exitReturnMap: MapId.SaffronCity,
  exitReturnPos: { x: 52, y: 7 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: blackBelt,
      facing: Direction.Down,
      pokemon: [{ id: 106, level: 37 }, { id: 107, level: 37 }],
      intro: ["Grunt!", "I am the KARATE", "MASTER! I am the LEADER here!", "You wish to", "challenge us? Expect no mercy!", "Fwaaa!"],
      outtro: ["Hwa!", "Arrgh! Beaten!"],
      money: 925,
      pos: { x: 10, y: 6 },
      postGame: { message: ["Indeed, I have", "lost!", "But, I beseech", "you, do not take our emblem as your", "trophy!", "In return, I will", "give you a prized fighting POKEMON!", "Choose whichever", "one you like!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Right,
      pokemon: [{ id: 56, level: 31 }, { id: 56, level: 31 }, { id: 57, level: 31 }],
      intro: ["Hoargh! Take your", "shoes off!"],
      outtro: ["I give", "up!"],
      money: 775,
      pos: { x: 6, y: 8 },
      postGame: { message: ["You wait 'til you", "see our Master!", "I'm a small fry", "compared to him!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Right,
      pokemon: [{ id: 66, level: 32 }, { id: 67, level: 32 }],
      intro: ["I hear you're", "good! Show me!"],
      outtro: ["Judge!", "1 point!"],
      money: 800,
      pos: { x: 6, y: 12 },
      postGame: { message: ["Our Master is a", "pro fighter!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Left,
      pokemon: [{ id: 57, level: 36 }],
      intro: ["Nothing tough", "frightens me!", "I break boulders", "for training!"],
      outtro: ["Yow!", "Stubbed fingers!"],
      money: 900,
      pos: { x: 10, y: 10 },
      postGame: { message: ["The only thing", "that frightens us is psychic power!"] },
    },
    {
      npc: blackBelt,
      facing: Direction.Left,
      pokemon: [{ id: 66, level: 31 }, { id: 56, level: 31 }, { id: 57, level: 31 }],
      intro: ["Hoohah!", "You're trespassing", "in our FIGHTING DOJO!"],
      outtro: ["Oof!", "I give up!"],
      money: 775,
      pos: { x: 10, y: 14 },
      postGame: { message: ["The prime fighters", "across the land train here."] },
    },
  ],
};

export default fightingDojo;
