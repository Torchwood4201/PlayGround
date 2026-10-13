import celadonmansionroofhouseImage from "../../assets/map/gen/celadon-mansion-roof-house.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_MANSION_ROOF_HOUSE - do not hand-edit.
const celadonMansionRoofHouse: MapType = {
  name: "Celadon Mansion Roof House",
  image: celadonmansionroofhouseImage,
  height: 8,
  width: 8,
  start: { x: 4, y: 6 },
  walls: {
    0: [2, 3],
    1: [2, 3],
    2: [2, 3],
    3: [2, 3],
  },
  text: {},
  maps: {
    14: {
      4: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      5: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      6: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      7: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
    },
    15: {
      4: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      5: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      6: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
      7: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 15 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default celadonMansionRoofHouse;
