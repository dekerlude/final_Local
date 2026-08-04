"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Map, Home, Lightbulb, Award } from "lucide-react";

interface NeighborhoodStats {
  walkScore: number;
  priceIndex: number;
  transit: string;
  housing: string;
  vibe: string;
}

interface NeighborhoodComparisonProps {
  name1: string;
  stats1: NeighborhoodStats;
  name2: string;
  stats2: NeighborhoodStats;
}

const stats = [
  {
    key: "walkScore" as const,
    label: "Walkability Index",
    icon: Zap,
    format: (v: number) => `${v}/100`,
  },
  {
    key: "priceIndex" as const,
    label: "Price Index",
    icon: TrendingUp,
    format: (v: number) => `${v}`,
  },
];

const stats2 = [
  {
    key: "transit" as const,
    label: "Transit Access",
    icon: Map,
  },
  {
    key: "housing" as const,
    label: "Housing Typology",
    icon: Home,
  },
  {
    key: "vibe" as const,
    label: "Neighborhood Aura",
    icon: Lightbulb,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function getWinner(val1: number, val2: number): 1 | 2 | 0 {
  if (val1 > val2) return 1;
  if (val2 > val1) return 2;
  return 0;
}

export function NeighborhoodComparison({
  name1,
  stats1,
  name2,
  stats2: stats2Data,
}: NeighborhoodComparisonProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 px-2 sm:px-0"
    >
      {/* Numeric Stats */}
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-forest flex-shrink-0 mt-1" />
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
            Key Metrics Comparison
          </h2>
        </div>

        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const val1 = stats1[stat.key];
            const val2 = stats2Data[stat.key];
            const winner = getWinner(val1, val2);

            return (
              <motion.div key={stat.key} variants={itemVariants}>
                <Card className="p-6 bg-[#fefae0] border border-[#01472e]/10 rounded-[2.5rem] hover:shadow-md transition-all duration-300">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#01472e]/5 flex items-center justify-center text-forest">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e]">
                        {stat.label}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className={`p-5 rounded-3xl transition-all duration-300 ${
                        winner === 1
                          ? "bg-[#e9edc9] border border-[#01472e]/20"
                          : "bg-[#ccd5ae]/10 border border-[#01472e]/5"
                      }`}>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/50 mb-2">
                          {name1}
                        </p>
                        <p className="text-xl font-display text-[#01472e]">
                          {stat.format(val1)}
                        </p>
                      </div>

                      <div className={`p-5 rounded-3xl transition-all duration-300 ${
                        winner === 2
                          ? "bg-[#e9edc9] border border-[#01472e]/20"
                          : "bg-[#ccd5ae]/10 border border-[#01472e]/5"
                      }`}>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/50 mb-2">
                          {name2}
                        </p>
                        <p className="text-xl font-display text-[#01472e]">
                          {stat.format(val2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Qualitative Features */}
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-forest flex-shrink-0 mt-1" />
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
            Qualitative Indicators
          </h2>
        </div>

        <div className="space-y-4">
          {stats2.map((stat) => {
            const Icon = stat.icon;
            const val1 = stats1[stat.key];
            const val2 = stats2Data[stat.key];

            return (
              <motion.div key={stat.key} variants={itemVariants}>
                <Card className="p-6 bg-[#fefae0] border border-[#01472e]/10 rounded-[2.5rem] hover:shadow-md transition-all duration-300">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#01472e]/5 flex items-center justify-center text-forest">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e]">
                        {stat.label}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/50 mb-3">
                          {name1}
                        </p>
                        <Badge variant="secondary" className="bg-[#ccd5ae]/20 text-[#01472e] border-none px-4 py-2 font-sans font-bold uppercase tracking-wider text-[10px] rounded-full shadow-none">
                          {val1}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/50 mb-3">
                          {name2}
                        </p>
                        <Badge variant="secondary" className="bg-[#ccd5ae]/20 text-[#01472e] border-none px-4 py-2 font-sans font-bold uppercase tracking-wider text-[10px] rounded-full shadow-none">
                          {val2}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
