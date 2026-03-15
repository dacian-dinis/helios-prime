"use client";

import { useState } from "react";
import { X, Plus, Trash2, ChefHat } from "lucide-react";
import { useRecipeStore, RecipeIngredient } from "@/stores/recipe-store";

interface Props {
  userId: string;
  onSave: (recipe: { name: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number }) => void;
  onClose: () => void;
}

const emptyIngredient: RecipeIngredient = {
  name: "",
  amount: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export default function RecipeBuilder({ userId, onSave, onClose }: Props) {
  const { addRecipe, recipes, deleteRecipe } = useRecipeStore();
  const [tab, setTab] = useState<"create" | "saved">("create");
  const [recipeName, setRecipeName] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ ...emptyIngredient }]);

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein: acc.protein + (ing.protein || 0),
      carbs: acc.carbs + (ing.carbs || 0),
      fat: acc.fat + (ing.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const perServing = {
    calories: Math.round(totals.calories / Math.max(servings, 1)),
    protein: Math.round(totals.protein / Math.max(servings, 1)),
    carbs: Math.round(totals.carbs / Math.max(servings, 1)),
    fat: Math.round(totals.fat / Math.max(servings, 1)),
  };

  const updateIngredient = (idx: number, updates: Partial<RecipeIngredient>) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], ...updates };
    setIngredients(updated);
  };

  const removeIngredient = (idx: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim() || ingredients.every((i) => !i.name.trim())) return;
    const recipe = addRecipe(userId, {
      name: recipeName,
      servings,
      ingredients: ingredients.filter((i) => i.name.trim()),
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    });
    // Log one serving to diary
    onSave({
      name: recipe.name,
      servingSize: `1/${servings} recipe`,
      calories: recipe.caloriesPerServing,
      protein: recipe.proteinPerServing,
      carbs: recipe.carbsPerServing,
      fat: recipe.fatPerServing,
    });
  };

  const logExistingRecipe = (recipe: { name: string; caloriesPerServing: number; proteinPerServing: number; carbsPerServing: number; fatPerServing: number; servings: number }) => {
    onSave({
      name: recipe.name,
      servingSize: `1/${recipe.servings} recipe`,
      calories: recipe.caloriesPerServing,
      protein: recipe.proteinPerServing,
      carbs: recipe.carbsPerServing,
      fat: recipe.fatPerServing,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-background p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recipe Builder</h2>
          <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-foreground/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-foreground/5 p-1">
          <button
            onClick={() => setTab("create")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              tab === "create" ? "bg-accent text-black" : "text-foreground/60"
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              tab === "saved" ? "bg-accent text-black" : "text-foreground/60"
            }`}
          >
            My Recipes ({recipes.length})
          </button>
        </div>

        {tab === "create" && (
          <>
            {/* Recipe name + servings */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Recipe Name</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="e.g. Protein Smoothie"
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-foreground/50">Servings</label>
                <input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Ingredients */}
            <p className="mb-2 text-xs font-semibold text-foreground/50">Ingredients</p>
            <div className="mb-3 space-y-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, { name: e.target.value })}
                      placeholder="Ingredient name"
                      className="flex-1 rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
                    />
                    <input
                      type="text"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, { amount: e.target.value })}
                      placeholder="Amount"
                      className="w-24 rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1.5 text-sm outline-none focus:border-accent"
                    />
                    {ingredients.length > 1 && (
                      <button
                        onClick={() => removeIngredient(idx)}
                        className="rounded p-1 text-foreground/30 transition hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                      <div key={field}>
                        <label className="text-[9px] text-foreground/40">
                          {field === "calories" ? "kcal" : `${field} (g)`}
                        </label>
                        <input
                          type="number"
                          value={ing[field] || ""}
                          onChange={(e) => updateIngredient(idx, { [field]: Number(e.target.value) || 0 })}
                          placeholder="0"
                          className="w-full rounded-md border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs outline-none focus:border-accent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIngredients([...ingredients, { ...emptyIngredient }])}
              className="mb-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 py-2 text-xs font-medium text-foreground/50 transition hover:border-accent hover:text-accent"
            >
              <Plus className="h-3 w-3" />
              Add Ingredient
            </button>

            {/* Per-serving totals */}
            <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
              <p className="mb-2 text-xs font-semibold text-accent">Per Serving</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{perServing.calories}</p>
                  <p className="text-[9px] text-foreground/50">kcal</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{perServing.protein}g</p>
                  <p className="text-[9px] text-foreground/50">protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{perServing.carbs}g</p>
                  <p className="text-[9px] text-foreground/50">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{perServing.fat}g</p>
                  <p className="text-[9px] text-foreground/50">fat</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveRecipe}
              disabled={!recipeName.trim()}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40"
            >
              Save Recipe & Log 1 Serving
            </button>
          </>
        )}

        {tab === "saved" && (
          <div className="space-y-2">
            {recipes.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <ChefHat className="mb-3 h-10 w-10 text-foreground/20" />
                <p className="text-sm text-foreground/40">No saved recipes yet</p>
              </div>
            ) : (
              recipes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-foreground/10 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-foreground/50">
                      {r.caloriesPerServing} kcal/serving &middot; {r.ingredients.length} ingredients
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => logExistingRecipe(r)}
                      className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
                    >
                      Log
                    </button>
                    <button
                      onClick={() => deleteRecipe(userId, r.id)}
                      className="rounded p-1 text-foreground/30 transition hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
