"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, ArrowRight, Trash } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";

interface SearchItem {
  id: string;
  name: string;
  timestamp: string;
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
};

export function SearchHistory() {
  const [searches, setSearches] = useLocalStorage<SearchItem[]>(
    "search_history",
    []
  );

  const handleRemove = (id: string) => {
    setSearches(searches.filter((s) => s.id !== id));
  };

  const handleClear = () => {
    setSearches([]);
  };

  const formatDate = (dateStr: string) => {
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
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {searches.length === 0
              ? "No searches yet"
              : `${searches.length} search${searches.length === 1 ? "" : "es"}`}
          </p>
        </div>
        {searches.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Clear All
          </motion.button>
        )}
      </div>

      {searches.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Your search history will appear here
            </p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <motion.div key={search.id} variants={itemVariants}>
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {search.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Searched {formatDate(search.timestamp)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/app`}>
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
                      onClick={() => handleRemove(search.id)}
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
