"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { SavedNeighborhoods } from "@/components/profile/SavedNeighborhoods";
import { SearchHistory } from "@/components/profile/SearchHistory";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import { AccountSettings } from "@/components/profile/AccountSettings";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-secondary to-tertiary">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border/30 bg-primary/90 sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="w-14 h-14 rounded-full bg-[#01472e] flex items-center justify-center shadow-lg text-[#fefae0]"
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <User className="w-7 h-7 text-[#fefae0]" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                Profile
              </h1>
              <p className="text-text-secondary">
                Manage your account, preferences, and settings
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24"
      >
        {/* Account Settings */}
        <section>
          <AccountSettings />
        </section>

        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Preferences */}
        <section>
          <PreferencesSettings />
        </section>

        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Saved Neighborhoods */}
        <section>
          <SavedNeighborhoods />
        </section>

        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Search History */}
        <section className="pb-12">
          <SearchHistory />
        </section>
      </motion.main>
    </div>
  );
}
