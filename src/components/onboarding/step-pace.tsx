"use client";

import { useMemo } from "react";
import { calculateBMR, calculateTDEE, calculateDailyCalories, daysToGoal } from "@/lib/utils";

interface Props {
  value: number;
  currentWeight: number;
  targetWeight: number;
  goal: string;
  gender: string;
  heightCm: number;
  age: number;
  activityLevel: string;
  workoutFrequency: string;
  onChange: (v: number) => void;
}

export default function StepPace({ value, currentWeight, targetWeight, goal, gender, heightCm, age, activityLevel, workoutFrequency, onChange }: Props) {
  const projected = useMemo(() => {
    if (!currentWeight || !targetWeight || !heightCm || !age) return null;
    const bmr = calculateBMR(currentWeight, heightCm, age, gender as "male" | "female" | "other");
    const tdee = calculateTDEE(bmr, activityLevel || "sedentary", workoutFrequency || "0-2");
    const dailyCals = calculateDailyCalories(tdee, goal, value);
    const days = daysToGoal(currentWeight, targetWeight, dailyCals, tdee);
    return { days, dailyCals };
  }, [value, currentWeight, targetWeight, goal, gender, heightCm, age, activityLevel, workoutFrequency]);

  const label = value < 33 ? "Slow & Steady" : value < 66 ? "Recommended" : "Aggressive";

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">How fast do you want results?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Pick a pace that fits your lifestyle
      </p>

      <div className="w-full max-w-xs">
        <div className="mb-2 flex justify-between text-xs text-foreground/40">
          <span>Slow</span>
          <span>Recommended</span>
          <span>Fast</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <p className="mt-3 text-center text-lg font-semibold text-accent">{label}</p>
        {goal !== "maintain" && projected && projected.days !== Infinity && (
          <p className="mt-2 text-center text-sm text-foreground/60">
            Estimated time: <span className="font-semibold text-foreground">{projected.days} days</span>
          </p>
        )}
      </div>
    </div>
  );
}
