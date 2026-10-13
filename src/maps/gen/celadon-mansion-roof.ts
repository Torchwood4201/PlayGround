import celadonmansionroofImage from "../../assets/map/gen/celadon-mansion-roof.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_MANSION_ROOF - do not hand-edit.
const celadonMansionRoof: MapType = {
  name: "Celadon Mansion Roof",
  image: celadonmansionroofImage,
  height: 12,
  width: 8,
  start: { x: 4, y: 10 },
  walls: {
    0: [4, 5],
    1: [4, 5],
  },
  text: {
    15: {
      6: ["I KNOW EVERYTHING!"],
      7: ["I KNOW EVERYTHING!"],
    },
  },
  maps: {
    2: {
      4: { map: MapId.CeladonMansion3f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion3f, pos: { x: 4, y: 3 } },
      12: { map: MapId.CeladonMansion3f, pos: { x: 14, y: 3 } },
      13: { map: MapId.CeladonMansion3f, pos: { x: 14, y: 3 } },
    },
    3: {
      4: { map: MapId.CeladonMansion3f, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansion3f, pos: { x: 4, y: 3 } },
      12: { map: MapId.CeladonMansion3f, pos: { x: 14, y: 3 } },
      13: { map: MapId.CeladonMansion3f, pos: { x: 14, y: 3 } },
    },
    14: {
      4: { map: MapId.CeladonMansionRoofHouse, pos: { x: 4, y: 15 } },
      5: { map: MapId.CeladonMansionRoofHouse, pos: { x: 4, y: 15 } },
    },
    15: {
      4: { map: MapId.CeladonMansionRoofHouse, pos: { x: 4, y: 15 } },
      5: { map: MapId.CeladonMansionRoofHouse, pos: { x: 4, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMansionRoof;
