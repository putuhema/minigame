"use client"

import * as  React from 'react'
import type { Item } from '../page'
import { Player } from './player'
import { cn } from '@/lib/utils'
import { motion } from "framer-motion"
import Image from 'next/image'


type CardProps = {
  player: Player
  item: Item
  handleSelectedCard: (item: Item) => void,
  isMatched: boolean,
  isSelected: boolean
}

export default function Card({ item, handleSelectedCard, isSelected, isMatched, player }: CardProps) {
  const [isRevealed, setIsRevealed] = React.useState(false)

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
      className="perspective-1000 h-[8rem] w-full"
    >
      <motion.div
        animate={{ rotateY: !isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6 }}
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