import { MoveState, PokemonInstance } from "../state/state-types";
import { getMoveMetadata } from "./use-move-metadata";
import { getPokemonMetadata } from "./use-pokemon-metadata";

const getLevelData = (
  currentLevel: number,
  currentExp: number,
  leveledUp = false
): { level: number; leveledUp: boolean; remainingXp: number } => {
  const nextLevel = currentLevel + 1;
  const nextLevelXp = Math.pow(nextLevel, 3);
  if (currentExp >= nextLevelXp) {
    return getLevelData(nextLevel, currentExp - nextLevelXp, true);
  }
  return {
    level: currentLevel,
    leveledUp: leveledUp,
    remainingXp: currentExp,
  };
};

export default getLevelData;

export const getLearnedMove = (pokemon: PokemonInstance): MoveState | null => {
  const moves = getLearnedMoves(pokemon, pokemon.level - 1, pokemon.level);
  return moves[0] || null;
};

// All moves learned between fromLevel (exclusive) and toLevel (inclusive)
// that the pokemon doesn't already know. Used so multi-level-ups don't skip
// moves learned at intermediate levels.
export const getLearnedMoves = (
  pokemon: PokemonInstance,
  fromLevel: number,
  toLevel: number
): MoveState[] => {
  const pokemonMetadata = getPokemonMetadata(pokemon.id);
  return pokemonMetadata.moves
    .filter(
      (move) =>
        move.levelLearnedAt > fromLevel &&
        move.levelLearnedAt <= toLevel &&
        !pokemon.moves.some((m) => m.id === move.name)
    )
    .map((move) => ({
      id: move.name,
      pp: getMoveMetadata(move.name).pp || 0,
    }));
};
