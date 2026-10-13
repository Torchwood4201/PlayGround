import ssannecaptainsroomImage from "../../assets/map/gen/ss-anne-captains-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { sailor } from "../../app/npcs";
import music from "../../assets/music/maps/route-3.mp3";

// Generated from pret/pokered SS_ANNE_CAPTAINS_ROOM - do not hand-edit.
const ssAnneCaptainsRoom: MapType = {
  name: "SS Anne Captains Room",
  image: ssannecaptainsroomImage,
  height: 8,
  width: 6,
  start: { x: 3, y: 6 },
  walls: {},
  text: {
    3: {
      8: ["Yuck! Shouldn't", "have looked!"],
      9: ["Yuck! Shouldn't", "have looked!"],
    },
    4: {
      8: ["..."],
    },
    5: {
      2: ["How to Conquer", "Seasickness... The CAPTAIN's reading", "this!"],
      3: ["How to Conquer", "Seasickness... The CAPTAIN's reading", "this!"],
    },
  },
  maps: {
    14: {
      0: { map: MapId.SsAnne2f, pos: { x: 72, y: 9 } },
      1: { map: MapId.SsAnne2f, pos: { x: 72, y: 9 } },
    },
    15: {
      0: { map: MapId.SsAnne2f, pos: { x: 72, y: 9 } },
      1: { map: MapId.SsAnne2f, pos: { x: 72, y: 9 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: sailor, pos: { x: 8, y: 4 }, facing: Direction.Up },
  ],
};

export default ssAnneCaptainsRoom;
