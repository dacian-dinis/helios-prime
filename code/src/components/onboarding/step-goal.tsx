"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const options = [
  { value: "lose", label: "Lose weight", icon: "📉", desc: "Burn fat and get lean" },
  { value: "maintain", label: "Maintain weight", icon: "⚖️", desc: "Stay at your current weight" },
  { value: "gain", label: "Gain weight", icon: "📈", desc: "Build muscle and bulk up" },
];

export default function StepGoal({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">What is your goal?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        This shapes your entire plan
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
            <span className="text-2xl">{opt.icon}</span>
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
