"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./_components/card";
import Scoreboard from "./_components/scoreboard";
import Image from "next/image";

const items = ["cat", "bird", "dog", "hippo", "monkey", "worm", "shark", "jellyfish", "octopus", "catfish"]


const DemoPlayers = {
  player1: {
    name: 'funnyValentine',
    isMyTurn: true,
    points: 0,
    color: 'blue'
  },
  player2: {
    name: 'AI',
    isMyTurn: false,
    points: 0,
    color: 'red'
  }
}

export type Item = {
  id: number,
  name: string
}

interface GameState {
  players: typeof DemoPlayers;
  selectedCards: Item[];
  matchedPairs: Set<number>;
  randomItems: Item[];
}

export default function Page() {
  const [gameState, setGameState] = useState<GameState>({
    players: DemoPlayers,
    selectedCards: [],
    matchedPairs: new Set(),
    randomItems: []
  });
  // const aiMemoryRef = useRef<Map<string, number>>(new Map());
  const aiMemoryRef = useRef<Item[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  useEffect(() => {
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    setGameState(prev => ({ ...prev, randomItems: shuffledItems }));
  }, []);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSelectCard = useCallback((item: Item) => {
    setGameState(prev => {
      if (prev.selectedCards.length < 2 && !prev.selectedCards.some(card => card.id === item.id)) {
        const newSelectedCards = [...prev.selectedCards, item];

        // Memorize both player and AI previous pick
        if (!aiMemoryRef.current.find(i => i.id === item.id && item.name === i.name)) {
          aiMemoryRef.current.push(item)
        }

        // Check for match immediately if two cards are selected
        if (newSelectedCards.length === 2) {
          const [first, second] = newSelectedCards;
          const currentPlayer = prev.players.player1.isMyTurn ? 'player1' : 'player2';
          const otherPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';


          if (first.name === second.name) {
            const newMatchedPairs = new Set(prev.matchedPairs).add(first.id).add(second.id);
            const newPlayers = {
              ...prev.players,
              [currentPlayer]: {
                ...prev.players[currentPlayer],
                points: prev.players[currentPlayer].points + 10,
                isMyTurn: !prev.players[currentPlayer].isMyTurn
              },
              [otherPlayer]: {
                ...prev.players[otherPlayer],
                isMyTurn: !prev.players[otherPlayer].isMyTurn
              }
            };

            // Schedule clearing of selected cards
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => updateGameState({ selectedCards: [] }), 1000);

            return {
              ...prev,
              selectedCards: newSelectedCards,
              matchedPairs: newMatchedPairs,
              players: newPlayers
            };
          } else {
            // No match, switch turns
            const newPlayers = {
              player1: { ...prev.players.player1, isMyTurn: !prev.players.player1.isMyTurn },
              player2: { ...prev.players.player2, isMyTurn: !prev.players.player2.isMyTurn }
            };

            // Schedule clearing of selected cards
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => updateGameState({ selectedCards: [] }), 1000);

            return { ...prev, selectedCards: newSelectedCards, players: newPlayers };
          }
        }

        return { ...prev, selectedCards: newSelectedCards };
      }
      return prev;
    });
  }, [updateGameState]);

  console.log({ memory: aiMemoryRef.current })
  const aiMove = useCallback(() => {
    const unmatched = aiMemoryRef.current.filter(item => !gameState.matchedPairs.has(item.id));
    const globalUnmatched = gameState.randomItems.filter(item => !gameState.matchedPairs.has(item.id));



    let firstPick: Item | null = null;
    let secondPick: Item | null = null;

    for (const item of aiMemoryRef.current) {
      const matchingCard = unmatched.find(i => item.name === i.name && item.id !== i.id);
      if (matchingCard) {
        firstPick = unmatched.find(i => item.id === i.id) || null;
        secondPick = matchingCard;
        break;
      }
    }

    if (!firstPick) {
      [firstPick, secondPick] = shuffleArray(globalUnmatched).slice(0, 2);
    }

    if (firstPick) handleSelectCard(firstPick);
    if (secondPick) setTimeout(() => handleSelectCard(secondPick), 1000);
  }, [gameState.randomItems, gameState.matchedPairs, handleSelectCard]);

  useEffect(() => {
    if (gameState.players.player2.isMyTurn && gameState.selectedCards.length === 0) {
      const timeoutId = setTimeout(aiMove, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.players.player2.isMyTurn, gameState.selectedCards.length, aiMove]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  return (
    <div className="w-full">
      <Scoreboard players={gameState.players} />
      <div className="grid grid-cols-5 gap-4 w-full">
        {gameState.randomItems.map((item) => (
          <Card
            player={gameState.players.player1.isMyTurn ? gameState.players.player1 : gameState.players.player2}
            key={item.id}
            item={item}
            handleSelectedCard={handleSelectCard}
            isMatched={gameState.matchedPairs.has(item.id)}
            isSelected={gameState.selectedCards.some(card => card.id === item.id)}
          />
        ))}
      </div>
      <div className="h-[12rem] overflow-auto w-max border">
        <div className="flex flex-col gap-2 items-center">
          {
            aiMemoryRef.current.map(({ name, id }) => <div key={id}>{name} ({id})</div>)
          }</div>
      </div>
    </div>
  );
}

