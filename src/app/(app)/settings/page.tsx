"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Settings className="mb-4 h-12 w-12 text-foreground/20" />
      <h1 className="text-xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-foreground/50">Coming in Phase 9 — Settings & Polish</p>
    </div>
  );
}
