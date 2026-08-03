"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AccessibleButtonProps {
  children: ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function AccessibleButton({
  children,
  ariaLabel,
  ariaDescribedBy,
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: AccessibleButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${className} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.button>
  );
}
