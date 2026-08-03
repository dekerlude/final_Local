"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SCORE_CATEGORIES } from "@/constants/profiles";
import { getScoreLabel, getScoreGradientColor as getScoreColor, getScoreGradientText } from "@/lib/scoreUtils";
import { TrendingUp } from "lucide-react";
import { cardHover } from "@/hooks/usePageAnimation";

interface CategoryScore {
  category: string;
  score: number;
  rawScore?: number;
  delta?: number;
}

interface ScoreCategoryBreakdownProps {
  scores: CategoryScore[];
  showComparison?: boolean;
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
    transition: { duration: 0.5 },
  },
};



function ScoreCategoryBreakdownComponent({
  scores,
  showComparison = false,
}: ScoreCategoryBreakdownProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 px-2 sm:px-0"
    >
      {/* Header */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-2 sm:gap-3 mb-2"
        >
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
            Score Breakdown
          </h2>
        </motion.div>
        <p className="text-sm sm:text-base md:text-lg text-text-secondary">
          How this neighborhood scores across 6 key factors
        </p>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {scores.map((categoryScore, idx) => {
          const categoryDef = SCORE_CATEGORIES.find(
            (c) => c.id === categoryScore.category
          );

          if (!categoryDef) return null;

          const label = getScoreLabel(categoryScore.score);
          const gradientColor = getScoreColor(categoryScore.score);
          const textColor = getScoreGradientText(categoryScore.score);

          return (
            <motion.div key={categoryScore.category} variants={itemVariants}>
              <motion.div
                className="relative group h-full"
                {...cardHover}
              >
                {/* Gradient border glow */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10 bg-gradient-to-r ${gradientColor}`}
                />

                {/* Card */}
                <Card className="p-6 h-full relative overflow-hidden bg-white/80 dark:bg-primary/15 border-border/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  {/* Animated background */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${gradientColor}`}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: idx * 0.1,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                          className="text-3xl mb-3"
                        >
                          {categoryDef.icon}
                        </motion.div>
                        <motion.h3
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.05 }}
                          className="font-semibold text-base text-text-primary"
                        >
                          {categoryDef.label}
                        </motion.h3>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.3 + idx * 0.1,
                          duration: 0.4,
                        }}
                        className={`text-3xl font-bold ${textColor}`}
                      >
                        <AnimatedCounter value={categoryScore.score} duration={1.2} />
                      </motion.div>
                    </div>

                    {/* Progress Bar with gradient */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="mb-4"
                    >
                      <div className="relative h-3 rounded-full bg-gray-200 dark:bg-gray-700/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${categoryScore.score}%` }}
                          transition={{
                            delay: 0.5 + idx * 0.1,
                            duration: 1,
                            ease: "easeOut",
                          }}
                          className={`h-full bg-gradient-to-r ${gradientColor} rounded-full shadow-lg`}
                        />
                      </div>
                    </motion.div>

                    {/* Label */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className={`text-xs font-semibold ${textColor}`}
                    >
                      {label}
                    </motion.p>

                    {/* Comparison Delta */}
                    {showComparison &&
                      categoryScore.delta !== undefined &&
                      categoryScore.delta !== 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="mt-4 pt-4 border-t border-border/50"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">
                              Base:{" "}
                              <span className="font-semibold text-text-primary">
                                {categoryScore.rawScore || categoryScore.score}
                              </span>
                            </span>
                            <motion.span
                              className={`font-semibold flex items-center gap-1 ${
                                categoryScore.delta > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : categoryScore.delta < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-text-secondary"
                              }`}
                              animate={{
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: idx * 0.2,
                              }}
                            >
                              {categoryScore.delta > 0 ? "+" : ""}
                              {categoryScore.delta}
                            </motion.span>
                          </div>
                        </motion.div>
                      )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export const ScoreCategoryBreakdown = memo(ScoreCategoryBreakdownComponent);
