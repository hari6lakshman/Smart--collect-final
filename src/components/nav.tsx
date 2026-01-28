"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Wallet,
} from "lucide-react";
import { Icons } from "./icons";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  // These are now tabs, so we don't need separate nav items
  // { href: '/admin/cases', label: 'Cases', icon: Briefcase },
  // { href: '/admin/dcas', label: 'DCAs', icon: Users },
  // { href: '/admin/timetable', label: 'Timetable', icon: Calendar },
];

const dcaNavItems = [
  { href: "/dca", label: "Dashboard", icon: LayoutDashboard },
  // These are now tabs
  // { href: '/dca/cases', label: 'My Cases', icon: Wallet },
  // { href: '/dca/timetable', label: 'My Timetable', icon: Calendar },
];

export function Nav() {
  const pathname = usePathname();
  const isDca = pathname.startsWith("/dca");

  const navItems = isDca ? dcaNavItems : adminNavItems;

  return (
    <nav className="flex-1 flex flex-col gap-3 px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
              isActive
                ? "bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10"
                : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/20"
            )}>
              {/* Active State Glow */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 blur-sm" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-cyan-500 rounded-r-full" />
                </>
              )}

              {/* Icon Container */}
              <div className={cn(
                "relative z-10 p-2 rounded-lg transition-all",
                isActive
                  ? "bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30"
                  : "bg-white/5 border border-white/10 group-hover:border-amber-500/20"
              )}>
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-amber-400" : "text-white/60 group-hover:text-amber-400"
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                "relative z-10 font-semibold text-sm transition-colors",
                isActive
                  ? "text-white"
                  : "text-white/70 group-hover:text-white"
              )}>
                {item.label}
              </span>

              {/* Hover Effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-cyan-500/0 group-hover:from-amber-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
