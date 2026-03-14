import { create } from "zustand";

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

  loadFromStorage: (userId: string) => void;
  startFast: (userId: string, presetId: string, targetHours: number) => void;
  completeFast: (userId: string) => void;
  cancelFast: (userId: string) => void;
  setFavoritePreset: (userId: string, presetId: string) => void;
  getStreak: () => number;
  getCompletedThisWeek: () => number;
  getTotalHoursFasted: () => number;
}

function storageKey(userId: string, type: string) {
  return `hp_${type}_${userId}`;
}

function persist(userId: string, type: string, data: unknown) {
  localStorage.setItem(storageKey(userId, type), JSON.stringify(data));
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useFastingStore = create<FastingState>((set, get) => ({
  activeSession: null,
  history: [],
  favoritePreset: null,

  loadFromStorage: (userId) => {
    try {
      const activeSession = JSON.parse(localStorage.getItem(storageKey(userId, "fasting_active")) || "null");
      const history = JSON.parse(localStorage.getItem(storageKey(userId, "fasting_history")) || "[]");
      const favoritePreset = localStorage.getItem(storageKey(userId, "fasting_fav")) || null;
      set({ activeSession, history, favoritePreset });
    } catch {
      set({ activeSession: null, history: [], favoritePreset: null });
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
    persist(userId, "fasting_active", session);
  },

  completeFast: (userId) => {
    const session = get().activeSession;
    if (!session) return;
    const completed = { ...session, completedAt: new Date().toISOString() };
    const history = [...get().history, completed];
    set({ activeSession: null, history });
    persist(userId, "fasting_active", null);
    persist(userId, "fasting_history", history);
  },

  cancelFast: (userId) => {
    const session = get().activeSession;
    if (!session) return;
    const cancelled = { ...session, completedAt: new Date().toISOString(), cancelled: true };
    const history = [...get().history, cancelled];
    set({ activeSession: null, history });
    persist(userId, "fasting_active", null);
    persist(userId, "fasting_history", history);
  },

  setFavoritePreset: (userId, presetId) => {
    set({ favoritePreset: presetId });
    localStorage.setItem(storageKey(userId, "fasting_fav"), presetId);
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
