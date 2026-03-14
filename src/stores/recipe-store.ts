"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface RecipeIngredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  createdAt: string;
}

interface RecipeState {
  recipes: Recipe[];
  loadFromStorage: (userId: string) => Promise<void>;
  addRecipe: (userId: string, recipe: Omit<Recipe, "id" | "createdAt" | "caloriesPerServing" | "proteinPerServing" | "carbsPerServing" | "fatPerServing">) => Recipe;
  deleteRecipe: (userId: string, id: string) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],

  loadFromStorage: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error('Failed to load recipes:', error.message);
      set({
        recipes: (data || []).map((r: Record<string, unknown>) => ({
          id: r.id,
          name: r.name,
          servings: r.servings,
          ingredients: r.ingredients,
          totalCalories: r.total_calories,
          totalProtein: r.total_protein,
          totalCarbs: r.total_carbs,
          totalFat: r.total_fat,
          caloriesPerServing: r.calories_per_serving,
          proteinPerServing: r.protein_per_serving,
          carbsPerServing: r.carbs_per_serving,
          fatPerServing: r.fat_per_serving,
          createdAt: r.created_at,
        })) as Recipe[],
      });
    } catch (err) {
      console.error('Failed to load recipes:', err);
    }
  },

  addRecipe: (userId, recipe) => {
    const servings = Math.max(recipe.servings, 1);
    const newRecipe: Recipe = {
      ...recipe,
      id: genId(),
      caloriesPerServing: Math.round(recipe.totalCalories / servings),
      proteinPerServing: Math.round(recipe.totalProtein / servings),
      carbsPerServing: Math.round(recipe.totalCarbs / servings),
      fatPerServing: Math.round(recipe.totalFat / servings),
      createdAt: new Date().toISOString(),
    };
    const recipes = [...get().recipes, newRecipe];
    set({ recipes });
    supabase.from('recipes').insert({
      id: newRecipe.id,
      user_id: userId,
      name: newRecipe.name,
      servings: newRecipe.servings,
      ingredients: newRecipe.ingredients,
      total_calories: newRecipe.totalCalories,
      total_protein: newRecipe.totalProtein,
      total_carbs: newRecipe.totalCarbs,
      total_fat: newRecipe.totalFat,
      calories_per_serving: newRecipe.caloriesPerServing,
      protein_per_serving: newRecipe.proteinPerServing,
      carbs_per_serving: newRecipe.carbsPerServing,
      fat_per_serving: newRecipe.fatPerServing,
      created_at: newRecipe.createdAt,
    }).then(({ error }) => { if (error) console.error('Failed to add recipe:', error.message); });
    return newRecipe;
  },

  deleteRecipe: (userId, id) => {
    const recipes = get().recipes.filter((r) => r.id !== id);
    set({ recipes });
    supabase.from('recipes').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to delete recipe:', error.message); });
  },
}));
