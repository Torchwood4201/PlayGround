import { useDispatch, useSelector } from "react-redux";
import { MapId } from "../maps/map-types";
import useBadges from "./use-badges";
import {
  addPokemon,
  completeQuest,
  encounterPokemon,
  moveLeft,
  selectCompletedQuests,
  selectPos,
  setPos,
  takeMoney,
} from "../state/gameSlice";
import { setBlackScreen, showConfirmationMenu } from "../state/uiSlice";
import { getPokemonStats } from "./use-pokemon-stats";
import getPokemonEncounter from "./pokemon-encounter-helper";
import { STARTER_QUESTS } from "./rival-teams";

export interface QuestType {
  trigger: "talk" | "walk";
  map: MapId;
  positions: Record<number, number[]>;
  active: () => boolean;
  text: string[];
  action: () => void;
}

export const useActiveMapQuests = (map: MapId) => {
  const quests = useQuests();
  return quests.filter((quest) => quest.map === map && quest.active());
};

const useQuests = () => {
  const dispatch = useDispatch();
  const badges = useBadges();
  const completedQuests = useSelector(selectCompletedQuests);
  const pos = useSelector(selectPos);

  const quests: QuestType[] = [
    // Professor Oak's Lab: pick a starter (talk to a POKE BALL).
    // The rival standing nearby battles you right after (vision trainer).
    ...[
      { id: 4, x: 4, name: "CHARMANDER", desc: "fire", moves: [{ id: "scratch", pp: 35 }, { id: "growl", pp: 40 }] },
      { id: 7, x: 5, name: "SQUIRTLE", desc: "water", moves: [{ id: "tackle", pp: 35 }, { id: "growl", pp: 40 }] },
      { id: 1, x: 6, name: "BULBASAUR", desc: "plant", moves: [{ id: "tackle", pp: 35 }, { id: "growl", pp: 40 }] },
    ].map((starter) => ({
      trigger: "talk" as const,
      map: MapId.PalletTownLab,
      positions: { 1: [starter.x] },
      active: () =>
        !Object.values(STARTER_QUESTS).some((q) => completedQuests.includes(q)),
      text: [
        "OAK: Here, Blue!",
        "There are 3 POKEMON here!",
        "Haha!",
        "They are inside the POKE BALLs.",
        "In my old age, I have only 3 left, but you can have one! Choose!",
      ],
      action: () => {
        dispatch(
          showConfirmationMenu({
            preMessage: `So! You want the ${starter.desc} POKEMON, ${starter.name}?`,
            postMessage: `Blue received a ${starter.name}!`,
            confirm: () => {
              dispatch(
                addPokemon({
                  id: starter.id,
                  level: 5,
                  xp: 0,
                  hp: getPokemonStats(starter.id, 5).hp,
                  moves: starter.moves,
                })
              );
              dispatch(completeQuest(STARTER_QUESTS[starter.id]));
            },
          })
        );
      },
    })),
    // Stationary legendaries (talk to battle; Voltorb/Electrode fakes too).
    ...[
      { map: MapId.PowerPlant, x: 4, y: 9, id: 145, level: 50 },
      { map: MapId.PowerPlant, x: 9, y: 20, id: 100, level: 40 },
      { map: MapId.PowerPlant, x: 32, y: 18, id: 100, level: 40 },
      { map: MapId.PowerPlant, x: 21, y: 25, id: 100, level: 40 },
      { map: MapId.PowerPlant, x: 25, y: 18, id: 101, level: 43 },
      { map: MapId.PowerPlant, x: 23, y: 34, id: 100, level: 40 },
      { map: MapId.PowerPlant, x: 26, y: 28, id: 100, level: 40 },
      { map: MapId.PowerPlant, x: 21, y: 14, id: 101, level: 43 },
      { map: MapId.PowerPlant, x: 37, y: 32, id: 100, level: 40 },
      { map: MapId.SeafoamIslandsB4f, x: 6, y: 1, id: 144, level: 50 },
      { map: MapId.VictoryRoad2f, x: 11, y: 5, id: 146, level: 50 },
      { map: MapId.CeruleanCaveB1f, x: 27, y: 13, id: 150, level: 70 },
    ].map((spot) => ({
      trigger: "talk" as const,
      map: spot.map,
      positions: {
        [2 * spot.y]: [2 * spot.x, 2 * spot.x + 1],
        [2 * spot.y + 1]: [2 * spot.x, 2 * spot.x + 1],
      },
      active: () => true,
      text: ["..."],
      action: () => {
        dispatch(encounterPokemon(getPokemonEncounter(spot.id, spot.level)));
      },
    })),
    // Pewter City
    {
      trigger: "walk",
      map: MapId.PewterCity,
      positions: {
        17: [35],
        18: [35],
        19: [35],
      },
      active: () => badges.length === 0,
      text: [
        "You're a Trainer, right?",
        "Brock's looking for new challengers.",
        "Follow me!",
      ],
      action: () => {
        dispatch(moveLeft());
        dispatch(setBlackScreen(true));
        setTimeout(() => {
          dispatch(setPos({ x: 14, y: 19 }));
        }, 300);
        setTimeout(() => {
          dispatch(setBlackScreen(false));
        }, 600);
      },
    },
    {
      trigger: "walk",
      map: MapId.PewterCityMuseum1f,
      positions: {
        4: [9, 10],
      },
      active: () => !completedQuests.includes("pewter-museum-1f-paid"),
      text: ["It's $50 for a child's ticket."],
      action: () => {
        dispatch(
          showConfirmationMenu({
            preMessage: "Would you like to come in?",
            postMessage: "Right $50! Thank you!",
            confirm: () => {
              dispatch(completeQuest("pewter-museum-1f-paid"));
              dispatch(takeMoney(50));
            },
            cancel: () => {
              dispatch(setPos({ x: pos.x, y: pos.y + 1 }));
            },
          })
        );
      },
    },
  ];

  return quests;
};

export default useQuests;
