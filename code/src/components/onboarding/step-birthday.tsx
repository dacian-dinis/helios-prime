"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const pad = (value: string | number) => String(value).padStart(2, "0");

const isValidDate = (d: number, m: number, y: number) => {
  if (y < 1900 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

export default function StepBirthday({ value, onChange }: Props) {
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const [day, setDay] = useState(() => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return pad(parsed.getDate());
  });

  const [month, setMonth] = useState(() => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return pad(parsed.getMonth() + 1);
  });

  const [year, setYear] = useState(() => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return String(parsed.getFullYear());
  });

  const tryUpdateDob = (newDay: string, newMonth: string, newYear: string) => {
    const d = Number(newDay);
    const m = Number(newMonth);
    const y = Number(newYear);

    if (newDay.length >= 1 && newMonth.length >= 1 && newYear.length === 4 && isValidDate(d, m, y)) {
      onChange(`${y}-${pad(m)}-${pad(d)}`);
    } else {
      onChange("");
    }
  };

  const onDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(raw);
    tryUpdateDob(raw, month, year);
    if (raw.length === 2) monthRef.current?.focus();
  };

  const onMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(raw);
    tryUpdateDob(day, raw, year);
    if (raw.length === 2) yearRef.current?.focus();
  };

  const onYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(raw);
    tryUpdateDob(day, month, raw);
  };

  const inputClass =
    "w-full rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-3 text-center text-lg outline-none transition focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-2xl font-bold">When were you born?</h2>
      <p className="mb-8 text-sm text-foreground/50">
        Your age helps us calculate your metabolism
      </p>

      <div className="flex w-full max-w-xs items-start justify-between gap-3">
        <div className="flex w-1/3 flex-col items-center gap-1">
          <label className="text-xs font-medium text-foreground/50">Day</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="DD"
            value={day}
            onChange={onDayChange}
            className={inputClass}
          />
        </div>
        <div className="flex w-1/3 flex-col items-center gap-1">
          <label className="text-xs font-medium text-foreground/50">Month</label>
          <input
            ref={monthRef}
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            placeholder="MM"
            value={month}
            onChange={onMonthChange}
            className={inputClass}
          />
        </div>
        <div className="flex w-1/3 flex-col items-center gap-1">
          <label className="text-xs font-medium text-foreground/50">Year</label>
          <input
            ref={yearRef}
            type="number"
            inputMode="numeric"
            min={1900}
            max={new Date().getFullYear()}
            placeholder="YYYY"
            value={year}
            onChange={onYearChange}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
