export interface ExerciseInfo {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: "strength" | "cardio" | "flexibility";
}

export type MuscleGroup = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio" | "full_body";
export type Equipment = "bodyweight" | "dumbbells" | "barbell" | "machine" | "cable" | "kettlebell" | "band" | "other";

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
];

export const EQUIPMENT_LIST: { value: Equipment; label: string }[] = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "machine", label: "Machine" },
  { value: "cable", label: "Cable" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "band", label: "Band" },
  { value: "other", label: "Other" },
];

export const EXERCISE_LIBRARY: ExerciseInfo[] = [
  // Chest
  { id: "bench-press", name: "Bench Press", muscleGroup: "chest", equipment: "barbell", type: "strength" },
  { id: "incline-bench", name: "Incline Bench Press", muscleGroup: "chest", equipment: "barbell", type: "strength" },
  { id: "db-bench", name: "Dumbbell Bench Press", muscleGroup: "chest", equipment: "dumbbells", type: "strength" },
  { id: "db-fly", name: "Dumbbell Fly", muscleGroup: "chest", equipment: "dumbbells", type: "strength" },
  { id: "push-ups", name: "Push-Ups", muscleGroup: "chest", equipment: "bodyweight", type: "strength" },
  { id: "cable-crossover", name: "Cable Crossover", muscleGroup: "chest", equipment: "cable", type: "strength" },
  { id: "chest-dips", name: "Chest Dips", muscleGroup: "chest", equipment: "bodyweight", type: "strength" },
  { id: "machine-chest-press", name: "Machine Chest Press", muscleGroup: "chest", equipment: "machine", type: "strength" },

  // Back
  { id: "deadlift", name: "Deadlift", muscleGroup: "back", equipment: "barbell", type: "strength" },
  { id: "pull-ups", name: "Pull-Ups", muscleGroup: "back", equipment: "bodyweight", type: "strength" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "back", equipment: "cable", type: "strength" },
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "back", equipment: "barbell", type: "strength" },
  { id: "db-row", name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbells", type: "strength" },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "back", equipment: "cable", type: "strength" },
  { id: "t-bar-row", name: "T-Bar Row", muscleGroup: "back", equipment: "barbell", type: "strength" },
  { id: "face-pulls", name: "Face Pulls", muscleGroup: "back", equipment: "cable", type: "strength" },

  // Shoulders
  { id: "ohp", name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell", type: "strength" },
  { id: "db-shoulder-press", name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", equipment: "dumbbells", type: "strength" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbells", type: "strength" },
  { id: "front-raise", name: "Front Raise", muscleGroup: "shoulders", equipment: "dumbbells", type: "strength" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbells", type: "strength" },
  { id: "arnold-press", name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbells", type: "strength" },
  { id: "upright-row", name: "Upright Row", muscleGroup: "shoulders", equipment: "barbell", type: "strength" },

  // Arms
  { id: "barbell-curl", name: "Barbell Curl", muscleGroup: "arms", equipment: "barbell", type: "strength" },
  { id: "db-curl", name: "Dumbbell Curl", muscleGroup: "arms", equipment: "dumbbells", type: "strength" },
  { id: "hammer-curl", name: "Hammer Curl", muscleGroup: "arms", equipment: "dumbbells", type: "strength" },
  { id: "tricep-pushdown", name: "Tricep Pushdown", muscleGroup: "arms", equipment: "cable", type: "strength" },
  { id: "skull-crushers", name: "Skull Crushers", muscleGroup: "arms", equipment: "barbell", type: "strength" },
  { id: "overhead-tricep-ext", name: "Overhead Tricep Extension", muscleGroup: "arms", equipment: "dumbbells", type: "strength" },
  { id: "preacher-curl", name: "Preacher Curl", muscleGroup: "arms", equipment: "barbell", type: "strength" },
  { id: "concentration-curl", name: "Concentration Curl", muscleGroup: "arms", equipment: "dumbbells", type: "strength" },
  { id: "dips", name: "Tricep Dips", muscleGroup: "arms", equipment: "bodyweight", type: "strength" },

  // Legs
  { id: "squat", name: "Barbell Squat", muscleGroup: "legs", equipment: "barbell", type: "strength" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs", equipment: "machine", type: "strength" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", muscleGroup: "legs", equipment: "barbell", type: "strength" },
  { id: "lunges", name: "Lunges", muscleGroup: "legs", equipment: "dumbbells", type: "strength" },
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs", equipment: "machine", type: "strength" },
  { id: "leg-curl", name: "Leg Curl", muscleGroup: "legs", equipment: "machine", type: "strength" },
  { id: "calf-raise", name: "Calf Raise", muscleGroup: "legs", equipment: "machine", type: "strength" },
  { id: "goblet-squat", name: "Goblet Squat", muscleGroup: "legs", equipment: "dumbbells", type: "strength" },
  { id: "hip-thrust", name: "Hip Thrust", muscleGroup: "legs", equipment: "barbell", type: "strength" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: "dumbbells", type: "strength" },

  // Core
  { id: "plank", name: "Plank", muscleGroup: "core", equipment: "bodyweight", type: "strength" },
  { id: "crunches", name: "Crunches", muscleGroup: "core", equipment: "bodyweight", type: "strength" },
  { id: "russian-twist", name: "Russian Twist", muscleGroup: "core", equipment: "bodyweight", type: "strength" },
  { id: "leg-raise", name: "Leg Raise", muscleGroup: "core", equipment: "bodyweight", type: "strength" },
  { id: "mountain-climbers", name: "Mountain Climbers", muscleGroup: "core", equipment: "bodyweight", type: "strength" },
  { id: "cable-crunch", name: "Cable Crunch", muscleGroup: "core", equipment: "cable", type: "strength" },
  { id: "ab-wheel", name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "other", type: "strength" },
  { id: "dead-bug", name: "Dead Bug", muscleGroup: "core", equipment: "bodyweight", type: "strength" },

  // Cardio
  { id: "running", name: "Running", muscleGroup: "cardio", equipment: "bodyweight", type: "cardio" },
  { id: "cycling", name: "Cycling", muscleGroup: "cardio", equipment: "machine", type: "cardio" },
  { id: "rowing", name: "Rowing", muscleGroup: "cardio", equipment: "machine", type: "cardio" },
  { id: "jump-rope", name: "Jump Rope", muscleGroup: "cardio", equipment: "other", type: "cardio" },
  { id: "stairmaster", name: "Stairmaster", muscleGroup: "cardio", equipment: "machine", type: "cardio" },
  { id: "elliptical", name: "Elliptical", muscleGroup: "cardio", equipment: "machine", type: "cardio" },
  { id: "burpees", name: "Burpees", muscleGroup: "cardio", equipment: "bodyweight", type: "cardio" },
  { id: "battle-ropes", name: "Battle Ropes", muscleGroup: "cardio", equipment: "other", type: "cardio" },

  // Full Body
  { id: "clean-and-press", name: "Clean and Press", muscleGroup: "full_body", equipment: "barbell", type: "strength" },
  { id: "kettlebell-swing", name: "Kettlebell Swing", muscleGroup: "full_body", equipment: "kettlebell", type: "strength" },
  { id: "thrusters", name: "Thrusters", muscleGroup: "full_body", equipment: "barbell", type: "strength" },
  { id: "turkish-getup", name: "Turkish Get-Up", muscleGroup: "full_body", equipment: "kettlebell", type: "strength" },
  { id: "man-makers", name: "Man Makers", muscleGroup: "full_body", equipment: "dumbbells", type: "strength" },
];
