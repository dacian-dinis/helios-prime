"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface FastingPreset {
  id: string;
  name: string;
  fastHours: number;
  eatHours: number;
  description: string;
}

export const FASTING_PRESETS: FastingPreset[] = [
  { id: "16:8", name: "16:8", fastHours: 16, eatHours: 8, description: "Most popular — skip breakfast, eat noon to 8pm" },
  { id: "18:6", name: "18:6", fastHours: 18, eatHours: 6, description: "Intermediate — 6 hour eating window" },
  { id: "20:4", name: "20:4", fastHours: 20, eatHours: 4, description: "Warrior Diet — one large meal + snacks" },
  { id: "23:1", name: "OMAD", fastHours: 23, eatHours: 1, description: "One Meal A Day — maximum fat burning" },
  { id: "14:10", name: "14:10", fastHours: 14, eatHours: 10, description: "Beginner friendly — gentle introduction" },
];

export interface FastingSession {
  id: string;
  startedAt: string; // ISO
  targetHours: number;
  presetId: string;
  completedAt?: string; // ISO
  cancelled?: boolean;
}

interface FastingState {
  activeSession: FastingSession | null;
  history: FastingSession[];
  favoritePreset: string | null;

  loadFromStorage: (userId: string) => Promise<void>;
  startFast: (userId: string, presetId: string, targetHours: number) => void;
  completeFast: (userId: string) => void;
  cancelFast: (userId: string) => void;
  setFavoritePreset: (userId: string, presetId: string) => void;
  getStreak: () => number;
  getCompletedThisWeek: () => number;
  getTotalHoursFasted: () => number;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useFastingStore = create<FastingState>((set, get) => ({
  activeSession: null,
  history: [],
  favoritePreset: null,

  loadFromStorage: async (userId) => {
    try {
      const [{ data: sessions, error: e1 }, { data: active, error: e2 }, { data: prefs, error: e3 }] = await Promise.all([
        supabase.from('fasting_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: true }),
        supabase.from('fasting_active').select('*').eq('user_id', userId),
        supabase.from('fasting_preferences').select('*').eq('user_id', userId),
      ]);
      if (e1) console.error('Failed to load fasting sessions:', e1.message);
      if (e2) console.error('Failed to load active fast:', e2.message);
      if (e3) console.error('Failed to load fasting preferences:', e3.message);
      set({
        history: (sessions || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          startedAt: s.started_at,
          targetHours: s.target_hours,
          presetId: s.preset_id,
          completedAt: s.completed_at,
          cancelled: s.cancelled,
        })) as FastingSession[],
        activeSession: active && active.length > 0
          ? (() => {
              const a = active[0] as Record<string, unknown>;
              const sd = a.session_data as Record<string, unknown> | null;
              return {
                id: sd?.id ?? a.id,
                startedAt: sd?.startedAt ?? a.started_at,
                targetHours: sd?.targetHours ?? a.target_hours,
                presetId: sd?.presetId ?? a.preset_id,
              } as FastingSession;
            })()
          : null,
        favoritePreset: prefs && prefs.length > 0
          ? (prefs[0] as Record<string, unknown>).favorite_preset as string
          : null,
      });
    } catch (err) {
      console.error('Failed to load fasting data:', err);
    }
  },

  startFast: (userId, presetId, targetHours) => {
    const session: FastingSession = {
      id: genId(),
      startedAt: new Date().toISOString(),
      targetHours,
      presetId,
    };
    set({ activeSession: session });
    supabase.from('fasting_active').upsert({ user_id: userId, session_data: session })
      .then(({ error }) => { if (error) console.error('Failed to start fast:', error.message); });
  },

  completeFast: async (userId) => {
    const session = get().activeSession;
    if (!session) return;
    const completed = { ...session, completedAt: new Date().toISOString() };
    const history = [...get().history, completed];
    set({ activeSession: null, history });
    const { error: e1 } = await supabase.from('fasting_sessions').insert({
      id: completed.id,
      user_id: userId,
      started_at: completed.startedAt,
      target_hours: completed.targetHours,
      preset_id: completed.presetId,
      completed_at: completed.completedAt,
      cancelled: false,
    });
    if (e1) console.error('Failed to save completed fast:', e1.message);
    const { error: e2 } = await supabase.from('fasting_active').delete().eq('user_id', userId);
    if (e2) console.error('Failed to clear active fast:', e2.message);
  },

  cancelFast: async (userId) => {
    const session = get().activeSession;
    if (!session) return;
    const cancelled = { ...session, completedAt: new Date().toISOString(), cancelled: true };
    const history = [...get().history, cancelled];
    set({ activeSession: null, history });
    const { error: e1 } = await supabase.from('fasting_sessions').insert({
      id: cancelled.id,
      user_id: userId,
      started_at: cancelled.startedAt,
      target_hours: cancelled.targetHours,
      preset_id: cancelled.presetId,
      completed_at: cancelled.completedAt,
      cancelled: true,
    });
    if (e1) console.error('Failed to save cancelled fast:', e1.message);
    const { error: e2 } = await supabase.from('fasting_active').delete().eq('user_id', userId);
    if (e2) console.error('Failed to clear active fast:', e2.message);
  },

  setFavoritePreset: (userId, presetId) => {
    set({ favoritePreset: presetId });
    supabase.from('fasting_preferences').upsert({ user_id: userId, favorite_preset: presetId })
      .then(({ error }) => { if (error) console.error('Failed to save favorite preset:', error.message); });
  },

  getStreak: () => {
    const completed = get().history.filter((s) => !s.cancelled);
    if (completed.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const hasFast = completed.some((s) => {
        const startDate = s.startedAt.split("T")[0];
        const endDate = s.completedAt?.split("T")[0];
        return startDate === dateStr || endDate === dateStr;
      });

      if (hasFast) streak++;
      else if (i > 0) break;
    }
    return streak;
  },

  getCompletedThisWeek: () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return get().history.filter(
      (s) => !s.cancelled && new Date(s.startedAt) >= weekAgo
    ).length;
  },

  getTotalHoursFasted: () => {
    return get().history
      .filter((s) => !s.cancelled && s.completedAt)
      .reduce((total, s) => {
        const start = new Date(s.startedAt).getTime();
        const end = new Date(s.completedAt!).getTime();
        return total + (end - start) / (1000 * 60 * 60);
      }, 0);
  },
}));
