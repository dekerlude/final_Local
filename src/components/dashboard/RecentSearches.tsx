"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Clock, X } from "lucide-react";

interface RecentSearch {
  id: string;
  name: string;
  location: string;
  timestamp: Date;
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (_id: string) => void;
  onClear: (_id: string) => void;
  maxItems?: number;
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
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function RecentSearches({
  searches,
  onSelect,
  onClear,
  maxItems = 5,
}: RecentSearchesProps) {
  const displaySearches = searches.slice(0, maxItems);

  if (displaySearches.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-forest" />
        <div>
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
            Recent Searches
          </h2>
          <p className="text-xs text-[#01472e]/60">
            Quickly jump back to your recent neighborhoods
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {displaySearches.map((search) => (
          <motion.div
            key={search.id}
            variants={itemVariants}
            layout
          >
            <Card className="p-5 flex items-center justify-between hover:shadow-md bg-[#fefae0] hover:bg-[#ccd5ae]/10 transition-all duration-300 cursor-pointer group border border-[#01472e]/10 hover:border-[#01472e]/30 rounded-2xl">
              <button
                onClick={() => onSelect(search.id)}
                className="flex-1 text-left"
              >
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e] transition-colors">
                  {search.name}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-xs text-[#01472e]/70">
                    {search.location}
                  </p>
                  <span className="text-xs text-[#01472e]/30">
                    •
                  </span>
                  <p className="text-[10px] text-[#01472e]/60 font-sans uppercase tracking-wider font-semibold">
                    {formatTime(search.timestamp)}
                  </p>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear(search.id);
                }}
                className="p-2 rounded-full hover:bg-[#7f1d1d]/10 transition-colors ml-2 flex-shrink-0 text-[#01472e]/40 hover:text-[#7f1d1d]"
                aria-label={`Clear ${search.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
