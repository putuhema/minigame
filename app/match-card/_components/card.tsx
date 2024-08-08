"use client"

import * as  React from 'react'
import type { GameState, Item, Player } from '../page'
import { cn } from '@/lib/utils'
import { motion } from "framer-motion"
import Image from 'next/image'
import AIPointer from './ai-pointer'


type CardProps = {
  player: Player
  item: Item
  handleSelectedCard: (item: Item) => void,
  isMatched: boolean,
  isSelected: boolean,
  selectedCardCounts: number,
}

export default function Card({ item, handleSelectedCard, isSelected, isMatched, player, selectedCardCounts }: CardProps) {
  const [isRevealed, setIsRevealed] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isSelected && !isMatched) {
      setIsRevealed(true);
      if (selectedCardCounts === 2) {
        timeoutId = setTimeout(() => {
          setIsRevealed(false);
        }, 1000);
      }
    } else if (isMatched) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isSelected, isMatched, player.isMyTurn]);

  const handleClick = React.useCallback(() => {
    if (!isRevealed && !isMatched) {
      handleSelectedCard(item);
    }
  }, [item, isRevealed, isMatched, handleSelectedCard]);


  return (
    <div
      id={`card-${item.id}`}
      onClick={() => {
        if (player.name !== "AI") {
          handleClick();
        }
      }}
      className="perspective-1000 w-full h-[11rem]"
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "rounded-xl h-full w-[8rem] cursor-pointer grid place-content-center hover:border-green-200 relative transform-style-3d",
          isSelected && "shadow-glow"
        )}
      >
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {
            isRevealed ?
              <Image
                className="rounded-xl"
                src={`/card/${item.name}.png`}
                alt={item.name}
                layout="fill"
                objectFit="cover"
              /> :

              <Image
                className="rounded-xl"
                src="/card/cardback.png"
                alt="Card Back"
                layout="fill"
                objectFit="cover"
              />
          }
        </div>
        {isMatched && (
          <div className="absolute inset-0 w-full h-full bg-black rounded-xl opacity-50" />
        )}
      </motion.div>
    </div>

  )
}