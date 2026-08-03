"use client";

import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { UserProfile, PROFILE_DEFINITIONS } from "@/constants/profiles";
import { CheckCircle2, Sparkles } from "lucide-react";

interface ProfileSelectorProps {
  selectedProfile: UserProfile | null;
  onSelect: (_profile: UserProfile) => void;
  loading?: boolean;
}

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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

function ProfileSelectorComponent({
  selectedProfile,
  onSelect,
  loading = false,
}: ProfileSelectorProps) {
  const handleSelect = useCallback((profile: UserProfile) => {
    onSelect(profile);
  }, [onSelect]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 px-2 sm:px-0"
    >
      {/* Header */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-3 mb-2"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
          <h2 className="text-xl sm:text-2xl font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
            Personalize Your Score
          </h2>
        </motion.div>
        <p className="text-sm sm:text-base text-[#01472e]/70">
          Select your profile blueprint to recalculate factor weights based on your lifestyle context.
        </p>
      </div>

      {/* Profile Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {(Object.keys(PROFILE_DEFINITIONS) as UserProfile[]).map(
          (profile) => {
            const def = PROFILE_DEFINITIONS[profile];
            const isSelected = selectedProfile === profile;

            return (
              <motion.button
                key={profile}
                variants={itemVariants}
                onClick={() => handleSelect(profile)}
                disabled={loading}
                className="text-left focus:outline-none focus:ring-2 focus:ring-primary rounded-[2.5rem] transition-all"
                whileHover={{ scale: isSelected ? 1 : 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative group h-full">
                  {/* Card */}
                  <Card
                    className={`p-8 h-full transition-all duration-500 ease-premium relative overflow-hidden rounded-[2.5rem] ${
                      isSelected
                        ? "border-[#01472e] bg-[#e9edc9] shadow-lg"
                        : "border-[#01472e]/10 bg-[#fefae0] hover:shadow-md hover:border-[#01472e]/30"
                    }`}
                  >
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        {/* Icon and Check */}
                        <div className="flex items-start justify-between mb-5">
                          <motion.div
                            className="text-5xl"
                            animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {def.icon}
                          </motion.div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                            >
                              <CheckCircle2 className="w-6 h-6 text-primary" />
                            </motion.div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-sans font-bold uppercase tracking-wider text-[#01472e] mb-3">
                          {def.label}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm leading-relaxed text-[#01472e]/70 font-sans font-medium">
                          {def.description}
                        </p>
                      </div>

                      {/* Select indicator */}
                      {!isSelected && (
                        <div className="mt-6 pt-4 border-t border-[#01472e]/5 flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#01472e]/60">
                          Select Profile →
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </motion.button>
            );
          }
        )}
      </motion.div>
    </motion.section>
  );
}

export const ProfileSelector = memo(ProfileSelectorComponent);
