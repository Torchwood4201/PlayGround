import halloffameImage from "../../assets/map/gen/hall-of-fame.png";
import { MapId, MapType } from "../map-types";
import { Direction } from "../../state/state-types";
import { oak } from "../../app/npcs";
import music from "../../assets/music/maps/pallet-town.mp3";

// Generated from pret/pokered HALL_OF_FAME - do not hand-edit.
const hallOfFame: MapType = {
  name: "Hall Of Fame",
  image: halloffameImage,
  height: 8,
  width: 10,
  start: { x: 5, y: 6 },
  walls: {},
  text: {
    4: {
      10: ["OAK: Er-hem!", "Congratulations Blue!", "This floor is the", "POKEMON HALL OF FAME!", "POKEMON LEAGUE", "champions are honored for their", "exploits here!", "Their POKEMON are", "also recorded in the HALL OF FAME!", "Blue! You have", "endeavored hard to become the new", "LEAGUE champion!", "Congratulations,", "Blue, you and your POKEMON are HALL", "OF FAMERs!"],
    },
  },
  maps: {
    14: {
      8: { map: MapId.ChampionsRoom, pos: { x: 6, y: 1 } },
      9: { map: MapId.ChampionsRoom, pos: { x: 6, y: 1 } },
      10: { map: MapId.ChampionsRoom, pos: { x: 8, y: 1 } },
      11: { map: MapId.ChampionsRoom, pos: { x: 8, y: 1 } },
    },
    15: {
      8: { map: MapId.ChampionsRoom, pos: { x: 6, y: 1 } },
      9: { map: MapId.ChampionsRoom, pos: { x: 6, y: 1 } },
      10: { map: MapId.ChampionsRoom, pos: { x: 8, y: 1 } },
      11: { map: MapId.ChampionsRoom, pos: { x: 8, y: 1 } },
    },
  },
  exits: {},
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  npcs: [
    { npc: oak, pos: { x: 10, y: 4 }, facing: Direction.Down },
  ],
};

export default hallOfFame;
