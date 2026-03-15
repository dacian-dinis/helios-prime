"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore, type NotificationSettings } from "@/stores/settings-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  User,
  Flame,
  Ruler,
  Palette,
  Bell,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  X,
  Crown,
  LogOut,
  Trophy,
  Calendar,
  Dumbbell,
} from "lucide-react";
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacros,
} from "@/lib/utils";

const NOTIFICATION_LABELS: Record<keyof NotificationSettings, { label: string; desc: string }> = {
  mealLogging: { label: "Meal Logging", desc: "Remind me to log meals" },
  water: { label: "Water Intake", desc: "Stay hydrated reminders" },
  workout: { label: "Workout", desc: "Time to exercise" },
  fasting: { label: "Fasting", desc: "Fasting window reminders" },
  weighIn: { label: "Weigh-In", desc: "Daily weigh-in reminder" },
};

const DIET_OPTIONS = [
  "No preference",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low-carb",
  "High-protein",
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, updateProfile, logout } = useAuthStore();
  const settings = useSettingsStore();

  // Section collapse state
  const [openSection, setOpenSection] = useState<string | null>("profile");

  // Profile form state
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<string>("active");
  const [workoutFrequency, setWorkoutFrequency] = useState<string>("3-5");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [pace, setPace] = useState(50);

  // Nutrition form state
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(60);
  const [diet, setDiet] = useState("No preference");

  // Confirmation modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [nutritionSaved, setNutritionSaved] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      settings.loadFromStorage(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setGender(profile.gender);
      setDateOfBirth(profile.dateOfBirth);
      setHeightCm(profile.heightCm);
      setWeightKg(profile.weightKg);
      setActivityLevel(profile.activityLevel);
      setWorkoutFrequency(profile.workoutFrequency);
      setGoal(profile.goal);
      setTargetWeightKg(profile.targetWeightKg);
      setPace(profile.pace);
      setDailyCalories(profile.dailyCalories);
      setProtein(profile.protein);
      setCarbs(profile.carbs);
      setFat(profile.fat);
      setDiet(profile.diet || "No preference");
    }
    if (user) setName(user.name);
  }, [profile, user]);

  // Computed calorie/macro suggestion
  const suggested = useMemo(() => {
    if (!dateOfBirth || !heightCm || !weightKg) return null;
    const age = Math.floor(
      (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel, workoutFrequency);
    const cals = calculateDailyCalories(tdee, goal, pace);
    const macros = calculateMacros(cals, weightKg, goal);
    return { calories: cals, ...macros };
  }, [dateOfBirth, heightCm, weightKg, gender, activityLevel, workoutFrequency, goal, pace]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const saveProfile = () => {
    updateProfile({
      gender,
      dateOfBirth,
      heightCm,
      weightKg,
      activityLevel: activityLevel as "sedentary" | "lightly_active" | "active" | "very_active",
      workoutFrequency: workoutFrequency as "0-2" | "3-5" | "6+",
      goal,
      targetWeightKg,
      pace,
      name,
    });
    if (user) {
      useAuthStore.setState({ user: { ...user, name } });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const saveNutrition = () => {
    updateProfile({ dailyCalories, protein, carbs, fat, diet });
    setNutritionSaved(true);
    setTimeout(() => setNutritionSaved(false), 2000);
  };

  const applyRecalculated = () => {
    if (!suggested) return;
    setDailyCalories(suggested.calories);
    setProtein(suggested.protein);
    setCarbs(suggested.carbs);
    setFat(suggested.fat);
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    settings.setBrowserPermission(permission);
  };

  const exportData = async () => {
    if (!user) return;
    const { supabase } = await import("@/lib/supabase");
    const tables = [
      "profiles", "food_entries", "water_entries", "daily_notes",
      "recipes", "workout_plans", "workout_sessions",
      "weight_log", "body_measurements", "fasting_sessions",
      "settings", "subscriptions",
    ];
    const data: Record<string, unknown> = {};
    for (const table of tables) {
      const col = table === "profiles" ? "id" : "user_id";
      const { data: rows } = await supabase.from(table).select("*").eq(col, user.id);
      if (rows && rows.length > 0) data[table] = rows;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helios-prime-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = async () => {
    if (!user) return;
    const { supabase } = await import("@/lib/supabase");
    const tables = [
      "food_entries", "water_entries", "daily_notes", "recipes",
      "workout_plans", "workout_sessions", "workout_active",
      "weight_log", "body_measurements",
      "fasting_sessions", "fasting_active", "fasting_preferences",
      "settings", "subscriptions",
    ];
    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id);
    }
    logout();
    router.push("/login");
  };

  const deleteAccount = async () => {
    if (!user) return;
    await clearAllData();
    // Note: Supabase Auth user deletion requires admin API or Edge Function
    // For now, data is cleared and user is signed out
  };

  if (!user) return null;

  const sectionClass =
    "rounded-2xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden";
  const sectionHeaderClass =
    "flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold transition hover:bg-foreground/5";
  const sectionBodyClass = "border-t border-foreground/10 px-6 py-5 space-y-4";
  const labelClass = "block text-xs font-medium text-foreground/60 mb-1.5";
  const inputClass =
    "w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30";
  const selectClass = inputClass + " appearance-none";
  const btnPrimary =
    "rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40";

  return (
    <div className="pb-24 md:pb-0">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {useSubscriptionStore.getState().isPro() && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500">
            <Crown className="h-3.5 w-3.5" /> PRO
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Profile */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("profile")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-accent" /> Profile
            </span>
            {openSection === "profile" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "profile" && (
            <div className={sectionBodyClass}>
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass + " text-foreground/40"} value={user.email} disabled />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Gender</label>
                  <select className={selectClass} value={gender} onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" className={inputClass} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Height (cm)</label>
                  <input type="number" className={inputClass} value={heightCm} onChange={(e) => setHeightCm(+e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input type="number" className={inputClass} value={weightKg} onChange={(e) => setWeightKg(+e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Activity Level</label>
                  <select className={selectClass} value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Workout Frequency</label>
                  <select className={selectClass} value={workoutFrequency} onChange={(e) => setWorkoutFrequency(e.target.value)}>
                    <option value="0-2">0-2 days/week</option>
                    <option value="3-5">3-5 days/week</option>
                    <option value="6+">6+ days/week</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Goal</label>
                  <select className={selectClass} value={goal} onChange={(e) => setGoal(e.target.value as "lose" | "maintain" | "gain")}>
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Target (kg)</label>
                  <input type="number" className={inputClass} value={targetWeightKg} onChange={(e) => setTargetWeightKg(+e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Pace ({pace}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={pace}
                    onChange={(e) => setPace(+e.target.value)}
                    className="mt-2 w-full accent-accent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={saveProfile} className={btnPrimary}>
                  {profileSaved ? "Saved!" : "Save Profile"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("achievements")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" /> Achievements
            </span>
            {openSection === "achievements" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "achievements" && (
            <div className="border-t border-foreground/10 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "first-workout", label: "First Workout", desc: "Complete your first session", icon: Trophy, unlocked: false },
                  { id: "burn-10k", label: "Burn 10,000 Cal", desc: "Total calories burned", icon: Flame, unlocked: false },
                  { id: "30-day-streak", label: "30 Day Streak", desc: "Log in for 30 consecutive days", icon: Calendar, unlocked: false },
                  { id: "lift-1000kg", label: "Lift 1,000kg", desc: "Total weight lifted", icon: Dumbbell, unlocked: false },
                ].map((a) => (
                  <div
                    key={a.id}
                    className={`relative rounded-xl border p-4 text-center transition ${
                      a.unlocked
                        ? "border-accent/30 bg-accent/5 shadow-[0_0_12px_rgba(255,223,0,0.15)]"
                        : "border-foreground/10 bg-foreground/[0.02]"
                    }`}
                  >
                    <a.icon
                      className={`mx-auto mb-2 h-7 w-7 ${
                        a.unlocked ? "text-accent" : "text-foreground/20"
                      }`}
                    />
                    <p className={`text-xs font-semibold ${a.unlocked ? "text-accent" : "text-foreground/60"}`}>
                      {a.label}
                    </p>
                    <p className="mt-0.5 text-[9px] text-foreground/40">{a.desc}</p>
                    {a.unlocked && (
                      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-accent text-[8px] font-bold leading-4 text-black">
                        !
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] text-foreground/30">
                Achievements unlock as you use the app
              </p>
            </div>
          )}
        </div>

        {/* Nutrition */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("nutrition")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-accent" /> Nutrition
            </span>
            {openSection === "nutrition" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "nutrition" && (
            <div className={sectionBodyClass}>
              {suggested && (
                <div className="flex items-center justify-between rounded-lg bg-accent/5 px-4 py-3 text-xs">
                  <span>
                    Suggested: <strong>{suggested.calories}</strong> kcal &middot;{" "}
                    P {suggested.protein}g &middot; C {suggested.carbs}g &middot; F {suggested.fat}g
                  </span>
                  <button
                    onClick={applyRecalculated}
                    className="ml-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-accent-dark"
                  >
                    Apply
                  </button>
                </div>
              )}
              <div>
                <label className={labelClass}>Daily Calories (kcal)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(+e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Protein (g)</label>
                  <input type="number" className={inputClass} value={protein} onChange={(e) => setProtein(+e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Carbs (g)</label>
                  <input type="number" className={inputClass} value={carbs} onChange={(e) => setCarbs(+e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Fat (g)</label>
                  <input type="number" className={inputClass} value={fat} onChange={(e) => setFat(+e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Diet Preference</label>
                <select className={selectClass} value={diet} onChange={(e) => setDiet(e.target.value)}>
                  {DIET_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button onClick={saveNutrition} className={btnPrimary}>
                  {nutritionSaved ? "Saved!" : "Save Nutrition"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Units */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("units")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-accent" /> Units
            </span>
            {openSection === "units" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "units" && (
            <div className={sectionBodyClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Measurement System</p>
                  <p className="text-xs text-foreground/50">Display conversion coming soon</p>
                </div>
                <div className="flex rounded-lg bg-foreground/5 p-1">
                  {(["metric", "imperial"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => settings.setUnits(user.id, u)}
                      className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                        settings.units === u
                          ? "bg-accent text-black"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {u === "metric" ? "Metric" : "Imperial"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("appearance")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" /> Appearance
            </span>
            {openSection === "appearance" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "appearance" && (
            <div className={sectionBodyClass}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Theme</p>
                <div className="flex rounded-lg bg-foreground/5 p-1">
                  {([
                    { value: "system" as const, icon: Monitor, label: "System" },
                    { value: "light" as const, icon: Sun, label: "Light" },
                    { value: "dark" as const, icon: Moon, label: "Dark" },
                  ]).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => settings.setTheme(user.id, t.value)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        settings.theme === t.value
                          ? "bg-accent text-black"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("notifications")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" /> Notifications
            </span>
            {openSection === "notifications" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "notifications" && (
            <div className={sectionBodyClass}>
              {settings.browserPermission === "denied" ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-xs text-red-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Notifications are blocked. Please enable them in your browser settings.
                </div>
              ) : settings.browserPermission !== "granted" ? (
                <div className="flex items-center justify-between rounded-lg bg-accent/5 px-4 py-3">
                  <span className="text-xs">Enable browser notifications for reminders</span>
                  <button
                    onClick={requestNotificationPermission}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-accent-dark"
                  >
                    Allow
                  </button>
                </div>
              ) : null}

              {(Object.keys(NOTIFICATION_LABELS) as (keyof NotificationSettings)[]).map((key) => {
                const pref = settings.notifications[key];
                const { label, desc } = NOTIFICATION_LABELS[key];
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-foreground/50">{desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={pref.time}
                        onChange={(e) =>
                          settings.updateNotification(user.id, key, { time: e.target.value })
                        }
                        disabled={!pref.enabled}
                        className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-xs outline-none disabled:opacity-30"
                      />
                      <ToggleSwitch
                        checked={pref.enabled}
                        onChange={(val) =>
                          settings.updateNotification(user.id, key, { enabled: val })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Data & Privacy */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("data")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" /> Data & Privacy
            </span>
            {openSection === "data" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "data" && (
            <div className={sectionBodyClass}>
              <button
                onClick={exportData}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-foreground/5"
              >
                <Download className="h-4 w-4 text-accent" />
                <div className="text-left">
                  <p className="font-medium">Export Data</p>
                  <p className="text-xs text-foreground/50">Download all your data as JSON</p>
                </div>
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-foreground/5"
              >
                <Trash2 className="h-4 w-4 text-orange-400" />
                <div className="text-left">
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-xs text-foreground/50">Remove all stored data and sign out</p>
                </div>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-foreground/5"
              >
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div className="text-left">
                  <p className="font-medium text-red-400">Delete Account</p>
                  <p className="text-xs text-foreground/50">
                    Permanently delete your account and all data
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* About */}
        <div className={sectionClass}>
          <button onClick={() => toggleSection("about")} className={sectionHeaderClass}>
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" /> About
            </span>
            {openSection === "about" ? (
              <ChevronUp className="h-4 w-4 text-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground/40" />
            )}
          </button>
          {openSection === "about" && (
            <div className={sectionBodyClass}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">Version</span>
                <span className="font-mono text-xs">0.1.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">GitHub</span>
                <a
                  href="https://github.com/dacian-dinis/helios-prime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  dacian-dinis/helios-prime
                </a>
              </div>
            </div>
          )}
        </div>
        {/* Log Out */}
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 py-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>

      {/* Clear data confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Clear All Data?</h3>
              <button onClick={() => setShowClearConfirm(false)}>
                <X className="h-5 w-5 text-foreground/40" />
              </button>
            </div>
            <p className="mb-6 text-sm text-foreground/60">
              This will remove all your stored data and sign you out. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-foreground/15 py-2.5 text-sm font-medium transition hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Delete Account?</h3>
              <button onClick={() => setShowDeleteConfirm(false)}>
                <X className="h-5 w-5 text-foreground/40" />
              </button>
            </div>
            <p className="mb-6 text-sm text-foreground/60">
              This will permanently delete your account and all associated data. This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-foreground/15 py-2.5 text-sm font-medium transition hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
