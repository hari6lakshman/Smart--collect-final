"use client";
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      const newRipple: Ripple = {
        x,
        y,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              border: '2px solid rgba(0,229,255,0.4)',
              boxShadow: '0 0 50px rgba(0,229,255,0.3), inset 0 0 20px rgba(251,191,36,0.2)',
            }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%', opacity: 1, scale: 0.5 }}
            animate={{
              width: ['0px', '300px'],
              height: ['0px', '300px'],
              opacity: [1, 0],
              scale: [0.5, 1.5],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
