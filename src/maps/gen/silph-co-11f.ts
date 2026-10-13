import silphco11fImage from "../../assets/map/gen/silph-co-11f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { giovanni, teamRocketGrunt } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_11F - do not hand-edit.
const silphCo11f: MapType = {
  name: "Silph Co 11F",
  image: silphco11fImage,
  height: 18,
  width: 18,
  start: { x: 10, y: 11 },
  walls: {
    8: [8, 9],
    9: [8, 9],
  },
  text: {},
  maps: {
    0: {
      18: { map: MapId.SilphCo10f, pos: { x: 20, y: 1 } },
      19: { map: MapId.SilphCo10f, pos: { x: 20, y: 1 } },
    },
    1: {
      18: { map: MapId.SilphCo10f, pos: { x: 20, y: 1 } },
      19: { map: MapId.SilphCo10f, pos: { x: 20, y: 1 } },
    },
    4: {
      6: { map: MapId.SilphCo7f, pos: { x: 10, y: 15 } },
      7: { map: MapId.SilphCo7f, pos: { x: 10, y: 15 } },
    },
    5: {
      6: { map: MapId.SilphCo7f, pos: { x: 10, y: 15 } },
      7: { map: MapId.SilphCo7f, pos: { x: 10, y: 15 } },
    },
  },
  exits: {
    11: [10, 11],
  },
  exitReturnMap: MapId.SilphCo7f,
  exitReturnPos: { x: 10, y: 15 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: giovanni,
      facing: Direction.Down,
      pokemon: [{ id: 33, level: 37 }, { id: 115, level: 35 }, { id: 111, level: 37 }, { id: 31, level: 41 }],
      intro: ["Ah Blue!", "So we meet again!", "The PRESIDENT and", "I are discussing a vital business", "proposition.", "Keep your nose", "out of grown-up matters...", "Or, experience a", "world of pain!"],
      outtro: ["Arrgh!!", "I lost again!?"],
      money: 4059,
      pos: { x: 12, y: 18 },
      postGame: { message: ["Blast it all!", "You ruined our plans for SILPH!", "But, TEAM ROCKET", "will never fall!", "Blue! Never", "forget that all POKEMON exist for TEAM", "ROCKET!", "I must go, but I", "shall return!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 104, level: 32 }, { id: 96, level: 32 }, { id: 105, level: 32 }],
      intro: ["Stop right there!", "Don't you move!"],
      outtro: ["Don't...", "Please!"],
      money: 960,
      pos: { x: 6, y: 32 },
      postGame: { message: ["So, you want to", "see my BOSS?"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 19, level: 25 }, { id: 19, level: 25 }, { id: 41, level: 25 }, { id: 19, level: 25 }, { id: 23, level: 25 }],
      intro: ["Halt! Do you have", "an appointment with my BOSS?"],
      outtro: ["Gaah!", "Demolished!"],
      money: 750,
      pos: { x: 30, y: 18 },
      postGame: { message: ["Watch your step,", "my BOSS likes his POKEMON tough!"] },
    },
  ],
};

export default silphCo11f;
