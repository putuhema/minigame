import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type AIPointerProps = {
  isVisible: boolean;
  position: { x: number; y: number };
}

export const AIPointer = ({ isVisible, position }: AIPointerProps) => {
  return (
    <motion.div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        width: 60,
        height: 60,
      }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{
        x: position.x - 10,
        y: position.y - 10,
        scale: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 40 }}
    >
      <Image src="/icons/cursor.png" width={100} height={100} alt='cursor' />
    </motion.div>
  );
};

export default AIPointer