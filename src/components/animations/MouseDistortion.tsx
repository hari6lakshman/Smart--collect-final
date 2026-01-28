"use client";
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface MouseDistortionProps {
  mouseX: number;
  mouseY: number;
}

export function MouseDistortion({ mouseX, mouseY }: MouseDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = (mouseX / 100) * canvas.width;
      const centerY = (mouseY / 100) * canvas.height;

      // Draw distortion waves
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 30 + Math.sin(time * 0.002 + i) * 20;
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius - 20,
          centerX,
          centerY,
          radius + 20
        );

        gradient.addColorStop(
          0,
          i % 2 === 0 ? 'rgba(255,183,77,0)' : 'rgba(0,229,255,0)'
        );
        gradient.addColorStop(
          0.5,
          i % 2 === 0 ? 'rgba(255,183,77,0.3)' : 'rgba(0,229,255,0.3)'
        );
        gradient.addColorStop(
          1,
          i % 2 === 0 ? 'rgba(255,183,77,0)' : 'rgba(0,229,255,0)'
        );

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      time++;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7, zIndex: 3 }}
    />
  );
}
