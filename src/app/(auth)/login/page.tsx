"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user, profile, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, profile, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (!success) {
      setError("Invalid email or password");
      return;
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">
          <span className="text-accent">Helios</span> Prime
        </h1>
        <p className="mb-8 text-center text-sm text-foreground/50">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/50">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-medium text-accent hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
