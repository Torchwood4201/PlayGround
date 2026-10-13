import celadonmansion3fImage from "../../assets/map/gen/celadon-mansion-3f.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { gentleman, scientist, superNerd } from "../../app/npcs";
import music from "../../assets/music/maps/pewter-city.mp3";

// Generated from pret/pokered CELADON_MANSION_3F - do not hand-edit.
const celadonMansion3f: MapType = {
  name: "Celadon Mansion 3F",
  image: celadonmansion3fImage,
  height: 12,
  width: 8,
  start: { x: 4, y: 10 },
  walls: {
    4: [2, 3],
    5: [2, 3],
  },
  text: {
    6: {
      4: ["Is that right?", "I'm the game", "designer!", "Filling up your", "POKEDEX is tough, but don't quit!", "When you finish,", "come tell me!"],
    },
    7: {
      2: ["It's the game", "program! Messing with it could bug out", "the game!"],
      3: ["It's the game", "program! Messing with it could bug out", "the game!"],
      8: ["Someone's playing", "a game instead of working!"],
      9: ["Someone's playing", "a game instead of working!"],
    },
    8: {
      0: ["Me? I'm the", "programmer!"],
      6: ["I'm the graphic", "artist! I drew you!"],
    },
    13: {
      2: ["It's the script!", "Better not look at the ending!"],
      3: ["It's the script!", "Better not look at the ending!"],
    },
    14: {
      0: ["I wrote the story!", "Isn't ERIKA cute?", "I like MISTY a", "lot too!", "Oh, and SABRINA,", "I like her!"],
    },
    19: {
      8: ["GAME FREAK", "Development Room"],
      9: ["GAME FREAK", "Development Room"],
    },
  },
  maps: {
    2: {
      4: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 3 } },
      8: { map: MapId.CeladonMansion2f, pos: { x: 8, y: 3 } },
      9: { map: MapId.CeladonMansion2f, pos: { x: 8, y: 3 } },
      12: { map: MapId.CeladonMansion2f, pos: { x: 12, y: 3 } },
      13: { map: MapId.CeladonMansion2f, pos: { x: 12, y: 3 } },
      14: { map: MapId.CeladonMansionRoof, pos: { x: 12, y: 3 } },
      15: { map: MapId.CeladonMansionRoof, pos: { x: 12, y: 3 } },
    },
    3: {
      4: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 3 } },
      5: { map: MapId.CeladonMansionRoof, pos: { x: 4, y: 3 } },
      8: { map: MapId.CeladonMansion2f, pos: { x: 8, y: 3 } },
      9: { map: MapId.CeladonMansion2f, pos: { x: 8, y: 3 } },
      12: { map: MapId.CeladonMansion2f, pos: { x: 12, y: 3 } },
      13: { map: MapId.CeladonMansion2f, pos: { x: 12, y: 3 } },
      14: { map: MapId.CeladonMansionRoof, pos: { x: 12, y: 3 } },
      15: { map: MapId.CeladonMansionRoof, pos: { x: 12, y: 3 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: gentleman, pos: { x: 0, y: 8 }, facing: Direction.Up },
    { npc: gentleman, pos: { x: 6, y: 8 }, facing: Direction.Up },
    { npc: superNerd, pos: { x: 0, y: 14 }, facing: Direction.Up },
    { npc: scientist, pos: { x: 4, y: 6 }, facing: Direction.Down },
  ],
};

export default celadonMansion3f;
