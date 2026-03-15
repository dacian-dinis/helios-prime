"use client";

import { useEffect } from "react";

export default function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function initCapacitor() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        // Status bar — transparent overlay for immersive look
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0a0a0a" });

        // Back button — Android hardware back
        const { App: CapApp } = await import("@capacitor/app");
        CapApp.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
      } catch {
        // Not running in Capacitor — ignore
      }
    }
    initCapacitor();
  }, []);

  return <>{children}</>;
}
