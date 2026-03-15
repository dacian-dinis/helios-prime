"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros, daysToGoal } from "@/lib/utils";
import StepGender from "@/components/onboarding/step-gender";
import StepBirthday from "@/components/onboarding/step-birthday";
import StepMeasurements from "@/components/onboarding/step-measurements";
import StepGoal from "@/components/onboarding/step-goal";
import StepTargetWeight from "@/components/onboarding/step-target-weight";
import StepPace from "@/components/onboarding/step-pace";
import StepActivity from "@/components/onboarding/step-activity";
import StepWorkoutFreq from "@/components/onboarding/step-workout-freq";
import StepDiet from "@/components/onboarding/step-diet";
import StepObstacles from "@/components/onboarding/step-obstacles";
import StepAddBackCalories from "@/components/onboarding/step-add-back-calories";
import StepProcessing from "@/components/onboarding/step-processing";
import StepProjection from "@/components/onboarding/step-projection";
import StepFinalPlan from "@/components/onboarding/step-final-plan";

const TOTAL_STEPS = 14; // 0-indexed: 0=gender, ..., 13=final plan

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, updateProfile, loadFromStorage, isLoading } = useAuthStore();

  const [step, setStep] = useState(0);

  // Form state
  const [gender, setGender] = useState("male");
  const [dob, setDob] = useState("");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [bodyFat, setBodyFat] = useState<number | undefined>();
  const [goal, setGoal] = useState("lose");
  const [targetWeight, setTargetWeight] = useState(70);
  const [pace, setPace] = useState(50);
  const [activityLevel, setActivityLevel] = useState("lightly_active");
  const [workoutFreq, setWorkoutFreq] = useState("3-5");
  const [diet, setDiet] = useState("classic");
  const [obstacles, setObstacles] = useState<string[]>([]);
  const [addBackCals, setAddBackCals] = useState(false);

  // Computed values
  const age = useMemo(() => {
    if (!dob) return 25;
    const birth = new Date(dob);
    const now = new Date();
    let a = now.getFullYear() - birth.getFullYear();
    if (
      now.getMonth() < birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    )
      a--;
    return a;
  }, [dob]);

  const computed = useMemo(() => {
    const bmr = calculateBMR(weightKg, heightCm, age, gender as "male" | "female" | "other");
    const tdee = calculateTDEE(bmr, activityLevel, workoutFreq);
    const dailyCals = calculateDailyCalories(tdee, goal, pace);
    const macros = calculateMacros(dailyCals, weightKg, goal);
    const days = daysToGoal(weightKg, targetWeight, dailyCals, tdee);
    return { bmr, tdee, dailyCals, ...macros, days };
  }, [weightKg, heightCm, age, gender, activityLevel, workoutFreq, goal, pace, targetWeight]);

  // Processing complete callback
  const [processingDone, setProcessingDone] = useState(false);
  const onProcessingComplete = useCallback(() => setProcessingDone(true), []);

  useEffect(() => {
    if (processingDone) setStep(12);
  }, [processingDone]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && profile?.onboardingComplete) router.push("/dashboard");
  }, [user, profile, isLoading, router]);

  const canProceed = () => {
    switch (step) {
      case 0: return !!gender;
      case 1: return !!dob;
      case 2: return heightCm > 0 && weightKg > 0;
      case 3: return !!goal;
      case 4: return targetWeight > 0;
      case 5: return true; // pace always valid
      case 6: return !!activityLevel;
      case 7: return !!workoutFreq;
      case 8: return !!diet;
      case 9: return true; // obstacles optional
      case 10: return true; // addBackCals always has a value
      default: return true;
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      // Skip processing screen when going back
      if (step === 12) setStep(10);
      else setStep(step - 1);
    }
  };

  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    await updateProfile({
      gender: gender as "male" | "female" | "other",
      dateOfBirth: dob,
      heightCm,
      weightKg,
      bodyFatPercent: bodyFat,
      goal: goal as "lose" | "maintain" | "gain",
      targetWeightKg: targetWeight,
      pace,
      activityLevel: activityLevel as "sedentary" | "lightly_active" | "active" | "very_active",
      workoutFrequency: workoutFreq as "0-2" | "3-5" | "6+",
      diet,
      obstacles,
      addBackCalories: addBackCals,
      dailyCalories: computed.dailyCals,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      onboardingComplete: true,
    });
    router.push("/dashboard");
  };

  if (isLoading || !user) return null;

  const isProcessing = step === 11;
  const showNav = !isProcessing;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      {showNav && (
        <div className="fixed top-0 z-50 w-full">
          <div className="h-1 bg-foreground/10">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      {showNav && (
        <div className="flex items-center justify-between px-6 py-4 pt-5">
          {step > 0 ? (
            <button
              onClick={back}
              className="text-sm font-medium text-foreground/60 transition hover:text-foreground"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <span className="text-xs text-foreground/40">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
      )}

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        {step === 0 && <StepGender value={gender} onChange={setGender} />}
        {step === 1 && <StepBirthday value={dob} onChange={setDob} />}
        {step === 2 && (
          <StepMeasurements
            height={heightCm}
            weight={weightKg}
            bodyFat={bodyFat}
            onChange={(d) => {
              setHeightCm(d.height);
              setWeightKg(d.weight);
              setBodyFat(d.bodyFat);
            }}
          />
        )}
        {step === 3 && <StepGoal value={goal} onChange={setGoal} />}
        {step === 4 && (
          <StepTargetWeight
            value={targetWeight}
            currentWeight={weightKg}
            goal={goal}
            onChange={setTargetWeight}
          />
        )}
        {step === 5 && (
          <StepPace
            value={pace}
            currentWeight={weightKg}
            targetWeight={targetWeight}
            goal={goal}
            gender={gender}
            heightCm={heightCm}
            age={age}
            activityLevel={activityLevel}
            workoutFrequency={workoutFreq}
            onChange={setPace}
          />
        )}
        {step === 6 && <StepActivity value={activityLevel} onChange={setActivityLevel} />}
        {step === 7 && <StepWorkoutFreq value={workoutFreq} onChange={setWorkoutFreq} />}
        {step === 8 && <StepDiet value={diet} onChange={setDiet} />}
        {step === 9 && <StepObstacles value={obstacles} onChange={setObstacles} />}
        {step === 10 && <StepAddBackCalories value={addBackCals} onChange={setAddBackCals} />}
        {step === 11 && <StepProcessing onComplete={onProcessingComplete} />}
        {step === 12 && (
          <StepProjection
            currentWeight={weightKg}
            targetWeight={targetWeight}
            days={computed.days}
          />
        )}
        {step === 13 && (
          <StepFinalPlan
            calories={computed.dailyCals}
            protein={computed.protein}
            carbs={computed.carbs}
            fat={computed.fat}
          />
        )}
      </div>

      {/* Bottom button */}
      {showNav && (
        <div className="px-6 pb-8">
          {step === 13 ? (
            <button
              onClick={finish}
              disabled={saving}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : "Let\u2019s Go! \u2192"}
            </button>
          ) : (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-dark disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
