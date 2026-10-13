import indigoplateaulobbyImage from "../../assets/map/gen/indigo-plateau-lobby.png";
import { MapId, MapType } from "../map-types";
import { ItemType } from "../../app/use-item-data";
import music from "../../assets/music/maps/pokemon-gym.mp3";

// Generated from pret/pokered INDIGO_PLATEAU_LOBBY - do not hand-edit.
const indigoPlateauLobby: MapType = {
  name: "Indigo Plateau Lobby",
  image: indigoplateaulobbyImage,
  height: 12,
  width: 16,
  start: { x: 14, y: 23 },
  walls: {},
  text: {},
  maps: {
    0: {
      16: { map: MapId.LoreleisRoom, pos: { x: 8, y: 23 } },
      17: { map: MapId.LoreleisRoom, pos: { x: 8, y: 23 } },
    },
    1: {
      16: { map: MapId.LoreleisRoom, pos: { x: 8, y: 23 } },
      17: { map: MapId.LoreleisRoom, pos: { x: 8, y: 23 } },
    },
  },
  exits: {
    23: [14, 15, 16, 17],
  },
  exitReturnMap: MapId.IndigoPlateau,
  exitReturnPos: { x: 18, y: 11 },
  music,
  encounters: { walk: { rate: 0, pokemon: [] }, oldRod: { rate: 0, pokemon: [] }, goodRod: { rate: 0, pokemon: [] }, superRod: { rate: 0, pokemon: [] }, surf: { rate: 0, pokemon: [] }, rockSmash: { rate: 0, pokemon: [] }, headbutt: { rate: 0, pokemon: [] }, darkGrass: { rate: 0, pokemon: [] }, grassSpots: { rate: 0, pokemon: [] }, caveSpots: { rate: 0, pokemon: [] }, bridgeSpots: { rate: 0, pokemon: [] }, superRodSpots: { rate: 0, pokemon: [] }, surfSpots: { rate: 0, pokemon: [] }, yellowFlowers: { rate: 0, pokemon: [] }, purpleFlowers: { rate: 0, pokemon: [] }, redFlowers: { rate: 0, pokemon: [] }, roughTerrain: { rate: 0, pokemon: [] }, gift: { rate: 0, pokemon: [] }, giftEgg: { rate: 0, pokemon: [] }, onlyOne: { rate: 0, pokemon: [] } },
  grass: {},
  store: { x: 1, y: 11 },
  storeItems: [ItemType.UltraBall, ItemType.GreatBall, ItemType.FullRestore, ItemType.MaxPotion, ItemType.FullHeal, ItemType.Revive, ItemType.MaxRepel],
  pokemonCenter: { x: 14, y: 11 },
};

export default indigoPlateauLobby;
