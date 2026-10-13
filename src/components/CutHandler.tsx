import { useDispatch, useSelector } from "react-redux";
import useEvent from "../app/use-event";
import { Event } from "../app/emitter";
import { directionModifier } from "../app/map-helper";
import {
  fellTree,
  partyKnowsMove,
  selectFelledTrees,
  selectMap,
  selectMapId,
  selectPokemon,
  selectPokemonEncounter,
  selectPos,
} from "../state/gameSlice";
import { selectDirection } from "../state/gameSlice";
import {
  selectMenuOpen,
  showText,
  showTextThenAction,
} from "../state/uiSlice";

/**
 * HM01 Cut field move: face a cuttable tree and press A to chop it down.
 * Felled trees persist per save (like collected items).
 */
const CutHandler = () => {
  const dispatch = useDispatch();
  const pos = useSelector(selectPos);
  const direction = useSelector(selectDirection);
  const map = useSelector(selectMap);
  const mapId = useSelector(selectMapId);
  const pokemon = useSelector(selectPokemon);
  const felledTrees = useSelector(selectFelledTrees);
  const menuOpen = useSelector(selectMenuOpen);
  const inBattle = !!useSelector(selectPokemonEncounter);

  useEvent(Event.A, () => {
    if (menuOpen || inBattle) return;
    if (!map.cut) return;
    const mod = directionModifier(direction);
    const x = pos.x + mod.x;
    const y = pos.y + mod.y;
    if (!map.cut[y] || !map.cut[y].includes(x)) return;
    if (!partyKnowsMove(pokemon, "cut")) {
      dispatch(showText(["This tree can be CUT!"]));
      return;
    }
    dispatch(fellTree({ x, y }));
    if (felledTrees.includes(`${mapId}-${x}-${y}`)) return;
    dispatch(
      showTextThenAction({
        text: ["Used CUT!"],
        action: () => {},
      })
    );
  });

  return null;
};

export default CutHandler;
