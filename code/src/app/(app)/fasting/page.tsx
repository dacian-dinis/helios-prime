"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useFastingStore,
  FASTING_PRESETS,
} from "@/stores/fasting-store";
import {
  Timer,
  Play,
  Square,
  Flame,
  Trophy,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getElapsedMs(startedAt: string) {
  return Date.now() - new Date(startedAt).getTime();
}

function getProgressPercent(startedAt: string, targetHours: number) {
  const elapsed = getElapsedMs(startedAt);
  const target = targetHours * 60 * 60 * 1000;
  return Math.min(100, (elapsed / target) * 100);
}

function getFastingZone(hours: number) {
  if (hours < 4) return { name: "Fed State", color: "text-foreground/50", desc: "Body digesting recent meal" };
  if (hours < 12) return { name: "Early Fasting", color: "text-blue-400", desc: "Blood sugar stabilizing, insulin dropping" };
  if (hours < 16) return { name: "Fat Burning", color: "text-amber-400", desc: "Body switching to fat for fuel" };
  if (hours < 24) return { name: "Ketosis", color: "text-orange-400", desc: "Deep fat burning, ketone production up" };
  return { name: "Deep Ketosis", color: "text-red-400", desc: "Maximum autophagy and fat oxidation" };
}

export default function FastingPage() {
  const { user, isLoading, loadFromStorage } = useAuthStore();
  const {
    activeSession,
    history,
    favoritePreset,
    loadFromStorage: loadFasting,
    startFast,
    completeFast,
    cancelFast,
    setFavoritePreset,
    getStreak,
    getCompletedThisWeek,
    getTotalHoursFasted,
  } = useFastingStore();

  const [now, setNow] = useState(Date.now());
  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [customHours, setCustomHours] = useState(16);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) loadFasting(user.id);
  }, [user, loadFasting]);

  // Timer tick
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = useCallback(
    (presetId: string, hours: number) => {
      if (!user) return;
      startFast(user.id, presetId, hours);
      setShowPresets(false);
    },
    [user, startFast]
  );

  if (isLoading || !user) return null;

  const streak = getStreak();
  const thisWeek = getCompletedThisWeek();
  const totalHours = getTotalHoursFasted();
  const completedFasts = history.filter((s) => !s.cancelled);
  const recentHistory = [...history].reverse().slice(0, 20);

  const elapsedMs = activeSession ? getElapsedMs(activeSession.startedAt) : 0;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const progress = activeSession ? getProgressPercent(activeSession.startedAt, activeSession.targetHours) : 0;
  const zone = activeSession ? getFastingZone(elapsedHours) : null;
  const targetMs = activeSession ? activeSession.targetHours * 60 * 60 * 1000 : 0;
  const remainingMs = activeSession ? Math.max(0, targetMs - elapsedMs) : 0;
  const isComplete = activeSession && elapsedMs >= targetMs;

  // Ring SVG
  const ringSize = 220;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="pb-24 md:pb-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Timer className="h-5 w-5 text-accent" />
          Fasting Tracker
        </h1>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
          <Flame className="mx-auto mb-1 h-4 w-4 text-orange-400" />
          <p className="text-lg font-bold">{streak}</p>
          <p className="text-[10px] text-foreground/40">Day Streak</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
          <Trophy className="mx-auto mb-1 h-4 w-4 text-amber-400" />
          <p className="text-lg font-bold">{thisWeek}</p>
          <p className="text-[10px] text-foreground/40">This Week</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 text-center">
          <Clock className="mx-auto mb-1 h-4 w-4 text-accent" />
          <p className="text-lg font-bold">{Math.round(totalHours)}</p>
          <p className="text-[10px] text-foreground/40">Total Hours</p>
        </div>
      </div>

      {/* Active Timer */}
      {activeSession ? (
        <div className="mb-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <div className="flex flex-col items-center">
            {/* Ring Timer */}
            <div className="relative mb-4">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-foreground/10"
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className={isComplete ? "text-accent" : "text-accent/80"}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isComplete ? (
                  <>
                    <CheckCircle2 className="mb-1 h-6 w-6 text-accent" />
                    <p className="text-2xl font-bold text-accent">Done!</p>
                    <p className="text-xs text-foreground/40">
                      +{formatDuration(elapsedMs - targetMs)} extra
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold tabular-nums">
                      {formatDuration(remainingMs)}
                    </p>
                    <p className="text-[10px] text-foreground/40">remaining</p>
                  </>
                )}
              </div>
            </div>

            {/* Zone */}
            {zone && (
              <div className="mb-4 flex items-center gap-2">
                <Zap className={`h-3.5 w-3.5 ${zone.color}`} />
                <span className={`text-xs font-semibold ${zone.color}`}>{zone.name}</span>
                <span className="text-[10px] text-foreground/30">— {zone.desc}</span>
              </div>
            )}

            {/* Time info */}
            <div className="mb-4 flex gap-6 text-center">
              <div>
                <p className="text-xs text-foreground/40">Elapsed</p>
                <p className="text-sm font-semibold tabular-nums">{formatDuration(elapsedMs)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/40">Target</p>
                <p className="text-sm font-semibold">{activeSession.targetHours}h</p>
              </div>
              <div>
                <p className="text-xs text-foreground/40">Protocol</p>
                <p className="text-sm font-semibold">{activeSession.presetId}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isComplete ? (
                <button
                  onClick={() => completeFast(user.id)}
                  className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Fast
                </button>
              ) : (
                <>
                  <button
                    onClick={() => completeFast(user.id)}
                    className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
                  >
                    <Square className="h-3.5 w-3.5" />
                    End Early
                  </button>
                  <button
                    onClick={() => cancelFast(user.id)}
                    className="rounded-lg border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground/60 transition hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Start Fast */
        <div className="mb-6">
          {/* Quick Start — favorite or default */}
          <button
            onClick={() => {
              const preset = FASTING_PRESETS.find((p) => p.id === (favoritePreset || "16:8"))!;
              handleStart(preset.id, preset.fastHours);
            }}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-sm font-bold text-black transition hover:bg-accent-dark"
          >
            <Play className="h-5 w-5" />
            Start {favoritePreset || "16:8"} Fast
          </button>

          {/* Preset selector */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="mb-3 flex w-full items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3 text-sm font-medium transition hover:border-accent/30"
          >
            Choose Protocol
            {showPresets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showPresets && (
            <div className="mb-4 space-y-2">
              {FASTING_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3 transition hover:border-accent/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{preset.name}</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] text-foreground/50">
                        {preset.fastHours}h fast / {preset.eatHours}h eat
                      </span>
                      {favoritePreset === preset.id && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-foreground/40">{preset.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFavoritePreset(user.id, preset.id)}
                      className="rounded-lg p-1.5 text-foreground/30 transition hover:text-amber-400"
                      title="Set as favorite"
                    >
                      <Star className={`h-3.5 w-3.5 ${favoritePreset === preset.id ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleStart(preset.id, preset.fastHours)}
                      className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}

              {/* Custom */}
              <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                <div className="flex-1">
                  <span className="text-sm font-semibold">Custom</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={customHours}
                      onChange={(e) => setCustomHours(Number(e.target.value))}
                      className="w-16 rounded-lg border border-foreground/10 bg-background px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-foreground/40">hours</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStart("custom", customHours)}
                  className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
                >
                  Start
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-foreground/50"
        >
          <span>History ({completedFasts.length} completed)</span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showHistory && (
          <div className="space-y-2">
            {recentHistory.length === 0 ? (
              <p className="py-6 text-center text-xs text-foreground/30">No fasting history yet</p>
            ) : (
              recentHistory.map((session) => {
                const start = new Date(session.startedAt);
                const end = session.completedAt ? new Date(session.completedAt) : null;
                const durationMs = end ? end.getTime() - start.getTime() : 0;
                const durationHours = durationMs / (1000 * 60 * 60);
                const hitTarget = !session.cancelled && durationHours >= session.targetHours;

                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3"
                  >
                    {session.cancelled ? (
                      <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                    ) : hitTarget ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{session.presetId}</span>
                        <span className="text-[10px] text-foreground/30">
                          {start.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/40">
                        {durationHours.toFixed(1)}h / {session.targetHours}h target
                        {session.cancelled && " — cancelled"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
