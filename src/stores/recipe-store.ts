"use client";

import { create } from "zustand";

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
  loadFromStorage: (userId: string) => void;
  addRecipe: (userId: string, recipe: Omit<Recipe, "id" | "createdAt" | "caloriesPerServing" | "proteinPerServing" | "carbsPerServing" | "fatPerServing">) => Recipe;
  deleteRecipe: (userId: string, id: string) => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],

  loadFromStorage: (userId) => {
    const data = localStorage.getItem(`hp_recipes_${userId}`);
    set({ recipes: data ? JSON.parse(data) : [] });
  },

  addRecipe: (userId, recipe) => {
    const servings = Math.max(recipe.servings, 1);
    const newRecipe: Recipe = {
      ...recipe,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      caloriesPerServing: Math.round(recipe.totalCalories / servings),
      proteinPerServing: Math.round(recipe.totalProtein / servings),
      carbsPerServing: Math.round(recipe.totalCarbs / servings),
      fatPerServing: Math.round(recipe.totalFat / servings),
      createdAt: new Date().toISOString(),
    };
    const recipes = [...get().recipes, newRecipe];
    set({ recipes });
    localStorage.setItem(`hp_recipes_${userId}`, JSON.stringify(recipes));
    return newRecipe;
  },

  deleteRecipe: (userId, id) => {
    const recipes = get().recipes.filter((r) => r.id !== id);
    set({ recipes });
    localStorage.setItem(`hp_recipes_${userId}`, JSON.stringify(recipes));
  },
}));
