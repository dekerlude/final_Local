"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Share2 } from "lucide-react";

interface DashboardHeaderProps {
  neighborhoodName: string;
  location: string;
  state: string;
  onBack: () => void;
  onShare: () => void;
}

export function DashboardHeader({
  neighborhoodName,
  location,
  state,
  onBack,
  onShare,
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 border-b border-border/50 bg-gradient-to-b from-white/80 to-white/40 dark:from-primary/20 dark:to-primary/10 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-6">
        {/* Top Actions Row */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded px-2 py-1"
            aria-label="Back to search"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Search</span>
            <span className="sm:hidden">Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs sm:text-sm transition-all duration-200 border border-primary/20 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            aria-label="Share results"
          >
            <Share2 className="w-4 h-4" />
            Share
          </motion.button>
        </div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-start gap-3 sm:gap-4"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary leading-tight"
            >
              {neighborhoodName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-2"
            >
              {location}, {state}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
