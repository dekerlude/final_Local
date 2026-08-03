import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-r from-tertiary via-secondary to-tertiary",
        className
      )}
      animate={{
        backgroundPosition: ["200% 0", "-200% 0"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
      {...props}
    />
  );
}


export { Skeleton };
