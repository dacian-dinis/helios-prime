"use client";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

const options = [
  { value: "consistency", label: "Lack of consistency", icon: "🔄" },
  { value: "eating", label: "Unhealthy eating habits", icon: "🍕" },
  { value: "busy", label: "Busy schedule", icon: "⏰" },
  { value: "inspiration", label: "Lack of meal inspiration", icon: "💡" },
  { value: "support", label: "Lack of support", icon: "🤝" },
];

export default function StepObstacles({ value, onChange }: Props) {
  const toggle = (v: string) => {
    onChange(
      value.includes(v) ? value.filter((x) => x !== v) : [...value, v]
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">What&apos;s stopping you?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Select all that apply — we&apos;ll help you overcome them
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left transition-all ${
              value.includes(opt.value)
                ? "border-accent bg-accent/10"
                : "border-foreground/15 hover:border-foreground/30"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className={`text-sm font-medium ${value.includes(opt.value) ? "text-accent" : ""}`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
