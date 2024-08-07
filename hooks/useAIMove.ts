import { GameState, Item } from "@/app/match-card/page";
import { shuffleArray } from "@/lib/utils";
import { MutableRefObject, useCallback } from "react";

export const useAIMove = (
  gameState: GameState,
  aiMemory: MutableRefObject<Item[]>,
  handleSelectCard: (card: Item) => void
) => {
  const aiMove = useCallback(() => {
    const getUnmatchedCards = (cards: Item[]): Item[] =>
      cards.filter((card) => !gameState.matchedPairs.has(card.id));

    const findMatchingPair = (cards: Item[]): Item[] | null => {
      for (const item of cards) {
        const match = cards.find(
          (i) => item.name === i.name && item.id !== i.id
        );
        if (match) return [item, match];
      }
      return null;
    };

    const selectPreferedCards = (cards: Item[], count: number): Item[] => {
      const unseenCards = cards.filter(
        (card) => !aiMemory.current.some((memCard) => memCard.id === card.id)
      );

      if (unseenCards.length >= count) {
        return shuffleArray(unseenCards).slice(0, count);
      } else {
        const seenCards = cards.filter((card) =>
          aiMemory.current.some((memCard) => memCard.id === card.id)
        );
        return [
          ...shuffleArray(unseenCards),
          ...shuffleArray(seenCards).slice(0, count - unseenCards.length),
        ];
      }
    };

    const updateAIMemory = (card: Item) => {
      if (!aiMemory.current.some((memCard) => memCard.id === card.id)) {
        aiMemory.current.push(card);
      }
    };

    const unmatchedMemory = getUnmatchedCards(aiMemory.current);
    const unmathedGlobal = getUnmatchedCards(gameState.randomItems);

    const knownPair = findMatchingPair(unmatchedMemory);
    let [firstPick, secondPick] =
      knownPair ?? selectPreferedCards(unmathedGlobal, 2);

    if (!knownPair) {
      const potentialMatch = unmatchedMemory.find(
        (i) => i.name == firstPick.name && i.id !== firstPick.id
      );
      if (potentialMatch) secondPick = potentialMatch;
    }

    const makeMove = (card: Item) => {
      updateAIMemory(card);
      handleSelectCard(card);
    };

    makeMove(firstPick);

    setTimeout(() => makeMove(secondPick), 1000);
  }, [gameState.randomItems, gameState.matchedPairs, handleSelectCard]);
  return aiMove;
};
