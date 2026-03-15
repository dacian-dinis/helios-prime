"use client";

import { Trash2, Clock, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWorkoutStore, type WorkoutSession } from "@/stores/workout-store";

interface Props {
  userId: string;
}

export default function WorkoutHistory({ userId }: Props) {
  const { sessions, deleteSession } = useWorkoutStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="py-16 text-center">
        <Dumbbell className="mx-auto mb-3 h-10 w-10 text-foreground/20" />
        <p className="text-sm text-foreground/40">No workouts logged yet</p>
        <p className="text-xs text-foreground/30">Start a workout to see your history here</p>
      </div>
    );
  }

  const formatDuration = (session: WorkoutSession) => {
    if (!session.completedAt) return "—";
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.completedAt).getTime();
    const mins = Math.round((end - start) / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalSets = (s: WorkoutSession) => s.exercises.reduce((t, e) => t + e.sets.length, 0);
  const completedSets = (s: WorkoutSession) => s.exercises.reduce((t, e) => t + e.sets.filter((st) => st.completed).length, 0);
  const totalVolume = (s: WorkoutSession) =>
    s.exercises.reduce((t, e) => t + e.sets.filter((st) => st.completed).reduce((v, st) => v + st.weight * st.reps, 0), 0);

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s.id} className="rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <button
            onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            className="flex w-full items-center justify-between px-4 py-3"
          >
            <div className="text-left">
              <p className="text-sm font-semibold">{s.planName}</p>
              <div className="flex items-center gap-3 text-[10px] text-foreground/40">
                <span>{formatDate(s.date)}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(s)}
                </span>
                <span>{completedSets(s)}/{totalSets(s)} sets</span>
              </div>
            </div>
            {expandedId === s.id ? (
              <ChevronUp className="h-4 w-4 text-foreground/30" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/30" />
            )}
          </button>

          {expandedId === s.id && (
            <div className="border-t border-foreground/5 px-4 py-3">
              {/* Stats */}
              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-foreground/5 p-2 text-center">
                  <p className="text-xs font-bold text-accent">{s.exercises.length}</p>
                  <p className="text-[9px] text-foreground/40">Exercises</p>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2 text-center">
                  <p className="text-xs font-bold text-accent">{completedSets(s)}</p>
                  <p className="text-[9px] text-foreground/40">Sets Done</p>
                </div>
                <div className="rounded-lg bg-foreground/5 p-2 text-center">
                  <p className="text-xs font-bold text-accent">{totalVolume(s).toLocaleString()} kg</p>
                  <p className="text-[9px] text-foreground/40">Volume</p>
                </div>
              </div>

              {/* Exercises */}
              {s.exercises.map((ex, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="mb-1 text-xs font-medium">{ex.name}</p>
                  <div className="space-y-0.5">
                    {ex.sets.filter((st) => st.completed).map((st, si) => (
                      <p key={si} className="text-[10px] text-foreground/40">
                        Set {si + 1}: {st.weight > 0 ? `${st.weight} kg` : "BW"} x {st.reps}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(userId, s.id);
                }}
                className="mt-3 flex items-center gap-1 text-[10px] font-medium text-foreground/30 transition hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
