"use client";

import { useMemo } from "react";

interface Props {
  value: number;
  currentWeight: number;
  goal: string;
  onChange: (v: number) => void;
}

export default function StepTargetWeight({ value, currentWeight, goal, onChange }: Props) {
  const message = useMemo(() => {
    const diff = Math.abs(currentWeight - value);
    if (!value || !currentWeight || diff === 0)
      return "";
    if (goal === "lose" && value >= currentWeight)
      return "Your target should be below your current weight.";
    if (goal === "gain" && value <= currentWeight)
      return "Your target should be above your current weight.";
    if (diff <= 3) return `Just ${diff} kg to go — you'll crush this! 💪`;
    if (diff <= 10) return `${diff} kg is a realistic target. You've got this! 🔥`;
    return `${diff} kg is ambitious — we'll build a plan to get you there! 🚀`;
  }, [value, currentWeight, goal]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">What is your target weight?</h2>
      <p className="mb-6 text-sm text-foreground/50">
        Current: {currentWeight} kg
      </p>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full max-w-xs rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-4 text-center text-2xl font-bold outline-none transition focus:border-accent"
        placeholder="70"
      />
      <span className="mt-1 text-xs text-foreground/40">kg</span>
      {message && (
        <p className="mt-4 max-w-xs text-center text-sm text-accent">{message}</p>
      )}
    </div>
  );
}
