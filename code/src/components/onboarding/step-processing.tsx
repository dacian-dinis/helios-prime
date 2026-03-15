"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

const messages = [
  "Analyzing your profile...",
  "Calculating metabolic rate...",
  "Building your macro split...",
  "Generating your custom plan...",
];

export default function StepProcessing({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const idx = Math.min(Math.floor(progress / 25), messages.length - 1);
    setMsgIndex(idx);
  }, [progress]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-5xl">⚡</div>
      <h2 className="mb-2 text-2xl font-bold">Setting everything up</h2>
      <p className="mb-8 text-sm text-foreground/50">{messages[msgIndex]}</p>
      <div className="w-full max-w-xs">
        <div className="h-3 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-accent">
          {progress}%
        </p>
      </div>
    </div>
  );
}
