"use client";

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function StepAddBackCalories({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Exercise calories</h2>
      <p className="mx-auto mb-8 max-w-sm text-center text-sm text-foreground/50">
        If you burn 300 calories exercising, should we add 300 extra calories to
        your daily goal?
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => onChange(true)}
          className={`rounded-xl border px-5 py-4 text-sm font-semibold transition-all ${
            value === true
              ? "border-accent bg-accent/10 text-accent"
              : "border-foreground/15 hover:border-foreground/30"
          }`}
        >
          Yes, add them back
        </button>
        <button
          onClick={() => onChange(false)}
          className={`rounded-xl border px-5 py-4 text-sm font-semibold transition-all ${
            value === false
              ? "border-accent bg-accent/10 text-accent"
              : "border-foreground/15 hover:border-foreground/30"
          }`}
        >
          No, keep my goal fixed
        </button>
      </div>
    </div>
  );
}
