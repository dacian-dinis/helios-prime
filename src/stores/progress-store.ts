import { create } from "zustand";

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

  loadFromStorage: (userId: string) => void;
  addWeight: (userId: string, entry: WeightEntry) => void;
  deleteWeight: (userId: string, date: string) => void;
  saveMeasurement: (userId: string, m: BodyMeasurement) => void;
  deleteMeasurement: (userId: string, date: string) => void;
  getWeightTrend: (days: number) => WeightEntry[];
  getLatestMeasurement: () => BodyMeasurement | undefined;
}

function storageKey(userId: string, type: string) {
  return `hp_${type}_${userId}`;
}

function persist(userId: string, type: string, data: unknown) {
  localStorage.setItem(storageKey(userId, type), JSON.stringify(data));
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightLog: [],
  measurements: [],

  loadFromStorage: (userId) => {
    try {
      const weightLog = JSON.parse(localStorage.getItem(storageKey(userId, "weight_log")) || "[]");
      const measurements = JSON.parse(localStorage.getItem(storageKey(userId, "measurements")) || "[]");
      set({ weightLog, measurements });
    } catch {
      set({ weightLog: [], measurements: [] });
    }
  },

  addWeight: (userId, entry) => {
    const log = get().weightLog.filter((w) => w.date !== entry.date);
    log.push(entry);
    log.sort((a, b) => a.date.localeCompare(b.date));
    set({ weightLog: log });
    persist(userId, "weight_log", log);
  },

  deleteWeight: (userId, date) => {
    const log = get().weightLog.filter((w) => w.date !== date);
    set({ weightLog: log });
    persist(userId, "weight_log", log);
  },

  saveMeasurement: (userId, m) => {
    const measurements = get().measurements.filter((x) => x.date !== m.date);
    measurements.push(m);
    measurements.sort((a, b) => a.date.localeCompare(b.date));
    set({ measurements });
    persist(userId, "measurements", measurements);
  },

  deleteMeasurement: (userId, date) => {
    const measurements = get().measurements.filter((x) => x.date !== date);
    set({ measurements });
    persist(userId, "measurements", measurements);
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
