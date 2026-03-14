"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface Props {
  currentWeight: number;
  targetWeight: number;
  days: number;
}

export default function StepProjection({ currentWeight, targetWeight, days }: Props) {
  const isLosing = targetWeight < currentWeight;
  const isGaining = targetWeight > currentWeight;
  const isMaintaining = !isLosing && !isGaining;

  const points = useMemo(() => {
    const effectiveDays = Math.max(days, 30);
    const milestones = [
      { label: "Now", day: 0 },
      { label: "1 week", day: 7 },
      { label: "1 month", day: 30 },
      ...(effectiveDays > 30 ? [{ label: "3 months", day: 90 }] : []),
      ...(effectiveDays > 90 ? [{ label: `${Math.round(effectiveDays / 30)}m`, day: effectiveDays }] : []),
    ].filter((m) => m.day <= effectiveDays);

    const diff = targetWeight - currentWeight;
    return milestones.map((m) => ({
      ...m,
      weight: Math.round(
        (currentWeight + (diff * m.day) / Math.max(effectiveDays, 1)) * 10
      ) / 10,
    }));
  }, [currentWeight, targetWeight, days]);

  const minW = Math.min(...points.map(p => p.weight)) - 2;
  const maxW = Math.max(...points.map(p => p.weight)) + 2;

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Your projected journey</h2>
      <p className="mb-6 text-sm text-foreground/50">
        {isMaintaining
          ? "Keep your weight steady and build healthy habits"
          : `Here's how your weight could change over time`}
      </p>

      {/* Icon + summary card */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-5 py-3">
        {isLosing && <TrendingDown className="h-6 w-6 text-accent" />}
        {isGaining && <TrendingUp className="h-6 w-6 text-accent" />}
        {isMaintaining && <Minus className="h-6 w-6 text-accent" />}
        <div>
          <p className="text-sm font-semibold">
            {currentWeight} kg → {targetWeight} kg
          </p>
          <p className="text-xs text-foreground/50">
            {isMaintaining
              ? "Maintain your current weight"
              : `${Math.abs(targetWeight - currentWeight).toFixed(1)} kg in ~${days} days`}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
        <div className="relative flex h-48 items-end justify-between gap-2">
          {points.map((p, i) => {
            const range = maxW - minW;
            const height = range > 0 ? ((p.weight - minW) / range) * 100 : 50;
            const isFirst = i === 0;
            const isLast = i === points.length - 1;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className={`text-xs font-bold ${isLast ? "text-accent" : ""}`}>
                  {p.weight} kg
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isFirst
                      ? "bg-foreground/20"
                      : isLast
                        ? "bg-accent"
                        : "bg-accent/40"
                  }`}
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
                <span className={`text-[10px] ${isLast ? "font-semibold text-accent" : "text-foreground/50"}`}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/60">
        {isMaintaining ? (
          <>Focus on <span className="font-semibold text-accent">consistency</span> and healthy habits</>
        ) : (
          <>
            Estimated: <span className="font-semibold text-accent">{days} days</span> to reach{" "}
            <span className="font-semibold">{targetWeight} kg</span>
          </>
        )}
      </p>
    </div>
  );
}
