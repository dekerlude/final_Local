"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Search,
  Share2,
  Download,
  MapPin,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cardHover } from "@/hooks/usePageAnimation";

interface QuickActionsProps {
  onSearchNew: () => void;
  onShare: () => void;
  onExport: () => void;
  onViewMap: () => void;
}

const actions = [
  {
    icon: Search,
    label: "Search Another",
    description: "Find a different neighborhood",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: Share2,
    label: "Share Results",
    description: "Share with friends & family",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-500/10 to-green-600/5",
  },
  {
    icon: Download,
    label: "Export Report",
    description: "Download as text",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-500/10 to-purple-600/5",
  },
  {
    icon: MapPin,
    label: "View on Map",
    description: "See location details",
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-500/10 to-orange-600/5",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export function QuickActions({
  onSearchNew,
  onShare,
  onExport,
  onViewMap,
}: QuickActionsProps) {
  const handlers = [onSearchNew, onShare, onExport, onViewMap];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 px-2 sm:px-0"
    >
      {/* Header */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-2 sm:gap-3 mb-2"
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
            Quick Actions
          </h2>
        </motion.div>
        <p className="text-sm sm:text-base md:text-lg text-text-secondary">
          Next steps for your neighborhood research
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              variants={itemVariants}
              onClick={handlers[index]}
              className="text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded-2xl transition-all group"
              {...cardHover}
              whileTap={{ scale: 0.96 }}
            >
              <div className="relative h-full">
                {/* Gradient border glow */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10 bg-gradient-to-r ${action.gradient}`}
                />

                {/* Card */}
                <Card
                  className={`p-6 h-full relative overflow-hidden bg-gradient-to-br ${action.bgGradient} border-border/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
                >
                  {/* Animated background */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${action.gradient}`}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: index * 0.2,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} p-3 mb-5 flex items-center justify-center`}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Label */}
                    <h4 className="font-semibold text-base text-text-primary mb-2">
                      {action.label}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-text-secondary mb-5">
                      {action.description}
                    </p>

                    {/* CTA */}
                    <motion.div
                      className="inline-flex items-center gap-2 text-primary font-medium text-sm"
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      Explore{" "}
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </Card>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
