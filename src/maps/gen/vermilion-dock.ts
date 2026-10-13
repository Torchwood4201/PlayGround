import vermiliondockImage from "../../assets/map/gen/vermilion-dock.png";
import { MapId, MapType } from "../map-types";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered VERMILION_DOCK - do not hand-edit.
const vermilionDock: MapType = {
  name: "Vermilion Dock",
  image: vermiliondockImage,
  height: 12,
  width: 28,
  start: { x: 28, y: 1 },
  walls: {
    4: [14, 15],
    5: [14, 15],
  },
  text: {},
  maps: {
    4: {
      28: { map: MapId.SsAnne1f, pos: { x: 54, y: 1 } },
      29: { map: MapId.SsAnne1f, pos: { x: 54, y: 1 } },
    },
    5: {
      28: { map: MapId.SsAnne1f, pos: { x: 54, y: 1 } },
      29: { map: MapId.SsAnne1f, pos: { x: 54, y: 1 } },
    },
  },
  exits: {
    1: [28, 29],
  },
  exitReturnMap: MapId.VermilionCity,
  exitReturnPos: { x: 36, y: 63 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
};

export default vermilionDock;
