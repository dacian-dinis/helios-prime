"use client";

import { useState, useRef } from "react";
import { X, Loader2, Barcode, Keyboard } from "lucide-react";

interface FoodResult {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  onResult: (item: FoodResult) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const [mode, setMode] = useState<"scan" | "manual">("manual");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FoodResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lookup = async (barcode: string) => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Product not found");
        return;
      }

      setResult({
        name: data.name,
        servingSize: data.servingSize,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      });
    } catch {
      setError("Failed to look up barcode. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Try to detect barcode from image using camera
  const handleImageCapture = async (file: File) => {
    // For now, we use the manual code entry as primary method
    // Full camera-based barcode detection would require additional setup
    setMode("manual");
    setError("Camera barcode scanning coming soon. Please enter the barcode number manually.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-background p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Barcode Scanner</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!result && (
          <>
            {/* Mode toggle */}
            <div className="mb-4 flex gap-1 rounded-lg bg-foreground/5 p-1">
              <button
                onClick={() => setMode("manual")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                  mode === "manual" ? "bg-accent text-black" : "text-foreground/60"
                }`}
              >
                <Keyboard className="h-3 w-3" />
                Enter Code
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-foreground/60 transition"
              >
                <Barcode className="h-3 w-3" />
                Scan Image
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])}
            />

            {/* Manual code entry */}
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup(code)}
                placeholder="Enter barcode number (e.g. 5449000000996)"
                className="flex-1 rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              />
              <button
                onClick={() => lookup(code)}
                disabled={loading || !code.trim()}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look up"}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-center text-sm text-red-500">{error}</p>
            )}

            <p className="mt-4 text-center text-xs text-foreground/40">
              Powered by Open Food Facts — a free, open food database
            </p>
          </>
        )}

        {/* Result */}
        {result && (
          <div>
            <div className="mb-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <p className="mb-1 text-base font-semibold">{result.name}</p>
              <p className="mb-3 text-xs text-foreground/50">Per {result.servingSize}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: result.calories, unit: "" },
                  { label: "Protein", value: result.protein, unit: "g" },
                  { label: "Carbs", value: result.carbs, unit: "g" },
                  { label: "Fat", value: result.fat, unit: "g" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg font-bold">{m.value}{m.unit}</p>
                    <p className="text-[10px] text-foreground/50">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setResult(null); setCode(""); }}
                className="flex-1 rounded-lg border border-foreground/20 py-2.5 text-sm font-medium transition hover:bg-foreground/5"
              >
                Scan another
              </button>
              <button
                onClick={() => onResult(result)}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
              >
                Add to diary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
