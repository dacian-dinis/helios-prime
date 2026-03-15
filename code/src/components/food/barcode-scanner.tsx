"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, Keyboard, Camera } from "lucide-react";

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

// Hard-kill every camera track on a container element
function killAllStreams(container: HTMLElement | null) {
  if (!container) return;
  const videos = container.querySelectorAll("video");
  videos.forEach((video) => {
    if (video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => {
        t.enabled = false;
        t.stop();
      });
      video.srcObject = null;
    }
    video.remove();
  });
  // Quagga also creates a canvas
  const canvases = container.querySelectorAll("canvas");
  canvases.forEach((c) => c.remove());
}

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const scannerRef = useRef<HTMLDivElement>(null);
  const quaggaRef = useRef<typeof import("@ericblade/quagga2").default | null>(null);
  const isProcessing = useRef(false);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookup = useCallback(async (barcode: string) => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Scanned Barcode:", barcode.trim());
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode.trim())}.json?fields=product_name,brands,nutriments,serving_size`,
        {
          headers: {
            "User-Agent": "HeliosPrime/1.0",
          },
        }
      );

      if (!res.ok) {
        setError(res.status === 404 ? "Product not found" : `Lookup error (${res.status})`);
        return;
      }

      const data = await res.json();

      if (data.status === 0 || !data.product) {
        setError("Product not found");
        return;
      }

      const p = data.product;
      const n = p.nutriments || {};

      setResult({
        name: [p.product_name, p.brands].filter(Boolean).join(" - ") || "Unknown product",
        servingSize: p.serving_size || "100g",
        calories: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
        protein: Math.round(n.proteins_100g || 0),
        carbs: Math.round(n.carbohydrates_100g || 0),
        fat: Math.round(n.fat_100g || 0),
      });
    } catch {
      setError("Failed to look up barcode. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopScanner = useCallback(() => {
    // Clear any pending init timer (Strict Mode double-mount)
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }

    const Q = quaggaRef.current;
    if (Q) {
      try {
        Q.offDetected();
      } catch {
        /* already removed */
      }
      try {
        Q.stop();
      } catch {
        /* already stopped */
      }
    }

    killAllStreams(scannerRef.current);
    setCameraReady(false);
  }, []);

  const startScanner = useCallback(
    (cancelledRef: { current: boolean }) => {
      // Clear any previous timer
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
      }

      // Delay init by 100ms to survive React Strict Mode double-mount
      initTimerRef.current = setTimeout(async () => {
        initTimerRef.current = null;

        // If the effect already cleaned up, abort
        if (cancelledRef.current) return;
        if (!scannerRef.current) return;

        setError("");
        isProcessing.current = false;

        try {
          // Pre-check camera permission
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          stream.getTracks().forEach((t) => {
            t.enabled = false;
            t.stop();
          });

          if (cancelledRef.current || !scannerRef.current) return;

          const Quagga = (await import("@ericblade/quagga2")).default;
          quaggaRef.current = Quagga;

          if (cancelledRef.current || !scannerRef.current) return;

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
              (err: Error | null) => (err ? reject(err) : resolve())
            );
          });

          // Check again after async init
          if (cancelledRef.current) {
            Quagga.stop();
            killAllStreams(scannerRef.current);
            return;
          }

          Quagga.start();
          setCameraReady(true);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Quagga.onDetected((data: any) => {
            // ---- LOCK: one detection only ----
            if (isProcessing.current) return;
            isProcessing.current = true;

            const detectedCode = data?.codeResult?.code as
              | string
              | null
              | undefined;
            if (!detectedCode) {
              isProcessing.current = false;
              return;
            }

            // Synchronous full stop — no awaits, no re-renders first
            try {
              Quagga.offDetected();
            } catch {
              /* noop */
            }
            try {
              Quagga.stop();
            } catch {
              /* noop */
            }
            killAllStreams(scannerRef.current);
            setCameraReady(false);

            // Now safe to trigger state updates
            setCode(detectedCode);
            lookup(detectedCode);
          });
        } catch (err) {
          if (cancelledRef.current) return;

          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Permission") || msg.includes("NotAllowed")) {
            setError(
              "Camera permission denied. Please allow camera access or enter the code manually."
            );
          } else if (
            msg.includes("NotFound") ||
            msg.includes("DevicesNotFound")
          ) {
            setError(
              "No camera found. Please enter the barcode number manually."
            );
          } else {
            setError("Could not start camera. Please enter the barcode manually.");
          }
          setMode("manual");
        }
      }, 100);
    },
    [lookup]
  );

  // Main effect: start/stop scanner based on mode
  useEffect(() => {
    // Per-cycle cancellation flag — survives Strict Mode teardown
    const cancelledRef = { current: false };

    if (mode === "scan" && !result) {
      startScanner(cancelledRef);
    }

    return () => {
      cancelledRef.current = true;
      stopScanner();
    };
  }, [mode, result, startScanner, stopScanner]);

  const handleScanAnother = () => {
    isProcessing.current = false;
    setResult(null);
    setCode("");
    setError("");
    setMode("scan");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Barcode Scanner</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition hover:bg-foreground/10"
          >
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
                  mode === "scan"
                    ? "bg-accent text-black"
                    : "text-foreground/60"
                }`}
              >
                <Camera className="h-3 w-3" />
                Camera
              </button>
              <button
                onClick={() => {
                  stopScanner();
                  setMode("manual");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                  mode === "manual"
                    ? "bg-accent text-black"
                    : "text-foreground/60"
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
                  className="relative aspect-video w-full overflow-hidden rounded-xl bg-black [&>video]:absolute [&>video]:inset-0 [&>video]:h-full [&>video]:w-full [&>video]:object-cover [&>canvas]:absolute [&>canvas]:inset-0 [&>canvas]:h-full [&>canvas]:w-full"
                >
                  {!cameraReady && !error && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  )}
                  {cameraReady && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
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
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Look up"
                  )}
                </button>
              </div>
            )}

            {mode === "scan" && loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm text-foreground/60">
                  Looking up barcode...
                </span>
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

        {result && (
          <div>
            <div className="mb-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <p className="mb-1 text-base font-semibold">{result.name}</p>
              <p className="mb-3 text-xs text-foreground/50">
                Per {result.servingSize}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: result.calories, unit: "" },
                  { label: "Protein", value: result.protein, unit: "g" },
                  { label: "Carbs", value: result.carbs, unit: "g" },
                  { label: "Fat", value: result.fat, unit: "g" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg font-bold">
                      {m.value}
                      {m.unit}
                    </p>
                    <p className="text-[10px] text-foreground/50">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleScanAnother}
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
