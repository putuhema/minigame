import React from 'react'
import type { Player as PlayerType } from './player'
import Player from './player'

type ScoreboardProps = {
  players: {
    player1: PlayerType,
    player2: PlayerType,
  }
}

export default function Scoreboard({ players }: ScoreboardProps) {
  return (
    <div className="flex items-center justify-between p-2">
      <Player player={players.player1} />
      <div className="flex gap-2 justify-center items-start text-3xl font-bold">
        <div className="border p-2 rounded-md">
          <p>{players.player1.points}<i className='text-sm'>pts</i></p>
        </div>
        <p>-</p>
        <div className="border p-2 rounded-md">
          <p>{players.player2.points}<i className='text-sm'>pts</i></p>
        </div>
      </div>
      <Player player={players.player2} picPosition="right" />
    </div>
  )
}
