"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trash2, ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getScoreColor, getScoreBg } from "@/lib/scoreUtils";
import Link from "next/link";

interface SavedNeighborhood {
  id: string;
  name: string;
  score: number;
  profile: string;
  savedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export function SavedNeighborhoods() {
  const [saved, setSaved] = useLocalStorage<SavedNeighborhood[]>(
    "saved_neighborhoods",
    []
  );

  const handleRemove = useCallback((id: string) => {
    setSaved(saved.filter((n) => n.id !== id));
  }, [saved, setSaved]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Neighborhoods
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {saved.length === 0
            ? "No saved neighborhoods yet"
            : `${saved.length} neighborhood${saved.length === 1 ? "" : "s"} saved`}
        </p>
      </div>

      {saved.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Start saving neighborhoods to keep track of your favorites
            </p>
            <Link href="/app">
              <Button className="mt-4" variant="default">
                Explore Neighborhoods
              </Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {saved.map((neighborhood) => (
            <motion.div key={neighborhood.id} variants={itemVariants}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {neighborhood.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Saved {formatDate(neighborhood.savedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {neighborhood.profile}
                    </Badge>
                  </div>

                  {/* Score and actions */}
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`text-center px-3 py-2 rounded-lg ${getScoreBg(
                        neighborhood.score
                      )}`}
                    >
                      <p className={`text-lg font-bold ${getScoreColor(neighborhood.score)}`}>
                        {neighborhood.score}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                    </motion.div>

                    <Link href={`/app/neighborhood/${neighborhood.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(neighborhood.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
