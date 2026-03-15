"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore, FEATURE_LABELS, type ProFeature } from "@/stores/subscription-store";
import { X, Crown, Check, Loader2 } from "lucide-react";

interface PaywallModalProps {
  feature: ProFeature;
  onClose: () => void;
}

export function PaywallModal({ feature, onClose }: PaywallModalProps) {
  const { user } = useAuthStore();
  const { upgrade } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    const ok = await upgrade(user.id);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-foreground/10 p-6">
        <button onClick={onClose} className="absolute right-4 top-4 text-foreground/40 hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold">Welcome to Pro!</h2>
            <p className="text-sm text-foreground/60">Enjoy all premium features.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                <Crown className="h-7 w-7 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold">Upgrade to Pro</h2>
              <p className="text-sm text-foreground/60 text-center">
                <span className="font-medium text-foreground">{FEATURE_LABELS[feature]}</span>{" "}
                is a Pro feature. Unlock it and more with Helios Prime Pro.
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-accent shrink-0" />
                  <span className={key === feature ? "font-medium text-foreground" : "text-foreground/70"}>{label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-foreground/5 p-4 mb-6 text-center">
              <div className="text-3xl font-bold">
                $9.99<span className="text-sm font-normal text-foreground/50">/month</span>
              </div>
              <p className="text-xs text-foreground/40 mt-1">Cancel anytime. 7-day free trial.</p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  Start Free Trial
                </>
              )}
            </button>

            <p className="text-[11px] text-foreground/30 text-center mt-3">
              Mock checkout — no real payment processed. Will be replaced with Stripe.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
