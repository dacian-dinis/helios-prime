"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
}

export default function StepBirthday({ value, onChange }: Props) {
  // Parse initial value
  const parts = value ? value.split("-") : ["", "", ""];
  const [dd, setDd] = useState(parts[2] || "");
  const [mm, setMm] = useState(parts[1] || "");
  const [yyyy, setYyyy] = useState(parts[0] || "");

  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  // Sync back to parent as YYYY-MM-DD
  useEffect(() => {
    if (dd && mm && yyyy && yyyy.length === 4) {
      onChange(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
    }
  }, [dd, mm, yyyy, onChange]);

  const handleDd = (v: string) => {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setDd(num);
    if (num.length === 2) mmRef.current?.focus();
  };

  const handleMm = (v: string) => {
    const num = v.replace(/\D/g, "").slice(0, 2);
    setMm(num);
    if (num.length === 2) yyyyRef.current?.focus();
  };

  const handleYyyy = (v: string) => {
    const num = v.replace(/\D/g, "").slice(0, 4);
    setYyyy(num);
  };

  const inputClass =
    "w-full rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-4 text-center text-lg outline-none transition focus:border-accent";

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">When were you born?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Your age helps us calculate your metabolism
      </p>
      <div className="flex w-full max-w-xs items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD"
          value={dd}
          onChange={(e) => handleDd(e.target.value)}
          maxLength={2}
          className={inputClass}
        />
        <span className="text-lg text-foreground/30">/</span>
        <input
          ref={mmRef}
          type="text"
          inputMode="numeric"
          placeholder="MM"
          value={mm}
          onChange={(e) => handleMm(e.target.value)}
          maxLength={2}
          className={inputClass}
        />
        <span className="text-lg text-foreground/30">/</span>
        <input
          ref={yyyyRef}
          type="text"
          inputMode="numeric"
          placeholder="YYYY"
          value={yyyy}
          onChange={(e) => handleYyyy(e.target.value)}
          maxLength={4}
          className={inputClass}
        />
      </div>
    </div>
  );
}
