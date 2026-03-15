"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Plus,
  X,
  Sparkles,
  Loader2,
  Dumbbell,
  Flame,
  Droplets,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
  Trash2,
  Camera,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useFoodStore } from "@/stores/food-store";
import { useWorkoutStore } from "@/stores/workout-store";
import { useProgressStore, type WeightEntry, type BodyMeasurement } from "@/stores/progress-store";
import { useSubscriptionStore, type ProFeature } from "@/stores/subscription-store";
import { PaywallModal } from "@/components/paywall-modal";
import BodyAnalysis from "@/components/progress/body-analysis";
import { Crown } from "lucide-react";

function today() {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export default function ProgressPage() {
  const { user, profile } = useAuthStore();
  const { entries: foodEntries, water, notes, loadFromStorage: loadFood, getDailyTotals, getWater } = useFoodStore();
  const { sessions, loadFromStorage: loadWorkouts } = useWorkoutStore();
  const {
    weightLog,
    measurements,
    loadFromStorage: loadProgress,
    addWeight,
    deleteWeight,
    saveMeasurement,
    deleteMeasurement,
    getLatestMeasurement,
  } = useProgressStore();

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [weightRange, setWeightRange] = useState(30); // days
  const [healthScore, setHealthScore] = useState<{
    score: number;
    grade: string;
    summary: string;
    tips: string[];
  } | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [showNutrition, setShowNutrition] = useState(true);
  const [showWorkoutStats, setShowWorkoutStats] = useState(true);
  const [showBodyAnalysis, setShowBodyAnalysis] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<ProFeature | null>(null);
  const { isPro } = useSubscriptionStore();

  useEffect(() => {
    if (user) {
      loadFood(user.id);
      loadWorkouts(user.id);
      loadProgress(user.id);
    }
  }, [user, loadFood, loadWorkouts, loadProgress]);

  if (!user || !profile) return null;

  // --- Weight chart data ---
  const chartEntries = weightLog.filter((w) => w.date >= daysAgo(weightRange));
  const minWeight = chartEntries.length > 0 ? Math.min(...chartEntries.map((w) => w.weightKg)) - 1 : profile.weightKg - 5;
  const maxWeight = chartEntries.length > 0 ? Math.max(...chartEntries.map((w) => w.weightKg)) + 1 : profile.weightKg + 5;
  const weightDiff = maxWeight - minWeight || 1;
  const latestWeight = chartEntries.length > 0 ? chartEntries[chartEntries.length - 1].weightKg : profile.weightKg;
  const firstWeight = chartEntries.length > 0 ? chartEntries[0].weightKg : profile.weightKg;
  const weightChange = latestWeight - firstWeight;

  // --- Nutrition stats (last 7 days) ---
  const last7Days = Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));
  const weeklyTotals = last7Days.map((d) => getDailyTotals(d));
  const avgCalories = Math.round(weeklyTotals.reduce((s, t) => s + t.calories, 0) / 7);
  const avgProtein = Math.round(weeklyTotals.reduce((s, t) => s + t.protein, 0) / 7);
  const avgCarbs = Math.round(weeklyTotals.reduce((s, t) => s + t.carbs, 0) / 7);
  const avgFat = Math.round(weeklyTotals.reduce((s, t) => s + t.fat, 0) / 7);
  const daysOnTarget = weeklyTotals.filter(
    (t) => t.calories > 0 && Math.abs(t.calories - profile.dailyCalories) / profile.dailyCalories < 0.1
  ).length;
  const calorieAdherence = Math.round((daysOnTarget / 7) * 100);
  const proteinDaysHit = weeklyTotals.filter((t) => t.protein >= profile.protein * 0.9).length;
  const proteinAdherence = Math.round((proteinDaysHit / 7) * 100);

  // --- Water stats ---
  const weeklyWater = last7Days.map((d) => getWater(d));
  const avgWater = Math.round(weeklyWater.reduce((s, w) => s + w, 0) / 7);
  const waterDaysHit = weeklyWater.filter((w) => w >= 2250).length; // 90% of 2500
  const waterAdherence = Math.round((waterDaysHit / 7) * 100);

  // --- Workout stats ---
  const thisWeekStart = daysAgo(6);
  const workoutsThisWeek = sessions.filter((s) => s.date >= thisWeekStart && s.completedAt).length;
  const totalSessions = sessions.filter((s) => s.completedAt).length;
  const totalVolume = sessions
    .filter((s) => s.completedAt)
    .reduce(
      (t, s) =>
        t + s.exercises.reduce((ev, e) => ev + e.sets.filter((st) => st.completed).reduce((sv, st) => sv + st.weight * st.reps, 0), 0),
      0
    );

  // --- Energy ---
  const weeklyEnergy = last7Days.map((d) => {
    const n = notes.find((note) => note.date === d);
    return n?.energyLevel || 0;
  });
  const energyDays = weeklyEnergy.filter((e) => e > 0);
  const avgEnergy = energyDays.length > 0 ? (energyDays.reduce((s, e) => s + e, 0) / energyDays.length).toFixed(1) : "—";

  // --- AI Health Score ---
  const fetchHealthScore = async () => {
    setLoadingScore(true);
    try {
      const res = await fetch("/api/ai/health-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: profile.goal,
          calorieTarget: profile.dailyCalories,
          calorieAdherence,
          proteinAdherence,
          avgWaterMl: avgWater,
          waterAdherence,
          workoutsThisWeek,
          workoutFrequency: profile.workoutFrequency,
          currentWeight: latestWeight,
          targetWeight: profile.targetWeightKg,
          avgEnergyLevel: avgEnergy,
        }),
      });
      const data = await res.json();
      setHealthScore(data);
    } catch {
      setHealthScore(null);
    } finally {
      setLoadingScore(false);
    }
  };

  // --- Measurement helpers ---
  const latestMeasurement = getLatestMeasurement();
  const measurementFields: { key: keyof BodyMeasurement; label: string }[] = [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "leftArm", label: "L. Arm" },
    { key: "rightArm", label: "R. Arm" },
    { key: "leftThigh", label: "L. Thigh" },
    { key: "rightThigh", label: "R. Thigh" },
    { key: "neck", label: "Neck" },
  ];

  // --- SVG chart ---
  const chartW = 500;
  const chartH = 140;
  const chartPad = 20;

  const chartPoints = chartEntries.map((w, i) => {
    const x = chartEntries.length > 1
      ? chartPad + (i / (chartEntries.length - 1)) * (chartW - chartPad * 2)
      : chartW / 2;
    const y = chartPad + ((maxWeight - w.weightKg) / weightDiff) * (chartH - chartPad * 2);
    return { x, y, ...w };
  });

  const linePath = chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath
    ? `${linePath} L ${chartPoints[chartPoints.length - 1]?.x} ${chartH - chartPad} L ${chartPoints[0]?.x} ${chartH - chartPad} Z`
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">Progress</h1>
        <p className="text-xs text-foreground/40">Track your journey and see how far you&apos;ve come</p>
      </div>

      {/* AI Health Score */}
      <div className="mb-5 rounded-2xl border border-accent/20 bg-accent/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold">AI Health Score</span>
          </div>
          {healthScore && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-accent">{healthScore.score}</span>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                {healthScore.grade}
              </span>
            </div>
          )}
        </div>

        {healthScore ? (
          <div>
            <p className="mb-3 text-xs text-foreground/60">{healthScore.summary}</p>
            <div className="space-y-1.5">
              {healthScore.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/50">
                  <Target className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
            <button
              onClick={fetchHealthScore}
              disabled={loadingScore}
              className="mt-3 text-[10px] font-medium text-accent transition hover:text-accent-dark"
            >
              Refresh Score
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-xs text-foreground/50">
              Get an AI-powered assessment based on your nutrition, workouts, and habits from the last 7 days.
            </p>
            <button
              onClick={() => isPro() ? fetchHealthScore() : setPaywallFeature("ai-health-score")}
              disabled={loadingScore}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition hover:bg-accent-dark disabled:opacity-50"
            >
              {loadingScore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Get My Score
                  {!isPro() && <Crown className="h-3 w-3 text-amber-500" />}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Body Analysis */}
      <button
        onClick={() => isPro() ? setShowBodyAnalysis(true) : setPaywallFeature("ai-body-analysis")}
        className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-left transition hover:bg-purple-500/10"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
          <Camera className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold flex items-center gap-2">
            AI Body Analysis
            {!isPro() && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">PRO</span>}
          </p>
          <p className="text-[10px] text-foreground/40">
            Upload a photo for physique assessment &amp; personalized advice
          </p>
        </div>
      </button>

      {/* Weight Tracking */}
      <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-bold">Weight</span>
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-1 rounded-lg bg-foreground/5 px-2.5 py-1 text-[10px] font-medium text-foreground/60 transition hover:bg-foreground/10"
          >
            <Plus className="h-3 w-3" /> Log Weight
          </button>
        </div>

        {/* Stats row */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-foreground/5 p-2 text-center">
            <p className="text-sm font-bold">{latestWeight} kg</p>
            <p className="text-[9px] text-foreground/40">Current</p>
          </div>
          <div className="rounded-lg bg-foreground/5 p-2 text-center">
            <p className="text-sm font-bold">{profile.targetWeightKg} kg</p>
            <p className="text-[9px] text-foreground/40">Target</p>
          </div>
          <div className="rounded-lg bg-foreground/5 p-2 text-center">
            <p className={`flex items-center justify-center gap-0.5 text-sm font-bold ${
              weightChange < 0 ? "text-green-500" : weightChange > 0 ? "text-red-400" : ""
            }`}>
              {weightChange > 0 && <TrendingUp className="h-3 w-3" />}
              {weightChange < 0 && <TrendingDown className="h-3 w-3" />}
              {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
            </p>
            <p className="text-[9px] text-foreground/40">Change ({weightRange}d)</p>
          </div>
        </div>

        {/* Range selector */}
        <div className="mb-3 flex gap-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setWeightRange(d)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition ${
                weightRange === d ? "bg-blue-400/20 text-blue-400" : "bg-foreground/5 text-foreground/40"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartEntries.length >= 2 ? (
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(96,165,250)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#weightGrad)" />
            <path d={linePath} fill="none" stroke="rgb(96,165,250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {chartPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(96,165,250)" />
            ))}
          </svg>
        ) : (
          <p className="py-6 text-center text-xs text-foreground/30">
            {chartEntries.length === 1 ? "Log at least 2 weights to see a chart" : "No weight entries yet — start logging!"}
          </p>
        )}
      </div>

      {/* Body Measurements */}
      <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-bold">Body Measurements</span>
          </div>
          <button
            onClick={() => setShowMeasureModal(true)}
            className="flex items-center gap-1 rounded-lg bg-foreground/5 px-2.5 py-1 text-[10px] font-medium text-foreground/60 transition hover:bg-foreground/10"
          >
            <Plus className="h-3 w-3" /> Measure
          </button>
        </div>

        {latestMeasurement ? (
          <div className="grid grid-cols-4 gap-2">
            {measurementFields.map((f) => {
              const val = latestMeasurement[f.key] as number | undefined;
              return val ? (
                <div key={f.key} className="rounded-lg bg-foreground/5 p-2 text-center">
                  <p className="text-xs font-bold">{val} cm</p>
                  <p className="text-[9px] text-foreground/40">{f.label}</p>
                </div>
              ) : null;
            })}
            <p className="col-span-4 text-[9px] text-foreground/30">
              Last measured: {new Date(latestMeasurement.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-foreground/30">
            No measurements yet — track your progress!
          </p>
        )}
      </div>

      {/* Nutrition Trends */}
      <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <button
          onClick={() => setShowNutrition(!showNutrition)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-bold">Nutrition (7-day avg)</span>
          </div>
          {showNutrition ? <ChevronUp className="h-4 w-4 text-foreground/30" /> : <ChevronDown className="h-4 w-4 text-foreground/30" />}
        </button>

        {showNutrition && (
          <div className="mt-3">
            {/* Calorie bar chart */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-foreground/50">Daily Calories</span>
                <span className="font-medium">{avgCalories} avg / {profile.dailyCalories} goal</span>
              </div>
              <div className="flex items-end gap-1" style={{ height: 60 }}>
                {last7Days.map((d, i) => {
                  const t = weeklyTotals[i];
                  const pct = profile.dailyCalories > 0 ? Math.min((t.calories / profile.dailyCalories) * 100, 120) : 0;
                  const onTarget = t.calories > 0 && Math.abs(t.calories - profile.dailyCalories) / profile.dailyCalories < 0.1;
                  return (
                    <div key={d} className="flex flex-1 flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-t-sm transition ${onTarget ? "bg-green-500" : t.calories > 0 ? "bg-orange-400/60" : "bg-foreground/10"}`}
                        style={{ height: `${Math.max(pct * 0.5, 2)}px` }}
                        title={`${t.calories} kcal`}
                      />
                      <span className="text-[8px] text-foreground/30">
                        {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex items-center gap-3 text-[9px] text-foreground/30">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" /> On target</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-orange-400/60" /> Off target</span>
              </div>
            </div>

            {/* Macro averages */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Protein", avg: avgProtein, target: profile.protein, color: "text-blue-400" },
                { label: "Carbs", avg: avgCarbs, target: profile.carbs, color: "text-amber-400" },
                { label: "Fat", avg: avgFat, target: profile.fat, color: "text-rose-400" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-foreground/5 p-2 text-center">
                  <p className={`text-xs font-bold ${m.color}`}>{m.avg}g</p>
                  <p className="text-[9px] text-foreground/40">{m.label} (avg)</p>
                  <p className="text-[8px] text-foreground/25">/ {m.target}g</p>
                </div>
              ))}
            </div>

            {/* Water + Adherence */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-foreground/5 p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Droplets className="h-3 w-3 text-sky-400" />
                  <p className="text-xs font-bold text-sky-400">{avgWater} ml</p>
                </div>
                <p className="text-[9px] text-foreground/40">Avg Water/day</p>
              </div>
              <div className="rounded-lg bg-foreground/5 p-2 text-center">
                <p className="text-xs font-bold">{calorieAdherence}%</p>
                <p className="text-[9px] text-foreground/40">Days on target</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workout Stats */}
      <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <button
          onClick={() => setShowWorkoutStats(!showWorkoutStats)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-400" />
            <span className="text-sm font-bold">Workout Stats</span>
          </div>
          {showWorkoutStats ? <ChevronUp className="h-4 w-4 text-foreground/30" /> : <ChevronDown className="h-4 w-4 text-foreground/30" />}
        </button>

        {showWorkoutStats && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-foreground/5 p-3 text-center">
              <p className="text-lg font-bold text-accent">{workoutsThisWeek}</p>
              <p className="text-[9px] text-foreground/40">This Week</p>
            </div>
            <div className="rounded-lg bg-foreground/5 p-3 text-center">
              <p className="text-lg font-bold">{totalSessions}</p>
              <p className="text-[9px] text-foreground/40">Total Sessions</p>
            </div>
            <div className="rounded-lg bg-foreground/5 p-3 text-center">
              <p className="text-lg font-bold">{(totalVolume / 1000).toFixed(1)}t</p>
              <p className="text-[9px] text-foreground/40">Total Volume</p>
            </div>
          </div>
        )}
      </div>

      {/* Energy Trend */}
      <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-bold">Energy Trend</span>
          <span className="text-xs text-foreground/40">Avg: {avgEnergy}/5</span>
        </div>
        <div className="flex gap-1">
          {last7Days.map((d, i) => {
            const level = weeklyEnergy[i];
            const emojis = ["", "😴", "😐", "🙂", "😊", "🔥"];
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-base">{level > 0 ? emojis[level] : "—"}</span>
                <span className="text-[8px] text-foreground/30">
                  {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weight Entry Modal */}
      {showWeightModal && (
        <WeightModal
          userId={user.id}
          currentWeight={latestWeight}
          onSave={(entry) => { addWeight(user.id, entry); setShowWeightModal(false); }}
          onClose={() => setShowWeightModal(false)}
        />
      )}

      {/* Measurement Modal */}
      {showMeasureModal && (
        <MeasurementModal
          userId={user.id}
          latest={latestMeasurement}
          fields={measurementFields}
          onSave={(m) => { saveMeasurement(user.id, m); setShowMeasureModal(false); }}
          onClose={() => setShowMeasureModal(false)}
        />
      )}

      {/* Body Analysis Modal */}
      {showBodyAnalysis && (
        <BodyAnalysis
          userProfile={{
            goal: profile.goal,
            weightKg: profile.weightKg,
            heightCm: profile.heightCm,
            workoutFrequency: profile.workoutFrequency,
          }}
          onClose={() => setShowBodyAnalysis(false)}
        />
      )}

      {/* Paywall Modal */}
      {paywallFeature && (
        <PaywallModal feature={paywallFeature} onClose={() => setPaywallFeature(null)} />
      )}
    </div>
  );
}

// --- Weight Modal ---
function WeightModal({
  userId,
  currentWeight,
  onSave,
  onClose,
}: {
  userId: string;
  currentWeight: number;
  onSave: (entry: WeightEntry) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState(currentWeight);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Log Weight</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-foreground/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-foreground/50">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today()}
            className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-[10px] text-foreground/50">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={() => weight > 0 && onSave({ date, weightKg: weight })}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// --- Measurement Modal ---
function MeasurementModal({
  userId,
  latest,
  fields,
  onSave,
  onClose,
}: {
  userId: string;
  latest?: BodyMeasurement;
  fields: { key: keyof BodyMeasurement; label: string }[];
  onSave: (m: BodyMeasurement) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(today());
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    fields.forEach((f) => {
      const prev = latest?.[f.key];
      if (typeof prev === "number") init[f.key] = prev;
    });
    return init;
  });

  const handleSave = () => {
    const m: BodyMeasurement = { date };
    fields.forEach((f) => {
      if (values[f.key]) {
        (m as unknown as Record<string, unknown>)[f.key] = values[f.key];
      }
    });
    onSave(m);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-background p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Body Measurements</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-foreground/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-foreground/50">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today()}
            className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-[10px] text-foreground/50">{f.label} (cm)</label>
              <input
                type="number"
                step="0.1"
                value={values[f.key] || ""}
                onChange={(e) => setValues({ ...values, [f.key]: Number(e.target.value) || 0 })}
                placeholder="—"
                className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
        >
          Save Measurements
        </button>
      </div>
    </div>
  );
}
