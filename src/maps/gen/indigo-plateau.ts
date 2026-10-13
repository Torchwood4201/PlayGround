import indigoplateauImage from "../../assets/map/gen/indigo-plateau.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered INDIGO_PLATEAU - do not hand-edit.
const indigoPlateau: MapType = {
  name: "Indigo Plateau",
  image: indigoplateauImage,
  height: 18,
  width: 20,
  start: { x: 10, y: 16 },
  walls: {
    0: [18, 19],
    1: [18, 19],
    2: [12, 13],
    3: [12, 13],
    8: [0, 1, 2, 3, 4, 5],
    9: [0, 1, 2, 3, 4, 5],
    12: [0, 1, 2, 3, 4, 5],
    13: [0, 1, 2, 3, 4, 5],
    16: [0, 1, 2, 3, 4, 5],
    17: [0, 1, 2, 3, 4, 5],
  },
  text: {},
  maps: {
    10: {
      18: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      19: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      20: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      21: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
    },
    11: {
      18: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      19: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      20: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
      21: { map: MapId.IndigoPlateauLobby, pos: { x: 14, y: 23 } },
    },
    17: {
      6: { map: MapId.Route23, pos: { x: 6, y: 1 } },
      7: { map: MapId.Route23, pos: { x: 6, y: 1 } },
      8: { map: MapId.Route23, pos: { x: 8, y: 1 } },
      9: { map: MapId.Route23, pos: { x: 8, y: 1 } },
      10: { map: MapId.Route23, pos: { x: 10, y: 1 } },
      11: { map: MapId.Route23, pos: { x: 10, y: 1 } },
      12: { map: MapId.Route23, pos: { x: 12, y: 1 } },
      13: { map: MapId.Route23, pos: { x: 12, y: 1 } },
      14: { map: MapId.Route23, pos: { x: 14, y: 1 } },
      15: { map: MapId.Route23, pos: { x: 14, y: 1 } },
      16: { map: MapId.Route23, pos: { x: 16, y: 1 } },
      17: { map: MapId.Route23, pos: { x: 16, y: 1 } },
      18: { map: MapId.Route23, pos: { x: 18, y: 1 } },
      19: { map: MapId.Route23, pos: { x: 18, y: 1 } },
    },
  },
  exits: {},
  exitReturnMap: MapId.Route23,
  exitReturnPos: { x: 10, y: 1 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default indigoPlateau;
