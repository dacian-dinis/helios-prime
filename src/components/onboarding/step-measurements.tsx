"use client";

import { useState } from "react";

interface Props {
  height: number;
  weight: number;
  bodyFat: number | undefined;
  onChange: (data: { height: number; weight: number; bodyFat?: number }) => void;
}

export default function StepMeasurements({ height, weight, bodyFat, onChange }: Props) {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const displayHeight = unit === "imperial" ? Math.round(height / 2.54) : height;
  const displayWeight = unit === "imperial" ? Math.round(weight * 2.205) : weight;

  const handleHeight = (v: number) => {
    const cm = unit === "imperial" ? Math.round(v * 2.54) : v;
    onChange({ height: cm, weight, bodyFat });
  };

  const handleWeight = (v: number) => {
    const kg = unit === "imperial" ? Math.round(v / 2.205) : v;
    onChange({ height, weight: kg, bodyFat });
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Your measurements</h2>
      <p className="mb-6 text-sm text-foreground/50">
        We&apos;ll use these to calculate your needs
      </p>

      <div className="mb-6 flex gap-2 rounded-lg bg-foreground/5 p-1">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              unit === u ? "bg-accent text-black" : "text-foreground/60"
            }`}
          >
            {u === "metric" ? "cm / kg" : "in / lbs"}
          </button>
        ))}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Height ({unit === "metric" ? "cm" : "in"})
          </label>
          <input
            type="number"
            value={displayHeight || ""}
            onChange={(e) => handleHeight(Number(e.target.value))}
            className="w-full rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-center text-lg outline-none transition focus:border-accent"
            placeholder={unit === "metric" ? "175" : "69"}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Weight ({unit === "metric" ? "kg" : "lbs"})
          </label>
          <input
            type="number"
            value={displayWeight || ""}
            onChange={(e) => handleWeight(Number(e.target.value))}
            className="w-full rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-center text-lg outline-none transition focus:border-accent"
            placeholder={unit === "metric" ? "75" : "165"}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Body Fat % <span className="text-foreground/40">(optional)</span>
          </label>
          <input
            type="number"
            value={bodyFat ?? ""}
            onChange={(e) =>
              onChange({
                height,
                weight,
                bodyFat: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-3 text-center text-lg outline-none transition focus:border-accent"
            placeholder="15"
          />
        </div>
      </div>
    </div>
  );
}
