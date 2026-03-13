"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Check, Pencil, X } from "lucide-react";

interface FoodItem {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Props {
  onAddItems: (items: FoodItem[]) => void;
  onClose: () => void;
}

export default function AIScanner({ onAddItems, onClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FoodItem[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [isMock, setIsMock] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const scan = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/scan-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      const data = await res.json();
      if (data.items) {
        setResults(data.items);
        setSelected(new Set(data.items.map((_: FoodItem, i: number) => i)));
        setIsMock(data.mock);
      }
    } catch {
      alert("Failed to scan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (idx: number, updates: Partial<FoodItem>) => {
    if (!results) return;
    const updated = [...results];
    updated[idx] = { ...updated[idx], ...updates };
    setResults(updated);
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const confirm = () => {
    if (!results) return;
    const items = results.filter((_, i) => selected.has(i));
    onAddItems(items);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl bg-background p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">AI Food Scanner</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Capture */}
        {!preview && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-foreground/20 px-6 py-12 transition hover:border-accent"
            >
              <Camera className="h-10 w-10 text-foreground/30" />
              <span className="text-sm font-medium text-foreground/50">
                Take a photo or upload an image
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Preview + Scan */}
        {preview && !results && (
          <div>
            <div className="mb-4 overflow-hidden rounded-xl">
              <img src={preview} alt="Food" className="h-48 w-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setPreview(null); setResults(null); }}
                className="flex-1 rounded-lg border border-foreground/20 py-2.5 text-sm font-medium transition hover:bg-foreground/5"
              >
                Retake
              </button>
              <button
                onClick={scan}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Scan Food
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            {isMock && (
              <div className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                Demo mode — add ANTHROPIC_API_KEY to .env.local for real scanning
              </div>
            )}
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground/60">
                {results.length} item{results.length !== 1 ? "s" : ""} detected
              </p>
              <button
                onClick={() => { setPreview(null); setResults(null); }}
                className="text-xs text-accent hover:underline"
              >
                Scan again
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto py-2">
              {results.map((item, i) => (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 transition ${
                    selected.has(i) ? "border-accent/40 bg-accent/5" : "border-foreground/10 opacity-50"
                  }`}
                >
                  {editIdx === i ? (
                    <div className="space-y-2">
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(i, { name: e.target.value })}
                        className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-sm outline-none focus:border-accent"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                          <div key={field}>
                            <label className="text-[9px] text-foreground/40">{field}</label>
                            <input
                              type="number"
                              value={item[field]}
                              onChange={(e) => updateItem(i, { [field]: Number(e.target.value) })}
                              className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setEditIdx(null)}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Done editing
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSelect(i)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                          selected.has(i) ? "border-accent bg-accent text-black" : "border-foreground/30"
                        }`}
                      >
                        {selected.has(i) && <Check className="h-3 w-3" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-foreground/50">
                          {item.servingSize} &middot; P:{item.protein}g C:{item.carbs}g F:{item.fat}g
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-accent">{item.calories}</span>
                      <button
                        onClick={() => setEditIdx(i)}
                        className="rounded p-1 text-foreground/30 transition hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={confirm}
              disabled={selected.size === 0}
              className="mt-3 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40"
            >
              Add {selected.size} item{selected.size !== 1 ? "s" : ""} to diary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
