import { useDispatch, useSelector } from "react-redux";
import {
  hideActionOnPokemon,
  queueEnemyAttack,
  selectActionOnPokemon,
} from "../state/uiSlice";
import { selectPokemonEncounter } from "../state/gameSlice";
import PokemonList from "./PokemonList";

const ActionOnPokemon = () => {
  const dispatch = useDispatch();
  const action = useSelector(selectActionOnPokemon);
  const inBattle = !!useSelector(selectPokemonEncounter);

  if (!action) return null;

  return (
    <PokemonList
      close={() => dispatch(hideActionOnPokemon())}
      clickPokemon={(index) => {
        action(index);
        dispatch(hideActionOnPokemon());
        // Using an item in battle costs the turn in Gen 1.
        if (inBattle) dispatch(queueEnemyAttack());
      }}
      text="Choose a Pokémon."
    />
  );
};

export default ActionOnPokemon;
