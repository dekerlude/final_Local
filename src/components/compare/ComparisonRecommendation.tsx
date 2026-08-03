"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Zap } from "lucide-react";
import { UserProfile } from "@/constants/profiles";

interface RecommendationItem {
  text: string;
}

interface ComparisonRecommendationProps {
  neighborhood1: string;
  neighborhood2: string;
  winner: 1 | 2;
  recommendation: string;
  betterFor: RecommendationItem[];
  considerIf: RecommendationItem[];
  profile: UserProfile | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function ComparisonRecommendation({
  neighborhood1,
  neighborhood2,
  winner,
  recommendation,
  betterFor,
  considerIf,
  profile,
}: ComparisonRecommendationProps) {
  const winnerName = winner === 1 ? neighborhood1 : neighborhood2;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-forest" />
        <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
          AI Recommendation
        </h2>
      </div>

      {/* Winner recommendation card */}
      <motion.div variants={itemVariants}>
        <Card className="p-10 bg-[#e9edc9] border border-[#01472e]/10 rounded-[2.5rem] shadow-sm">
          <div className="space-y-5">
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <Badge className="bg-forest text-cream px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full shadow-none border-none flex-shrink-0">
                ✨ Best Match
              </Badge>
              <div className="flex-1">
                <h3 className="text-lg font-sans font-bold uppercase tracking-wide text-[#01472e] mb-3">
                  {winnerName} matches your requirements best
                </h3>
                <p className="text-sm text-[#01472e]/85 leading-relaxed font-sans font-medium">
                  {recommendation}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Better For / Consider If Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Better For */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 border border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-forest" />
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e]">
                  Ideal for {profile ? profile : "selected profile"}
                </h3>
              </div>

              <ul className="space-y-3">
                {betterFor.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05, duration: 0.3 }}
                    className="flex items-start gap-2 text-xs font-sans font-semibold uppercase tracking-wide text-[#01472e]/80"
                  >
                    <span className="text-forest mt-0.5">
                      →
                    </span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Consider If */}
        <motion.div variants={itemVariants}>
          <Card className="p-8 border border-[#7f1d1d]/15 bg-[#7f1d1d]/5 rounded-[2.5rem] h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#7f1d1d]" />
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#7f1d1d]">
                  Consider if you need
                </h3>
              </div>

              <ul className="space-y-3">
                {considerIf.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05, duration: 0.3 }}
                    className="flex items-start gap-2 text-xs font-sans font-semibold uppercase tracking-wide text-[#7f1d1d]/80"
                  >
                    <span className="text-[#7f1d1d] mt-0.5">
                      ⚠
                    </span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Summary note */}
      <motion.div
        variants={itemVariants}
        className="text-center p-5 bg-[#ccd5ae]/10 rounded-2xl border border-[#01472e]/5"
      >
        <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/60">
          Recommendation synthesized across six core performance vectors.
        </p>
      </motion.div>
    </motion.section>
  );
}
