"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function SplashScreen() {
  const router = useRouter();
  const { user, profile, isLoading, loadFromStorage } = useAuthStore();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isLoading) return;

    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const navTimer = setTimeout(() => {
      if (user) {
        router.push(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
      } else {
        router.push("/register");
      }
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [isLoading, user, profile, router]);

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glow behind logo */}
      <div className="absolute h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      {/* Logo */}
      <div className="relative animate-pulse">
        <h1 className="text-5xl font-extrabold tracking-tight">
          <span className="text-accent">Helios</span> Prime
        </h1>
      </div>

      {/* Tagline */}
      <p className="mt-4 animate-fade-in text-sm text-foreground/40 tracking-widest uppercase">
        Snap. Track. Transform.
      </p>

      {/* Loading indicator */}
      <div className="mt-10">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-full animate-shimmer rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
