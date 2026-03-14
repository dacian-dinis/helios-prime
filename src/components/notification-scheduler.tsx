"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore, type NotificationSettings } from "@/stores/settings-store";
import { showNotification, getNotificationMessage } from "@/lib/notifications";

export function NotificationScheduler() {
  const notifications = useSettingsStore((s) => s.notifications);
  const browserPermission = useSettingsStore((s) => s.browserPermission);
  const firedToday = useRef<Set<string>>(new Set());
  const lastDate = useRef<string>("");

  useEffect(() => {
    if (browserPermission !== "granted") return;

    const check = () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      // Reset fired set on new day
      if (todayStr !== lastDate.current) {
        firedToday.current = new Set();
        lastDate.current = todayStr;
      }

      const keys = Object.keys(notifications) as (keyof NotificationSettings)[];
      for (const key of keys) {
        const pref = notifications[key];
        if (pref.enabled && pref.time === currentTime && !firedToday.current.has(key)) {
          firedToday.current.add(key);
          const msg = getNotificationMessage(key);
          showNotification(msg.title, msg.body);
        }
      }
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [notifications, browserPermission]);

  return null;
}
