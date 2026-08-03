"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SCORE_CATEGORIES } from "@/constants/profiles";
import { TrendingUp } from "lucide-react";

interface CategoryData {
  category: string;
  score1: number;
  score2: number;
}

interface CategoryComparisonProps {
  categories: CategoryData[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

function getWinner(score1: number, score2: number): 1 | 2 | 0 {
  if (score1 > score2) return 1;
  if (score2 > score1) return 2;
  return 0;
}

export function CategoryComparison({
  categories,
}: CategoryComparisonProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 px-2 sm:px-0"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-forest flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
            Category Breakdown
          </h2>
          <p className="text-xs text-[#01472e]/60 mt-1">
            Compare performance vectors across all six urban indexes
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((cat, idx) => {
          const categoryDef = SCORE_CATEGORIES.find((c) => c.id === cat.category);
          if (!categoryDef) return null;

          const winner = getWinner(cat.score1, cat.score2);
          const diff = Math.abs(cat.score1 - cat.score2);

          return (
            <motion.div key={cat.category} variants={itemVariants}>
              <Card className="p-6 relative overflow-hidden bg-[#fefae0] border border-[#01472e]/10 rounded-[2.5rem] hover:shadow-md transition-all duration-300">
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoryDef.icon}</span>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e]">
                        {categoryDef.label}
                      </h3>
                    </div>
                    {winner !== 0 && (
                      <div className="text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-1 bg-[#ccd5ae]/20 text-[#01472e] rounded-full">
                        {winner === 1 ? "← " : "→ "}
                        {diff} pts
                      </div>
                    )}
                  </div>

                  {/* Score bars side by side */}
                  <div className="space-y-4">
                    {/* Neighborhood 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/60">
                          First Area
                        </span>
                        <span className="text-xs font-sans font-bold text-[#01472e]">
                          {cat.score1}
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-[#01472e]/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.score1}%` }}
                          transition={{
                            delay: 0.2 + idx * 0.05,
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full bg-forest rounded-full"
                        />
                      </div>
                    </div>

                    {/* Neighborhood 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/60">
                          Second Area
                        </span>
                        <span className="text-xs font-sans font-bold text-[#01472e]">
                          {cat.score2}
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-[#01472e]/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.score2}%` }}
                          transition={{
                            delay: 0.2 + idx * 0.05,
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full bg-moss rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
