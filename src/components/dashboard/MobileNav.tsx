"use client";

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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-50">
      <div className="flex justify-around py-2 px-1">
        {navigation.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                isActive ? "text-zinc-100" : "text-zinc-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-14">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
