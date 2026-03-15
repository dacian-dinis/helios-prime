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
  Ruler,
  Save,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useProgressStore } from "@/stores/progress-store";
import { useSubscriptionStore, type ProFeature } from "@/stores/subscription-store";
import { PaywallModal } from "@/components/paywall-modal";
import { Crown } from "lucide-react";
import PlanBuilder from "@/components/workout/plan-builder";
import ActiveSession from "@/components/workout/active-session";
import WorkoutHistory from "@/components/workout/workout-history";
import AIGenerator from "@/components/workout/ai-generator";

type Tab = "plans" | "history" | "body";

export default function WorkoutsPage() {
  const { user, profile } = useAuthStore();
  const {
    plans,
    activeSession,
    startSession,
    startEmptySession,
    deletePlan,
  } = useWorkoutStore();
  const {
    measurements,
    weightLog,
    loadFromStorage: loadProgress,
    saveMeasurement,
    addWeight,
  } = useProgressStore();

  const [tab, setTab] = useState<Tab>("plans");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | undefined>();
  const [showAI, setShowAI] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<ProFeature | null>(null);
  const { isPro } = useSubscriptionStore();

  // Body measurement form
  const [mWeight, setMWeight] = useState("");
  const [mBodyFat, setMBodyFat] = useState("");
  const [mChest, setMChest] = useState("");
  const [mWaist, setMWaist] = useState("");
  const [mArms, setMArms] = useState("");
  const [measureSaved, setMeasureSaved] = useState(false);

  useEffect(() => {
    if (user) loadProgress(user.id);
  }, [user, loadProgress]);

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
          { id: "body" as Tab, label: "Body", icon: Ruler },
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
            onClick={() => isPro() ? setShowAI(true) : setPaywallFeature("ai-workout-generator")}
            className="mb-4 flex w-full items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-left transition hover:bg-accent/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                AI Workout Generator
                {!isPro() && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">PRO</span>}
              </p>
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

      {tab === "body" && (
        <div className="space-y-4">
          {/* Log Measurement Form */}
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-bold">Log Measurements</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mWeight}
                  onChange={(e) => setMWeight(e.target.value)}
                  placeholder="75.0"
                  className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  value={mBodyFat}
                  onChange={(e) => setMBodyFat(e.target.value)}
                  placeholder="15.0"
                  className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mChest}
                  onChange={(e) => setMChest(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mWaist}
                  onChange={(e) => setMWaist(e.target.value)}
                  placeholder="80"
                  className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Arms (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mArms}
                  onChange={(e) => setMArms(e.target.value)}
                  placeholder="35"
                  className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                if (mWeight) {
                  addWeight(user.id, { date: today, weightKg: parseFloat(mWeight) });
                }
                saveMeasurement(user.id, {
                  date: today,
                  chest: mChest ? parseFloat(mChest) : undefined,
                  waist: mWaist ? parseFloat(mWaist) : undefined,
                  leftArm: mArms ? parseFloat(mArms) : undefined,
                  rightArm: mArms ? parseFloat(mArms) : undefined,
                });
                setMWeight(""); setMBodyFat(""); setMChest(""); setMWaist(""); setMArms("");
                setMeasureSaved(true);
                setTimeout(() => setMeasureSaved(false), 2000);
              }}
              disabled={!mWeight && !mChest && !mWaist && !mArms}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              {measureSaved ? "Saved!" : "Save Measurement"}
            </button>
          </div>

          {/* Recent History */}
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
            <h3 className="mb-3 text-sm font-bold">Recent Entries</h3>
            {measurements.length === 0 && weightLog.length === 0 ? (
              <p className="py-6 text-center text-xs text-foreground/40">
                No measurements logged yet. Start tracking above!
              </p>
            ) : (
              <div className="space-y-3">
                {[...weightLog].reverse().slice(0, 3).map((w, i, arr) => {
                  const m = measurements.find((m) => m.date === w.date);
                  const prev = arr[i + 1];
                  const trend = prev ? w.weightKg - prev.weightKg : 0;
                  return (
                    <div
                      key={w.date}
                      className="rounded-xl border border-foreground/10 bg-background p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground/50">{w.date}</span>
                        {trend !== 0 && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend < 0 ? "text-green-400" : "text-red-400"}`}>
                            {trend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            {trend > 0 ? "+" : ""}{trend.toFixed(1)} kg
                          </span>
                        )}
                        {trend === 0 && prev && (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-foreground/30">
                            <Minus className="h-3 w-3" /> 0.0 kg
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold">{w.weightKg}</p>
                          <p className="text-[9px] text-foreground/40">kg</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{m?.chest ?? "—"}</p>
                          <p className="text-[9px] text-foreground/40">Chest</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{m?.waist ?? "—"}</p>
                          <p className="text-[9px] text-foreground/40">Waist</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{m?.leftArm ?? "—"}</p>
                          <p className="text-[9px] text-foreground/40">Arms</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Paywall Modal */}
      {paywallFeature && (
        <PaywallModal feature={paywallFeature} onClose={() => setPaywallFeature(null)} />
      )}
    </div>
  );
}
