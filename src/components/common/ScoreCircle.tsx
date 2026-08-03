"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getScoreColorHex, getScoreLabel } from "@/lib/scoreUtils";

interface ScoreCircleProps {
  score: number;
  size?: "small" | "medium" | "large";
  animated?: boolean;
}

const SIZES = {
  small: 240,
  medium: 260,
  large: 280,
};

export function ScoreCircle({
  score,
  size = "large",
  animated = true,
}: ScoreCircleProps) {
  const diameter = SIZES[size];
  const radius = diameter / 2;
  const circumference = 2 * Math.PI * (radius - 8);
  const strokeDashoffset = circumference * (1 - score / 100);
  const color = getScoreColorHex(score);
  const label = getScoreLabel(score);

  const prefersReducedMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(animated && !prefersReducedMotion ? 0 : score);

  useEffect(() => {
    if (!animated || prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    let startTime: number;
    const animateDuration = 1000; // slightly faster for a more purposeful feel

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animateDuration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentNumber = Math.floor(easeProgress * score);

      setDisplayScore(currentNumber);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated, prefersReducedMotion]);

  return (
    <div className="flex items-center justify-center animate-fade-in relative">
      <div style={{ width: diameter, height: diameter }} className="relative">
        <svg
          width={diameter}
          height={diameter}
          className="absolute inset-0"
        >
          {/* Background circle track */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 8}
            fill="none"
            stroke="rgba(1, 71, 46, 0.08)"
            strokeWidth="2"
          />

          {/* Foreground colored circle progress */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 8}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={animated && !prefersReducedMotion ? strokeDashoffset : strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transformOrigin: `${radius}px ${radius}px`,
              transform: "rotate(-90deg)",
              transition: animated && !prefersReducedMotion ? "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" : "none" 
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-7xl font-display text-[#01472e] leading-none"
          >
            {displayScore}
          </div>
          <div className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-[#01472e]/60 mt-1">/100</div>
          <div
            className="text-xs font-bold font-sans uppercase tracking-[0.2em] mt-3"
            style={{ color }}
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
