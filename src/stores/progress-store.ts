"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface BodyMeasurement {
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  neck?: number;
}

interface ProgressState {
  weightLog: WeightEntry[];
  measurements: BodyMeasurement[];

  loadFromStorage: (userId: string) => Promise<void>;
  addWeight: (userId: string, entry: WeightEntry) => void;
  deleteWeight: (userId: string, date: string) => void;
  saveMeasurement: (userId: string, m: BodyMeasurement) => void;
  deleteMeasurement: (userId: string, date: string) => void;
  getWeightTrend: (days: number) => WeightEntry[];
  getLatestMeasurement: () => BodyMeasurement | undefined;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightLog: [],
  measurements: [],

  loadFromStorage: async (userId) => {
    try {
      const [{ data: weights, error: e1 }, { data: measurements, error: e2 }] = await Promise.all([
        supabase.from('weight_log').select('*').eq('user_id', userId).order('date', { ascending: true }),
        supabase.from('body_measurements').select('*').eq('user_id', userId).order('date', { ascending: true }),
      ]);
      if (e1) console.error('Failed to load weight log:', e1.message);
      if (e2) console.error('Failed to load body measurements:', e2.message);
      set({
        weightLog: (weights || []).map((w: Record<string, unknown>) => ({
          date: w.date,
          weightKg: w.weight_kg,
          note: w.note,
        })) as WeightEntry[],
        measurements: (measurements || []).map((m: Record<string, unknown>) => ({
          date: m.date,
          chest: m.chest,
          waist: m.waist,
          hips: m.hips,
          leftArm: m.left_arm,
          rightArm: m.right_arm,
          leftThigh: m.left_thigh,
          rightThigh: m.right_thigh,
          neck: m.neck,
        })) as BodyMeasurement[],
      });
    } catch (err) {
      console.error('Failed to load progress data:', err);
    }
  },

  addWeight: async (userId, entry) => {
    const log = get().weightLog.filter((w) => w.date !== entry.date);
    log.push(entry);
    log.sort((a, b) => a.date.localeCompare(b.date));
    set({ weightLog: log });
    const { error } = await supabase.from('weight_log').upsert({
      user_id: userId,
      date: entry.date,
      weight_kg: entry.weightKg,
      note: entry.note,
    });
    if (error) console.error('Failed to save weight entry:', error.message);
  },

  deleteWeight: async (userId, date) => {
    const log = get().weightLog.filter((w) => w.date !== date);
    set({ weightLog: log });
    const { error } = await supabase.from('weight_log').delete().eq('user_id', userId).eq('date', date);
    if (error) console.error('Failed to delete weight entry:', error.message);
  },

  saveMeasurement: async (userId, m) => {
    const measurements = get().measurements.filter((x) => x.date !== m.date);
    measurements.push(m);
    measurements.sort((a, b) => a.date.localeCompare(b.date));
    set({ measurements });
    const { error } = await supabase.from('body_measurements').upsert({
      user_id: userId,
      date: m.date,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      left_arm: m.leftArm,
      right_arm: m.rightArm,
      left_thigh: m.leftThigh,
      right_thigh: m.rightThigh,
      neck: m.neck,
    });
    if (error) console.error('Failed to save measurement:', error.message);
  },

  deleteMeasurement: async (userId, date) => {
    const measurements = get().measurements.filter((x) => x.date !== date);
    set({ measurements });
    const { error } = await supabase.from('body_measurements').delete().eq('user_id', userId).eq('date', date);
    if (error) console.error('Failed to delete measurement:', error.message);
  },

  getWeightTrend: (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return get().weightLog.filter((w) => w.date >= cutoffStr);
  },

  getLatestMeasurement: () => {
    const m = get().measurements;
    return m.length > 0 ? m[m.length - 1] : undefined;
  },
}));
