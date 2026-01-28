"use client";
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface NetworkLinesProps {
  mouseX: number;
  mouseY: number;
}

export function NetworkLines({ mouseX, mouseY }: NetworkLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes] = useState(() => 
    Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      side: Math.random() > 0.5 ? 'left' : 'right',
    }))
  );

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > 100) node.vx *= -1;
        if (node.y < 0 || node.y > 100) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(100, node.x));
        node.y = Math.max(0, Math.min(100, node.y));

        const x = (node.x / 100) * canvas.width;
        const y = (node.y / 100) * canvas.height;

        // Draw connections
        nodes.forEach((otherNode, j) => {
          if (i >= j) return;

          const otherX = (otherNode.x / 100) * canvas.width;
          const otherY = (otherNode.y / 100) * canvas.height;

          const distance = Math.sqrt(
            Math.pow(x - otherX, 2) + Math.pow(y - otherY, 2)
          );

          if (distance < 150 && node.side === otherNode.side) {
            const opacity = 1 - distance / 150;
            const color = node.side === 'left' ? 
              `rgba(255,183,77,${opacity * 0.4})` : 
              `rgba(0,229,255,${opacity * 0.4})`;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.moveTo(x, y);
            ctx.lineTo(otherX, otherY);
            ctx.stroke();
          }
        });

        // Draw node
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 3);
        const color = node.side === 'left' ? 
          'rgba(255,183,77,0.8)' : 
          'rgba(0,229,255,0.8)';
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [nodes]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
