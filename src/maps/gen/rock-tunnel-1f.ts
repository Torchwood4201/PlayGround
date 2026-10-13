import rocktunnel1fImage from "../../assets/map/gen/rock-tunnel-1f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { hiker, jrTrainerFemale, pokeManiac } from "../../app/npcs";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered ROCK_TUNNEL_1F - do not hand-edit.
const rockTunnel1f: MapType = {
  name: "Rock Tunnel 1F",
  image: rocktunnel1fImage,
  height: 36,
  width: 40,
  start: { x: 30, y: 7 },
  walls: {
    0: [4, 5, 6, 7, 14, 15, 16, 17],
    1: [4, 5, 6, 7, 14, 15, 16, 17],
    2: [0, 1, 2, 3, 8, 9, 12, 13],
    3: [0, 1, 2, 3, 8, 9, 12, 13],
    8: [14, 15, 16, 17, 26, 27, 28, 29, 30, 31, 32, 33],
    9: [14, 15, 16, 17, 26, 27, 28, 29, 30, 31, 32, 33],
    14: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    15: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    22: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    23: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    28: [2, 3, 4, 5, 6, 7, 10, 11, 22, 23],
    29: [2, 3, 4, 5, 6, 7, 10, 11, 22, 23],
    30: [0, 1, 8, 9, 20, 21, 24, 25],
    31: [0, 1, 8, 9, 20, 21, 24, 25],
    32: [0, 1, 8, 9, 20, 21, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
    33: [0, 1, 8, 9, 20, 21, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
  },
  text: {
    59: {
      22: ["ROCK TUNNEL", "CERULEAN CITY - LAVENDER TOWN"],
      23: ["ROCK TUNNEL", "CERULEAN CITY - LAVENDER TOWN"],
    },
  },
  maps: {
    6: {
      10: { map: MapId.RockTunnelB1f, pos: { x: 54, y: 7 } },
      11: { map: MapId.RockTunnelB1f, pos: { x: 54, y: 7 } },
      74: { map: MapId.RockTunnelB1f, pos: { x: 66, y: 51 } },
      75: { map: MapId.RockTunnelB1f, pos: { x: 66, y: 51 } },
    },
    7: {
      10: { map: MapId.RockTunnelB1f, pos: { x: 54, y: 7 } },
      11: { map: MapId.RockTunnelB1f, pos: { x: 54, y: 7 } },
      74: { map: MapId.RockTunnelB1f, pos: { x: 66, y: 51 } },
      75: { map: MapId.RockTunnelB1f, pos: { x: 66, y: 51 } },
    },
    22: {
      34: { map: MapId.RockTunnelB1f, pos: { x: 46, y: 23 } },
      35: { map: MapId.RockTunnelB1f, pos: { x: 46, y: 23 } },
    },
    23: {
      34: { map: MapId.RockTunnelB1f, pos: { x: 46, y: 23 } },
      35: { map: MapId.RockTunnelB1f, pos: { x: 46, y: 23 } },
    },
    34: {
      74: { map: MapId.RockTunnelB1f, pos: { x: 6, y: 7 } },
      75: { map: MapId.RockTunnelB1f, pos: { x: 6, y: 7 } },
    },
    35: {
      74: { map: MapId.RockTunnelB1f, pos: { x: 6, y: 7 } },
      75: { map: MapId.RockTunnelB1f, pos: { x: 6, y: 7 } },
    },
  },
  exits: {
    1: [30, 31],
    7: [30, 31],
    67: [30, 31],
    71: [30, 31],
  },
  cave: true,
  exitReturnMap: MapId.Route10,
  exitReturnPos: { x: 16, y: 35 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: hiker,
      facing: Direction.Down,
      pokemon: [{ id: 74, level: 19 }, { id: 66, level: 19 }, { id: 74, level: 19 }, { id: 74, level: 19 }],
      intro: ["This tunnel goes", "a long way, kid!"],
      outtro: ["Doh!", "You win!"],
      money: 665,
      pos: { x: 14, y: 10 },
      postGame: { message: ["Watch for ONIX!", "It can put the squeeze on you!"] },
    },
    {
      npc: hiker,
      facing: Direction.Down,
      pokemon: [{ id: 95, level: 20 }, { id: 95, level: 20 }, { id: 74, level: 20 }],
      intro: ["Hmm. Maybe I'm", "lost in here..."],
      outtro: ["Ease up!", "What am I doing? Which way is out?"],
      money: 700,
      pos: { x: 10, y: 32 },
      postGame: { message: ["That sleeping", "POKEMON on ROUTE 12 forced me to take", "this detour."] },
    },
    {
      npc: hiker,
      facing: Direction.Left,
      pokemon: [{ id: 74, level: 21 }, { id: 75, level: 21 }],
      intro: ["Outsiders like", "you need to show me some respect!"],
      outtro: ["I give!"],
      money: 735,
      pos: { x: 34, y: 30 },
      postGame: { message: ["You're talented", "enough to hike!"] },
    },
    {
      npc: pokeManiac,
      facing: Direction.Left,
      pokemon: [{ id: 104, level: 23 }, { id: 79, level: 23 }],
      intro: ["POKEMON fight!", "Ready, go!"],
      outtro: ["Game", "over!"],
      money: 1150,
      pos: { x: 46, y: 16 },
      postGame: { message: ["Oh well, I'll get", "a ZUBAT as I go!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Left,
      pokemon: [{ id: 69, level: 22 }, { id: 35, level: 22 }],
      intro: ["Eek! Don't try", "anything funny in the dark!"],
      outtro: ["It", "was too dark!"],
      money: 440,
      pos: { x: 74, y: 42 },
      postGame: { message: ["I saw a MACHOP", "in this tunnel!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Down,
      pokemon: [{ id: 52, level: 20 }, { id: 43, level: 20 }, { id: 16, level: 20 }],
      intro: ["I came this far", "for POKEMON!"],
      outtro: ["I'm", "out of POKEMON!"],
      money: 400,
      pos: { x: 44, y: 48 },
      postGame: { message: ["You looked cute", "and harmless!"] },
    },
    {
      npc: jrTrainerFemale,
      facing: Direction.Right,
      pokemon: [{ id: 16, level: 19 }, { id: 19, level: 19 }, { id: 19, level: 19 }, { id: 69, level: 19 }],
      intro: ["You have POKEMON!", "Let's start!"],
      outtro: ["You", "play hard!"],
      money: 380,
      pos: { x: 64, y: 48 },
      postGame: { message: ["Whew! I'm all", "sweaty now!"] },
    },
  ],
};

export default rockTunnel1f;
