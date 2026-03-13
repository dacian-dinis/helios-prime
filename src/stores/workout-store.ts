import { create } from "zustand";

// --- Types ---

export interface PlanExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg, 0 = bodyweight
  restSeconds: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  muscleGroups: string[];
  exercises: PlanExercise[];
  estimatedMinutes: number;
  createdAt: string;
}

export interface SessionSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  planId?: string;
  planName: string;
  date: string;
  startedAt: string;
  completedAt?: string;
  exercises: SessionExercise[];
  notes?: string;
}

// --- Store ---

interface WorkoutState {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  activeSession: WorkoutSession | null;

  loadFromStorage: (userId: string) => void;
  addPlan: (userId: string, plan: Omit<WorkoutPlan, "id" | "createdAt">) => WorkoutPlan;
  updatePlan: (userId: string, id: string, updates: Partial<Omit<WorkoutPlan, "id" | "createdAt">>) => void;
  deletePlan: (userId: string, id: string) => void;

  startSession: (userId: string, plan: WorkoutPlan) => WorkoutSession;
  startEmptySession: (userId: string) => WorkoutSession;
  updateActiveSession: (userId: string, session: WorkoutSession) => void;
  completeSession: (userId: string) => void;
  cancelSession: (userId: string) => void;

  deleteSession: (userId: string, id: string) => void;
  getSessionsByDate: (date: string) => WorkoutSession[];
  getRecentSessions: (limit?: number) => WorkoutSession[];
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

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plans: [],
  sessions: [],
  activeSession: null,

  loadFromStorage: (userId) => {
    try {
      const plans = JSON.parse(localStorage.getItem(storageKey(userId, "workout_plans")) || "[]");
      const sessions = JSON.parse(localStorage.getItem(storageKey(userId, "workout_sessions")) || "[]");
      const active = JSON.parse(localStorage.getItem(storageKey(userId, "workout_active")) || "null");
      set({ plans, sessions, activeSession: active });
    } catch {
      set({ plans: [], sessions: [], activeSession: null });
    }
  },

  addPlan: (userId, plan) => {
    const newPlan: WorkoutPlan = {
      ...plan,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    const plans = [...get().plans, newPlan];
    set({ plans });
    persist(userId, "workout_plans", plans);
    return newPlan;
  },

  updatePlan: (userId, id, updates) => {
    const plans = get().plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
    set({ plans });
    persist(userId, "workout_plans", plans);
  },

  deletePlan: (userId, id) => {
    const plans = get().plans.filter((p) => p.id !== id);
    set({ plans });
    persist(userId, "workout_plans", plans);
  },

  startSession: (userId, plan) => {
    const session: WorkoutSession = {
      id: genId(),
      planId: plan.id,
      planName: plan.name,
      date: new Date().toISOString().split("T")[0],
      startedAt: new Date().toISOString(),
      exercises: plan.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        targetSets: e.sets,
        targetReps: e.reps,
        sets: Array.from({ length: e.sets }, () => ({
          reps: e.reps,
          weight: e.weight,
          completed: false,
        })),
      })),
    };
    set({ activeSession: session });
    persist(userId, "workout_active", session);
    return session;
  },

  startEmptySession: (userId) => {
    const session: WorkoutSession = {
      id: genId(),
      planName: "Quick Workout",
      date: new Date().toISOString().split("T")[0],
      startedAt: new Date().toISOString(),
      exercises: [],
    };
    set({ activeSession: session });
    persist(userId, "workout_active", session);
    return session;
  },

  updateActiveSession: (userId, session) => {
    set({ activeSession: session });
    persist(userId, "workout_active", session);
  },

  completeSession: (userId) => {
    const active = get().activeSession;
    if (!active) return;
    const completed: WorkoutSession = {
      ...active,
      completedAt: new Date().toISOString(),
    };
    const sessions = [completed, ...get().sessions];
    set({ sessions, activeSession: null });
    persist(userId, "workout_sessions", sessions);
    localStorage.removeItem(storageKey(userId, "workout_active"));
  },

  cancelSession: (userId) => {
    set({ activeSession: null });
    localStorage.removeItem(storageKey(userId, "workout_active"));
  },

  deleteSession: (userId, id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    set({ sessions });
    persist(userId, "workout_sessions", sessions);
  },

  getSessionsByDate: (date) => {
    return get().sessions.filter((s) => s.date === date);
  },

  getRecentSessions: (limit = 10) => {
    return get().sessions.slice(0, limit);
  },
}));
