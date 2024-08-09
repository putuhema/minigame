"use client"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

type SliderProps = {
  items: string[],
  onChange: (item: string) => void
}


export default function Slider({ items, onChange }: SliderProps) {



  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0);

  const handleSwitch = (newDirection: "left" | "right") => {
    setDirection(newDirection === "left" ? -1 : 1);
    let index: number;
    if (newDirection === "left") {
      index = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    } else {
      index = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    }
    setCurrentIndex(index);
    onChange(items[index])
  }

  const xDistance = 300
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? xDistance : -xDistance,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? xDistance : -xDistance,
      opacity: 0,
    }),
  };

  return (
    <div className="relative overflow-hidden w-full ">
      <div className="absolute inset-0 flex items-center justify-between z-10">
        <button onClick={() => handleSwitch("left")} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => handleSwitch("right")} className="p-2">
          <ChevronRight size={24} />
        </button>
      </div>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
