"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile, PROFILE_DEFINITIONS } from "@/constants/profiles";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";

interface AISummaryCardProps {
  summary: string;
  profile: UserProfile | null;
  loading?: boolean;
  error?: string;
}

function AISummaryCardComponent({
  summary,
  profile,
  loading = false,
  error,
}: AISummaryCardProps) {
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-forest animate-pulse" />
            <div>
              <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
                AI Summary
              </h2>
              <p className="text-xs text-[#01472e]/60">
                Analyzing your personalized fit...
              </p>
            </div>
          </div>
        </div>

        <Card className="p-10 space-y-4 bg-[#fefae0] border border-[#01472e]/10 rounded-[2.5rem] shadow-sm">
          <Skeleton className="h-3 w-full bg-[#ccd5ae]/40" />
          <Skeleton className="h-3 w-full bg-[#ccd5ae]/40" />
          <Skeleton className="h-3 w-3/4 bg-[#ccd5ae]/40" />
        </Card>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#7f1d1d]" />
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.22em] text-[#7f1d1d]">
            Unable to Generate Summary
          </h2>
        </div>
        <Card className="p-10 bg-[#7f1d1d]/5 border border-[#7f1d1d]/10 rounded-[2.5rem]">
          <p className="text-xs sm:text-sm font-sans font-medium text-[#7f1d1d]">{error}</p>
        </Card>
      </motion.section>
    );
  }

  if (!summary) {
    return null;
  }

  const profileDef = profile ? PROFILE_DEFINITIONS[profile] : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-forest" />
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
              AI Summary
            </h2>
            <p className="text-xs text-[#01472e]/60">
              Personalized insights parsed according to your selected profile
            </p>
          </div>
        </div>
        {profileDef && (
          <Badge variant="outline" className="gap-2 text-[10px] font-sans font-bold uppercase tracking-wider px-4 py-2 border-[#01472e]/10 bg-[#ccd5ae]/20 text-[#01472e] rounded-full shadow-none">
            <span className="text-sm">{profileDef.icon}</span>
            <span>{profileDef.label}</span>
          </Badge>
        )}
      </div>

      {/* Summary Card */}
      <Card className="p-10 relative overflow-hidden bg-[#e9edc9] border border-[#01472e]/10 rounded-[2.5rem] hover:shadow-md transition-all duration-500 ease-premium">
        {/* Content */}
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-sm sm:text-base text-[#01472e] leading-relaxed whitespace-pre-line font-sans font-medium"
          >
            {summary}
          </motion.p>
        </div>
      </Card>

      {/* Footer note */}
      <div className="flex items-start gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-[#01472e]/55">
        <Sparkles className="w-4 h-4 text-forest flex-shrink-0" />
        <span>
          AI-generated assessment.{" "}
          <span className="text-[#01472e]/40">Cross-reference with local spatial records.</span>
        </span>
      </div>
    </motion.section>
  );
}

export const AISummaryCard = memo(AISummaryCardComponent);
