import { PokemonEncounterType, PokemonInstance } from "../state/state-types";
import { CRITICAL_HIT_MULTIPLIER } from "./constants";
import getTypeEffectiveness from "./type-effectiveness";
import { getMoveMetadata } from "./use-move-metadata";
import { getPokemonMetadata } from "./use-pokemon-metadata";
import { getPokemonStats } from "./use-pokemon-stats";

export interface MoveResult {
  moveName: string;
  us: PokemonInstance;
  them: PokemonEncounterType;
  missed: boolean;
  superEffective: boolean;
  notVeryEffective: boolean;
  critical: boolean;
  isBuff: boolean;
  isDebuff: boolean;
}

const getUs = (us: PokemonInstance, isAttacking: boolean, move: string) => {
  if (!isAttacking) return us;
  const newUs = {
    ...us,
    moves: us.moves.map((m) => {
      if (m.id !== move) return m;
      return {
        ...m,
        pp: Math.max(0, m.pp - 1),
      };
    }),
  };
  return newUs;
};

// Gen 1 high critical-hit ratio moves (8x the normal crit chance).
const HIGH_CRIT_MOVES = ["crabhammer", "karate-chop", "razor-leaf", "slash"];

// Gen 1 critical hit: chance = (base Speed / 512), x8 for high-crit moves.
// Crits deal double damage.
const getCriticalMultiplier = (attackerId: number, moveId: string) => {
  const baseSpeed = getPokemonMetadata(attackerId).baseStats.speed;
  const chance = (baseSpeed / 512) * (HIGH_CRIT_MOVES.includes(moveId) ? 8 : 1);
  return Math.random() < chance ? CRITICAL_HIT_MULTIPLIER : 1;
};

// Gen 1 damage variance roll: random 217-255 / 255.
const getDamageVariance = () => (217 + Math.floor(Math.random() * 39)) / 255;

const processMove = (
  us: PokemonInstance,
  them: PokemonEncounterType,
  move: string,
  isAttacking: boolean
): MoveResult => {
  const ourMetadata = getPokemonMetadata(us.id);
  const theirMetadata = getPokemonMetadata(them.id);
  const ourStats = getPokemonStats(us.id, us.level);
  const theirStats = getPokemonStats(them.id, them.level);
  const moveMetadata = getMoveMetadata(move);

  const defaultReturn = {
    moveName: moveMetadata.name,
    us: getUs(us, isAttacking, move),
    them,
    missed: false,
    superEffective: false,
    notVeryEffective: false,
    critical: false,
    isBuff: false,
    isDebuff: false,
  };

  // Attack misses
  if (moveMetadata.accuracy && moveMetadata.accuracy < Math.random() * 100) {
    return {
      ...defaultReturn,
      missed: true,
    };
  }

  // Our attack
  if (isAttacking) {
    // TODO - handle moves with no power
    if (!moveMetadata.power) {
      return {
        ...defaultReturn,
        isDebuff: true,
      };
    }

    const attack =
      moveMetadata.damageClass === "physical"
        ? ourStats.attack
        : ourStats.specialAttack;
    const defense =
      moveMetadata.damageClass === "physical"
        ? theirStats.defense
        : theirStats.specialDefense;
    if (!moveMetadata.power) throw new Error("No power for move");
    const critical = getCriticalMultiplier(us.id, move);
    const stab = ourMetadata.types.includes(moveMetadata.type) ? 1.5 : 1;
    const typeEffectiveness = getTypeEffectiveness(
      moveMetadata.type,
      theirMetadata.types
    );
    const superEffective = typeEffectiveness > 1;
    const notVeryEffective =
      typeEffectiveness < 1 && typeEffectiveness > 0;
    // Immunity (0x) deals no damage; all other hits deal at least 1.
    const damage =
      typeEffectiveness === 0
        ? 0
        : Math.max(
            1,
            Math.round(
              ((((2 * us.level * critical) / 5 + 2) *
                moveMetadata.power *
                (attack / defense)) /
                50 +
                2) *
                stab *
                typeEffectiveness *
                getDamageVariance()
            )
          );

    return {
      ...defaultReturn,
      them: {
        ...them,
        hp: Math.max(0, them.hp - damage),
      },
      superEffective,
      notVeryEffective,
      critical: critical > 1,
    };
  }

  // Enemy attack
  // TODO - handle moves with no power
  if (!moveMetadata.power) {
    return {
      ...defaultReturn,
      isDebuff: true,
    };
  }

  const attack =
    moveMetadata.damageClass === "physical"
      ? theirStats.attack
      : theirStats.specialAttack;
  const defense =
    moveMetadata.damageClass === "physical"
      ? ourStats.defense
      : ourStats.specialDefense;
  if (!moveMetadata.power) throw new Error("No power for move");
  const critical = getCriticalMultiplier(them.id, move);
  const stab = theirMetadata.types.includes(moveMetadata.type) ? 1.5 : 1;
  const typeEffectiveness = getTypeEffectiveness(
    moveMetadata.type,
    ourMetadata.types
  );
  const superEffective = typeEffectiveness > 1;
  const notVeryEffective = typeEffectiveness < 1 && typeEffectiveness > 0;
  // Immunity (0x) deals no damage; all other hits deal at least 1.
  const damage =
    typeEffectiveness === 0
      ? 0
      : Math.max(
          1,
          Math.round(
            ((((2 * them.level * critical) / 5 + 2) *
              moveMetadata.power *
              (attack / defense)) /
              50 +
              2) *
              stab *
              typeEffectiveness *
              getDamageVariance()
          )
        );

  return {
    ...defaultReturn,
    us: {
      ...defaultReturn.us,
      hp: Math.max(0, us.hp - damage),
    },
    notVeryEffective,
    superEffective,
    critical: critical > 1,
  };
};

export default processMove;
