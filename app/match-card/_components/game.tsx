"use client"
import React from 'react'
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./card";
import Scoreboard from "./scoreboard";
import { shuffleArray } from "@/lib/utils";
import { useAIMove } from "@/hooks/useAIMove";

import AIPointer from "./ai-pointer";
import DialogStart from "./dialog-start";
import { useSearchParams } from 'next/navigation';
import { GameState } from '../page';



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



export type DifficultyLevel = "easy" | "medium" | "hard";


const items = ["ant", "ball", "boar", "frog", "lizard", "mimic", "red-ant", "rhino", "skull-gator", "snake"]




type GameProps = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
}

export default function Game({
  gameState,
  setGameState
}: GameProps) {
  const [isDialogOpen, setDialogOpen] = useState(false)

  const aiMemoryRef = useRef<MemoryItem[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const turnCounterRef = useRef<number>(0);
  const [aiPointerVisible, setAiPointerVisible] = useState(false);
  const [aiPointerPosition, setAiPointerPosition] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState<Item | null>(null)


  // Initialize game
  useEffect(() => {
    const sliceItems = items.slice(0, gameState.cards)
    const shuffledItems = shuffleArray([...sliceItems, ...sliceItems].map(item => ({ id: Math.random(), name: item })));
    setGameState(prev => ({ ...prev, randomItems: shuffledItems }));
    setAiPointerPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    })
  }, []);



  // End Game
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
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
      timeoutId = setTimeout(() => setDialogOpen(true), 1000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
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
    const sliceItems = items.slice(0, gameState.cards)
    const shuffledItems = shuffleArray([...sliceItems, ...sliceItems].map(item => ({ id: Math.random(), name: item })))
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
        isDialogOpen={isDialogOpen}
        handleCloseDialog={handleCloseDialog}
        handleResetGame={handleResetGame}
      />
      <div className="pt-24">
        <Scoreboard players={gameState.players} />
      </div>
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
