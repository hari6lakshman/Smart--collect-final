"use client";
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface CursorTrailProps {
  mouseX: number;
  mouseY: number;
}

export function CursorTrail({ mouseX, mouseY }: CursorTrailProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    const newPoint: TrailPoint = {
      x: mouseX,
      y: mouseY,
      id: Date.now(),
    };

    setTrail((prev) => [...prev, newPoint].slice(-15));
  }, [mouseX, mouseY]);

  return (
    <>
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${(index + 1) * 2}px`,
            height: `${(index + 1) * 2}px`,
            background: index % 2 === 0
              ? 'radial-gradient(circle, rgba(255,183,77,0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0,229,255,0.6) 0%, transparent 70%)',
            boxShadow:
              index % 2 === 0
                ? '0 0 20px rgba(255,183,77,0.8)'
                : '0 0 20px rgba(0,229,255,0.8)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1 - index / 15, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </>
  );
}
