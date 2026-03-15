"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — silently ignore
      });
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Check if banner was dismissed recently
      const dismissed = localStorage.getItem("hp_pwa_dismissed");
      if (dismissed) {
        const dismissedAt = new Date(dismissed).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedAt < sevenDays) return;
      }
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("hp_pwa_dismissed", new Date().toISOString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 bg-accent px-4 py-2.5 text-black md:px-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Download className="h-4 w-4" />
        Install Helios Prime for a better experience
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="rounded-lg bg-black/20 px-3 py-1 text-xs font-semibold transition hover:bg-black/30"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 transition hover:bg-black/20 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
