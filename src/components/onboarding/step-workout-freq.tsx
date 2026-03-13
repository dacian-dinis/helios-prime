"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const options = [
  { value: "0-2", label: "0-2 per week", desc: "Now and then", icon: "🌱" },
  { value: "3-5", label: "3-5 per week", desc: "A few per week", icon: "💪" },
  { value: "6+", label: "6+ per week", desc: "Dedicated athlete", icon: "🏆" },
];

export default function StepWorkoutFreq({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">How often do you work out?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Weekly workout sessions
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
