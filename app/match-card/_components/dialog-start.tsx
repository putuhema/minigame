import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useState } from "react"
import type { GameState } from "../page"


type DialogStartProps = {
  gameState: GameState,
  handleDifficultyChange: (difficulty: string) => void,
  handleSetPlayerWager: (wager: number) => void,
  isDialogOpen: boolean,
  handleCloseDialog: () => void
}

export default function DialogStart({ gameState, isDialogOpen, handleDifficultyChange, handleSetPlayerWager, handleCloseDialog }: DialogStartProps) {
  const [input, setInput] = useState("")
  return (
    <Dialog open={isDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Matching Card Games</DialogTitle>
          <DialogDescription>matching 2 cards with the same picture</DialogDescription>
          <div>
            <p>Choose Difficulty Level : </p>
            <Select
              defaultValue={gameState.difficulty}
              onValueChange={handleDifficultyChange}>
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
            <button onClick={() => handleSetPlayerWager(Number(input))}>Wage</button>
          </div>
          <button onClick={handleCloseDialog} >Play</button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
