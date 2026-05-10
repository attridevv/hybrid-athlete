"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Heart, Dumbbell, TrendingUp, Brain, User, Shield } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Check-In", href: "/checkin", icon: Activity },
  { name: "Runs", href: "/runs", icon: Heart },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Recovery", href: "/recovery", icon: Shield },
  { name: "Injuries", href: "/injuries", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "AI Coach", href: "/insights", icon: Brain },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6 max-md:hidden flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">VEKTOR</h1>
        <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest">Command Center</p>
      </div>
      <nav className="space-y-0.5 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive
                  ? "text-zinc-100 bg-zinc-800 font-medium"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 border-t border-zinc-800 flex items-center gap-3 text-xs text-zinc-500">
        <UserButton />
        <span>Signed in</span>
      </div>
    </aside>
  );
}
