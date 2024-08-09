"use client"
import { useCallback, useState } from "react";
import Game, { DifficultyLevel, Item, Player } from "./_components/game";
import SplashScreen from "./_components/spash-screen";
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
  cards: number;
}
type Players = {
  player1: Player;
  player2: Player;
}
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

export default function Page() {
  const [gameState, setGameState] = useState<GameState>({
    players: DemoPlayers,
    selectedCards: [],
    matchedPairs: new Set(),
    randomItems: [],
    isGameOver: false,
    difficulty: "easy",
    wager: 0,
    cards: 20
  });
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const [showSplashScreen, setShowSplashScreen] = useState(true) // temporary

  const handleStartGame = () => {
    setShowSplashScreen(false)
  }

  return (
    showSplashScreen ? <SplashScreen onStart={handleStartGame} onUpdate={updateGameState} /> : <Game gameState={gameState} setGameState={setGameState} />
  )
}

