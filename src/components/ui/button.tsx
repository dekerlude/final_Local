import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-sans font-bold uppercase tracking-wider transition-all duration-400 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01472e] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#01472e]/20 disabled:text-[#01472e]/50 disabled:border-transparent disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        secondary:
          "bg-[#e9edc9] text-[#01472e] hover:bg-[#ccd5ae] border border-[#01472e]/20 shadow-xs hover:shadow-sm active:scale-[0.98]",
        outline:
          "border-2 border-[#01472e] bg-transparent text-[#01472e] hover:bg-[#01472e] hover:text-[#fefae0] shadow-xs active:scale-[0.98]",
        ghost:
          "text-[#01472e] hover:bg-[#01472e]/10 active:scale-[0.98]",
        danger:
          "bg-[#7f1d1d] text-white hover:bg-[#7f1d1d]/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        success:
          "bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90 shadow-sm hover:shadow-md active:scale-[0.98]",
        "gradient-primary":
          "bg-gradient-to-r from-[#01472e] to-[#015c3c] text-[#fefae0] shadow-md hover:shadow-lg active:scale-[0.98]",
      },
      size: {
        xs: "h-8 px-3 text-[10px]",
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-xs",
        lg: "h-12 px-8 text-xs sm:text-sm",
        xl: "h-14 px-10 text-sm",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...(props as any)}
    />
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
