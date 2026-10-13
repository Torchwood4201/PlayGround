import { NpcType } from "../app/npcs";
import { ItemType } from "../app/use-item-data";
import { Direction, PosType } from "../state/state-types";

export enum MapId {
  PalletTown = "pallet-town",
  PalletTownHouseA1F = "pallet-town-house-a-1f",
  PalletTownHouseA2F = "pallet-town-house-a-2f",
  PalletTownHouseB = "pallet-town-house-b",
  Route1 = "route-1",
  PalletTownLab = "pallet-town-lab",
  ViridianCity = "viridian-city",
  ViridianCityGym = "viridian-city-gym",
  ViridianCityPokeMart = "viridian-city-poke-mart",
  ViridianCityPokemonCenter = "viridian-city-pokemon-center",
  ViridianCityPokemonAcadamy = "viridian-city-pokemon-acadamy",
  ViridianCityNpcHouse = "veridian-city-npc-house",
  Route22 = "route-22",
  GateHouse = "gate-house",
  Route2 = "route-2",
  Route2Gate = "route-2-gate",
  ViridianForrest = "viridian-forrest",
  Route2GateNorth = "route-2-gate-north",
  PewterCity = "pewter-city",
  PewterCityPokeMart = "pewter-city-poke-mart",
  PewterCityPokemonCenter = "pewter-city-pokemon-center",
  PewterCityNpcA = "pewter-city-npc-a",
  PewterCityNpcB = "pewter-city-npc-b",
  PewterCityGym = "pewter-city-gym",
  PewterCityMuseum1f = "pewter-city-museum-1f",
  PewterCityMuseum2f = "pewter-city-museum-2f",
  Route3 = "route-3",
  Route3PokemonCenter = "route-3-pokemon-center",
  MtMoon1f = "mt-moon-1f",
  MtMoon2f = "mt-moon-2f",
  MtMoon3f = "mt-moon-3f",
  AgathasRoom = "agathas-room",
  BikeShop = "bike-shop",
  BillsHouse = "bills-house",
  BrunosRoom = "brunos-room",
  CeladonChiefHouse = "celadon-chief-house",
  CeladonCity = "celadon-city",
  CeladonDiner = "celadon-diner",
  CeladonGym = "celadon-gym",
  CeladonHotel = "celadon-hotel",
  CeladonMansion1f = "celadon-mansion-1f",
  CeladonMansion2f = "celadon-mansion-2f",
  CeladonMansion3f = "celadon-mansion-3f",
  CeladonMansionRoof = "celadon-mansion-roof",
  CeladonMansionRoofHouse = "celadon-mansion-roof-house",
  CeladonMart1f = "celadon-mart-1f",
  CeladonMart2f = "celadon-mart-2f",
  CeladonMart3f = "celadon-mart-3f",
  CeladonMart4f = "celadon-mart-4f",
  CeladonMart5f = "celadon-mart-5f",
  CeladonMartRoof = "celadon-mart-roof",
  CeladonPokecenter = "celadon-pokecenter",
  CeruleanBadgeHouse = "cerulean-badge-house",
  CeruleanCave1f = "cerulean-cave-1f",
  CeruleanCave2f = "cerulean-cave-2f",
  CeruleanCaveB1f = "cerulean-cave-b1f",
  CeruleanCity = "cerulean-city",
  CeruleanGym = "cerulean-gym",
  CeruleanMart = "cerulean-mart",
  CeruleanPokecenter = "cerulean-pokecenter",
  CeruleanTradeHouse = "cerulean-trade-house",
  CeruleanTrashedHouse = "cerulean-trashed-house",
  ChampionsRoom = "champions-room",
  CinnabarGym = "cinnabar-gym",
  CinnabarIsland = "cinnabar-island",
  CinnabarLab = "cinnabar-lab",
  CinnabarLabFossilRoom = "cinnabar-lab-fossil-room",
  CinnabarLabMetronomeRoom = "cinnabar-lab-metronome-room",
  CinnabarLabTradeRoom = "cinnabar-lab-trade-room",
  CinnabarMart = "cinnabar-mart",
  CinnabarPokecenter = "cinnabar-pokecenter",
  CopycatsHouse1f = "copycats-house-1f",
  CopycatsHouse2f = "copycats-house-2f",
  Daycare = "daycare",
  DiglettsCave = "digletts-cave",
  DiglettsCaveRoute11 = "digletts-cave-route-11",
  DiglettsCaveRoute2 = "digletts-cave-route-2",
  FightingDojo = "fighting-dojo",
  FuchsiaBillsGrandpasHouse = "fuchsia-bills-grandpas-house",
  FuchsiaCity = "fuchsia-city",
  FuchsiaGoodRodHouse = "fuchsia-good-rod-house",
  FuchsiaGym = "fuchsia-gym",
  FuchsiaMart = "fuchsia-mart",
  FuchsiaMeetingRoom = "fuchsia-meeting-room",
  FuchsiaPokecenter = "fuchsia-pokecenter",
  GameCorner = "game-corner",
  GameCornerPrizeRoom = "game-corner-prize-room",
  HallOfFame = "hall-of-fame",
  IndigoPlateau = "indigo-plateau",
  IndigoPlateauLobby = "indigo-plateau-lobby",
  LancesRoom = "lances-room",
  LavenderCuboneHouse = "lavender-cubone-house",
  LavenderMart = "lavender-mart",
  LavenderPokecenter = "lavender-pokecenter",
  LavenderTown = "lavender-town",
  LoreleisRoom = "loreleis-room",
  MrFujisHouse = "mr-fujis-house",
  MrPsychicsHouse = "mr-psychics-house",
  NameRatersHouse = "name-raters-house",
  PokemonFanClub = "pokemon-fan-club",
  PokemonMansion1f = "pokemon-mansion-1f",
  PokemonMansion2f = "pokemon-mansion-2f",
  PokemonMansion3f = "pokemon-mansion-3f",
  PokemonMansionB1f = "pokemon-mansion-b1f",
  PokemonTower1f = "pokemon-tower-1f",
  PokemonTower2f = "pokemon-tower-2f",
  PokemonTower3f = "pokemon-tower-3f",
  PokemonTower4f = "pokemon-tower-4f",
  PokemonTower5f = "pokemon-tower-5f",
  PokemonTower6f = "pokemon-tower-6f",
  PokemonTower7f = "pokemon-tower-7f",
  PowerPlant = "power-plant",
  RockTunnel1f = "rock-tunnel-1f",
  RockTunnelB1f = "rock-tunnel-b1f",
  RockTunnelPokecenter = "rock-tunnel-pokecenter",
  RocketHideoutB1f = "rocket-hideout-b1f",
  RocketHideoutB2f = "rocket-hideout-b2f",
  RocketHideoutB3f = "rocket-hideout-b3f",
  RocketHideoutB4f = "rocket-hideout-b4f",
  Route10 = "route-10",
  Route11 = "route-11",
  Route11Gate1f = "route-11-gate-1f",
  Route11Gate2f = "route-11-gate-2f",
  Route12 = "route-12",
  Route12Gate1f = "route-12-gate-1f",
  Route12Gate2f = "route-12-gate-2f",
  Route12SuperRodHouse = "route-12-super-rod-house",
  Route13 = "route-13",
  Route14 = "route-14",
  Route15 = "route-15",
  Route15Gate1f = "route-15-gate-1f",
  Route15Gate2f = "route-15-gate-2f",
  Route16 = "route-16",
  Route16FlyHouse = "route-16-fly-house",
  Route16Gate1f = "route-16-gate-1f",
  Route16Gate2f = "route-16-gate-2f",
  Route17 = "route-17",
  Route18 = "route-18",
  Route18Gate1f = "route-18-gate-1f",
  Route18Gate2f = "route-18-gate-2f",
  Route19 = "route-19",
  Route20 = "route-20",
  Route21 = "route-21",
  Route23 = "route-23",
  Route24 = "route-24",
  Route25 = "route-25",
  Route2TradeHouse = "route-2-trade-house",
  Route4 = "route-4",
  Route5 = "route-5",
  Route5Gate = "route-5-gate",
  Route6 = "route-6",
  Route6Gate = "route-6-gate",
  Route7 = "route-7",
  Route7Gate = "route-7-gate",
  Route8 = "route-8",
  Route8Gate = "route-8-gate",
  Route9 = "route-9",
  SafariZoneCenter = "safari-zone-center",
  SafariZoneCenterRestHouse = "safari-zone-center-rest-house",
  SafariZoneEast = "safari-zone-east",
  SafariZoneEastRestHouse = "safari-zone-east-rest-house",
  SafariZoneGate = "safari-zone-gate",
  SafariZoneNorth = "safari-zone-north",
  SafariZoneNorthRestHouse = "safari-zone-north-rest-house",
  SafariZoneSecretHouse = "safari-zone-secret-house",
  SafariZoneWest = "safari-zone-west",
  SafariZoneWestRestHouse = "safari-zone-west-rest-house",
  SaffronCity = "saffron-city",
  SaffronGym = "saffron-gym",
  SaffronMart = "saffron-mart",
  SaffronPidgeyHouse = "saffron-pidgey-house",
  SaffronPokecenter = "saffron-pokecenter",
  SeafoamIslands1f = "seafoam-islands-1f",
  SeafoamIslandsB1f = "seafoam-islands-b1f",
  SeafoamIslandsB2f = "seafoam-islands-b2f",
  SeafoamIslandsB3f = "seafoam-islands-b3f",
  SeafoamIslandsB4f = "seafoam-islands-b4f",
  SilphCo10f = "silph-co-10f",
  SilphCo11f = "silph-co-11f",
  SilphCo1f = "silph-co-1f",
  SilphCo2f = "silph-co-2f",
  SilphCo3f = "silph-co-3f",
  SilphCo4f = "silph-co-4f",
  SilphCo5f = "silph-co-5f",
  SilphCo6f = "silph-co-6f",
  SilphCo7f = "silph-co-7f",
  SilphCo8f = "silph-co-8f",
  SilphCo9f = "silph-co-9f",
  SsAnne1f = "ss-anne-1f",
  SsAnne1fRooms = "ss-anne-1f-rooms",
  SsAnne2f = "ss-anne-2f",
  SsAnne2fRooms = "ss-anne-2f-rooms",
  SsAnne3f = "ss-anne-3f",
  SsAnneB1f = "ss-anne-b1f",
  SsAnneB1fRooms = "ss-anne-b1f-rooms",
  SsAnneBow = "ss-anne-bow",
  SsAnneCaptainsRoom = "ss-anne-captains-room",
  SsAnneKitchen = "ss-anne-kitchen",
  UndergroundPathNorthSouth = "underground-path-north-south",
  UndergroundPathRoute5 = "underground-path-route-5",
  UndergroundPathRoute6 = "underground-path-route-6",
  UndergroundPathRoute7 = "underground-path-route-7",
  UndergroundPathRoute8 = "underground-path-route-8",
  UndergroundPathWestEast = "underground-path-west-east",
  VermilionCity = "vermilion-city",
  VermilionDock = "vermilion-dock",
  VermilionGym = "vermilion-gym",
  VermilionMart = "vermilion-mart",
  VermilionOldRodHouse = "vermilion-old-rod-house",
  VermilionPidgeyHouse = "vermilion-pidgey-house",
  VermilionPokecenter = "vermilion-pokecenter",
  VermilionTradeHouse = "vermilion-trade-house",
  VictoryRoad1f = "victory-road-1f",
  VictoryRoad2f = "victory-road-2f",
  VictoryRoad3f = "victory-road-3f",
  WardensHouse = "wardens-house",
}

export interface PokemonMinimalType {
  id: number;
  level: number;
}

export interface PokemonEncounterData {
  id: number;
  chance: number;
  conditionValues: { name: string; url: string }[];
  maxLevel: number;
  minLevel: number;
}

export interface EncounterData {
  rate: number;
  pokemon: PokemonEncounterData[];
}

export interface EncountersType {
  walk: EncounterData;
  surf: EncounterData;
  oldRod: EncounterData;
  goodRod: EncounterData;
  superRod: EncounterData;
  rockSmash: EncounterData;
  headbutt: EncounterData;
  darkGrass: EncounterData;
  grassSpots: EncounterData;
  caveSpots: EncounterData;
  bridgeSpots: EncounterData;
  superRodSpots: EncounterData;
  surfSpots: EncounterData;
  yellowFlowers: EncounterData;
  purpleFlowers: EncounterData;
  redFlowers: EncounterData;
  roughTerrain: EncounterData;
  gift: EncounterData;
  giftEgg: EncounterData;
  onlyOne: EncounterData;
}

export interface TrainerType {
  npc: NpcType;
  pokemon: PokemonMinimalType[];
  facing: Direction;
  intro: string[];
  outtro: string[];
  money: number;
  pos: PosType;
  // Rival fight tier (see rival-teams.ts): the team is picked from the
  // player's starter at battle time; pokemon[] is the fallback team.
  rivalTier?: number;
  postGame?: {
    message: string[];
    items?: ItemType[];
  };
}

export interface MapItemType {
  pos: PosType;
  item: ItemType;
  hidden?: boolean;
}

export interface MapWithPos {
  map: MapId;
  pos: PosType;
}

export interface MapType {
  name: string;
  image: string;
  height: number;
  width: number;
  start: PosType;
  walls: Record<number, number[]>;
  text: Record<number, Record<number, string[]>>;
  // Door warps (plain MapId lands on the destination's start) or exact
  // positioned warps for map-edge connections {map, pos}.
  maps: Record<number, Record<number, MapId | MapWithPos>>;
  teleports?: Record<number, Record<number, MapWithPos>>;
  exits: Record<number, number[]>;
  cave?: boolean;
  // Cuttable trees, same shape as walls (tiles are walkable once felled).
  cut?: Record<number, number[]>;
  // Surfable water tiles (walkable when the party knows Surf).
  water?: Record<number, number[]>;
  exitReturnMap?: MapId;
  exitReturnPos?: PosType;
  music?: string;
  encounters?: EncountersType;
  grass: Record<number, number[]>;
  recoverLocation?: PosType;
  fences?: Record<number, number[]>;
  pokemonCenter?: PosType;
  pc?: PosType;
  store?: PosType;
  storeItems?: ItemType[];
  spinners?: Record<number, Record<number, Direction>>;
  stoppers?: Record<number, number[]>;
  trainers?: TrainerType[];
  items?: MapItemType[];
}
