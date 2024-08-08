import React from 'react'
import type { Player as PlayerType } from "../page"
import Player from './player'
import type { DifficultyLevel } from '../page'

type ScoreboardProps = {
  difficulty: DifficultyLevel
  players: {
    player1: PlayerType,
    player2: PlayerType,
  }
}

export default function Scoreboard({ players, difficulty }: ScoreboardProps) {
  return (
    <div className=' mx-auto max-w-md border rounded-full border-green-600 bg-green-100'>
      <div className="flex items-center justify-between p-1">
        <Player player={players.player1} />
        <div className="flex gap-2 justify-center items-start text-4xl font-bold">
          <p>{players.player1.points}</p>
          <p>:</p>
          <p>{players.player2.points}</p>
        </div>
        <Player player={players.player2} picPosition="right" difficulty={difficulty} />
      </div>
    </div>
  )
}
