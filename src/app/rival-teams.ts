import { PokemonMinimalType } from "../maps/map-types";

// Rival teams per fight tier, one variant per player starter:
// variant 0 = rival's Squirtle line (player picked Bulbasaur),
// variant 1 = rival's Bulbasaur line (player picked Charmander),
// variant 2 = rival's Charmander line (player picked Squirtle).
// Parties from pret/pokered Rival1Data/Rival2Data/Rival3Data.
const RIVAL_TEAMS: PokemonMinimalType[][][] = [
  // 0 - Oak's Lab
  [
    [{ id: 7, level: 5 }],
    [{ id: 1, level: 5 }],
    [{ id: 4, level: 5 }],
  ],
  // 1 - Route 22
  [
    [{ id: 16, level: 9 }, { id: 7, level: 8 }],
    [{ id: 16, level: 9 }, { id: 1, level: 8 }],
    [{ id: 16, level: 9 }, { id: 4, level: 8 }],
  ],
  // 2 - Cerulean City (Nugget Bridge)
  [
    [{ id: 17, level: 18 }, { id: 63, level: 15 }, { id: 19, level: 15 }, { id: 7, level: 17 }],
    [{ id: 17, level: 18 }, { id: 63, level: 15 }, { id: 19, level: 15 }, { id: 1, level: 17 }],
    [{ id: 17, level: 18 }, { id: 63, level: 15 }, { id: 19, level: 15 }, { id: 4, level: 17 }],
  ],
  // 3 - S.S. Anne
  [
    [{ id: 17, level: 19 }, { id: 20, level: 16 }, { id: 64, level: 18 }, { id: 8, level: 20 }],
    [{ id: 17, level: 19 }, { id: 20, level: 16 }, { id: 64, level: 18 }, { id: 2, level: 20 }],
    [{ id: 17, level: 19 }, { id: 20, level: 16 }, { id: 64, level: 18 }, { id: 5, level: 20 }],
  ],
  // 4 - Pokemon Tower
  [
    [{ id: 17, level: 25 }, { id: 58, level: 23 }, { id: 102, level: 22 }, { id: 64, level: 20 }, { id: 8, level: 25 }],
    [{ id: 17, level: 25 }, { id: 130, level: 23 }, { id: 58, level: 22 }, { id: 64, level: 20 }, { id: 2, level: 25 }],
    [{ id: 17, level: 25 }, { id: 102, level: 23 }, { id: 130, level: 22 }, { id: 64, level: 20 }, { id: 5, level: 25 }],
  ],
  // 5 - Silph Co.
  [
    [{ id: 18, level: 37 }, { id: 58, level: 38 }, { id: 102, level: 35 }, { id: 65, level: 35 }, { id: 9, level: 40 }],
    [{ id: 18, level: 37 }, { id: 130, level: 38 }, { id: 58, level: 35 }, { id: 65, level: 35 }, { id: 3, level: 40 }],
    [{ id: 18, level: 37 }, { id: 102, level: 38 }, { id: 130, level: 35 }, { id: 65, level: 35 }, { id: 6, level: 40 }],
  ],
  // 6 - Route 22 rematch (reserved; no static spot in v1)
  [[], [], []],
  // 7 - Pokemon League Champion
  [
    [{ id: 18, level: 61 }, { id: 65, level: 59 }, { id: 112, level: 61 }, { id: 59, level: 61 }, { id: 103, level: 63 }, { id: 9, level: 65 }],
    [{ id: 18, level: 61 }, { id: 65, level: 59 }, { id: 112, level: 61 }, { id: 130, level: 61 }, { id: 59, level: 63 }, { id: 3, level: 65 }],
    [{ id: 18, level: 61 }, { id: 65, level: 59 }, { id: 112, level: 61 }, { id: 103, level: 61 }, { id: 130, level: 63 }, { id: 6, level: 65 }],
  ],
];

export const STARTER_QUESTS = {
  1: "starter-bulbasaur",
  4: "starter-charmander",
  7: "starter-squirtle",
} as Record<number, string>;

/** 0/1/2 by picked starter, defaulting to 0 (Bulbasaur path). */
export const getRivalVariant = (completedQuests: string[]): number => {
  if (completedQuests.includes(STARTER_QUESTS[4])) return 1;
  if (completedQuests.includes(STARTER_QUESTS[7])) return 2;
  return 0;
};

export const getRivalTeam = (
  tier: number,
  completedQuests: string[]
): PokemonMinimalType[] => {
  const teams = RIVAL_TEAMS[tier];
  if (!teams) return [];
  return teams[getRivalVariant(completedQuests)] || [];
};

export default RIVAL_TEAMS;
