"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const options = [
  { value: "classic", label: "Classic", icon: "🍽️" },
  { value: "pescatarian", label: "Pescatarian", icon: "🐟" },
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "keto", label: "Keto", icon: "🥑" },
  { value: "high-protein", label: "High-Protein", icon: "🥩" },
];

export default function StepDiet({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Do you follow a specific diet?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        We&apos;ll tailor meal suggestions accordingly
      </p>
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all ${
              value === opt.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-foreground/15 hover:border-foreground/30"
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-xs font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
