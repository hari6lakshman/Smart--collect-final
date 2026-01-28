"use client";
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface FloatingParticleProps {
  index: number;
  mouseX: number;
  mouseY: number;
}

export function FloatingParticle({ index, mouseX, mouseY }: FloatingParticleProps) {
  const [position] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  });

  // Enhanced parallax with distance-based intensity
  const dx = mouseX - position.x;
  const dy = mouseY - position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = 50;
  const intensity = Math.max(0, 1 - distance / maxDistance);

  const parallaxX = dx * intensity * 0.8;
  const parallaxY = dy * intensity * 0.8;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.size}px`,
        height: `${position.size}px`,
        background: index % 2 === 0 ?
          'radial-gradient(circle, rgba(255,183,77,0.8) 0%, rgba(255,152,0,0.4) 100%)' :
          'radial-gradient(circle, rgba(0,229,255,0.8) 0%, rgba(0,188,212,0.4) 100%)',
        boxShadow: index % 2 === 0 ?
          '0 0 10px rgba(255,183,77,0.6)' :
          '0 0 10px rgba(0,229,255,0.6)',
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, Math.sin(index) * 10, 0],
        opacity: [0.4, 1, 0.4],
        scale: intensity > 0.3 ? [1, 1.5, 1] : [1, 1.2, 1],
      }}
      transition={{
        duration: position.duration,
        repeat: Infinity,
        delay: position.delay,
        ease: "easeInOut",
      }}
    />
  );
}