"use client";

import { create } from "zustand";

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

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  loadFromStorage: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }
    const userData = localStorage.getItem("hp_user");
    const profileData = localStorage.getItem("hp_profile");
    set({
      user: userData ? JSON.parse(userData) : null,
      profile: profileData ? JSON.parse(profileData) : null,
      isLoading: false,
    });
  },

  login: (email, password) => {
    const users = JSON.parse(localStorage.getItem("hp_users") || "[]");
    const found = users.find(
      (u: { email: string; password: string }) =>
        u.email === email && u.password === password
    );
    if (!found) return false;
    const user: User = {
      id: found.id,
      email: found.email,
      name: found.name,
      createdAt: found.createdAt,
    };
    localStorage.setItem("hp_user", JSON.stringify(user));
    const profileData = localStorage.getItem(`hp_profile_${user.id}`);
    const profile = profileData ? JSON.parse(profileData) : null;
    if (profile) localStorage.setItem("hp_profile", JSON.stringify(profile));
    set({ user, profile });
    return true;
  },

  register: (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("hp_users") || "[]");
    if (users.some((u: { email: string }) => u.email === email)) return false;
    const newUser = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("hp_users", JSON.stringify(users));
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };
    localStorage.setItem("hp_user", JSON.stringify(user));
    set({ user, profile: null });
    return true;
  },

  logout: () => {
    localStorage.removeItem("hp_user");
    localStorage.removeItem("hp_profile");
    set({ user: null, profile: null });
  },

  updateProfile: (partial) => {
    const current = get().profile || ({} as UserProfile);
    const updated = { ...current, ...partial };
    const user = get().user;
    if (user) {
      localStorage.setItem(`hp_profile_${user.id}`, JSON.stringify(updated));
    }
    localStorage.setItem("hp_profile", JSON.stringify(updated));
    set({ profile: updated });
  },
}));
