"use client"

import * as  React from 'react'
import type { Item, Player } from '../page'
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
  }, [isSelected, isMatched]);

  const handleClick = React.useCallback(() => {
    if (!isRevealed && !isMatched) {
      handleSelectedCard(item);
    }
  }, [item, isRevealed, isMatched, handleSelectedCard]);


  return (
    <div
      id={`card-${item.id}`}
      onClick={handleClick}
      className="perspective-1000 h-[8rem] w-full"
    >

      <motion.div
        animate={{ rotateY: !isRevealed ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(" rounded-md h-full w-full cursor-pointer grid place-content-center hover:border-green-200 relative  transform-style-3d ",
          player.name === "AI" && "cursor-not-allowed"
        )}
      >
        <div className="absolute inset-0 flex items-center bg-green-600 rounded-xl justify-center backface-hidden">
          {isRevealed && <Image className='rounded-xl' src={`/icons/${item.name}.jpg`} alt={item.name} width={150} height={150} />}
        </div>
      </motion.div>
    </div>

  )
}