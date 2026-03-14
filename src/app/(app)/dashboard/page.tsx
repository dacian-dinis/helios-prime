"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useFoodStore } from "@/stores/food-store";
import { Flame, Beef, Wheat, Droplets, Plus, Droplet, GlassWater, Zap } from "lucide-react";

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const { user, profile, isLoading, loadFromStorage } = useAuthStore();
  const { getDailyTotals, getWater, addWater, getNote, saveNote } = useFoodStore();
  const router = useRouter();
  const [date] = useState(today());

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && user && !profile?.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !profile || !user) return null;

  const totals = getDailyTotals(date);
  const waterMl = getWater(date);
  const waterGoal = 2500;
  const caloriesLeft = Math.max(profile.dailyCalories - totals.calories, 0);
  const caloriePct = Math.min(totals.calories / profile.dailyCalories, 1);
  const note = getNote(date);

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="pb-24 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hi, {user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-foreground/50">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Calorie Ring */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
        <div className="flex items-center gap-6">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - caloriePct)}
                className="text-accent transition-all duration-500"
              />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-extrabold">{caloriesLeft}</p>
              <p className="text-[10px] text-foreground/50">remaining</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/50">Goal</span>
              <span className="font-semibold">{profile.dailyCalories} kcal</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/50">Eaten</span>
              <span className="font-semibold text-accent">{totals.calories} kcal</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/50">Remaining</span>
              <span className="font-semibold">{caloriesLeft} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Bars */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Protein", value: totals.protein, target: profile.protein, icon: Beef, color: "text-blue-500", bg: "bg-blue-500" },
          { label: "Carbs", value: totals.carbs, target: profile.carbs, icon: Wheat, color: "text-amber-500", bg: "bg-amber-500" },
          { label: "Fat", value: totals.fat, target: profile.fat, icon: Droplets, color: "text-rose-500", bg: "bg-rose-500" },
        ].map((m) => {
          const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
          return (
            <div key={m.label} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-center">
              <m.icon className={`mx-auto mb-2 h-5 w-5 ${m.color}`} />
              <p className="text-lg font-bold">{m.value}g</p>
              <p className="text-[10px] text-foreground/50">/ {m.target}g</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className={`h-full rounded-full ${m.bg} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Water Tracker */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlassWater className="h-5 w-5 text-sky-400" />
            <span className="text-sm font-semibold">Water</span>
          </div>
          <span className="text-xs text-foreground/50">
            {waterMl} / {waterGoal} ml
          </span>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-sky-400 transition-all duration-500"
            style={{ width: `${Math.min((waterMl / waterGoal) * 100, 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          {[150, 250, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(user.id, date, ml)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-foreground/10 py-2 text-xs font-medium transition hover:border-sky-400 hover:bg-sky-400/10 hover:text-sky-400"
            >
              <Droplet className="h-3 w-3" />
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-semibold">How are you feeling today?</span>
        </div>
        <div className="flex gap-2">
          {[
            { level: 1, emoji: "😴", label: "Low" },
            { level: 2, emoji: "😐", label: "Meh" },
            { level: 3, emoji: "🙂", label: "OK" },
            { level: 4, emoji: "😊", label: "Good" },
            { level: 5, emoji: "🔥", label: "Great" },
          ].map((e) => (
            <button
              key={e.level}
              onClick={() =>
                saveNote(user.id, {
                  date,
                  energyLevel: e.level,
                  note: note?.note || "",
                })
              }
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-xs transition ${
                note?.energyLevel === e.level
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                  : "border-foreground/10 hover:border-foreground/20"
              }`}
            >
              <span className="text-lg">{e.emoji}</span>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
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

      {/* Floating Add Button */}
      <button
        onClick={() => router.push("/food-log")}
        className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-lg shadow-accent/25 transition hover:bg-accent-dark md:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
