"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./_components/card";
import Scoreboard from "./_components/scoreboard";
import { shuffleArray } from "@/lib/utils";
import { useAIMove } from "@/hooks/useAIMove";

const items = ["cat", "bird", "dog", "hippo", "monkey", "worm", "jellyfish", "shark", "pig", "cow"]


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

export interface GameState {
  players: typeof DemoPlayers;
  selectedCards: Item[];
  matchedPairs: Set<number>;
  randomItems: Item[];
  isGameOver: boolean;
}

export default function Page() {
  const [gameState, setGameState] = useState<GameState>({
    players: DemoPlayers,
    selectedCards: [],
    matchedPairs: new Set(),
    randomItems: [],
    isGameOver: false
  });
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


  useEffect(() => {
    if (gameState.matchedPairs.size === gameState.randomItems.length - 2) {
      updateGameState({ isGameOver: true })
    }
  }, [gameState.matchedPairs])

  const handleSelectCard = useCallback((item: Item) => {
    if (!gameState.isGameOver) {

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
    }
  }, [updateGameState]);

  const aiMove = useAIMove(gameState, aiMemoryRef, handleSelectCard)

  useEffect(() => {
    if (!gameState.isGameOver && gameState.players.player2.isMyTurn && gameState.selectedCards.length === 0) {
      const timeoutId = setTimeout(aiMove, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.players.player2.isMyTurn, gameState.selectedCards.length, aiMove]);



  const handleResetGame = () => {
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    updateGameState({
      players: {
        player1: { ...gameState.players.player1, points: 0 },
        player2: { ...gameState.players.player2, points: 0 },
      },
      selectedCards: [],
      matchedPairs: new Set(),
      randomItems: shuffledItems,
      isGameOver: false
    })
  }


  return (
    <div className="w-full">
      <Scoreboard players={gameState.players} />
      {
        gameState.isGameOver &&
        <button className="border block mx-auto rounded-md p-2" onClick={handleResetGame}>Play Again</button>
      }
      <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto mt-10">
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
    </div>
  );
}

