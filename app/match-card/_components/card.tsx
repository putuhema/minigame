"use client"

import * as  React from 'react'
import type { Item } from '../page'
import { Player } from './player'
import { cn } from '@/lib/utils'


type CardProps = {
  player: Player
  item: Item
  handleSelectedCard: (item: Item) => void,
  isMatched: boolean,
  isSelected: boolean
}

export default function Card({ item, handleSelectedCard, isSelected, isMatched, player }: CardProps) {
  const [isRevealed, setIsRevealed] = React.useState(false)
  const currentColor = `hover:border-${player.color}-500`
  console.log(currentColor)
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isSelected && !isMatched) {
      setIsRevealed(true);
      timeoutId = setTimeout(() => {
        setIsRevealed(false);
      }, 1000);
    } else if (isMatched) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isSelected, isMatched]);

  const handleClick = React.useCallback(() => {
    if (!isRevealed && !isMatched) {
      handleSelectedCard(item);
    }
  }, [item, isRevealed, isMatched, handleSelectedCard]);


  return (
    <div
      onClick={handleClick}
      className={cn("border rounded-md h-[12rem] w-full  grid place-content-center",
        currentColor
      )}
    >
      {
        isRevealed &&
        <p>{item.name}</p>
      }
    </div>

  )
}