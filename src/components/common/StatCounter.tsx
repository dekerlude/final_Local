"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StatCounterProps {
  value: number | string;
  label: string;
  isNumeric?: boolean;
  duration?: number;
}

export function StatCounter({
  value,
  label,
  isNumeric = true,
  duration = 1.5,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();
  const numValue = typeof value === "string" ? parseInt(value) : value;

  useEffect(() => {
    if (!isInView || !isNumeric || prefersReducedMotion) {
      setDisplayValue(numValue);
      return;
    }

    let startTime: number;
    const targetValue = numValue;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress * (2 * 1.56 * progress - 1.56 + 1)
          : 1 -
            Math.pow(-2 * progress + 2, 2) /
              2 /
              (2 * 1.56 * progress - 1.56 + 1);

      setDisplayValue(Math.floor(easeProgress * targetValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, numValue, duration, isNumeric, prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center group"
    >
      <motion.div
        className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2"
        animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
        transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
      >
        {isNumeric ? displayValue : value}
        {typeof value === "string" && value.endsWith("+") ? "+" : ""}
      </motion.div>
      <motion.div
        className="text-sm font-medium text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
