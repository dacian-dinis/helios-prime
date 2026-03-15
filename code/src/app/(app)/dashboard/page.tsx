"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useFoodStore } from "@/stores/food-store";
import { Flame, Plus, Droplet, GlassWater, Zap, Quote, Trophy, Dumbbell } from "lucide-react";

function today() {
  return new Date().toISOString().split("T")[0];
}

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The hard days are what make you stronger.", author: "Aly Raisman" },
  { text: "No matter how slow you go, you're still lapping everyone on the couch.", author: "Unknown" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
];

const DEFAULT_PRS = [
  { lift: "Bench Press", weight: 0, unit: "kg" },
  { lift: "Squat", weight: 0, unit: "kg" },
  { lift: "Deadlift", weight: 0, unit: "kg" },
  { lift: "Overhead Press", weight: 0, unit: "kg" },
];

export default function DashboardPage() {
  const { user, profile, isLoading, loadFromStorage } = useAuthStore();
  const { getWater, addWater, getNote, saveNote } = useFoodStore();
  const router = useRouter();
  const [date] = useState(today());

  // PR state — persisted in localStorage
  const [prs, setPrs] = useState(DEFAULT_PRS);
  const [editingPR, setEditingPR] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && user && !profile?.onboardingComplete) {
      router.push("/onboarding");
    }
  }, [user, profile, isLoading, router]);

  // Load PRs from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`helios-prs-${user.id}`);
      if (saved) {
        try { setPrs(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, [user]);

  const savePR = (index: number, weight: number) => {
    const updated = [...prs];
    updated[index] = { ...updated[index], weight };
    setPrs(updated);
    if (user) {
      localStorage.setItem(`helios-prs-${user.id}`, JSON.stringify(updated));
    }
    setEditingPR(null);
  };

  // Daily quote based on day of year
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  if (isLoading || !profile || !user) return null;

  const waterMl = getWater(date);
  const waterGoal = 2500;
  const note = getNote(date);

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

      {/* Quote of the Day */}
      <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Quote className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Quote of the Day
          </span>
        </div>
        <p className="text-sm font-medium italic leading-relaxed">
          &ldquo;{dailyQuote.text}&rdquo;
        </p>
        <p className="mt-2 text-xs text-foreground/40">
          — {dailyQuote.author}
        </p>
      </div>

      {/* PR Tracker */}
      <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold">Personal Records</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-foreground/40">
            Tap to edit
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {prs.map((pr, i) => (
            <div
              key={pr.lift}
              onClick={() => setEditingPR(i)}
              className="group cursor-pointer rounded-xl border border-foreground/10 bg-background p-3 transition hover:border-accent/30"
            >
              <div className="mb-1 flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-foreground/40 group-hover:text-accent" />
                <span className="text-xs font-medium text-foreground/60">{pr.lift}</span>
              </div>
              {editingPR === i ? (
                <input
                  type="number"
                  autoFocus
                  defaultValue={pr.weight || ""}
                  placeholder="0"
                  onBlur={(e) => savePR(i, Number(e.target.value) || 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePR(i, Number((e.target as HTMLInputElement).value) || 0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-lg font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              ) : (
                <p className="text-lg font-bold">
                  {pr.weight > 0 ? (
                    <>
                      {pr.weight}
                      <span className="text-xs font-normal text-foreground/40"> {pr.unit}</span>
                    </>
                  ) : (
                    <span className="text-foreground/20">— kg</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
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
          <Dumbbell className="h-5 w-5 text-accent" />
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
