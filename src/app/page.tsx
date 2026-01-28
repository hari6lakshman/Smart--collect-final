"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { LandingAnimation } from "@/components/animations/LandingAnimation";

export default function Home() {
  return (
    <LandingAnimation>
      <div className="flex flex-col min-h-screen">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-headline text-orange-400">
              Smart Collect
            </h1>
          </div>
        </header>
        <main className="flex-grow flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-extrabold font-headline tracking-tight sm:text-5xl md:text-6xl text-white">
                AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-400">Debt Collection</span>
              </h2>
              <p className="mt-4 text-lg text-cyan-100/80">
                Streamline case management, prioritize collections, and analyze
                performance with intelligent automation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 border-none text-white font-bold px-8 py-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20 group w-full sm:w-auto">
                    <Link href="/login" className="flex items-center">
                      Get Started
                      <LogIn className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      {/* Shimmer Effect moved inside Link to satisfy asChild requirement */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </Link>
                  </Button>
                </motion.div>

                <Button variant="outline" asChild size="lg" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60 font-bold px-8 py-6 rounded-full transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                  <Link href="/about">
                    Mission Briefing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-sm text-cyan-200/40">
          © {new Date().getFullYear()} Smart Collect. All Rights Reserved.
        </footer>
      </div>
    </LandingAnimation>
  );
}
