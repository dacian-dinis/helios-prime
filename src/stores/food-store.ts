"use client";

import { create } from "zustand";

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface WaterEntry {
  date: string;
  ml: number;
}

export interface DailyNote {
  date: string;
  energyLevel: number; // 1-5
  note: string;
}

interface FoodState {
  entries: FoodEntry[];
  water: WaterEntry[];
  notes: DailyNote[];
  loadFromStorage: (userId: string) => void;
  addEntry: (userId: string, entry: Omit<FoodEntry, "id" | "createdAt">) => void;
  deleteEntry: (userId: string, id: string) => void;
  editEntry: (userId: string, id: string, updates: Partial<FoodEntry>) => void;
  addWater: (userId: string, date: string, ml: number) => void;
  getWater: (date: string) => number;
  saveNote: (userId: string, note: DailyNote) => void;
  getNote: (date: string) => DailyNote | undefined;
  getEntriesByDate: (date: string) => FoodEntry[];
  getDailyTotals: (date: string) => { calories: number; protein: number; carbs: number; fat: number };
  getRecentFoods: () => FoodEntry[];
  getFrequentFoods: () => { name: string; entry: Omit<FoodEntry, "id" | "createdAt" | "date" | "mealType">; count: number }[];
}

function storageKey(userId: string, type: string) {
  return `hp_${type}_${userId}`;
}

function persist(userId: string, type: string, data: unknown) {
  localStorage.setItem(storageKey(userId, type), JSON.stringify(data));
}

export const useFoodStore = create<FoodState>((set, get) => ({
  entries: [],
  water: [],
  notes: [],

  loadFromStorage: (userId) => {
    const entries = JSON.parse(localStorage.getItem(storageKey(userId, "food")) || "[]");
    const water = JSON.parse(localStorage.getItem(storageKey(userId, "water")) || "[]");
    const notes = JSON.parse(localStorage.getItem(storageKey(userId, "notes")) || "[]");
    set({ entries, water, notes });
  },

  addEntry: (userId, entry) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    const entries = [...get().entries, newEntry];
    set({ entries });
    persist(userId, "food", entries);
  },

  deleteEntry: (userId, id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    persist(userId, "food", entries);
  },

  editEntry: (userId, id, updates) => {
    const entries = get().entries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    set({ entries });
    persist(userId, "food", entries);
  },

  addWater: (userId, date, ml) => {
    const water = [...get().water];
    const existing = water.find((w) => w.date === date);
    if (existing) {
      existing.ml += ml;
    } else {
      water.push({ date, ml });
    }
    set({ water });
    persist(userId, "water", water);
  },

  getWater: (date) => {
    return get().water.find((w) => w.date === date)?.ml || 0;
  },

  saveNote: (userId, note) => {
    const notes = get().notes.filter((n) => n.date !== note.date);
    notes.push(note);
    set({ notes });
    persist(userId, "notes", notes);
  },

  getNote: (date) => {
    return get().notes.find((n) => n.date === date);
  },

  getEntriesByDate: (date) => {
    return get().entries.filter((e) => e.date === date);
  },

  getDailyTotals: (date) => {
    const dayEntries = get().entries.filter((e) => e.date === date);
    return dayEntries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },

  getRecentFoods: () => {
    const entries = get().entries;
    const seen = new Set<string>();
    return entries
      .slice()
      .reverse()
      .filter((e) => {
        if (seen.has(e.name)) return false;
        seen.add(e.name);
        return true;
      })
      .slice(0, 20);
  },

  getFrequentFoods: () => {
    const entries = get().entries;
    const counts = new Map<string, { entry: FoodEntry; count: number }>();
    entries.forEach((e) => {
      const existing = counts.get(e.name);
      if (existing) {
        existing.count++;
      } else {
        counts.set(e.name, { entry: e, count: 1 });
      }
    });
    return Array.from(counts.entries())
      .map(([name, { entry, count }]) => ({
        name,
        entry: {
          name: entry.name,
          servingSize: entry.servingSize,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
        },
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  },
}));
