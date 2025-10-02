"use client";

import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  duration: number; // milliseconds
  text: string; // loading message
};

export default function ProgressLoading({ duration, text }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = 100;
    const intervalTime = duration / steps; // evenly spread increments
    let count = 0;

    const interval = setInterval(() => {
      count++;
      setProgress((count / steps) * 100);

      if (count >= steps) {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-muted">
      <div className="flex flex-col items-center gap-6 w-80">
        <p className="text-lg font-medium text-muted-foreground">{text}</p>
        <Progress value={progress} className="w-full h-2" />
      </div>
    </div>
  );
}
