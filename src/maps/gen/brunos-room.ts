import brunosroomImage from "../../assets/map/gen/brunos-room.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { bruno } from "../../app/npcs";
import music from "../../assets/music/maps/mt-moon.mp3";

// Generated from pret/pokered BRUNOS_ROOM - do not hand-edit.
const brunosRoom: MapType = {
  name: "Brunos Room",
  image: brunosroomImage,
  height: 12,
  width: 10,
  start: { x: 5, y: 10 },
  walls: {
    10: [2, 3],
    11: [2, 3],
  },
  text: {},
  maps: {
    0: {
      8: { map: MapId.AgathasRoom, pos: { x: 8, y: 23 } },
      9: { map: MapId.AgathasRoom, pos: { x: 8, y: 23 } },
      10: { map: MapId.AgathasRoom, pos: { x: 10, y: 23 } },
      11: { map: MapId.AgathasRoom, pos: { x: 10, y: 23 } },
    },
    1: {
      8: { map: MapId.AgathasRoom, pos: { x: 8, y: 23 } },
      9: { map: MapId.AgathasRoom, pos: { x: 8, y: 23 } },
      10: { map: MapId.AgathasRoom, pos: { x: 10, y: 23 } },
      11: { map: MapId.AgathasRoom, pos: { x: 10, y: 23 } },
    },
    22: {
      8: { map: MapId.LoreleisRoom, pos: { x: 8, y: 1 } },
      9: { map: MapId.LoreleisRoom, pos: { x: 8, y: 1 } },
      10: { map: MapId.LoreleisRoom, pos: { x: 10, y: 1 } },
      11: { map: MapId.LoreleisRoom, pos: { x: 10, y: 1 } },
    },
    23: {
      8: { map: MapId.LoreleisRoom, pos: { x: 8, y: 1 } },
      9: { map: MapId.LoreleisRoom, pos: { x: 8, y: 1 } },
      10: { map: MapId.LoreleisRoom, pos: { x: 10, y: 1 } },
      11: { map: MapId.LoreleisRoom, pos: { x: 10, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  trainers: [
    {
      npc: bruno,
      facing: Direction.Down,
      pokemon: [{ id: 95, level: 53 }, { id: 107, level: 55 }, { id: 106, level: 55 }, { id: 95, level: 56 }, { id: 68, level: 58 }],
      intro: ["I am BRUNO of", "the ELITE FOUR!", "Through rigorous", "training, people and POKEMON can become", "stronger!", "I've weight", "trained with my POKEMON!", "Blue!", "We will grind you", "down with our superior power!", "Hoo hah!"],
      outtro: ["Why?", "How could I lose?"],
      money: 5742,
      pos: { x: 10, y: 4 },
      postGame: { message: ["My job is done!", "Go face your next challenge!"] },
    },
  ],
};

export default brunosRoom;
