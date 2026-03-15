"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useFoodStore } from "@/stores/food-store";
import { useRecipeStore } from "@/stores/recipe-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useProgressStore } from "@/stores/progress-store";
import { useFastingStore } from "@/stores/fasting-store";
import { NotificationScheduler } from "@/components/notification-scheduler";
import { PWARegister } from "@/components/pwa-register";
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Timer,
  Users,
  GraduationCap,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/food-log", label: "Food", icon: UtensilsCrossed },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/fasting", label: "Fasting", icon: Timer },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/community", label: "Community", icon: Users },
  { href: "/coaches", label: "Coaches", icon: GraduationCap },
  { href: "/pricing", label: "Pricing", icon: Crown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, loadFromStorage, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) {
      useSettingsStore.getState().loadFromStorage(user.id);
      useSubscriptionStore.getState().loadSubscription(user.id);
      useFoodStore.getState().loadFromStorage(user.id);
      useRecipeStore.getState().loadFromStorage(user.id);
      useWorkoutStore.getState().loadFromStorage(user.id);
      useProgressStore.getState().loadFromStorage(user.id);
      useFastingStore.getState().loadFromStorage(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (isLoading || !user) return null;

  // Hide app shell during onboarding
  if (pathname === "/onboarding") return <>{children}</>;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <PWARegister />
      <NotificationScheduler />

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-foreground/10 bg-background md:flex">
        <div className="px-5 py-5">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-accent">Helios</span> Prime
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-foreground/10 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/60 transition hover:bg-foreground/5 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-foreground/10 bg-background transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-accent">Helios</span> Prime
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-foreground/50 transition hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-foreground/10 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/60 transition hover:bg-foreground/5 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-3 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-foreground/50 transition hover:bg-foreground/5 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold tracking-tight">
            <span className="text-accent">Helios</span> Prime
          </span>
          <Link
            href="/settings"
            className={`rounded-lg p-2 transition ${
              pathname === "/settings"
                ? "bg-accent/10 text-accent"
                : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full border-t border-foreground/10 bg-background/95 backdrop-blur-md md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${
                active ? "text-accent" : "text-foreground/50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
