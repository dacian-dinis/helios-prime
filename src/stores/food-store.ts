"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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
  loadFromStorage: (userId: string) => Promise<void>;
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

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useFoodStore = create<FoodState>((set, get) => ({
  entries: [],
  water: [],
  notes: [],

  loadFromStorage: async (userId) => {
    try {
      const [{ data: entries, error: e1 }, { data: water, error: e2 }, { data: notes, error: e3 }] = await Promise.all([
        supabase.from('food_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('water_entries').select('*').eq('user_id', userId),
        supabase.from('daily_notes').select('*').eq('user_id', userId),
      ]);
      if (e1) console.error('Failed to load food entries:', e1.message);
      if (e2) console.error('Failed to load water entries:', e2.message);
      if (e3) console.error('Failed to load daily notes:', e3.message);
      set({
        entries: (entries || []).map((e: Record<string, unknown>) => ({
          id: e.id,
          date: e.date,
          mealType: e.meal_type,
          name: e.name,
          servingSize: e.serving_size,
          calories: e.calories,
          protein: e.protein,
          carbs: e.carbs,
          fat: e.fat,
          createdAt: e.created_at,
        })) as FoodEntry[],
        water: (water || []).map((w: Record<string, unknown>) => ({
          date: w.date,
          ml: w.ml,
        })) as WaterEntry[],
        notes: (notes || []).map((n: Record<string, unknown>) => ({
          date: n.date,
          energyLevel: n.energy_level,
          note: n.note,
        })) as DailyNote[],
      });
    } catch (err) {
      console.error('Failed to load food data:', err);
    }
  },

  addEntry: async (userId, entry) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    const entries = [...get().entries, newEntry];
    set({ entries });
    const { error } = await supabase.from('food_entries').insert({
      id: newEntry.id,
      user_id: userId,
      date: newEntry.date,
      meal_type: newEntry.mealType,
      name: newEntry.name,
      serving_size: newEntry.servingSize,
      calories: newEntry.calories,
      protein: newEntry.protein,
      carbs: newEntry.carbs,
      fat: newEntry.fat,
      created_at: newEntry.createdAt,
    });
    if (error) console.error('Failed to add food entry:', error.message);
  },

  deleteEntry: async (userId, id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    const { error } = await supabase.from('food_entries').delete().eq('id', id);
    if (error) console.error('Failed to delete food entry:', error.message);
  },

  editEntry: async (userId, id, updates) => {
    const entries = get().entries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    set({ entries });
    const snakeUpdates: Record<string, unknown> = {};
    if (updates.mealType !== undefined) snakeUpdates.meal_type = updates.mealType;
    if (updates.servingSize !== undefined) snakeUpdates.serving_size = updates.servingSize;
    if (updates.name !== undefined) snakeUpdates.name = updates.name;
    if (updates.calories !== undefined) snakeUpdates.calories = updates.calories;
    if (updates.protein !== undefined) snakeUpdates.protein = updates.protein;
    if (updates.carbs !== undefined) snakeUpdates.carbs = updates.carbs;
    if (updates.fat !== undefined) snakeUpdates.fat = updates.fat;
    if (updates.date !== undefined) snakeUpdates.date = updates.date;
    const { error } = await supabase.from('food_entries').update(snakeUpdates).eq('id', id);
    if (error) console.error('Failed to edit food entry:', error.message);
  },

  addWater: async (userId, date, ml) => {
    const water = [...get().water];
    const existing = water.find((w) => w.date === date);
    if (existing) {
      existing.ml += ml;
    } else {
      water.push({ date, ml });
    }
    const newTotal = water.find((w) => w.date === date)!.ml;
    set({ water });
    const { error } = await supabase.from('water_entries').upsert({ user_id: userId, date, ml: newTotal });
    if (error) console.error('Failed to save water entry:', error.message);
  },

  getWater: (date) => {
    return get().water.find((w) => w.date === date)?.ml || 0;
  },

  saveNote: async (userId, note) => {
    const notes = get().notes.filter((n) => n.date !== note.date);
    notes.push(note);
    set({ notes });
    const { error } = await supabase.from('daily_notes').upsert({
      user_id: userId,
      date: note.date,
      energy_level: note.energyLevel,
      note: note.note,
    });
    if (error) console.error('Failed to save daily note:', error.message);
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
