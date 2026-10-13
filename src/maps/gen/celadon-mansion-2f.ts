import celadonmansion2fImage from "../../assets/map/gen/celadon-mansion-2f.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_MANSION_2F - do not hand-edit.
const celadonMansion2f: MapType = {
  name: "Celadon Mansion 2F",
  image: celadonmansion2fImage,
  height: 12,
  width: 8,
  start: { x: 4, y: 10 },
  walls: {
    0: [2, 3],
    1: [2, 3],
    2: [0, 1, 2, 3],
    3: [0, 1, 2, 3],
    6: [2, 3],
    7: [2, 3],
  },
  text: {
    19: {
      8: ["GAME FREAK", "Meeting Room"],
      9: ["GAME FREAK", "Meeting Room"],
    },
  },
  maps: {
    2: {
      4: { map: MapId.CeladonMansion1f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion1f, pos: { x: 4, y: 3 } },
      8: { map: MapId.CeladonMansion3f, pos: { x: 8, y: 3 } },
      9: { map: MapId.CeladonMansion3f, pos: { x: 8, y: 3 } },
      12: { map: MapId.CeladonMansion3f, pos: { x: 12, y: 3 } },
      13: { map: MapId.CeladonMansion3f, pos: { x: 12, y: 3 } },
      14: { map: MapId.CeladonMansion1f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CeladonMansion1f, pos: { x: 14, y: 3 } },
    },
    3: {
      4: { map: MapId.CeladonMansion1f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion1f, pos: { x: 4, y: 3 } },
      8: { map: MapId.CeladonMansion3f, pos: { x: 8, y: 3 } },
      9: { map: MapId.CeladonMansion3f, pos: { x: 8, y: 3 } },
      12: { map: MapId.CeladonMansion3f, pos: { x: 12, y: 3 } },
      13: { map: MapId.CeladonMansion3f, pos: { x: 12, y: 3 } },
      14: { map: MapId.CeladonMansion1f, pos: { x: 14, y: 3 } },
      15: { map: MapId.CeladonMansion1f, pos: { x: 14, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMansion2f;
