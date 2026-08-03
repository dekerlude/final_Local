"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScoreCircle } from "@/components/common";
import { Users, Zap, TrendingUp, Award } from "lucide-react";
import { cardHover } from "@/hooks/usePageAnimation";

interface NeighborhoodStatsProps {
  score: number;
  population: number;
  walkScore?: number;
  priceIndex?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function NeighborhoodStatsComponent({
  score,
  population,
  walkScore = 72,
  priceIndex = 85,
}: NeighborhoodStatsProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {/* Main Score Card - Large */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <div className="relative group h-full">
          {/* Gradient border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary-hover rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />

          {/* Card */}
          <Card className="p-10 h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-primary/20 dark:to-primary/10 border-border/50 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-semibold text-text-secondary mb-8 tracking-wide"
              >
                OVERALL NEIGHBORHOOD SCORE
              </motion.p>
              <ScoreCircle score={score} size="large" animated={true} />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-sm text-text-secondary leading-relaxed max-w-xs"
              >
                {score >= 80
                  ? "Excellent neighborhood with strong fundamentals across all categories"
                  : score >= 60
                    ? "Good neighborhood with solid amenities and services"
                    : "Fair neighborhood with room for improvement in key areas"}
              </motion.p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Population Card */}
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Users}
          label="Population"
          value={`${(population / 1000).toFixed(1)}K`}
          description="Total residents"
          color="from-blue-500 to-blue-600"
          delay={0.3}
        />
      </motion.div>

      {/* Walkability Card */}
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Zap}
          label="Walkability"
          value={walkScore.toString()}
          description="Walk score rating"
          color="from-green-500 to-green-600"
          delay={0.4}
        />
      </motion.div>

      {/* Price Index Card */}
      <motion.div variants={itemVariants}>
        <StatCard
          icon={TrendingUp}
          label="Price Index"
          value={priceIndex.toString()}
          description="Cost of living"
          color="from-orange-500 to-orange-600"
          delay={0.5}
        />
      </motion.div>

      {/* Rank Card */}
      <motion.div variants={itemVariants}>
        <StatCard
          icon={Award}
          label="Rank"
          value={score >= 80 ? "Top 10%" : score >= 60 ? "Top 25%" : "Top 50%"}
          description="Among all neighborhoods"
          color="from-purple-500 to-purple-600"
          delay={0.6}
        />
      </motion.div>
    </motion.section>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
  color: string;
  delay: number;
}

export const NeighborhoodStats = memo(NeighborhoodStatsComponent);

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  color,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      className="relative group h-full"
      {...cardHover}
    >
      {/* Gradient border glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

      {/* Card */}
      <Card className="p-6 h-full relative overflow-hidden bg-white/80 dark:bg-primary/15 border-border/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group-hover:border-primary/50">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-5"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} p-2 mb-4 flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.05 }}
            className="text-xs font-semibold text-text-secondary mb-3 tracking-wide"
          >
            {label}
          </motion.p>

          {/* Value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1, duration: 0.4 }}
            className="text-3xl font-bold text-text-primary mb-3"
          >
            {value}
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.15 }}
            className="text-xs text-text-secondary"
          >
            {description}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  );
}
