"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useFoodStore } from "@/stores/food-store";
import { useRecipeStore } from "@/stores/recipe-store";
import { ChevronLeft, ChevronRight, Plus, Trash2, Coffee, Sun, Moon, Cookie, Camera, Barcode, ChefHat, Beef, Wheat, Droplets } from "lucide-react";
import AddFoodModal from "@/components/food/add-food-modal";
import AIScanner from "@/components/food/ai-scanner";
import BarcodeScanner from "@/components/food/barcode-scanner";
import RecipeBuilder from "@/components/food/recipe-builder";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type ModalType = MealType | "ai" | "barcode" | "recipe" | null;

const meals: { type: MealType; label: string; icon: typeof Coffee }[] = [
  { type: "breakfast", label: "Breakfast", icon: Coffee },
  { type: "lunch", label: "Lunch", icon: Sun },
  { type: "dinner", label: "Dinner", icon: Moon },
  { type: "snack", label: "Snacks", icon: Cookie },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function FoodLogPage() {
  const { user, profile, isLoading, loadFromStorage } = useAuthStore();
  const { loadFromStorage: loadFood, getEntriesByDate, getDailyTotals, deleteEntry, addEntry } = useFoodStore();
  const { loadFromStorage: loadRecipes } = useRecipeStore();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [modal, setModal] = useState<ModalType>(null);
  // Which meal type to assign when adding from AI/barcode/recipe
  const [targetMeal, setTargetMeal] = useState<MealType>("lunch");

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);
  useEffect(() => {
    if (user) {
      loadFood(user.id);
      loadRecipes(user.id);
    }
  }, [user, loadFood, loadRecipes]);

  if (isLoading || !user || !profile) return null;

  const entries = getEntriesByDate(date);
  const totals = getDailyTotals(date);

  const changeDate = (offset: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split("T")[0]);
  };

  const mealCalories = (type: MealType) =>
    entries.filter((e) => e.mealType === type).reduce((sum, e) => sum + e.calories, 0);

  // Handlers for AI scanner, barcode, recipe results
  const handleAIItems = (items: { name: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number }[]) => {
    items.forEach((item) => {
      addEntry(user.id, { date, mealType: targetMeal, ...item });
    });
    setModal(null);
  };

  const handleBarcodeResult = (item: { name: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number }) => {
    addEntry(user.id, { date, mealType: targetMeal, ...item });
    setModal(null);
  };

  const handleRecipeResult = (item: { name: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number }) => {
    addEntry(user.id, { date, mealType: targetMeal, ...item });
    setModal(null);
  };

  const isMealModal = modal === "breakfast" || modal === "lunch" || modal === "dinner" || modal === "snack";

  return (
    <div className="pb-24 md:pb-0">
      {/* Date Picker */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="rounded-lg p-2 transition hover:bg-foreground/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold">{formatDate(date)}</p>
          <p className="text-xs text-foreground/50">{date}</p>
        </div>
        <button onClick={() => changeDate(1)} className="rounded-lg p-2 transition hover:bg-foreground/10">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Tools Bar */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <button
          onClick={() => { setTargetMeal("lunch"); setModal("ai"); }}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] py-3 text-xs font-medium transition hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
        >
          <Camera className="h-5 w-5" />
          AI Scan
        </button>
        <button
          onClick={() => { setTargetMeal("lunch"); setModal("barcode"); }}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] py-3 text-xs font-medium transition hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
        >
          <Barcode className="h-5 w-5" />
          Barcode
        </button>
        <button
          onClick={() => { setTargetMeal("lunch"); setModal("recipe"); }}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] py-3 text-xs font-medium transition hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
        >
          <ChefHat className="h-5 w-5" />
          Recipe
        </button>
      </div>

      {/* Calorie Ring */}
      {(() => {
        const caloriesLeft = Math.max(profile.dailyCalories - totals.calories, 0);
        const caloriePct = Math.min(totals.calories / profile.dailyCalories, 1);
        const circumference = 2 * Math.PI * 52;
        return (
          <div className="mb-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
            <div className="flex items-center gap-6">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - caloriePct)}
                    className="text-accent transition-all duration-500"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-xl font-extrabold">{caloriesLeft}</p>
                  <p className="text-[10px] text-foreground/50">remaining</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Goal</span>
                  <span className="font-semibold">{profile.dailyCalories} kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Eaten</span>
                  <span className="font-semibold text-accent">{totals.calories} kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Remaining</span>
                  <span className="font-semibold">{caloriesLeft} kcal</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Macro Bars */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Protein", value: totals.protein, target: profile.protein, icon: Beef, color: "text-blue-500", bg: "bg-blue-500" },
          { label: "Carbs", value: totals.carbs, target: profile.carbs, icon: Wheat, color: "text-amber-500", bg: "bg-amber-500" },
          { label: "Fat", value: totals.fat, target: profile.fat, icon: Droplets, color: "text-rose-500", bg: "bg-rose-500" },
        ].map((m) => {
          const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
          return (
            <div key={m.label} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-center">
              <m.icon className={`mx-auto mb-2 h-5 w-5 ${m.color}`} />
              <p className="text-lg font-bold">{m.value}g</p>
              <p className="text-[10px] text-foreground/50">/ {m.target}g</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className={`h-full rounded-full ${m.bg} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal Sections */}
      {meals.map((meal) => {
        const mealEntries = entries.filter((e) => e.mealType === meal.type);
        const cals = mealCalories(meal.type);

        return (
          <div key={meal.type} className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <meal.icon className="h-4 w-4 text-foreground/40" />
                <span className="text-sm font-semibold">{meal.label}</span>
                {cals > 0 && <span className="text-xs text-foreground/40">{cals} kcal</span>}
              </div>
              <button
                onClick={() => setModal(meal.type)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {mealEntries.length === 0 ? (
              <button
                onClick={() => setModal(meal.type)}
                className="w-full rounded-xl border border-dashed border-foreground/15 px-4 py-6 text-center text-xs text-foreground/40 transition hover:border-accent/30 hover:text-accent"
              >
                Tap to add {meal.label.toLowerCase()}
              </button>
            ) : (
              <div className="space-y-2">
                {mealEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.name}</p>
                      <p className="text-xs text-foreground/50">
                        {entry.servingSize} &middot; P:{entry.protein}g C:{entry.carbs}g F:{entry.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{entry.calories}</span>
                      <button
                        onClick={() => deleteEntry(user.id, entry.id)}
                        className="rounded-md p-1 text-foreground/30 transition hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Modals */}
      {isMealModal && (
        <AddFoodModal
          userId={user.id}
          date={date}
          mealType={modal as MealType}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "ai" && (
        <AIScanner
          onAddItems={handleAIItems}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "barcode" && (
        <BarcodeScanner
          onResult={handleBarcodeResult}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "recipe" && (
        <RecipeBuilder
          userId={user.id}
          onSave={handleRecipeResult}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
