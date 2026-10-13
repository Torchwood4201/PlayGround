import image from "../assets/map/viridian-city-pokemon-acadamy.png";
import { MapId, MapType } from "./map-types";

const viridianCityAcadamy: MapType = {
  name: "Viridian City Academy",
  image,
  height: 8,
  width: 8,
  start: {
    x: 2,
    y: 6,
  },
  walls: {
    0: [0, 1, 2, 3, 4, 5, 6, 7],
    1: [7],
    3: [3, 4],
    4: [3, 4],
    6: [0, 7],
    7: [0, 7],
  },
  text: {
    0: {
      3: [
        "POKEMON status problems:",
        "SLP, PSN, PAR, BRN and FRZ.",
        "Cures are sold at POKEMON MARTs!",
      ],
    },
    4: {
      3: [
        "Looked at the notebook!",
        "First page...",
        "POKE BALLs are used to catch POKEMON.",
        "Up to 6 POKEMON can be carried.",
      ],
    },
  },
  maps: {},
  exits: {
    7: [2, 3],
  },
  grass: {},
  exitReturnMap: MapId.ViridianCity,
  exitReturnPos: {
    x: 21,
    y: 16,
  },
};

export default viridianCityAcadamy;
