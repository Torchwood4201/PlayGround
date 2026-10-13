import silphco6fImage from "../../assets/map/gen/silph-co-6f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { scientist, teamRocketGrunt } from "../../app/npcs";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SILPH_CO_6F - do not hand-edit.
const silphCo6f: MapType = {
  name: "Silph Co 6F",
  image: silphco6fImage,
  height: 18,
  width: 26,
  start: { x: 13, y: 16 },
  walls: {
    0: [4, 5],
    1: [4, 5],
    4: [22, 23],
    5: [22, 23],
    8: [4, 5],
    9: [4, 5],
    16: [0, 1],
    17: [0, 1],
  },
  text: {},
  maps: {
    0: {
      28: { map: MapId.SilphCo5f, pos: { x: 48, y: 1 } },
      29: { map: MapId.SilphCo5f, pos: { x: 48, y: 1 } },
      32: { map: MapId.SilphCo7f, pos: { x: 44, y: 1 } },
      33: { map: MapId.SilphCo7f, pos: { x: 44, y: 1 } },
    },
    1: {
      28: { map: MapId.SilphCo5f, pos: { x: 48, y: 1 } },
      29: { map: MapId.SilphCo5f, pos: { x: 48, y: 1 } },
      32: { map: MapId.SilphCo7f, pos: { x: 44, y: 1 } },
      33: { map: MapId.SilphCo7f, pos: { x: 44, y: 1 } },
    },
    6: {
      6: { map: MapId.SilphCo4f, pos: { x: 34, y: 7 } },
      7: { map: MapId.SilphCo4f, pos: { x: 34, y: 7 } },
      46: { map: MapId.SilphCo2f, pos: { x: 18, y: 31 } },
      47: { map: MapId.SilphCo2f, pos: { x: 18, y: 31 } },
    },
    7: {
      6: { map: MapId.SilphCo4f, pos: { x: 34, y: 7 } },
      7: { map: MapId.SilphCo4f, pos: { x: 34, y: 7 } },
      46: { map: MapId.SilphCo2f, pos: { x: 18, y: 31 } },
      47: { map: MapId.SilphCo2f, pos: { x: 18, y: 31 } },
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
      pokemon: [{ id: 66, level: 29 }, { id: 67, level: 29 }],
      intro: ["I am one of the 4", "ROCKET BROTHERS!"],
      outtro: ["Flame", "out!"],
      money: 870,
      pos: { x: 34, y: 6 },
      postGame: { message: ["No matter!", "My brothers will avenge me!"] },
    },
    {
      npc: scientist,
      facing: Direction.Down,
      pokemon: [{ id: 100, level: 25 }, { id: 109, level: 25 }, { id: 82, level: 25 }, { id: 81, level: 25 }, { id: 109, level: 25 }],
      intro: ["That rotten", "PRESIDENT!", "He shouldn't have", "sent me to the TIKSI BRANCH!"],
      outtro: ["Shoot!"],
      money: 1250,
      pos: { x: 14, y: 16 },
      postGame: { message: ["TIKSI BRANCH?", "It's in Russian no man's land!"] },
    },
    {
      npc: teamRocketGrunt,
      facing: Direction.Left,
      pokemon: [{ id: 41, level: 28 }, { id: 41, level: 28 }, { id: 42, level: 28 }],
      intro: ["You dare betray", "TEAM ROCKET?"],
      outtro: ["You", "traitor!"],
      money: 840,
      pos: { x: 28, y: 30 },
      postGame: { message: ["If you stand for", "justice, you betray evil!"] },
    },
  ],
  items: [
    { item: ItemType.HpUp, pos: { x: 6, y: 25 } },
    { item: ItemType.XAccuracy, pos: { x: 4, y: 31 } },
  ],
};

export default silphCo6f;
