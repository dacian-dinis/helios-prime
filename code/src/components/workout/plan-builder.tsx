"use client";

import { useState } from "react";
import { X, Plus, Trash2, Search, Clock, GripVertical } from "lucide-react";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS, type MuscleGroup } from "@/lib/exercises";
import { useWorkoutStore, type PlanExercise } from "@/stores/workout-store";

interface Props {
  userId: string;
  editPlanId?: string;
  onClose: () => void;
}

const emptyExercise: PlanExercise = {
  exerciseId: "",
  name: "",
  sets: 3,
  reps: 10,
  weight: 0,
  restSeconds: 60,
};

export default function PlanBuilder({ userId, editPlanId, onClose }: Props) {
  const { addPlan, updatePlan, plans } = useWorkoutStore();
  const editPlan = editPlanId ? plans.find((p) => p.id === editPlanId) : null;

  const [name, setName] = useState(editPlan?.name || "");
  const [description, setDescription] = useState(editPlan?.description || "");
  const [exercises, setExercises] = useState<PlanExercise[]>(
    editPlan?.exercises || []
  );
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | "all">("all");

  const filteredExercises = EXERCISE_LIBRARY.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = filterMuscle === "all" || e.muscleGroup === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const addExerciseFromLibrary = (exerciseId: string, exerciseName: string) => {
    setExercises([
      ...exercises,
      { ...emptyExercise, exerciseId, name: exerciseName },
    ]);
    setShowLibrary(false);
    setSearchQuery("");
  };

  const updateExercise = (idx: number, updates: Partial<PlanExercise>) => {
    const updated = [...exercises];
    updated[idx] = { ...updated[idx], ...updates };
    setExercises(updated);
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= exercises.length) return;
    const updated = [...exercises];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setExercises(updated);
  };

  const muscleGroups = [...new Set(exercises.map((e) => {
    const lib = EXERCISE_LIBRARY.find((l) => l.id === e.exerciseId);
    return lib?.muscleGroup || "other";
  }))];

  const estimatedMinutes = exercises.reduce((sum, e) => {
    const setTime = e.sets * 0.75; // ~45s per set
    const restTime = (e.sets - 1) * (e.restSeconds / 60);
    return sum + setTime + restTime;
  }, 0);

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    const planData = {
      name: name.trim(),
      description: description.trim() || undefined,
      muscleGroups,
      exercises,
      estimatedMinutes: Math.round(estimatedMinutes),
    };
    if (editPlanId) {
      updatePlan(userId, editPlanId, planData);
    } else {
      addPlan(userId, planData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{editPlanId ? "Edit Plan" : "Create Workout Plan"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan info */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-foreground/50">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Push Day, Full Body A"
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-foreground/50">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chest, shoulders, triceps"
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground/50">
            Exercises ({exercises.length})
          </p>
          {estimatedMinutes > 0 && (
            <span className="flex items-center gap-1 text-xs text-foreground/40">
              <Clock className="h-3 w-3" />
              ~{Math.round(estimatedMinutes)} min
            </span>
          )}
        </div>

        <div className="mb-3 space-y-3">
          {exercises.map((ex, idx) => (
            <div key={idx} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveExercise(idx, -1)}
                    disabled={idx === 0}
                    className="text-foreground/20 hover:text-foreground/60 disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3" />
                  </button>
                </div>
                <span className="flex-1 text-sm font-medium">{ex.name}</span>
                <button
                  onClick={() => removeExercise(idx)}
                  className="rounded p-1 text-foreground/30 transition hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] text-foreground/40">Sets</label>
                  <input
                    type="number"
                    min={1}
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, { sets: Math.max(1, Number(e.target.value)) })}
                    className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-foreground/40">Reps</label>
                  <input
                    type="number"
                    min={1}
                    value={ex.reps}
                    onChange={(e) => updateExercise(idx, { reps: Math.max(1, Number(e.target.value)) })}
                    className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-foreground/40">Weight (kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={ex.weight || ""}
                    onChange={(e) => updateExercise(idx, { weight: Number(e.target.value) || 0 })}
                    placeholder="BW"
                    className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-foreground/40">Rest (s)</label>
                  <input
                    type="number"
                    min={0}
                    step={15}
                    value={ex.restSeconds}
                    onChange={(e) => updateExercise(idx, { restSeconds: Math.max(0, Number(e.target.value)) })}
                    className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add exercise button / library */}
        {showLibrary ? (
          <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button onClick={() => { setShowLibrary(false); setSearchQuery(""); }} className="text-xs text-foreground/50">
                Cancel
              </button>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                onClick={() => setFilterMuscle("all")}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                  filterMuscle === "all" ? "bg-accent text-black" : "bg-foreground/10 text-foreground/60"
                }`}
              >
                All
              </button>
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg.value}
                  onClick={() => setFilterMuscle(mg.value)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                    filterMuscle === mg.value ? "bg-accent text-black" : "bg-foreground/10 text-foreground/60"
                  }`}
                >
                  {mg.label}
                </button>
              ))}
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredExercises.map((e) => (
                <button
                  key={e.id}
                  onClick={() => addExerciseFromLibrary(e.id, e.name)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-foreground/10"
                >
                  <span>{e.name}</span>
                  <span className="text-[10px] text-foreground/40 capitalize">{e.muscleGroup.replace("_", " ")}</span>
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <p className="py-4 text-center text-xs text-foreground/40">No exercises found</p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLibrary(true)}
            className="mb-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 py-2 text-xs font-medium text-foreground/50 transition hover:border-accent hover:text-accent"
          >
            <Plus className="h-3 w-3" />
            Add Exercise
          </button>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || exercises.length === 0}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40"
        >
          {editPlanId ? "Update Plan" : "Save Plan"}
        </button>
      </div>
    </div>
  );
}
