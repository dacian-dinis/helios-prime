"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const options = [
  { value: "male", label: "Male", icon: "♂️" },
  { value: "female", label: "Female", icon: "♀️" },
  { value: "other", label: "Prefer not to say", icon: "⚧️" },
];

export default function StepGender({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">Choose your Gender</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Used to calculate accurate metabolic rates
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all ${
              value === opt.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-foreground/15 hover:border-foreground/30"
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
