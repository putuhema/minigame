import React from 'react'
import type { Player as PlayerType } from "./game"
import Player from './player'
import type { DifficultyLevel } from './game'

type ScoreboardProps = {
  players: {
    player1: PlayerType,
    player2: PlayerType,
  }
}

export default function Scoreboard({ players }: ScoreboardProps) {
  return (
    <div className=' mx-auto max-w-md border rounded-full border-green-600 bg-white'>
      <div className="flex items-center justify-between p-1">
        <Player player={players.player1} />
        <div className="flex gap-2 justify-center items-start text-4xl font-bold">
          <p>{players.player1.points}</p>
          <p>:</p>
          <p>{players.player2.points}</p>
        </div>
        <Player player={players.player2} picPosition="right" />
      </div>
    </div>
  )
}
