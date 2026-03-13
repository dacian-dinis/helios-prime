"use client";

import { useMemo } from "react";

interface Props {
  currentWeight: number;
  targetWeight: number;
  days: number;
}

export default function StepProjection({ currentWeight, targetWeight, days }: Props) {
  const points = useMemo(() => {
    const milestones = [
      { label: "Now", day: 0 },
      { label: "3 days", day: 3 },
      { label: "7 days", day: 7 },
      { label: "30 days", day: 30 },
      { label: `${days} days`, day: days },
    ].filter((m) => m.day <= days);

    const diff = targetWeight - currentWeight;
    return milestones.map((m) => ({
      ...m,
      weight: Math.round(
        (currentWeight + (diff * m.day) / Math.max(days, 1)) * 10
      ) / 10,
    }));
  }, [currentWeight, targetWeight, days]);

  const minW = Math.min(currentWeight, targetWeight) - 2;
  const maxW = Math.max(currentWeight, targetWeight) + 2;

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Your projected journey</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Here&apos;s how your weight could change over time
      </p>

      <div className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
        <div className="relative flex h-48 items-end justify-between gap-1">
          {points.map((p, i) => {
            const height = ((p.weight - minW) / (maxW - minW)) * 100;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold">{p.weight} kg</span>
                <div
                  className="w-full rounded-t-md bg-accent/60 transition-all"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
                <span className="text-[10px] text-foreground/50">{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Estimated: <span className="font-semibold text-accent">{days} days</span> to reach{" "}
        <span className="font-semibold">{targetWeight} kg</span>
      </p>
    </div>
  );
}
