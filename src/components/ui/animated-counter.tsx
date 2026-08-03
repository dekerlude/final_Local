"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (latest) => {
    const rounded =
      decimals === 0
        ? Math.round(latest)
        : parseFloat(latest.toFixed(decimals));
    return `${prefix}${rounded}${suffix}`;
  });

  useEffect(() => {
    const animation = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });

    return () => animation.stop();
  }, [motionValue, value, duration]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
