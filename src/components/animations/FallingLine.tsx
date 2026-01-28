"use client";
import { motion } from 'motion/react';
import { useState } from 'react';

interface FallingLineProps {
  index: number;
}

export function FallingLine({ index }: FallingLineProps) {
  const [position] = useState({
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 2 + 3,
    height: Math.random() * 100 + 50,
  });

  const color = index % 3 === 0 ? 
    'rgba(255,183,77,0.3)' : 
    index % 3 === 1 ? 
    'rgba(0,229,255,0.3)' : 
    'rgba(255,255,255,0.2)';

  return (
    <motion.div
      className="absolute top-0"
      style={{
        left: `${position.x}%`,
        width: '1px',
        height: `${position.height}px`,
        background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
      }}
      animate={{
        y: ['0vh', '100vh'],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: position.duration,
        repeat: Infinity,
        delay: position.delay,
        ease: "linear",
      }}
    />
  );
}
