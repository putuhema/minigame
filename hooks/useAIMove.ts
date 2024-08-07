import { GameState, Item, MemoryItem } from "@/app/match-card/page";
import { shuffleArray } from "@/lib/utils";
import { MutableRefObject, useCallback, useRef } from "react";

export const useAIMove = (
  gameState: GameState,
  aiMemory: MutableRefObject<MemoryItem[]>,
  turnCounterRef: MutableRefObject<number>,
  handleSelectCard: (card: Item) => void
) => {
  const aiMove = useCallback(() => {
    turnCounterRef.current += 1;

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

    const calculateWeight = (item: MemoryItem): number => {
      const turnsAgo = turnCounterRef.current - item.lastSeen;
      const baseWeight = Math.max(1, 15 - Math.sqrt(turnsAgo));

      const multipleSeenBonus = Math.min(item.seenCount || 0, 5);

      switch (gameState.difficulty) {
        case "easy":
          return baseWeight * 0.5 + multipleSeenBonus;
        case "medium":
          return baseWeight + multipleSeenBonus;
        case "hard":
          return baseWeight * 1.5 + multipleSeenBonus * 2;
        default:
          return baseWeight;
      }
    };

    const selectWeightCards = (cards: Item[], count: number): Item[] => {
      const unseenCards = cards.filter(
        (card) => !aiMemory.current.some((memCard) => memCard.id === card.id)
      );

      if (unseenCards.length >= count) {
        return shuffleArray(unseenCards).slice(0, count);
      } else {
        const seenCards = aiMemory.current.filter(
          (card) => !gameState.matchedPairs.has(card.id)
        );

        const weightSelection = weightRandomSelection(
          seenCards,
          calculateWeight,
          count - unseenCards.length
        );
        return [...shuffleArray(unseenCards), ...weightSelection];
      }
    };

    const updateAIMemory = (card: Item) => {
      const existingCard = aiMemory.current.find((item) => item.id === card.id);
      if (existingCard) {
        existingCard.lastSeen = turnCounterRef.current;
        existingCard.seenCount = (existingCard.seenCount || 0) + 1;
      } else {
        aiMemory.current.push({
          ...card,
          lastSeen: turnCounterRef.current,
          seenCount: 1,
        });
      }
    };

    const unmatchedMemory = getUnmatchedCards(aiMemory.current);
    const unmathedGlobal = getUnmatchedCards(gameState.randomItems);

    const knownPair = findMatchingPair(unmatchedMemory);
    let [firstPick, secondPick] =
      knownPair ?? selectWeightCards(unmathedGlobal, 2);

    if (!knownPair && gameState.difficulty !== "easy") {
      const potentialMatch = unmatchedMemory.find(
        (i) => i.name == firstPick.name && i.id !== firstPick.id
      );
      if (potentialMatch) secondPick = potentialMatch;
    }

    const makeMove = (card: Item) => {
      updateAIMemory(card);
      handleSelectCard(card);
    };

    // Introduce adaptive difficulty
    const matchRate =
      gameState.matchedPairs.size / (gameState.randomItems.length / 2);
    let mistakeProbability;

    switch (gameState.difficulty) {
      case "easy":
        mistakeProbability = 0.3 - matchRate * 0.1;
        break;
      case "medium":
        mistakeProbability = 0.15 - matchRate * 0.05;
        break;
      case "hard":
        mistakeProbability = 0.05 - matchRate * 0.02;
        break;
      default:
        mistakeProbability = 0;
    }

    if (Math.random() < mistakeProbability) {
      [firstPick, secondPick] = selectWeightCards(unmathedGlobal, 2);
    }

    makeMove(firstPick);

    const delayTime = Math.random() * 1000 + 1500; // Random delay between 1.5 and 2.5 seconds
    setTimeout(() => makeMove(secondPick), delayTime);
  }, [gameState.randomItems, gameState.matchedPairs, handleSelectCard]);
  return aiMove;
};

function weightRandomSelection<T>(
  items: T[],
  weightFn: (item: T) => number,
  count: number
): T[] {
  const weights = items.map(weightFn);
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

  const selected: T[] = [];
  for (let i = 0; i < count; i++) {
    let randomWeight = Math.random() * totalWeight;
    for (let j = 0; j < items.length; j++) {
      randomWeight -= weights[j];
      if (randomWeight <= 0) {
        selected.push(items[j]);
        break;
      }
    }
  }

  return selected;
}
