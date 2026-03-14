"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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

  loadFromStorage: (userId: string) => Promise<void>;
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

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plans: [],
  sessions: [],
  activeSession: null,

  loadFromStorage: async (userId) => {
    try {
      const [{ data: plans, error: e1 }, { data: sessions, error: e2 }, { data: active, error: e3 }] = await Promise.all([
        supabase.from('workout_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('workout_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }),
        supabase.from('workout_active').select('*').eq('user_id', userId),
      ]);
      if (e1) console.error('Failed to load workout plans:', e1.message);
      if (e2) console.error('Failed to load workout sessions:', e2.message);
      if (e3) console.error('Failed to load active workout:', e3.message);
      set({
        plans: (plans || []).map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          muscleGroups: p.muscle_groups,
          exercises: p.exercises,
          estimatedMinutes: p.estimated_minutes,
          createdAt: p.created_at,
        })) as WorkoutPlan[],
        sessions: (sessions || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          planId: s.plan_id,
          planName: s.plan_name,
          date: s.date,
          startedAt: s.started_at,
          completedAt: s.completed_at,
          exercises: (s.session_data as Record<string, unknown>)?.exercises ?? s.exercises,
          notes: (s.session_data as Record<string, unknown>)?.notes ?? s.notes,
        })) as WorkoutSession[],
        activeSession: active && active.length > 0
          ? (() => {
              const a = active[0] as Record<string, unknown>;
              const sd = a.session_data as Record<string, unknown> | null;
              return {
                id: sd?.id ?? a.id,
                planId: sd?.planId ?? a.plan_id,
                planName: sd?.planName ?? a.plan_name,
                date: sd?.date ?? a.date,
                startedAt: sd?.startedAt ?? a.started_at,
                completedAt: sd?.completedAt ?? a.completed_at,
                exercises: sd?.exercises ?? [],
                notes: sd?.notes,
              } as WorkoutSession;
            })()
          : null,
      });
    } catch (err) {
      console.error('Failed to load workout data:', err);
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
    supabase.from('workout_plans').insert({
      id: newPlan.id,
      user_id: userId,
      name: newPlan.name,
      description: newPlan.description,
      muscle_groups: newPlan.muscleGroups,
      exercises: newPlan.exercises,
      estimated_minutes: newPlan.estimatedMinutes,
      created_at: newPlan.createdAt,
    }).then(({ error }) => { if (error) console.error('Failed to add workout plan:', error.message); });
    return newPlan;
  },

  updatePlan: (userId, id, updates) => {
    const plans = get().plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
    set({ plans });
    const snakeUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) snakeUpdates.name = updates.name;
    if (updates.description !== undefined) snakeUpdates.description = updates.description;
    if (updates.muscleGroups !== undefined) snakeUpdates.muscle_groups = updates.muscleGroups;
    if (updates.exercises !== undefined) snakeUpdates.exercises = updates.exercises;
    if (updates.estimatedMinutes !== undefined) snakeUpdates.estimated_minutes = updates.estimatedMinutes;
    supabase.from('workout_plans').update(snakeUpdates).eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to update workout plan:', error.message); });
  },

  deletePlan: (userId, id) => {
    const plans = get().plans.filter((p) => p.id !== id);
    set({ plans });
    supabase.from('workout_plans').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to delete workout plan:', error.message); });
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
    supabase.from('workout_active').upsert({ user_id: userId, session_data: session })
      .then(({ error }) => { if (error) console.error('Failed to save active session:', error.message); });
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
    supabase.from('workout_active').upsert({ user_id: userId, session_data: session })
      .then(({ error }) => { if (error) console.error('Failed to save active session:', error.message); });
    return session;
  },

  updateActiveSession: (userId, session) => {
    set({ activeSession: session });
    supabase.from('workout_active').upsert({ user_id: userId, session_data: session })
      .then(({ error }) => { if (error) console.error('Failed to update active session:', error.message); });
  },

  completeSession: async (userId) => {
    const active = get().activeSession;
    if (!active) return;
    const completed: WorkoutSession = {
      ...active,
      completedAt: new Date().toISOString(),
    };
    const sessions = [completed, ...get().sessions];
    set({ sessions, activeSession: null });
    const { error: e1 } = await supabase.from('workout_sessions').insert({
      id: completed.id,
      user_id: userId,
      plan_id: completed.planId,
      plan_name: completed.planName,
      date: completed.date,
      started_at: completed.startedAt,
      completed_at: completed.completedAt,
      exercises: completed.exercises,
      notes: completed.notes,
    });
    if (e1) console.error('Failed to save completed session:', e1.message);
    const { error: e2 } = await supabase.from('workout_active').delete().eq('user_id', userId);
    if (e2) console.error('Failed to clear active session:', e2.message);
  },

  cancelSession: async (userId) => {
    set({ activeSession: null });
    const { error } = await supabase.from('workout_active').delete().eq('user_id', userId);
    if (error) console.error('Failed to cancel session:', error.message);
  },

  deleteSession: (userId, id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    set({ sessions });
    supabase.from('workout_sessions').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to delete session:', error.message); });
  },

  getSessionsByDate: (date) => {
    return get().sessions.filter((s) => s.date === date);
  },

  getRecentSessions: (limit = 10) => {
    return get().sessions.slice(0, limit);
  },
}));
