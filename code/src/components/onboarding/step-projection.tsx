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
        <svg viewBox="0 0 300 160" className="mb-4 w-full" aria-label="Projected weight journey">
          {/* curve line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points
              .map((p, i) => {
                const x = 30 + (i / Math.max(points.length - 1, 1)) * 240;
                const y = 120 - ((p.weight - minW) / (maxW - minW)) * 100;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* gradient area under the curve */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent, #f97316)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-accent, #f97316)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#areaGrad)"
            points={[
              ...points.map((p, i) => {
                const x = 30 + (i / Math.max(points.length - 1, 1)) * 240;
                const y = 120 - ((p.weight - minW) / (maxW - minW)) * 100;
                return `${x},${y}`;
              }),
              `${30 + 240},120`,
              `30,120`,
            ].join(" ")}
          />
          {/* dots and labels */}
          {points.map((p, i) => {
            const x = 30 + (i / Math.max(points.length - 1, 1)) * 240;
            const y = 120 - ((p.weight - minW) / (maxW - minW)) * 100;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={4} className="fill-accent" />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="fill-current text-[10px] font-bold"
                >
                  {p.weight} kg
                </text>
                <text
                  x={x}
                  y={140}
                  textAnchor="middle"
                  className="fill-current text-[9px] opacity-50"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Estimated: <span className="font-semibold text-accent">{days} days</span> to reach{" "}
        <span className="font-semibold">{targetWeight} kg</span>
      </p>
    </div>
  );
}
