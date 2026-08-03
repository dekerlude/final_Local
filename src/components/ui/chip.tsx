"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-2 rounded-full transition-all duration-400 ease-premium hover:shadow-md",
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
        outline:
          "border border-primary/30 bg-transparent text-text-secondary",
      },
      size: {
        sm: "text-[9px] font-sans font-bold uppercase tracking-[0.15em] px-3 py-1",
        md: "text-[10px] font-sans font-bold uppercase tracking-[0.15em] px-4 py-1.5",
        lg: "text-xs font-sans font-bold uppercase tracking-[0.2em] px-5 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void;
  removable?: boolean;
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    { className, variant, size, onRemove, removable = false, icon, children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
