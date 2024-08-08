"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./_components/card";
import Scoreboard from "./_components/scoreboard";
import { shuffleArray } from "@/lib/utils";
import { useAIMove } from "@/hooks/useAIMove";

import AIPointer from "./_components/ai-pointer";
import DialogStart from "./_components/dialog-start";



const items = ["ant", "ball", "boar", "frog", "lizard", "mimic", "red-ant", "rhino", "skull-gator", "snake"]


const DemoPlayers: Players = {
  player1: {
    name: 'funnyValentine',
    isMyTurn: true,
    points: 0,
    gold: 20,
    color: 'blue',
    guess: null,
    role: "player"
  },
  player2: {
    name: 'AI',
    isMyTurn: false,
    points: 0,
    gold: 100,
    color: 'red',
    guess: null,
    role: "ai"
  }
}

export interface Item {
  id: number;
  name: string
}

export interface MemoryItem extends Item {
  lastSeen: number;
  seenCount: number;
}

export interface Player {
  name: string;
  isMyTurn: boolean;
  points: number;
  gold: number;
  color: string;
  guess: "correct" | "incorrect" | null;
  role: "player" | "ai"
}

type Players = {
  player1: Player;
  player2: Player;
}

export type DifficultyLevel = "easy" | "medium" | "hard";
export interface GameState {
  players: {
    player1: Player;
    player2: Player;
  }
  selectedCards: Item[];
  matchedPairs: Set<number>;
  randomItems: Item[];
  isGameOver: boolean;
  difficulty: DifficultyLevel,
  wager: number;
}

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState(true)
  const [gameState, setGameState] = useState<GameState>({
    players: DemoPlayers,
    selectedCards: [],
    matchedPairs: new Set(),
    randomItems: [],
    isGameOver: false,
    difficulty: "easy",
    wager: 0
  });
  const aiMemoryRef = useRef<MemoryItem[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnCounterRef = useRef<number>(0);
  const [aiPointerVisible, setAiPointerVisible] = useState(false);
  const [aiPointerPosition, setAiPointerPosition] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState<Item | null>(null)


  // Initialize game
  useEffect(() => {
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    setGameState(prev => ({ ...prev, randomItems: shuffledItems }));
    setAiPointerPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    })
  }, []);

  // End Game
  useEffect(() => {
    if (gameState.isGameOver) {
      const { player1, player2 } = gameState.players;
      const winner = player1.points > player2.points ? 'player1' : 'player2';
      const loser = winner === 'player1' ? 'player2' : 'player1';
      updateGameState({
        wager: 0,
        players: {
          ...gameState.players,
          [winner]: {
            ...gameState.players[winner],
            gold: gameState.players[winner].gold + gameState.wager * 2
          },
          [loser]: {
            ...gameState.players[loser],
            gold: gameState.players[loser].gold - gameState.wager
          }
        }
      })
    }
  }, [gameState.isGameOver])

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);


  useEffect(() => {
    if (gameState.matchedPairs.size === gameState.randomItems.length - 2) {
      updateGameState({ isGameOver: true })
    }
  }, [gameState.matchedPairs])

  const handleSelectCard = useCallback((item: Item) => {
    if (gameState.isGameOver) return

    turnCounterRef.current += 1;
    setSelectedCard(item)


    setGameState(prev => {
      if (prev.selectedCards.length >= 2 || prev.selectedCards.some(card => card.id === item.id)) {
        return prev;
      }

      const newSelectedCards = [...prev.selectedCards, item];

      // AI Memory
      if (gameState.difficulty !== "easy") {
        const existingMemoryItem = aiMemoryRef.current.find(i => item.id === i.id)
        if (existingMemoryItem) {
          existingMemoryItem.lastSeen = turnCounterRef.current
          existingMemoryItem.seenCount = (existingMemoryItem.seenCount || 0) + 1
        } else {
          aiMemoryRef.current.push({ ...item, lastSeen: turnCounterRef.current, seenCount: 1 })
        }
      }

      if (newSelectedCards.length < 2) {
        return { ...prev, selectedCards: newSelectedCards }
      }

      // Handle match case
      const [first, second] = newSelectedCards;
      const isMatch = first.name === second.name;
      const currentPlayer = prev.players.player1.isMyTurn ? 'player1' : 'player2';
      const otherPlayer = currentPlayer === "player1" ? "player2" : "player1";


      const newPlayers = {
        ...prev.players,
        [currentPlayer]: {
          ...prev.players[currentPlayer],
          points: isMatch ? prev.players[currentPlayer].points + 10 : prev.players[currentPlayer].points,
          guess: isMatch ? "correct" : "incorrect",
          isMyTurn: !prev.players[currentPlayer].isMyTurn
        },
        [otherPlayer]: {
          ...prev.players[otherPlayer],
          isMyTurn: !prev.players[otherPlayer].isMyTurn
        }
      };

      const newMatchedPairs = isMatch
        ? new Set(prev.matchedPairs).add(first.id).add(second.id)
        : prev.matchedPairs;


      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateGameState({
          selectedCards: [],
          players: {
            ...newPlayers, [currentPlayer]: {
              ...newPlayers[currentPlayer],
              guess: null,
            },
          }
        })
      }
        , 1000);

      return {
        ...prev,
        selectedCards: newSelectedCards,
        matchedPairs: newMatchedPairs,
        players: newPlayers
      };
    });

  }, [updateGameState, gameState.difficulty]);

  useEffect(() => {
    if (selectedCard) {
      const cardElement = document.getElementById(`card-${selectedCard.id}`);
      let timeoutIdx: NodeJS.Timeout;
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect()
        setAiPointerPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
        setAiPointerVisible(true)
      }

      const idx = setTimeout(() => {
        setAiPointerVisible(false)
      }, 1000)

      return () => {
        clearTimeout(idx)
        clearTimeout(timeoutIdx)
      }
    }


  }, [selectedCard])

  const aiMove = useAIMove(gameState, aiMemoryRef, turnCounterRef, handleSelectCard)

  useEffect(() => {
    if (!gameState.isGameOver && gameState.players.player2.isMyTurn && gameState.selectedCards.length === 0) {
      const timeoutId = setTimeout(aiMove, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.players.player2.isMyTurn, gameState.selectedCards.length, aiMove]);



  const handleResetGame = () => {
    setDialogOpen(true)
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    updateGameState({
      players: {
        player1: { ...gameState.players.player1, isMyTurn: true, points: 0 },
        player2: { ...gameState.players.player2, isMyTurn: false, points: 0 },
      },
      selectedCards: [],
      matchedPairs: new Set(),
      randomItems: shuffledItems,
      isGameOver: false
    })
    aiMemoryRef.current = []
    turnCounterRef.current = 0

  }


  const handleUpdateDifficultyLevel = (difficulty: string) => {
    updateGameState({ difficulty: (difficulty as DifficultyLevel) })
  }

  const handleSetPlayerWager = (wager: number) => {
    const currentGold = gameState.players.player1.gold - wager
    updateGameState({ wager: wager, players: { ...gameState.players, player1: { ...gameState.players.player1, gold: currentGold } } })
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }
  return (
    <div className="w-full relative">
      <AIPointer isVisible={aiPointerVisible} position={aiPointerPosition} />
      <DialogStart
        gameState={gameState}
        handleDifficultyChange={handleUpdateDifficultyLevel}
        handleSetPlayerWager={handleSetPlayerWager}
        isDialogOpen={isDialogOpen}
        handleCloseDialog={handleCloseDialog}
      />
      <div className="pt-24">
        <Scoreboard players={gameState.players} difficulty={gameState.difficulty} />
      </div>
      {
        gameState.isGameOver &&
        <button className="border block mx-auto rounded-md p-2" onClick={handleResetGame}>Play Again</button>
      }
      <div className="pt-10">
        <div className="grid grid-cols-5 gap-2 max-w-2xl mx-auto ">
          {gameState.randomItems.map((item) => (
            <Card
              player={gameState.players.player1.isMyTurn ? gameState.players.player1 : gameState.players.player2}
              key={`card-${item.id}`}
              item={item}
              handleSelectedCard={handleSelectCard}
              isMatched={gameState.matchedPairs.has(item.id)}
              isSelected={gameState.selectedCards.some(card => card.id === item.id)}
              selectedCardCounts={gameState.selectedCards.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

