"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCircle } from "@/components/common";
import { TrendingUp, Crown } from "lucide-react";

interface ScoreComparisonProps {
  name1: string;
  score1: number;
  name2: string;
  score2: number;
}

export function ScoreComparison({
  name1,
  score1,
  name2,
  score2,
}: ScoreComparisonProps) {
  const diff = Math.abs(score1 - score2);
  const winner = score1 > score2 ? 1 : score2 > score1 ? 2 : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-forest" />
        <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
          Overall Comparison
        </h2>
      </div>

      {/* Side-by-side score circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Neighborhood 1 */}
        <div className="space-y-6">
          <Card
            className={`p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-premium ${
              winner === 1
                ? "border-[#01472e] bg-[#e9edc9] shadow-lg"
                : "border-[#01472e]/10 bg-[#fefae0] hover:shadow-md"
            }`}
          >
            <div className="relative z-10 text-center flex flex-col items-center">
              <ScoreCircle score={score1} size="large" animated={true} />

              {winner === 1 && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Badge className="bg-forest text-cream gap-2 px-4 py-2 rounded-full font-sans font-bold uppercase tracking-wider text-[10px] border-none shadow-none">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Winner</span>
                  </Badge>
                </div>
              )}

              {winner === 0 && diff === 0 && (
                <div className="mt-6">
                  <Badge variant="secondary" className="bg-[#ccd5ae]/20 text-[#01472e] font-sans font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-full border-none shadow-none">
                    Perfect Tie
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          <h3 className="text-lg font-sans font-bold uppercase tracking-wider text-center text-[#01472e] mt-4">
            {name1}
          </h3>
        </div>

        {/* Neighborhood 2 */}
        <div className="space-y-6">
          <Card
            className={`p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-premium ${
              winner === 2
                ? "border-[#01472e] bg-[#e9edc9] shadow-lg"
                : "border-[#01472e]/10 bg-[#fefae0] hover:shadow-md"
            }`}
          >
            <div className="relative z-10 text-center flex flex-col items-center">
              <ScoreCircle score={score2} size="large" animated={true} />

              {winner === 2 && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Badge className="bg-forest text-cream gap-2 px-4 py-2 rounded-full font-sans font-bold uppercase tracking-wider text-[10px] border-none shadow-none">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Winner</span>
                  </Badge>
                </div>
              )}

              {winner === 0 && diff === 0 && (
                <div className="mt-6">
                  <Badge variant="secondary" className="bg-[#ccd5ae]/20 text-[#01472e] font-sans font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-full border-none shadow-none">
                    Perfect Tie
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          <h3 className="text-lg font-sans font-bold uppercase tracking-wider text-center text-[#01472e] mt-4">
            {name2}
          </h3>
        </div>
      </div>

      {/* Difference indicator */}
      {diff > 0 && (
        <div className="p-6 bg-[#ccd5ae]/20 rounded-2xl border border-[#01472e]/10 text-center font-sans font-bold uppercase tracking-wider text-xs text-[#01472e]">
          <span>{winner === 1 ? name1 : name2} leads by </span>
          <span className="text-sm font-display text-forest">{diff} points</span>
        </div>
      )}
    </motion.section>
  );
}
