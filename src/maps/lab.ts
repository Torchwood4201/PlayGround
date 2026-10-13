import labImage from "../assets/map/lab.png";
import { MapId, MapType } from "./map-types";

import music from "../assets/music/maps/oaks-laboratory.mp3";
import { rival } from "../app/npcs";
import { Direction } from "../state/state-types";

const lab: MapType = {
  name: "Lab",
  image: labImage,
  height: 12,
  width: 10,
  start: {
    x: 5,
    y: 10,
  },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [0, 1, 2, 3, 6, 7, 8, 9],
    3: [6, 7, 8],
    6: [0, 1, 2, 3, 6, 7, 8, 9],
    7: [0, 1, 2, 3, 6, 7, 8, 9],
  },
  text: {
    1: {
      0: ["ASH turned on the PC.", "It's not working..."],
    },
  },
  maps: {},
  exits: {
    11: [4, 5],
  },
  exitReturnPos: {
    x: 12,
    y: 12,
  },
  exitReturnMap: MapId.PalletTown,
  music,
  grass: {},
  trainers: [
    {
      npc: rival,
      rivalTier: 0,
      pokemon: [{ id: 7, level: 5 }],
      facing: Direction.Left,
      intro: [
        "Rival: Wait Blue!",
        "Let's check out our POKEMON!",
        "Come on, I'll take you on!",
      ],
      outtro: ["WHAT?", "Unbelievable! I picked the wrong POKEMON!"],
      money: 175,
      pos: { x: 8, y: 5 },
      postGame: {
        message: [
          "Rival: Okay!",
          "I'll make my POKEMON fight to toughen it up!",
          "Blue! Gramps! Smell you later!",
        ],
      },
    },
  ],
};

export default lab;
