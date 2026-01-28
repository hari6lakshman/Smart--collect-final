"use client";
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface Beam {
  id: number;
  startX: number;
  startY: number;
  active: boolean;
}

interface InteractiveBeamsProps {
  mouseX: number;
  mouseY: number;
}

export function InteractiveBeams({ mouseX, mouseY }: InteractiveBeamsProps) {
  const [beams] = useState<Beam[]>([
    { id: 1, startX: 10, startY: 10, active: false },
    { id: 2, startX: 90, startY: 10, active: false },
    { id: 3, startX: 10, startY: 90, active: false },
    { id: 4, startX: 90, startY: 90, active: false },
    { id: 5, startX: 50, startY: 5, active: false },
    { id: 6, startX: 50, startY: 95, active: false },
    { id: 7, startX: 5, startY: 50, active: false },
    { id: 8, startX: 95, startY: 50, active: false },
  ]);

  const [activeBeams, setActiveBeams] = useState<number[]>([]);

  useEffect(() => {
    const newActiveBeams = beams
      .filter((beam) => {
        const distance = Math.sqrt(
          Math.pow(mouseX - beam.startX, 2) + Math.pow(mouseY - beam.startY, 2)
        );
        return distance < 40;
      })
      .map((beam) => beam.id);

    setActiveBeams(newActiveBeams);
  }, [mouseX, mouseY, beams]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      <defs>
        <linearGradient id="beamGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,183,77,0)" />
          <stop offset="50%" stopColor="rgba(255,183,77,0.8)" />
          <stop offset="100%" stopColor="rgba(0,229,255,0.8)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {beams.map((beam) => {
        const isActive = activeBeams.includes(beam.id);
        return (
          <motion.line
            key={beam.id}
            x1={`${beam.startX}%`}
            y1={`${beam.startY}%`}
            x2={`${mouseX}%`}
            y2={`${mouseY}%`}
            stroke="url(#beamGradient1)"
            strokeWidth={isActive ? "3" : "1"}
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 0.8 : 0 }}
            transition={{ duration: 0.2 }}
          />
        );
      })}

      {/* Beam source points */}
      {beams.map((beam) => {
        const isActive = activeBeams.includes(beam.id);
        return (
          <motion.circle
            key={`point-${beam.id}`}
            cx={`${beam.startX}%`}
            cy={`${beam.startY}%`}
            r={isActive ? "8" : "4"}
            fill={beam.id % 2 === 0 ? "rgba(255,183,77,0.9)" : "rgba(0,229,255,0.9)"}
            filter="url(#glow)"
            animate={{
              scale: isActive ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isActive ? Infinity : 0,
            }}
          />
        );
      })}
    </svg>
  );
}
