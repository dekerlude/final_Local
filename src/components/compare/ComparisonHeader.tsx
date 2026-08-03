"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Share2, Download, Zap } from "lucide-react";

interface ComparisonHeaderProps {
  neighborhood1: string;
  neighborhood2: string;
  onBack: () => void;
  onShare: () => void;
  onExport: () => void;
}

export function ComparisonHeader({
  neighborhood1,
  neighborhood2,
  onBack,
  onShare,
  onExport,
}: ComparisonHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 border-b border-[#01472e]/10 bg-cream/80 backdrop-blur-xl shadow-sm transition-shadow"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Actions Row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-forest hover:text-forest/70 transition-colors font-sans font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ccd5ae]/20 hover:bg-[#ccd5ae]/40 text-[#01472e] font-sans font-bold uppercase tracking-wider text-[10px] transition-all border border-[#01472e]/10"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ccd5ae]/20 hover:bg-[#ccd5ae]/40 text-[#01472e] font-sans font-bold uppercase tracking-wider text-[10px] transition-all border border-[#01472e]/10"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#01472e]">
            {neighborhood1}
          </h1>

          <div className="flex items-center gap-2 text-[#01472e]/40">
            <Zap className="w-4 h-4 text-forest" />
            <span className="text-sm font-display uppercase tracking-widest">vs</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#01472e]">
            {neighborhood2}
          </h1>
        </div>
      </div>
    </motion.div>
  );
}
