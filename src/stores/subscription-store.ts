"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type PlanType = "free" | "pro";

export interface Subscription {
  plan: PlanType;
  startedAt: string | null;
  expiresAt: string | null;
}

export const PRO_FEATURES = [
  "ai-body-analysis",
  "ai-workout-generator",
  "ai-health-score",
  "nutrition-trends",
  "unlimited-recipes",
  "priority-support",
] as const;

export type ProFeature = (typeof PRO_FEATURES)[number];

export const FEATURE_LABELS: Record<ProFeature, string> = {
  "ai-body-analysis": "AI Body Analysis",
  "ai-workout-generator": "AI Workout Generator",
  "ai-health-score": "AI Health Score",
  "nutrition-trends": "Advanced Nutrition Trends",
  "unlimited-recipes": "Unlimited Recipes",
  "priority-support": "Priority Support",
};

interface SubscriptionState {
  subscription: Subscription;
  isLoading: boolean;

  loadSubscription: (userId: string) => void;
  isPro: () => boolean;
  canAccess: (feature: ProFeature) => boolean;
  upgrade: (userId: string) => Promise<boolean>;
  downgrade: (userId: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: { plan: "free", startedAt: null, expiresAt: null },
  isLoading: true,

  loadSubscription: async (userId: string) => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) {
        set({
          subscription: {
            plan: data.plan,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  isPro: () => {
    const { plan, expiresAt } = get().subscription;
    if (plan !== "pro") return false;
    if (expiresAt && new Date(expiresAt) < new Date()) return false;
    return true;
  },

  canAccess: (feature: ProFeature) => {
    // Free tier limits
    if (feature === "unlimited-recipes") {
      // Free users get 5 recipes max — checked in recipe-store
      return get().isPro();
    }
    return get().isPro();
  },

  upgrade: async (userId: string) => {
    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);
    const sub: Subscription = {
      plan: "pro",
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    set({ subscription: sub });
    try {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: "pro",
        started_at: sub.startedAt,
        expires_at: sub.expiresAt,
      });
      return true;
    } catch {
      return false;
    }
  },

  downgrade: async (userId: string) => {
    const sub: Subscription = { plan: "free", startedAt: null, expiresAt: null };
    set({ subscription: sub });
    try {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: "free",
        started_at: null,
        expires_at: null,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
