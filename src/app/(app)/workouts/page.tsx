"use client";

import { useEffect, useState } from "react";
import {
  Dumbbell,
  Plus,
  Play,
  Pencil,
  Trash2,
  Sparkles,
  Clock,
  Zap,
  ListChecks,
  History,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkoutStore } from "@/stores/workout-store";
import PlanBuilder from "@/components/workout/plan-builder";
import ActiveSession from "@/components/workout/active-session";
import WorkoutHistory from "@/components/workout/workout-history";
import AIGenerator from "@/components/workout/ai-generator";

type Tab = "plans" | "history";

export default function WorkoutsPage() {
  const { user, profile } = useAuthStore();
  const {
    plans,
    activeSession,
    loadFromStorage,
    startSession,
    startEmptySession,
    deletePlan,
  } = useWorkoutStore();

  const [tab, setTab] = useState<Tab>("plans");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | undefined>();
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (user) loadFromStorage(user.id);
  }, [user, loadFromStorage]);

  if (!user || !profile) return null;

  if (activeSession) {
    return (
      <ActiveSession
        userId={user.id}
        onComplete={() => {}}
      />
    );
  }

  const handleStartPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    startSession(user.id, plan);
  };

  const handleQuickStart = () => {
    startEmptySession(user.id);
  };

  const handleEditPlan = (id: string) => {
    setEditPlanId(id);
    setShowBuilder(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Workouts</h1>
          <p className="text-xs text-foreground/40">Plan, track, and crush your sessions</p>
        </div>
        <button
          onClick={handleQuickStart}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black transition hover:bg-accent-dark"
        >
          <Zap className="h-3.5 w-3.5" />
          Quick Start
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-foreground/5 p-1">
        {[
          { id: "plans" as Tab, label: "My Plans", icon: ListChecks },
          { id: "history" as Tab, label: "History", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/40 hover:text-foreground/60"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <>
          {/* AI Generate button */}
          <button
            onClick={() => setShowAI(true)}
            className="mb-4 flex w-full items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-left transition hover:bg-accent/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Workout Generator</p>
              <p className="text-[10px] text-foreground/40">
                Get personalized plans based on your goals
              </p>
            </div>
          </button>

          {/* Plans list */}
          {plans.length === 0 ? (
            <div className="py-12 text-center">
              <Dumbbell className="mx-auto mb-3 h-10 w-10 text-foreground/20" />
              <p className="mb-1 text-sm text-foreground/40">No workout plans yet</p>
              <p className="mb-4 text-xs text-foreground/30">
                Create your own or use AI to generate plans
              </p>
              <button
                onClick={() => { setEditPlanId(undefined); setShowBuilder(true); }}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition hover:bg-accent-dark"
              >
                Create First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-[10px] text-foreground/40">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-foreground/30">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        ~{plan.estimatedMinutes}m
                      </span>
                      <span>{plan.exercises.length} ex</span>
                    </div>
                  </div>

                  {/* Muscle groups */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {plan.muscleGroups.map((mg) => (
                      <span
                        key={mg}
                        className="rounded-full bg-foreground/5 px-2 py-0.5 text-[9px] font-medium capitalize text-foreground/40"
                      >
                        {mg.replace("_", " ")}
                      </span>
                    ))}
                  </div>

                  {/* Exercise preview */}
                  <div className="mb-3 space-y-1">
                    {plan.exercises.slice(0, 4).map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/60">{ex.name}</span>
                        <span className="text-[10px] text-foreground/25">
                          {ex.sets}x{ex.reps}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 4 && (
                      <p className="text-[10px] text-foreground/25">
                        +{plan.exercises.length - 4} more
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartPlan(plan.id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2 text-xs font-semibold text-black transition hover:bg-accent-dark"
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </button>
                    <button
                      onClick={() => handleEditPlan(plan.id)}
                      className="rounded-lg border border-foreground/15 p-2 text-foreground/40 transition hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deletePlan(user.id, plan.id)}
                      className="rounded-lg border border-foreground/15 p-2 text-foreground/40 transition hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAB to create plan */}
          {plans.length > 0 && (
            <button
              onClick={() => { setEditPlanId(undefined); setShowBuilder(true); }}
              className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-lg transition hover:bg-accent-dark md:bottom-6 md:right-6"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </>
      )}

      {tab === "history" && <WorkoutHistory userId={user.id} />}

      {/* Modals */}
      {showBuilder && (
        <PlanBuilder
          userId={user.id}
          editPlanId={editPlanId}
          onClose={() => { setShowBuilder(false); setEditPlanId(undefined); }}
        />
      )}

      {showAI && (
        <AIGenerator
          userId={user.id}
          userProfile={{
            goal: profile.goal,
            activityLevel: profile.activityLevel,
            workoutFrequency: profile.workoutFrequency,
          }}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
