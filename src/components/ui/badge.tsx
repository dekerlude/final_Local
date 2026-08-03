"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.15em] transition-all duration-400 ease-premium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary/5 text-primary",
        secondary:
          "border border-primary/20 bg-secondary text-text-primary",
        success:
          "border border-[#01472e] bg-[#ccd5ae]/30 text-[#01472e]",
        warning:
          "border border-[#854d0e] bg-[#fefae0]/50 text-[#854d0e]",
        danger:
          "border border-[#7f1d1d] bg-[#7f1d1d]/5 text-[#7f1d1d]",
        info: "border border-primary bg-primary/5 text-primary",
        outline:
          "border border-primary/30 bg-transparent text-text-secondary hover:bg-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
