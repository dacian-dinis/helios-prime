"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  goal: "lose" | "maintain" | "gain";
  targetWeightKg: number;
  pace: number; // 0-100
  activityLevel: "sedentary" | "lightly_active" | "active" | "very_active";
  workoutFrequency: "0-2" | "3-5" | "6+";
  diet: string;
  obstacles: string[];
  addBackCalories: boolean;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  onboardingComplete: boolean;
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    gender: row.gender as string,
    dateOfBirth: row.date_of_birth as string,
    heightCm: row.height_cm as number,
    weightKg: row.weight_kg as number,
    bodyFatPercent: row.body_fat_percent as number | undefined,
    goal: row.goal as string,
    targetWeightKg: row.target_weight_kg as number,
    pace: row.pace as number,
    activityLevel: row.activity_level as string,
    workoutFrequency: row.workout_frequency as string,
    diet: row.diet as string,
    obstacles: row.obstacles as string[],
    addBackCalories: row.add_back_calories as boolean,
    dailyCalories: row.daily_calories as number,
    protein: row.protein as number,
    carbs: row.carbs as number,
    fat: row.fat as number,
    onboardingComplete: row.onboarding_complete as boolean,
  } as UserProfile;
}

function toSnakeCase(profile: Partial<UserProfile>): Record<string, unknown> {
  const map: Record<string, string> = {
    dateOfBirth: "date_of_birth",
    heightCm: "height_cm",
    weightKg: "weight_kg",
    bodyFatPercent: "body_fat_percent",
    targetWeightKg: "target_weight_kg",
    activityLevel: "activity_level",
    workoutFrequency: "workout_frequency",
    addBackCalories: "add_back_calories",
    dailyCalories: "daily_calories",
    onboardingComplete: "onboarding_complete",
  };

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value === undefined) continue;
    const dbKey = map[key] || key;
    result[dbKey] = value;
  }
  return result;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile> & { name?: string }) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  loadFromStorage: async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        set({ isLoading: false });
        return;
      }

      const user: User = {
        id: authUser.id,
        email: authUser.email ?? "",
        name: authUser.user_metadata?.name ?? "",
        createdAt: authUser.created_at,
      };

      let profile: UserProfile | null = null;
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileRow) {
        profile = mapProfile(profileRow);
      }

      set({ user, profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) return false;

      const user: User = {
        id: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.name ?? "",
        createdAt: data.user.created_at,
      };

      let profile: UserProfile | null = null;
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileRow) {
        profile = mapProfile(profileRow);
      }

      set({ user, profile });
      return true;
    } catch {
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error || !data.user) return false;

      const user: User = {
        id: data.user.id,
        email: data.user.email ?? "",
        name: name,
        createdAt: data.user.created_at,
      };

      set({ user, profile: null });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (partial) => {
    const current = get().profile || ({} as UserProfile);
    const updated = { ...current, ...partial };
    const user = get().user;

    set({ profile: updated });

    if (user) {
      const snakeCaseFields = toSnakeCase(partial);
      if (partial.name !== undefined) {
        snakeCaseFields.name = partial.name;
      }
      await supabase
        .from("profiles")
        .update(snakeCaseFields)
        .eq("id", user.id);
    }
  },
}));
