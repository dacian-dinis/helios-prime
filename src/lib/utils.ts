export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// Mifflin-St Jeor BMR
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

// Activity multipliers
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
  very_active: 1.725,
};

const WORKOUT_BONUS: Record<string, number> = {
  "0-2": 0,
  "3-5": 0.05,
  "6+": 0.1,
};

export function calculateTDEE(
  bmr: number,
  activityLevel: string,
  workoutFrequency: string
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const bonus = WORKOUT_BONUS[workoutFrequency] || 0;
  return Math.round(bmr * (multiplier + bonus));
}

// Calorie adjustment based on goal and pace
export function calculateDailyCalories(
  tdee: number,
  goal: string,
  pace: number // 0-100 slider
): number {
  if (goal === "lose") {
    const deficit = 250 + (pace / 100) * 750; // 250-1000 cal deficit
    return Math.round(Math.max(tdee - deficit, 1200));
  }
  if (goal === "gain") {
    const surplus = 150 + (pace / 100) * 450; // 150-600 cal surplus
    return Math.round(tdee + surplus);
  }
  return tdee;
}

// Macro split (grams)
export function calculateMacros(
  calories: number,
  weightKg: number,
  goal: string
): { protein: number; carbs: number; fat: number } {
  let proteinPerKg = goal === "gain" ? 2.0 : goal === "lose" ? 2.2 : 1.8;
  const protein = Math.round(weightKg * proteinPerKg);
  const fatCalories = calories * 0.25;
  const fat = Math.round(fatCalories / 9);
  const carbCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.round(Math.max(carbCalories / 4, 50));
  return { protein, carbs, fat };
}

// Days to reach goal
export function daysToGoal(
  currentWeight: number,
  targetWeight: number,
  dailyCalories: number,
  tdee: number
): number {
  const diff = Math.abs(currentWeight - targetWeight);
  const dailyChange = Math.abs(tdee - dailyCalories) / 7700; // ~7700 cal per kg
  if (dailyChange === 0) return Infinity;
  return Math.round(diff / dailyChange);
}
