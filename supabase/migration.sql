-- Helios Prime — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'male',
  date_of_birth TEXT NOT NULL DEFAULT '',
  height_cm REAL NOT NULL DEFAULT 170,
  weight_kg REAL NOT NULL DEFAULT 70,
  body_fat_percent REAL,
  goal TEXT NOT NULL DEFAULT 'maintain',
  target_weight_kg REAL NOT NULL DEFAULT 70,
  pace INTEGER NOT NULL DEFAULT 50,
  activity_level TEXT NOT NULL DEFAULT 'active',
  workout_frequency TEXT NOT NULL DEFAULT '3-5',
  diet TEXT NOT NULL DEFAULT 'No preference',
  obstacles JSONB NOT NULL DEFAULT '[]',
  add_back_calories BOOLEAN NOT NULL DEFAULT false,
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  protein INTEGER NOT NULL DEFAULT 150,
  carbs INTEGER NOT NULL DEFAULT 200,
  fat INTEGER NOT NULL DEFAULT 67,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food entries
CREATE TABLE IF NOT EXISTS food_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_food_user_date ON food_entries(user_id, date);

-- Water entries
CREATE TABLE IF NOT EXISTS water_entries (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  ml REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Daily notes
CREATE TABLE IF NOT EXISTS daily_notes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  energy_level INTEGER NOT NULL DEFAULT 3,
  note TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, date)
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]',
  total_calories REAL NOT NULL DEFAULT 0,
  total_protein REAL NOT NULL DEFAULT 0,
  total_carbs REAL NOT NULL DEFAULT 0,
  total_fat REAL NOT NULL DEFAULT 0,
  calories_per_serving REAL NOT NULL DEFAULT 0,
  protein_per_serving REAL NOT NULL DEFAULT 0,
  carbs_per_serving REAL NOT NULL DEFAULT 0,
  fat_per_serving REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);

-- Workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups JSONB NOT NULL DEFAULT '[]',
  exercises JSONB NOT NULL DEFAULT '[]',
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wplans_user ON workout_plans(user_id);

-- Workout sessions
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT,
  plan_name TEXT NOT NULL,
  date TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  exercises JSONB NOT NULL DEFAULT '[]',
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_wsessions_user ON workout_sessions(user_id);

-- Active workout session (one per user)
CREATE TABLE IF NOT EXISTS workout_active (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL
);

-- Weight log
CREATE TABLE IF NOT EXISTS weight_log (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  note TEXT,
  PRIMARY KEY (user_id, date)
);

-- Body measurements
CREATE TABLE IF NOT EXISTS body_measurements (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  chest REAL,
  waist REAL,
  hips REAL,
  left_arm REAL,
  right_arm REAL,
  left_thigh REAL,
  right_thigh REAL,
  neck REAL,
  PRIMARY KEY (user_id, date)
);

-- Fasting sessions
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  target_hours REAL NOT NULL,
  preset_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  cancelled BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_fasting_user ON fasting_sessions(user_id);

-- Active fasting session (one per user)
CREATE TABLE IF NOT EXISTS fasting_active (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL
);

-- Fasting preferences
CREATE TABLE IF NOT EXISTS fasting_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_preset TEXT
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  units TEXT NOT NULL DEFAULT 'metric',
  theme TEXT NOT NULL DEFAULT 'system',
  notifications JSONB NOT NULL DEFAULT '{}'
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- Row Level Security (RLS) — each user can only access own data
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_active ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_active ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
-- INSERT uses WITH CHECK (true) so the trigger (which runs before auth context exists)
-- can create the row; subsequent reads/updates/deletes are still scoped to the owner.
CREATE POLICY profiles_select ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_delete ON profiles FOR DELETE USING (id = auth.uid());

-- Helper: create policies for tables with user_id column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'food_entries', 'water_entries', 'daily_notes', 'recipes',
    'workout_plans', 'workout_sessions', 'workout_active',
    'weight_log', 'body_measurements',
    'fasting_sessions', 'fasting_active', 'fasting_preferences',
    'settings', 'subscriptions'
  ])
  LOOP
    EXECUTE format('CREATE POLICY %I_select ON %I FOR SELECT USING (user_id = auth.uid())', tbl, tbl);
    -- INSERT uses WITH CHECK (true) for same reason as profiles — trigger runs without auth context
    EXECUTE format('CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_update ON %I FOR UPDATE USING (user_id = auth.uid())', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_delete ON %I FOR DELETE USING (user_id = auth.uid())', tbl, tbl);
  END LOOP;
END $$;

-- Auto-create profile + settings + subscription on user signup
-- SECURITY DEFINER SET search_path = public ensures it runs with correct privileges
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.settings (user_id) VALUES (NEW.id);
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
