"use client";

import { useState } from "react";
import { X, Clock, Star } from "lucide-react";
import { useFoodStore, FoodEntry } from "@/stores/food-store";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type Tab = "manual" | "recent" | "frequent";

interface Props {
  userId: string;
  date: string;
  mealType: MealType;
  onClose: () => void;
}

export default function AddFoodModal({ userId, date, mealType, onClose }: Props) {
  const { addEntry, getRecentFoods, getFrequentFoods } = useFoodStore();
  const [tab, setTab] = useState<Tab>("manual");

  // Manual entry state
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const mealLabels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;
    addEntry(userId, {
      date,
      mealType,
      name,
      servingSize: servingSize || "1 serving",
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    onClose();
  };

  const quickAdd = (food: { name: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number }) => {
    addEntry(userId, {
      date,
      mealType,
      ...food,
    });
    onClose();
  };

  const recentFoods = getRecentFoods();
  const frequentFoods = getFrequentFoods();

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add to {mealLabels[mealType]}</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-foreground/5 p-1">
          {([
            { key: "manual" as Tab, label: "Manual", icon: null },
            { key: "recent" as Tab, label: "Recent", icon: Clock },
            { key: "frequent" as Tab, label: "Frequent", icon: Star },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${
                tab === t.key ? "bg-accent text-black" : "text-foreground/60"
              }`}
            >
              {t.icon && <t.icon className="h-3 w-3" />}
              {t.label}
            </button>
          ))}
        </div>

        {/* Manual Entry */}
        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Food name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              required
            />
            <input
              type="text"
              placeholder="Serving size (e.g. 100g, 1 cup)"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Calories *</label>
                <input
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none transition focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Protein (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Carbs (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Fat (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none transition focus:border-accent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
            >
              Add Food
            </button>
          </form>
        )}

        {/* Recent */}
        {tab === "recent" && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {recentFoods.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/40">No recent foods yet</p>
            ) : (
              recentFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() =>
                    quickAdd({
                      name: food.name,
                      servingSize: food.servingSize,
                      calories: food.calories,
                      protein: food.protein,
                      carbs: food.carbs,
                      fat: food.fat,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-foreground/10 px-4 py-3 text-left transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <div>
                    <p className="text-sm font-medium">{food.name}</p>
                    <p className="text-xs text-foreground/50">{food.servingSize}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">{food.calories} kcal</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Frequent */}
        {tab === "frequent" && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {frequentFoods.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/40">No frequent foods yet</p>
            ) : (
              frequentFoods.map((item) => (
                <button
                  key={item.name}
                  onClick={() => quickAdd(item.entry)}
                  className="flex w-full items-center justify-between rounded-lg border border-foreground/10 px-4 py-3 text-left transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-foreground/50">
                      Logged {item.count}x &middot; {item.entry.servingSize}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent">{item.entry.calories} kcal</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
