import React from 'react'

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;


export default function Page() {

  function getInitialBoard() {
    const board = Array(CELL_COUNT).fill(null)
    return
  }
  return (
    <div>
      <h1>2048</h1>
    </div>
  )
}
