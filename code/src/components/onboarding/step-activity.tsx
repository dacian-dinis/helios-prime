"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const options = [
  { value: "sedentary", label: "Sedentary", desc: "Less than 5,000 steps", icon: "🪑" },
  { value: "lightly_active", label: "Lightly Active", desc: "5,000 - 10,000 steps", icon: "🚶" },
  { value: "active", label: "Active", desc: "10,000+ steps", icon: "🏃" },
  { value: "very_active", label: "Very Active", desc: "Highly physical job", icon: "⚡" },
];

export default function StepActivity({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Your daily activity level</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Outside of workouts, how active are you?
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition-all ${
              value === opt.value
                ? "border-accent bg-accent/10"
                : "border-foreground/15 hover:border-foreground/30"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${value === opt.value ? "text-accent" : ""}`}>
                {opt.label}
              </p>
              <p className="text-xs text-foreground/50">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
