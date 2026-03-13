"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isLoading, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && user && !profile?.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !profile) return null;

  const consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const remaining = {
    calories: profile.dailyCalories - consumed.calories,
    protein: profile.protein - consumed.protein,
    carbs: profile.carbs - consumed.carbs,
    fat: profile.fat - consumed.fat,
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hi, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-foreground/50">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Calorie ring */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 text-center">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - consumed.calories / profile.dailyCalories)}`}
              className="text-accent transition-all"
            />
          </svg>
          <div>
            <p className="text-3xl font-extrabold">{remaining.calories}</p>
            <p className="text-xs text-foreground/50">kcal left</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-xs text-foreground/50">
          <span>Goal: <b className="text-foreground">{profile.dailyCalories}</b></span>
          <span>Eaten: <b className="text-foreground">{consumed.calories}</b></span>
        </div>
      </div>

      {/* Macro cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Protein", value: consumed.protein, target: profile.protein, icon: Beef, color: "text-blue-500", bg: "bg-blue-500" },
          { label: "Carbs", value: consumed.carbs, target: profile.carbs, icon: Wheat, color: "text-amber-500", bg: "bg-amber-500" },
          { label: "Fat", value: consumed.fat, target: profile.fat, icon: Droplets, color: "text-rose-500", bg: "bg-rose-500" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-center">
            <m.icon className={`mx-auto mb-2 h-5 w-5 ${m.color}`} />
            <p className="text-lg font-bold">{m.value}g</p>
            <p className="text-[10px] text-foreground/50">/ {m.target}g {m.label}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className={`h-full rounded-full ${m.bg} transition-all`}
                style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/food-log")}
          className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-left transition hover:border-accent/30 hover:bg-accent/5"
        >
          <Flame className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-semibold">Log Food</p>
            <p className="text-xs text-foreground/50">Track a meal</p>
          </div>
        </button>
        <button
          onClick={() => router.push("/workouts")}
          className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-left transition hover:border-accent/30 hover:bg-accent/5"
        >
          <Flame className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-semibold">Start Workout</p>
            <p className="text-xs text-foreground/50">Train today</p>
          </div>
        </button>
      </div>
    </div>
  );
}
