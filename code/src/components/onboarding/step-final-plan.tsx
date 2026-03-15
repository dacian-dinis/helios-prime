"use client";

interface Props {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function StepFinalPlan({ calories, protein, carbs, fat }: Props) {
  const macros = [
    { label: "Protein", value: `${protein}g`, color: "bg-blue-500", pct: Math.round((protein * 4 / calories) * 100) },
    { label: "Carbs", value: `${carbs}g`, color: "bg-amber-500", pct: Math.round((carbs * 4 / calories) * 100) },
    { label: "Fat", value: `${fat}g`, color: "bg-rose-500", pct: Math.round((fat * 9 / calories) * 100) },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-4xl">🎉</div>
      <h2 className="mb-2 text-2xl font-bold">Your plan is ready!</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Here&apos;s your personalized daily target
      </p>

      <div className="w-full max-w-xs rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground/60">Daily Calories</p>
        <p className="mt-1 text-5xl font-extrabold text-accent">{calories.toLocaleString()}</p>
        <p className="text-sm text-foreground/50">kcal</p>
      </div>

      <div className="mt-6 grid w-full max-w-xs grid-cols-3 gap-3">
        {macros.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 text-center"
          >
            <div className={`mx-auto mb-2 h-1.5 w-10 rounded-full ${m.color} opacity-60`} />
            <p className="text-lg font-bold">{m.value}</p>
            <p className="text-[10px] text-foreground/50">
              {m.label} ({m.pct}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
