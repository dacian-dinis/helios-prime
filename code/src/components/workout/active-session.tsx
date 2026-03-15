"use client";

import { useState, useEffect } from "react";
import { X, Check, Plus, Trash2, ChevronDown, ChevronUp, Timer, Trophy } from "lucide-react";
import { useWorkoutStore, type WorkoutSession, type SessionExercise, type SessionSet } from "@/stores/workout-store";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS, type MuscleGroup } from "@/lib/exercises";

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function ActiveSession({ userId, onComplete }: Props) {
  const { activeSession, updateActiveSession, completeSession, cancelSession } = useWorkoutStore();
  const [elapsed, setElapsed] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | "all">("all");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (!activeSession) return;
    const start = new Date(activeSession.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const session = activeSession;
  const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0);
  const completedSets = session.exercises.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex, ei) =>
        ei === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((st, si) =>
                si === setIdx ? { ...st, completed: !st.completed } : st
              ),
            }
          : ex
      ),
    };
    updateActiveSession(userId, updated);
  };

  const updateSet = (exIdx: number, setIdx: number, updates: Partial<SessionSet>) => {
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((ex, ei) =>
        ei === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((st, si) =>
                si === setIdx ? { ...st, ...updates } : st
              ),
            }
          : ex
      ),
    };
    updateActiveSession(userId, updated);
  };

  const addSetToExercise = (exIdx: number) => {
    const ex = session.exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1] || { reps: ex.targetReps, weight: 0, completed: false };
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.map((e, ei) =>
        ei === exIdx
          ? { ...e, sets: [...e.sets, { reps: lastSet.reps, weight: lastSet.weight, completed: false }] }
          : e
      ),
    };
    updateActiveSession(userId, updated);
  };

  const removeExercise = (exIdx: number) => {
    const updated: WorkoutSession = {
      ...session,
      exercises: session.exercises.filter((_, i) => i !== exIdx),
    };
    updateActiveSession(userId, updated);
  };

  const addExerciseToSession = (exerciseId: string, name: string) => {
    const newEx: SessionExercise = {
      exerciseId,
      name,
      targetSets: 3,
      targetReps: 10,
      sets: [
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
      ],
    };
    const updated: WorkoutSession = {
      ...session,
      exercises: [...session.exercises, newEx],
    };
    updateActiveSession(userId, updated);
    setShowAddExercise(false);
    setSearchQuery("");
    setExpandedIdx(session.exercises.length);
  };

  const handleComplete = () => {
    completeSession(userId);
    onComplete();
  };

  const handleCancel = () => {
    cancelSession(userId);
    onComplete();
  };

  const filteredLibrary = EXERCISE_LIBRARY.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = filterMuscle === "all" || e.muscleGroup === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-foreground/10 bg-foreground/[0.02] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">{session.planName}</h2>
            <div className="flex items-center gap-3 text-xs text-foreground/50">
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {formatTime(elapsed)}
              </span>
              <span>{completedSets}/{totalSets} sets</span>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="rounded-lg p-1.5 text-foreground/40 transition hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {session.exercises.length === 0 && (
          <div className="py-12 text-center text-sm text-foreground/40">
            No exercises yet. Add one to get started!
          </div>
        )}

        {session.exercises.map((ex, exIdx) => (
          <div key={exIdx} className="mb-3 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
            <button
              onClick={() => setExpandedIdx(expandedIdx === exIdx ? -1 : exIdx)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                  {exIdx + 1}
                </span>
                <span className="text-sm font-medium">{ex.name}</span>
                <span className="text-[10px] text-foreground/30">
                  {ex.sets.filter((s) => s.completed).length}/{ex.sets.length}
                </span>
              </div>
              {expandedIdx === exIdx ? (
                <ChevronUp className="h-4 w-4 text-foreground/30" />
              ) : (
                <ChevronDown className="h-4 w-4 text-foreground/30" />
              )}
            </button>

            {expandedIdx === exIdx && (
              <div className="border-t border-foreground/5 px-4 py-3">
                {/* Set headers */}
                <div className="mb-1 grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[9px] font-medium text-foreground/30">
                  <span>SET</span>
                  <span>WEIGHT (kg)</span>
                  <span>REPS</span>
                  <span></span>
                </div>

                {ex.sets.map((st, si) => (
                  <div
                    key={si}
                    className={`mb-1 grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 rounded-lg px-1 py-1 ${
                      st.completed ? "bg-accent/5" : ""
                    }`}
                  >
                    <span className="text-center text-xs font-medium text-foreground/40">{si + 1}</span>
                    <input
                      type="number"
                      min={0}
                      value={st.weight || ""}
                      placeholder="BW"
                      onChange={(e) => updateSet(exIdx, si, { weight: Number(e.target.value) || 0 })}
                      className="rounded-md border border-foreground/15 bg-foreground/5 px-2 py-1.5 text-xs outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      min={0}
                      value={st.reps}
                      onChange={(e) => updateSet(exIdx, si, { reps: Number(e.target.value) || 0 })}
                      className="rounded-md border border-foreground/15 bg-foreground/5 px-2 py-1.5 text-xs outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => toggleSet(exIdx, si)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                        st.completed
                          ? "border-accent bg-accent text-black"
                          : "border-foreground/20 text-foreground/30 hover:border-accent hover:text-accent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => addSetToExercise(exIdx)}
                    className="flex items-center gap-1 text-[10px] font-medium text-accent transition hover:text-accent-dark"
                  >
                    <Plus className="h-3 w-3" /> Add Set
                  </button>
                  <button
                    onClick={() => removeExercise(exIdx)}
                    className="flex items-center gap-1 text-[10px] font-medium text-foreground/30 transition hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add exercise in session */}
        {showAddExercise ? (
          <div className="mb-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              autoFocus
              className="mb-2 w-full rounded-lg border border-foreground/15 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                onClick={() => setFilterMuscle("all")}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  filterMuscle === "all" ? "bg-accent text-black" : "bg-foreground/10 text-foreground/60"
                }`}
              >
                All
              </button>
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg.value}
                  onClick={() => setFilterMuscle(mg.value)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    filterMuscle === mg.value ? "bg-accent text-black" : "bg-foreground/10 text-foreground/60"
                  }`}
                >
                  {mg.label}
                </button>
              ))}
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredLibrary.map((e) => (
                <button
                  key={e.id}
                  onClick={() => addExerciseToSession(e.id, e.name)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-foreground/10"
                >
                  <span>{e.name}</span>
                  <span className="text-[10px] text-foreground/40 capitalize">{e.muscleGroup.replace("_", " ")}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowAddExercise(false); setSearchQuery(""); }}
              className="mt-2 w-full text-center text-xs text-foreground/40"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 py-2.5 text-xs font-medium text-foreground/50 transition hover:border-accent hover:text-accent"
          >
            <Plus className="h-3 w-3" /> Add Exercise
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-foreground/10 bg-background/95 p-4 backdrop-blur">
        <button
          onClick={handleComplete}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-bold text-black transition hover:bg-accent-dark"
        >
          <Trophy className="h-4 w-4" />
          Finish Workout
        </button>
      </div>

      {/* Cancel confirmation */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={() => setShowConfirmCancel(false)}>
          <div className="mx-4 w-full max-w-xs rounded-2xl bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-center font-bold">Cancel Workout?</h3>
            <p className="mb-4 text-center text-xs text-foreground/50">
              Your progress will not be saved.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 rounded-lg border border-foreground/20 py-2 text-sm font-medium transition hover:bg-foreground/5"
              >
                Keep Going
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
