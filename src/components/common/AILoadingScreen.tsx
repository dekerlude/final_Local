"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Database, Cpu, Activity, CheckCircle2 } from "lucide-react";

interface AILoadingScreenProps {
  progress: number;
  message: string;
}

export function AILoadingScreen({ progress, message }: AILoadingScreenProps) {
  // Determine icon based on progress range
  let Icon = Activity;
  if (progress < 25) Icon = Database;
  else if (progress < 45) Icon = MapPin;
  else if (progress < 80) Icon = Cpu;
  else if (progress < 100) Icon = Sparkles;
  else Icon = CheckCircle2;

  return (
    <motion.div
      key="ai-loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary"
    >
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <div className="w-full h-full border-x border-[#01472e] max-w-7xl mx-auto" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* Pulsing Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mx-auto w-20 h-20 bg-[#e9edc9] rounded-full flex items-center justify-center border border-[#01472e]/20 mb-8 shadow-[0_0_40px_rgba(233,237,201,0.5)]"
        >
          <Icon className="w-10 h-10 text-[#01472e]" />
        </motion.div>

        <h2 className="text-3xl font-display uppercase tracking-tight text-[#01472e] mb-2">
          AI Engine Processing
        </h2>
        
        <div className="h-6 overflow-hidden mb-8 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-sm font-sans font-bold text-[#01472e]/70"
            >
              {message}...
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-2 w-full bg-[#01472e]/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#01472e] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-bold text-[#01472e]/50 font-mono tracking-widest">
          <span>0%</span>
          <span className="text-[#01472e]">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>
    </motion.div>
  );
}
