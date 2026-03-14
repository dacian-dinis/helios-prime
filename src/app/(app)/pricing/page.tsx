"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore, FEATURE_LABELS, PRO_FEATURES } from "@/stores/subscription-store";
import { Crown, Check, X, Loader2, Zap } from "lucide-react";

const FREE_FEATURES = [
  "Manual food logging",
  "AI food photo scanning",
  "Barcode scanner",
  "5 custom recipes",
  "Manual workout tracking",
  "Weight & measurement logging",
  "Fasting timer",
  "Community access",
];

const PRO_EXTRAS = [
  "Everything in Free, plus:",
  ...Object.values(FEATURE_LABELS),
  "Early access to new features",
];

export default function PricingPage() {
  const { user } = useAuthStore();
  const { subscription, isPro, loadSubscription, upgrade, downgrade } = useSubscriptionStore();
  const [loading, setLoading] = useState<"upgrade" | "downgrade" | null>(null);

  useEffect(() => {
    if (user) loadSubscription(user.id);
  }, [user, loadSubscription]);

  const currentlyPro = isPro();

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading("upgrade");
    await upgrade(user.id);
    setLoading(null);
  };

  const handleDowngrade = async () => {
    if (!user) return;
    setLoading("downgrade");
    await downgrade(user.id);
    setLoading(null);
  };

  return (
    <div className="pb-24">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-sm text-foreground/60">
          {currentlyPro
            ? "You're on the Pro plan. Thank you for your support!"
            : "Unlock the full power of Helios Prime with Pro."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
        {/* Free Plan */}
        <div className={`rounded-2xl border p-6 ${!currentlyPro ? "border-accent bg-accent/5" : "border-foreground/10"}`}>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Free</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-sm text-foreground/50">/month</span>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-foreground/70">{f}</span>
              </li>
            ))}
          </ul>
          {currentlyPro ? (
            <button
              onClick={handleDowngrade}
              disabled={loading === "downgrade"}
              className="w-full rounded-xl border border-foreground/20 py-2.5 text-sm font-medium transition hover:bg-foreground/5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "downgrade" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Switch to Free"
              )}
            </button>
          ) : (
            <div className="w-full rounded-xl border border-accent bg-accent/10 py-2.5 text-sm font-medium text-accent text-center">
              Current Plan
            </div>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`rounded-2xl border p-6 relative ${currentlyPro ? "border-amber-500 bg-amber-500/5" : "border-foreground/10"}`}>
          {!currentlyPro && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white flex items-center gap-1">
              <Zap className="h-3 w-3" /> RECOMMENDED
            </div>
          )}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Pro</h2>
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-sm text-foreground/50">/month</span>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_EXTRAS.map((f, i) => (
              <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? "font-medium text-foreground" : ""}`}>
                {i === 0 ? (
                  <span className="text-accent shrink-0 mt-0.5">+</span>
                ) : (
                  <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <span className="text-foreground/70">{f}</span>
              </li>
            ))}
          </ul>
          {currentlyPro ? (
            <div className="w-full rounded-xl border border-amber-500 bg-amber-500/10 py-2.5 text-sm font-medium text-amber-500 text-center flex items-center justify-center gap-2">
              <Crown className="h-4 w-4" /> Current Plan
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading === "upgrade"}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "upgrade" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  Start Free Trial
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {currentlyPro && subscription.expiresAt && (
        <p className="text-center text-xs text-foreground/40 mt-6">
          Your Pro plan renews on {new Date(subscription.expiresAt).toLocaleDateString()}.
        </p>
      )}

      <p className="text-center text-[11px] text-foreground/30 mt-4">
        Mock checkout — no real payment processed. Will be replaced with Stripe.
      </p>
    </div>
  );
}
