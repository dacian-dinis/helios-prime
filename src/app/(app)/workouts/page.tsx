"use client";

import { Dumbbell } from "lucide-react";

export default function WorkoutsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Dumbbell className="mb-4 h-12 w-12 text-foreground/20" />
      <h1 className="text-xl font-bold">Workouts</h1>
      <p className="mt-2 text-sm text-foreground/50">Coming in Phase 4 — Workout Planner</p>
    </div>
  );
}
