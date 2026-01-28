"use client";

import { motion } from "motion/react";
import { Mail, Phone, GraduationCap, MapPin, Sparkles, BrainCircuit, ShieldCheck, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingAnimation } from "@/components/animations/LandingAnimation";
import { Card, CardContent } from "@/components/ui/card";

const creators = [
    {
        name: "Hari Prasanth L",
        email: "hari.lakshman6@gmail.com",
        phone: "+91 98941 31655"
    },
    {
        name: "Gowri Shankar M",
        email: "gowrishankar28057@gmail.com",
        phone: "+91 80727 84089"
    },
    {
        name: "Kaaviya SN",
        email: "nesasubha3@gmail.com",
        phone: "+91 90806 31958"
    }
];

const features = [
    {
        icon: <BrainCircuit className="h-6 w-6 text-amber-400" />,
        title: "AI Prioritization",
        desc: "Neural networks analyze debtor history to score and prioritize cases automatically."
    },
    {
        icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
        title: "Real-time Analytics",
        desc: "Dynamic dashboards for administrators to track collection efficiency and agent performance."
    },
    {
        icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
        title: "Secure Terminal",
        desc: "Encrypted DCA consoles allowing field agents to update case intelligence in real-time."
    },
    {
        icon: <Users className="h-6 w-6 text-cyan-400" />,
        title: "Resource Management",
        desc: "Automated agent onboarding and case assignment powered by workload balancing algorithms."
    }
];

export default function AboutPage() {
    return (
        <LandingAnimation interactive={false}>
            <div className="flex flex-col min-h-screen py-10 px-4 sm:px-6 lg:px-8">
                <header className="container mx-auto mb-12">
                    <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group">
                        <span className="mr-2">←</span> Back to Terminal
                    </Link>
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-black font-headline bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tight mb-4">
                            Mission Overview
                        </h1>
                        <p className="text-xl text-cyan-100/70 font-medium">
                            Smart Collect is an advanced, AI-driven debt collection management platform designed to revolutionize how financial institutions handle recovery processes through intelligent automation.
                        </p>
                    </div>
                </header>

                <main className="container mx-auto space-y-24 pb-20">
                    {/* Features Grid */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="text-amber-400 h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white">System Features</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((f, i) => (
                                <Card key={i} className="bg-card hover:border-amber-500/50 transition-all group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardContent className="p-6 relative z-10">
                                        <div className="mb-4">{f.icon}</div>
                                        <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                        <p className="text-sm text-cyan-100/60 leading-relaxed">{f.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Creators Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <Users className="text-cyan-400 h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white">The Creators</h2>
                        </div>

                        <Card className="bg-card shadow-2xl rounded-3xl p-8 lg:p-12 mb-12 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px]" />
                            <div className="grid lg:grid-cols-[1fr_auto_1.5fr] gap-12 items-center">
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-black text-white leading-tight">Engineering the Future of Collection</h3>
                                    <p className="text-cyan-100/60">
                                        We are a team of dedicated first-year engineering students specializing in Electronics and Communication Engineering. This project merges financial technology with cutting-edge AI to solve complex recovery bottlenecks.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-cyan-300">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>ECE Dept, St. Joseph's College of Engineering</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-cyan-300">
                                            <MapPin className="h-4 w-4" />
                                            <span>OMR, Chennai</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px lg:h-48 w-full lg:w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                                <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                    {creators.map((c, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-secondary hover:bg-white/10 transition-colors">
                                            <h4 className="font-bold text-amber-400 mb-3">{c.name}</h4>
                                            <div className="space-y-1.5">
                                                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-cyan-100/60 hover:text-white transition-colors">
                                                    <Mail className="h-3 w-3" /> {c.email}
                                                </a>
                                                <div className="flex items-center gap-2 text-xs text-cyan-100/60">
                                                    <Phone className="h-3 w-3" /> {c.phone}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </section>
                </main>

                <footer className="container mx-auto py-8 text-center border-t border-white/5">
                    <p className="text-xs text-cyan-200/20 uppercase tracking-[0.5em]">
                        St. Joseph's College of Engineering // Project Terminal // 2026
                    </p>
                </footer>
            </div>
        </LandingAnimation>
    );
}
