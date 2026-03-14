"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, Barcode, Keyboard, Camera } from "lucide-react";

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
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const quaggaRunning = useRef(false);

  const lookup = useCallback(async (barcode: string) => {
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
  }, []);

  const stopScanner = useCallback(async () => {
    if (quaggaRunning.current) {
      const Quagga = (await import("@ericblade/quagga2")).default;
      Quagga.stop();
      quaggaRunning.current = false;
      setCameraReady(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || quaggaRunning.current) return;
    setError("");

    try {
      const Quagga = (await import("@ericblade/quagga2")).default;

      await new Promise<void>((resolve, reject) => {
        Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              target: scannerRef.current!,
              constraints: {
                facingMode: "environment",
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
            },
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "upc_e_reader",
                "code_128_reader",
              ],
            },
            locate: true,
            frequency: 10,
          },
          (err: Error | null) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          }
        );
      });

      Quagga.start();
      quaggaRunning.current = true;
      setCameraReady(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Quagga.onDetected((data: any) => {
        const detectedCode = data?.codeResult?.code as string | null | undefined;
        if (detectedCode) {
          stopScanner();
          setCode(detectedCode);
          lookup(detectedCode);
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Camera permission denied. Please allow camera access or enter the code manually.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("No camera found. Please enter the barcode number manually.");
      } else {
        setError("Could not start camera. Please enter the barcode manually.");
      }
      setMode("manual");
    }
  }, [lookup, stopScanner]);

  useEffect(() => {
    if (mode === "scan" && !result) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [mode, result, startScanner, stopScanner]);

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
                onClick={() => setMode("scan")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                  mode === "scan" ? "bg-accent text-black" : "text-foreground/60"
                }`}
              >
                <Camera className="h-3 w-3" />
                Camera
              </button>
              <button
                onClick={() => { stopScanner(); setMode("manual"); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                  mode === "manual" ? "bg-accent text-black" : "text-foreground/60"
                }`}
              >
                <Keyboard className="h-3 w-3" />
                Enter Code
              </button>
            </div>

            {/* Camera scanner */}
            {mode === "scan" && (
              <div className="mb-4">
                <div
                  ref={scannerRef}
                  className="relative overflow-hidden rounded-xl bg-black"
                  style={{ minHeight: 240 }}
                >
                  {!cameraReady && !error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  )}
                  {/* Scan guide overlay */}
                  {cameraReady && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-20 w-64 rounded-lg border-2 border-accent/60" />
                    </div>
                  )}
                </div>
                {cameraReady && (
                  <p className="mt-2 text-center text-xs text-foreground/40">
                    Point your camera at a barcode
                  </p>
                )}
              </div>
            )}

            {/* Manual code entry */}
            {mode === "manual" && (
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
            )}

            {/* Loading state for camera scan */}
            {mode === "scan" && loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm text-foreground/60">Looking up barcode...</span>
              </div>
            )}

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
                onClick={() => { setResult(null); setCode(""); setMode("scan"); }}
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
