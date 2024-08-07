"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import Card from "./_components/card";
import Scoreboard from "./_components/scoreboard";
import { shuffleArray } from "@/lib/utils";
import { useAIMove } from "@/hooks/useAIMove";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



const items = ["cat", "bird", "dog", "hippo", "monkey", "worm", "jellyfish", "shark", "pig", "cow"]


const DemoPlayers = {
  player1: {
    name: 'funnyValentine',
    isMyTurn: true,
    points: 0,
    gold: 20,
    color: 'blue'
  },
  player2: {
    name: 'AI',
    isMyTurn: false,
    points: 0,
    gold: 100,
    color: 'red'
  }
}

export interface Item {
  id: number;
  name: string
}

export interface MemoryItem extends Item {
  lastSeen: number;

}

export interface Player {
  name: string;
  isMyTurn: boolean;
  points: number;
  gold: number;
  color: string;
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
  const [input, setInput] = useState("")
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


  // Initialize game
  useEffect(() => {
    const shuffledItems = shuffleArray([...items, ...items].map(item => ({ id: Math.random(), name: item })));
    setGameState(prev => ({ ...prev, randomItems: shuffledItems }));
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
        } else {
          aiMemoryRef.current.push({ ...item, lastSeen: turnCounterRef.current })
        }
      }

      if (newSelectedCards.length < 2) {
        return { ...prev, selectedCards: newSelectedCards }
      }

      // Handle match case
      const [first, second] = newSelectedCards;
      const isMatch = first.name === second.name;
      const currentPlayer = prev.players.player1.isMyTurn ? 'player1' : 'player2';
      const otherPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';

      const newPlayers = {
        ...prev.players,
        [currentPlayer]: {
          ...prev.players[currentPlayer],
          points: isMatch ? prev.players[currentPlayer].points + 10 : prev.players[currentPlayer].points,
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
      timerRef.current = setTimeout(() => updateGameState({ selectedCards: [] }), 1000);

      return {
        ...prev,
        selectedCards: newSelectedCards,
        matchedPairs: newMatchedPairs,
        players: newPlayers
      };
    });

  }, [updateGameState, gameState.difficulty]);

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
        player1: { ...gameState.players.player1, points: 0 },
        player2: { ...gameState.players.player2, points: 0 },
      },
      selectedCards: [],
      matchedPairs: new Set(),
      randomItems: shuffledItems,
      isGameOver: false
    })
    aiMemoryRef.current = []
    turnCounterRef.current = 0
  }


  return (
    <div className="w-full">
      <Dialog open={isDialogOpen}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matching Card Games</DialogTitle>
            <div>
              <p>Choose Difficulty Level : </p>
              <Select defaultValue={gameState.difficulty} onValueChange={diff => updateGameState({ difficulty: (diff as DifficultyLevel) })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent >
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <p>Wage your Gold: {gameState.players.player1.gold}<i className="text-xs">g</i></p>
              <input
                className="border p-2 rounded-md"
                onChange={e => {
                  let value = Number(e.target.value)
                  if (value > gameState.players.player1.gold) {
                    value = gameState.players.player1.gold
                  };
                  setInput(value.toString())
                }}></input>
              <button onClick={() => {
                const currentGold = gameState.players.player1.gold - Number(input)
                updateGameState({ wager: Number(input), players: { ...gameState.players, player1: { ...gameState.players.player1, gold: currentGold } } })

              }}>Wage</button>
            </div>
            <button onClick={() => setDialogOpen(false)} >Play</button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Scoreboard players={gameState.players} difficulty={gameState.difficulty} />
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

