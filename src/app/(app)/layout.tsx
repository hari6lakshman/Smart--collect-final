
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { UserNav } from "@/components/user-nav";
import { Icons } from "@/components/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import type { Dca } from "@/lib/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loggedInUser, dcas, isLoading, setLoggedInUser } = useAppContext();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoading && !loggedInUser) {
      router.push("/login");
    }
  }, [loggedInUser, isLoading, router, hydrated]);

  if (!hydrated || isLoading || !loggedInUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isDca = loggedInUser.role === "DCA";
  const user = isDca
    ? {
      name: (loggedInUser as Dca).name,
      email: `${(loggedInUser as Dca).username}@smartcollect.com`,
      role: "DCA" as const,
    }
    : {
      name: "Admin User",
      email: (loggedInUser as { id: string, name: string, role: 'Admin' }).id,
      role: "Admin" as const,
    };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-cyan-500/30 bg-black/5 backdrop-blur-[2px] md:block shadow-[1px_0_15px_rgba(6,182,212,0.15)]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6 bg-transparent">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-headline text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.2)] group-hover:from-amber-300 group-hover:to-cyan-300 transition-all uppercase tracking-tight">Smart Collect</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <Nav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-20 items-center gap-4 border-b bg-black/5 px-4 lg:h-[80px] lg:px-8 relative overflow-hidden">
          {/* HUD Background Decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_70%)] pointer-events-none" />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Menu className="h-5 w-5 text-cyan-400" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-[#0a0a0c] border-white/10">
              <div className="flex h-14 items-center border-b border-white/5 px-4 lg:h-[60px] lg:px-6 mb-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 group"
                >
                  <span className="font-headline text-xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tight">Smart Collect</span>
                </Link>
              </div>
              <Nav />
            </SheetContent>
          </Sheet>

          {/* Horizontal Command Unit */}
          <div className="flex-1 flex items-center justify-center gap-12 z-10">
            <div className="flex flex-col items-start pointer-events-none">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/70">{isDca ? "DCA System" : "Admin System"}</span>
                <div className="h-[1px] w-4 bg-amber-500/30" />
              </div>
              <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.1em] text-white leading-tight whitespace-nowrap">
                {isDca ? "DCA" : "Administrator"} <span className="text-amber-500">{isDca ? "Page" : "Console"}</span>
              </h1>
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />

            <div className="flex items-center gap-6 group cursor-default">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-cyan-400 group-hover:text-cyan-300 transition-colors">Active Status</span>
                <span className="text-[7px] font-mono text-cyan-500/30 group-hover:text-cyan-400/50 transition-colors">System: Online // Sync_v2</span>
              </div>
              <div className="flex items-end gap-1 h-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[5px] bg-gradient-to-t from-blue-700 via-cyan-500 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                    style={{
                      animationName: 'equalize',
                      animationDuration: `${0.7 + Math.random() * 0.6}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Profile & UserNav */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex flex-col items-end hidden xl:flex mr-2">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter leading-none">Access Level</span>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">Tier 01 // Root</span>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 rounded-full opacity-20 blur group-hover:opacity-40 transition-opacity animate-[spin_10s_linear_infinite]" />
              <div className="relative flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 leading-none">{user.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[7px] font-medium uppercase tracking-tighter text-cyan-400/50">Encrypted Session</span>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                <UserNav user={user} onLogout={() => setLoggedInUser(null)} />
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/5 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/5 to-transparent blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-amber-500/5 to-transparent blur-3xl" />

            {/* Animated Border Lines */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          </div>

          {/* Main Content Container - 95% Transparent */}
          <div className="absolute inset-4 lg:inset-6 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent border border-white/5 rounded-3xl -z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-cyan-500/5 opacity-30" />
          </div>

          <div className="relative z-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
