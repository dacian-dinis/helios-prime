"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface NotificationPreference {
  enabled: boolean;
  time: string; // "HH:mm"
}

export interface NotificationSettings {
  mealLogging: NotificationPreference;
  water: NotificationPreference;
  workout: NotificationPreference;
  fasting: NotificationPreference;
  weighIn: NotificationPreference;
}

interface SettingsState {
  units: "metric" | "imperial";
  theme: "system" | "light" | "dark";
  notifications: NotificationSettings;
  browserPermission: NotificationPermission;

  loadFromStorage: (userId: string) => Promise<void>;
  setUnits: (userId: string, units: "metric" | "imperial") => void;
  setTheme: (userId: string, theme: "system" | "light" | "dark") => void;
  updateNotification: (
    userId: string,
    key: keyof NotificationSettings,
    value: Partial<NotificationPreference>
  ) => void;
  setBrowserPermission: (permission: NotificationPermission) => void;
  resetAll: (userId: string) => void;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  mealLogging: { enabled: false, time: "12:00" },
  water: { enabled: false, time: "10:00" },
  workout: { enabled: false, time: "08:00" },
  fasting: { enabled: false, time: "20:00" },
  weighIn: { enabled: false, time: "07:00" },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    units: "metric",
    theme: "system",
    notifications: { ...DEFAULT_NOTIFICATIONS },
    browserPermission: "default",

    loadFromStorage: async (userId) => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (error) console.error('Failed to load settings:', error.message);
        if (data) {
          set({
            units: data.units || "metric",
            theme: data.theme || "system",
            notifications: { ...DEFAULT_NOTIFICATIONS, ...data.notifications },
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      if (typeof Notification !== "undefined") {
        set({ browserPermission: Notification.permission });
      }
    },

    setUnits: (userId, units) => {
      set({ units });
      const state = get();
      supabase.from('settings').upsert({
        user_id: userId,
        units,
        theme: state.theme,
        notifications: state.notifications,
      }).then(({ error }) => { if (error) console.error('Failed to save units:', error.message); });
    },

    setTheme: (userId, theme) => {
      set({ theme });
      const state = get();
      supabase.from('settings').upsert({
        user_id: userId,
        units: state.units,
        theme,
        notifications: state.notifications,
      }).then(({ error }) => { if (error) console.error('Failed to save theme:', error.message); });
    },

    updateNotification: (userId, key, value) => {
      const notifications = { ...get().notifications };
      notifications[key] = { ...notifications[key], ...value };
      set({ notifications });
      const state = get();
      supabase.from('settings').upsert({
        user_id: userId,
        units: state.units,
        theme: state.theme,
        notifications,
      }).then(({ error }) => { if (error) console.error('Failed to save notifications:', error.message); });
    },

    setBrowserPermission: (permission) => {
      set({ browserPermission: permission });
    },

    resetAll: async (userId) => {
      set({
        units: "metric",
        theme: "system",
        notifications: { ...DEFAULT_NOTIFICATIONS },
      });
      const { error } = await supabase.from('settings').delete().eq('user_id', userId);
      if (error) console.error('Failed to reset settings:', error.message);
    },
}));
