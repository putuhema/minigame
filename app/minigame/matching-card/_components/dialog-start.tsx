import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


import { useEffect, useState } from "react"
import type { Player } from "./game"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import confetti from "canvas-confetti"
import type { GameState } from "../page"


type DialogStartProps = {
  gameState: GameState,
  isDialogOpen: boolean,
  handleCloseDialog: () => void
  handleResetGame: () => void
}

export default function DialogStart({ gameState, isDialogOpen, handleCloseDialog, handleResetGame }: DialogStartProps) {
  return (
    <Dialog open={isDialogOpen}>
      {
        !gameState.isGameOver ? (
          <GamePauseDialog
            handleCloseDialog={handleCloseDialog}
          />
        ) : <GameOverDialog
          isDialogOpen={isDialogOpen}
          player={gameState.players.player1.points > gameState.players.player2.points ? gameState.players.player1 : gameState.players.player2}
          handleCloseDialog={handleCloseDialog}
          handleResetGame={handleResetGame} />
      }

    </Dialog>
  )
}


type StartGameDialogProps = {
  handleCloseDialog: () => void;
}

function GamePauseDialog({ handleCloseDialog }: StartGameDialogProps) {
  const [loading, setLoading] = useState(false)
  return (
    <DialogContent className="space-y-8">
      <DialogHeader>
        <DialogTitle>Matching Card Games</DialogTitle>
        <DialogDescription>matching 2 cards with the same picture</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-2">
        <p>Choose Difficulty : </p>
      </div>
      <button onClick={() => {
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          handleCloseDialog()
        }, 1000)
      }} className="font-bold p-2 rounded-md bg-orange-500 text-white flex items-center justify-center gap-2
      ">
        {loading && <Loader2 className="animate-spin h-4 w-4" />}
        Play</button>
    </DialogContent>
  )
}


type GameOverDialogProps = {
  handleCloseDialog: () => void
  handleResetGame: () => void,
  player: Player,
  isDialogOpen: boolean
}
function GameOverDialog({ isDialogOpen, handleCloseDialog, handleResetGame, player }: GameOverDialogProps) {

  useEffect(() => {
    if (isDialogOpen) {
      var count = 200;
      var defaults = {
        origin: { y: 0.6 }
      } satisfies confetti.Options;

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }

  }, [isDialogOpen])
  return (
    <DialogContent id="gameOverDialog" className="space-y-8">
      <DialogHeader>
        <DialogTitle>Game Over</DialogTitle>
        <DialogDescription>{player.role === "player" ? "You Win !!!" : "Whom, whom, You Lose !!!, Beat by AI, LMAO"}</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <div className="flex flex-col gap-4 w-full">
          <button onClick={() => {
            handleResetGame()
            handleCloseDialog()
          }} className="font-bold p-2 rounded-md bg-orange-500 text-white">Play Again</button>
          <Link className="self-center text-muted-foreground hover:text-foreground" href="/">Back Home</Link>
        </div>
      </DialogFooter>
    </DialogContent>
  )

}