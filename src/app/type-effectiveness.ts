// Authentic Generation 1 (Red/Blue/Yellow) type chart.
// NOTE: Gen 1 has no Dark/Steel/Fairy. Pokemon/moves in this game still use
// modern PokeAPI typings in places, so unknown attacking types fall through
// to neutral (1x) via the guards in getTypeEffectiveness below.
const typeChart: Record<string, Record<string, number>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
  },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    bug: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    bug: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 2,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
  },
  ghost: {
    normal: 0,
    // In Gen 1, Psychic-type Pokemon are immune to Ghost moves (original bug).
    psychic: 0,
    ghost: 2,
  },
  dragon: {
    dragon: 2,
  },
};

const getTypeEffectiveness = (
  attackingType: string,
  defendingTypes: string[]
) => {
  let effectiveness = 1;

  // Unknown attacking types (e.g. modern Dark/Steel/Fairy typings) deal
  // neutral damage rather than crashing.
  const row = typeChart[attackingType];
  if (!row) return effectiveness;

  defendingTypes.forEach((defendingType) => {
    const multiplier = row[defendingType];
    // Unknown defending types are neutral; 0 (immunity) must multiply.
    if (multiplier !== undefined) effectiveness *= multiplier;
  });

  return effectiveness;
};

export default getTypeEffectiveness;
