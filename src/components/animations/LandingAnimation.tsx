"use client";

import { motion } from 'motion/react';
import { useState, useEffect, ReactNode } from 'react';
import { FloatingParticle } from './FloatingParticle';
import { FallingLine } from './FallingLine';
import { GeometricShape } from './GeometricShape';
import { NetworkLines } from './NetworkLines';
import { CursorTrail } from './CursorTrail';
import { RippleEffect } from './RippleEffect';
import { MagneticParticles } from './MagneticParticles';
import { InteractiveBeams } from './InteractiveBeams';
import { MouseDistortion } from './MouseDistortion';
import backgroundImage from '@/assets/background.png';

interface LandingAnimationProps {
    children: ReactNode;
    interactive?: boolean;
}

export function LandingAnimation({ children, interactive = true }: LandingAnimationProps) {
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const x = (clientX / innerWidth) * 100;
        const y = (clientY / innerHeight) * 100;

        setMousePosition({ x, y });

        // 3D tilt effect based on mouse position
        const rotateY = ((x - 50) / 50) * 5; // -5 to 5 degrees
        const rotateX = ((y - 50) / 50) * -5; // -5 to 5 degrees
        setTilt({ rotateX, rotateY });
    };

    const handleMouseDown = () => {
        setIsMouseDown(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    return (
        <div
            className={`relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${interactive ? 'select-none' : ''}`}
            onMouseMove={interactive ? handleMouseMove : undefined}
            onMouseDown={interactive ? handleMouseDown : undefined}
            onMouseUp={interactive ? handleMouseUp : undefined}
            style={{
                cursor: interactive ? (isMouseDown ? 'grabbing' : 'grab') : 'default',
                perspective: '1000px',
            }}
        >
            {/* Background Image Overlay with 3D tilt */}
            <motion.div
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${backgroundImage.src})`,
                    rotateX: tilt.rotateX,
                    rotateY: tilt.rotateY,
                }}
                animate={{
                    scale: isMouseDown ? 1.1 : [1, 1.05, 1],
                }}
                transition={{
                    scale: isMouseDown ? { duration: 0.3 } : {
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                    rotateX: { type: "spring", stiffness: 100, damping: 30 },
                    rotateY: { type: "spring", stiffness: 100, damping: 30 },
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/50" />

            {/* Mouse-based interactive components */}
            {interactive && (
                <>
                    <MouseDistortion mouseX={mousePosition.x} mouseY={mousePosition.y} />
                    <InteractiveBeams mouseX={mousePosition.x} mouseY={mousePosition.y} />
                    <NetworkLines mouseX={mousePosition.x} mouseY={mousePosition.y} />
                    <MagneticParticles
                        mouseX={mousePosition.x}
                        mouseY={mousePosition.y}
                        isMouseDown={isMouseDown}
                    />
                    <CursorTrail mouseX={mousePosition.x} mouseY={mousePosition.y} />
                    <RippleEffect />
                </>
            )}

            {/* Falling Lines - Always show as background atmospheric */}
            {isLoaded && [...Array(30)].map((_, i) => (
                <FallingLine key={`line-${i}`} index={i} />
            ))}

            {/* Geometric Shapes - Left Side (Orange) */}
            {isLoaded && [...Array(6)].map((_, i) => (
                <GeometricShape
                    key={`shape-left-${i}`}
                    index={i}
                    side="left"
                    mouseX={interactive ? mousePosition.x : 50}
                    mouseY={interactive ? mousePosition.y : 50}
                />
            ))}

            {/* Geometric Shapes - Right Side (Cyan) */}
            {isLoaded && [...Array(6)].map((_, i) => (
                <GeometricShape
                    key={`shape-right-${i}`}
                    index={i}
                    side="right"
                    mouseX={interactive ? mousePosition.x : 50}
                    mouseY={interactive ? mousePosition.y : 50}
                />
            ))}

            {/* Floating Particles */}
            {isLoaded && [...Array(100)].map((_, i) => (
                <FloatingParticle
                    key={`particle-${i}`}
                    index={i}
                    mouseX={interactive ? mousePosition.x : 50}
                    mouseY={interactive ? mousePosition.y : 50}
                />
            ))}

            {/* Central Glow Effect - Enhanced with mouse interaction */}
            {interactive && (
                <motion.div
                    className="absolute rounded-full blur-3xl pointer-events-none"
                    style={{
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`,
                        width: '400px',
                        height: '400px',
                        transform: 'translate(-50%, -50%)',
                        background: isMouseDown
                            ? 'radial-gradient(circle, rgba(255,183,77,0.4) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(100,200,255,0.2) 0%, transparent 70%)',
                    }}
                    animate={{
                        scale: isMouseDown ? [1, 1.5, 1] : [1, 1.2, 1],
                        opacity: isMouseDown ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: isMouseDown ? 0.5 : 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 w-full h-full min-h-screen">
                {children}
            </div>

            {/* Enhanced Mouse Follower with multiple rings */}
            {interactive && (
                <motion.div
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: 0,
                        top: 0
                    }}
                    animate={{
                        x: mousePosition.x * (typeof window !== 'undefined' ? window.innerWidth : 1000) / 100 - 24,
                        y: mousePosition.y * (typeof window !== 'undefined' ? window.innerHeight : 1000) / 100 - 24,
                    }}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                    }}
                >
                    <motion.div
                        className="w-12 h-12 rounded-full border-2 border-cyan-400/50"
                        animate={{
                            scale: isMouseDown ? 1.5 : [1, 1.2, 1],
                            rotate: 360,
                            borderColor: isMouseDown
                                ? ['rgba(255,183,77,0.8)', 'rgba(0,229,255,0.8)', 'rgba(255,183,77,0.8)']
                                : ['rgba(0,229,255,0.5)', 'rgba(255,183,77,0.5)', 'rgba(0,229,255,0.5)'],
                        }}
                        transition={{
                            scale: isMouseDown ? { duration: 0.2 } : { duration: 2, repeat: Infinity },
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            borderColor: { duration: 2, repeat: Infinity },
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 w-12 h-12 rounded-full border border-orange-400/30"
                        animate={{
                            scale: [1.2, 1.5, 1.2],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    />
                </motion.div>
            )}

            {/* Corner Accents - Enhanced with mouse interaction */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-transparent blur-3xl pointer-events-none"
                animate={{
                    opacity: mousePosition.x < 30 && mousePosition.y < 30 ? 0.6 : 0.2,
                    scale: mousePosition.x < 30 && mousePosition.y < 30 ? 1.5 : 1,
                }}
                transition={{ duration: 0.5 }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-500/20 to-transparent blur-3xl pointer-events-none"
                animate={{
                    opacity: mousePosition.x > 70 && mousePosition.y > 70 ? 0.6 : 0.2,
                    scale: mousePosition.x > 70 && mousePosition.y > 70 ? 1.5 : 1,
                }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );
}
