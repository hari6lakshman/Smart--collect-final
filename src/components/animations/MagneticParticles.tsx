"use client";
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface MagneticParticlesProps {
  mouseX: number;
  mouseY: number;
  isMouseDown: boolean;
}

export function MagneticParticles({ mouseX, mouseY, isMouseDown }: MagneticParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const mouseRef = useRef({ x: mouseX, y: mouseY });

  useEffect(() => {
    mouseRef.current = { x: mouseX, y: mouseY };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      size: Math.random() * 4 + 2,
      color: i % 2 === 0 ? 'rgba(255,183,77,0.9)' : 'rgba(0,229,255,0.9)',
    }));
    setParticles(initialParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentMouse = mouseRef.current;
      setParticles((prev) =>
        prev.map((particle) => {
          let { x, y, vx, vy } = particle;

          // Calculate distance to mouse
          const dx = currentMouse.x - x;
          const dy = currentMouse.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Magnetic attraction/repulsion
          const force = isMouseDown ? 0.3 : 0.15;
          const maxDistance = 30;

          if (distance < maxDistance && distance > 0) {
            const angle = Math.atan2(dy, dx);
            const strength = (1 - distance / maxDistance) * force;

            if (isMouseDown) {
              // Repulsion when mouse is down
              vx -= Math.cos(angle) * strength;
              vy -= Math.sin(angle) * strength;
            } else {
              // Attraction when mouse is up
              vx += Math.cos(angle) * strength;
              vy += Math.sin(angle) * strength;
            }
          }

          // Apply velocity
          x += vx;
          y += vy;

          // Damping
          vx *= 0.95;
          vy *= 0.95;

          // Bounce off edges
          if (x < 0 || x > 100) {
            vx *= -0.8;
            x = Math.max(0, Math.min(100, x));
          }
          if (y < 0 || y > 100) {
            vy *= -0.8;
            y = Math.max(0, Math.min(100, y));
          }

          return { ...particle, x, y, vx, vy };
        })
      );
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isMouseDown]);

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            boxShadow: `0 0 15px ${particle.color}`,
          }}
          animate={{
            scale: isMouseDown ? [1, 1.5, 1] : 1,
          }}
          transition={{
            scale: { duration: 0.3 },
          }}
        />
      ))}
    </>
  );
}
