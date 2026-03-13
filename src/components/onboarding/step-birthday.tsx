"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function StepBirthday({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">When were you born?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Your age helps us calculate your metabolism
      </p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        className="w-full max-w-xs rounded-xl border border-foreground/20 bg-foreground/5 px-5 py-4 text-center text-lg outline-none transition focus:border-accent"
      />
    </div>
  );
}
