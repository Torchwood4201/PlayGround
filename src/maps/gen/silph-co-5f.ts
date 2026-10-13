import silphco5fImage from "../../assets/map/gen/silph-co-5f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { juggler, scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_5F - do not hand-edit.
const silphCo5f: MapType = {
  name: "Silph Co 5F",
  image: silphco5fImage,
  height: 18,
  width: 30,
  start: { x: 15, y: 16 },
  walls: {
    0: [6, 7],
    1: [6, 7],
    4: [26, 27],
    5: [26, 27],
    6: [14, 15],
    7: [14, 15],
    14: [10, 11],
    15: [10, 11],
    16: [0, 1],
    17: [0, 1],
  },
  text: {
    12: {
      48: ["It's a POKEMON", "REPORT!", "4 POKEMON evolve", "only when traded by link-cable."],
    },
    18: {
      26: ["..."],
    },
    20: {
      50: ["It's a POKEMON", "REPORT!", "Over 160 POKEMON", "techniques have been confirmed."],
    },
    24: {
      44: ["It's a POKEMON", "REPORT!", "POKEMON LAB", "created PORYGON, the first virtual", "reality POKEMON."],
    },
  },
  maps: {
    0: {
      48: { map: MapId.SilphCo6f, pos: { x: 28, y: 1 } },
      49: { map: MapId.SilphCo6f, pos: { x: 28, y: 1 } },
      52: { map: MapId.SilphCo4f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo4f, pos: { x: 52, y: 1 } },
    },
    1: {
      48: { map: MapId.SilphCo6f, pos: { x: 28, y: 1 } },
      49: { map: MapId.SilphCo6f, pos: { x: 28, y: 1 } },
      52: { map: MapId.SilphCo4f, pos: { x: 52, y: 1 } },
      53: { map: MapId.SilphCo4f, pos: { x: 52, y: 1 } },
    },
    6: {
      54: { map: MapId.SilphCo7f, pos: { x: 42, y: 31 } },
      55: { map: MapId.SilphCo7f, pos: { x: 42, y: 31 } },
    },
    7: {
      54: { map: MapId.SilphCo7f, pos: { x: 42, y: 31 } },
      55: { map: MapId.SilphCo7f, pos: { x: 42, y: 31 } },
    },
    10: {
      22: { map: MapId.SilphCo3f, pos: { x: 6, y: 7 } },
      23: { map: MapId.SilphCo3f, pos: { x: 6, y: 7 } },
    },
    11: {
      22: { map: MapId.SilphCo3f, pos: { x: 6, y: 7 } },
      23: { map: MapId.SilphCo3f, pos: { x: 6, y: 7 } },
    },
    30: {
      6: { map: MapId.SilphCo3f, pos: { x: 6, y: 31 } },
      7: { map: MapId.SilphCo3f, pos: { x: 6, y: 31 } },
      18: { map: MapId.SilphCo9f, pos: { x: 34, y: 31 } },
      19: { map: MapId.SilphCo9f, pos: { x: 34, y: 31 } },
    },
    31: {
      6: { map: MapId.SilphCo3f, pos: { x: 6, y: 31 } },
      7: { map: MapId.SilphCo3f, pos: { x: 6, y: 31 } },
      18: { map: MapId.SilphCo9f, pos: { x: 34, y: 31 } },
      19: { map: MapId.SilphCo9f, pos: { x: 34, y: 31 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: teamRocketGrunt,
      facing: Direction.Right,
      pokemon: [{ id: 24, level: 33 }],
      intro: ["I heard a kid was", "wandering around."],
      outtro: ["Boom!"],
      money: 990,
      pos: { x: 16, y: 32 },
      postGame: { message: ["It's not smart", "to pick a fight with TEAM ROCKET!"] },
    },
    {
      npc: scientist,
      facing: Direction.Right,
      pokemon: [{ id: 82, level: 26 }, { id: 109, level: 26 }, { id: 110, level: 26 }, { id: 81, level: 26 }],
      intro: ["We study #", "BALL technology on this floor!"],
      outtro: ["Dang!", "Blast it!"],
      money: 1300,
      pos: { x: 16, y: 6 },
      postGame: { message: ["We worked on the", "ultimate POKE BALL which would catch", "anything!"] },
    },
    {
      npc: juggler,
      facing: Direction.Up,
      pokemon: [{ id: 64, level: 29 }, { id: 122, level: 29 }],
      intro: ["Whaaat? There", "shouldn't be any children here?"],
      outtro: ["Oh", "goodness!"],
      money: 1015,
      pos: { x: 36, y: 20 },
      postGame: { message: ["You're only on 5F.", "It's a long way to my BOSS!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Up,
      pokemon: [{ id: 97, level: 33 }],
      intro: ["Show TEAM ROCKET", "a little respect!"],
      outtro: ["Cough...", "Cough..."],
      money: 990,
      pos: { x: 56, y: 8 },
      postGame: { message: ["Which reminds me.", "KOFFING evolves", "into WEEZING!"] },
    },
  ],
  items: [
    { item: ItemType.Tm09, pos: { x: 4, y: 27 } },
    { item: ItemType.Protein, pos: { x: 8, y: 13 } },
    { item: ItemType.CardKey, pos: { x: 42, y: 33 } },
  ],
  npcs: [
    { npc: scientist, pos: { x: 26, y: 18 }, facing: Direction.Down },
  ],
};

export default silphCo5f;
