"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, Plus, Check } from "lucide-react";
import { useWorkoutStore, type WorkoutPlan } from "@/stores/workout-store";

interface Props {
  userId: string;
  userProfile: {
    goal?: string;
    activityLevel?: string;
    workoutFrequency?: string;
  };
  onClose: () => void;
}

interface GeneratedPlan {
  name: string;
  description?: string;
  muscleGroups: string[];
  exercises: {
    exerciseId: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    restSeconds: number;
  }[];
  estimatedMinutes: number;
}

export default function AIGenerator({ userId, userProfile, onClose }: Props) {
  const { addPlan } = useWorkoutStore();
  const [focus, setFocus] = useState("");
  const [equipment, setEquipment] = useState("full gym");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<GeneratedPlan[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const focusOptions = [
    "Push/Pull/Legs",
    "Upper/Lower",
    "Full Body",
    "Chest & Triceps",
    "Back & Biceps",
    "Legs & Core",
    "Shoulders & Arms",
    "Cardio & Core",
  ];

  const equipmentOptions = [
    "Full Gym",
    "Dumbbells Only",
    "Bodyweight Only",
    "Home Gym (Basic)",
    "Barbell & Rack",
  ];

  const generate = async () => {
    setLoading(true);
    setPlans([]);
    setSavedIds(new Set());
    try {
      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: userProfile.goal,
          activityLevel: userProfile.activityLevel,
          workoutFrequency: userProfile.workoutFrequency,
          focus: focus || "full body",
          equipment,
        }),
      });
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const savePlan = (plan: GeneratedPlan, idx: number) => {
    addPlan(userId, {
      name: plan.name,
      description: plan.description,
      muscleGroups: plan.muscleGroups,
      exercises: plan.exercises,
      estimatedMinutes: plan.estimatedMinutes,
    });
    setSavedIds(new Set([...savedIds, idx]));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Workout Generator
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {plans.length === 0 ? (
          <>
            {/* Focus selection */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-foreground/50">Workout Focus</label>
              <div className="flex flex-wrap gap-2">
                {focusOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocus(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      focus === f
                        ? "bg-accent text-black"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-medium text-foreground/50">Available Equipment</label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEquipment(e)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      equipment === e
                        ? "bg-accent text-black"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-bold text-black transition hover:bg-accent-dark disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Plans
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs text-foreground/50">
              {plans.length} plan{plans.length !== 1 ? "s" : ""} generated. Save the ones you like!
            </p>

            <div className="space-y-3">
              {plans.map((plan, idx) => (
                <div key={idx} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-[10px] text-foreground/40">{plan.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-foreground/30">~{plan.estimatedMinutes} min</span>
                  </div>

                  <div className="mb-3 space-y-1">
                    {plan.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/70">{ex.name}</span>
                        <span className="text-foreground/30">
                          {ex.sets}x{ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : ""}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => savePlan(plan, idx)}
                    disabled={savedIds.has(idx)}
                    className={`flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition ${
                      savedIds.has(idx)
                        ? "bg-accent/10 text-accent"
                        : "bg-accent text-black hover:bg-accent-dark"
                    }`}
                  >
                    {savedIds.has(idx) ? (
                      <>
                        <Check className="h-3 w-3" /> Saved
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Save to My Plans
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setPlans([]); setSavedIds(new Set()); }}
              className="mt-4 w-full rounded-lg border border-foreground/20 py-2 text-xs font-medium text-foreground/60 transition hover:bg-foreground/5"
            >
              Generate New Plans
            </button>
          </>
        )}
      </div>
    </div>
  );
}
