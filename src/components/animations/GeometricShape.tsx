"use client";
import { motion } from 'motion/react';
import { useState } from 'react';

interface GeometricShapeProps {
  index: number;
  side: 'left' | 'right';
  mouseX: number;
  mouseY: number;
}

export function GeometricShape({ index, side, mouseX, mouseY }: GeometricShapeProps) {
  const [position] = useState({
    x: side === 'left' ? Math.random() * 30 : 70 + Math.random() * 30,
    y: 20 + Math.random() * 60,
    size: Math.random() * 60 + 40,
    rotation: Math.random() * 360,
  });

  const color = side === 'left' ? 
    'rgba(255,152,0,0.15)' : 
    'rgba(0,229,255,0.15)';
  
  const borderColor = side === 'left' ? 
    'rgba(255,183,77,0.6)' : 
    'rgba(0,229,255,0.6)';

  // Enhanced magnetic effect with distance calculation
  const dx = mouseX - position.x;
  const dy = mouseY - position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = 40;
  const intensity = Math.max(0, 1 - distance / maxDistance);
  
  const parallaxX = dx * intensity * 1.2;
  const parallaxY = dy * intensity * 1.2;

  // Generate random polygon points for triangle/diamond shapes
  const generatePolygon = () => {
    const points = Math.floor(Math.random() * 2) + 3; // 3 or 4 points
    if (points === 3) {
      return 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else {
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    }
  };

  const [clipPath] = useState(generatePolygon());

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.size}px`,
        height: `${position.size}px`,
      }}
      animate={{
        x: parallaxX,
        y: parallaxY,
        rotate: [position.rotation, position.rotation + 360],
        scale: intensity > 0.5 ? 1.3 : 1,
      }}
      transition={{
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        },
        x: { type: "spring", stiffness: 100, damping: 20 },
        y: { type: "spring", stiffness: 100, damping: 20 },
        scale: { duration: 0.3 },
      }}
      whileHover={{ scale: 1.5, rotate: position.rotation + 180 }}
    >
      <div
        className="w-full h-full relative"
        style={{
          background: color,
          clipPath: clipPath,
          border: `1px solid ${borderColor}`,
          boxShadow: intensity > 0.5 ? `0 0 60px ${borderColor}` : `0 0 30px ${borderColor}`,
        }}
      >
        {/* Inner lines/connections */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: '1px',
              height: '100%',
              background: borderColor,
              left: `${(i + 1) * 25}%`,
              transformOrigin: 'center',
            }}
            animate={{
              opacity: intensity > 0.3 ? [0.8, 1, 0.8] : [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}