"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Settings, CheckCircle } from "lucide-react";
import { useCallback } from "react";
import { UserProfile } from "@/constants/profiles";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UserPreferences {
  favoriteProfile: UserProfile | null;
  notifications: boolean;
  dataSharing: boolean;
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

const PROFILE_OPTIONS: Array<{ id: UserProfile; label: string; description: string }> = [
  { id: "FAMILY", label: "Family", description: "Schools, safety, parks" },
  { id: "STUDENT", label: "Student", description: "Nightlife, transit, affordability" },
  { id: "PROFESSIONAL", label: "Professional", description: "Commute, dining, amenities" },
];

export function PreferencesSettings() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    "user_preferences",
    {
      favoriteProfile: null,
      notifications: true,
      dataSharing: false,
    }
  );

  const handleProfileSelect = useCallback((profileId: UserProfile) => {
    setPreferences({
      ...preferences,
      favoriteProfile: profileId,
    });
  }, [preferences, setPreferences]);

  const toggleNotifications = () => {
    setPreferences({
      ...preferences,
      notifications: !preferences.notifications,
    });
  };

  const toggleDataSharing = () => {
    setPreferences({
      ...preferences,
      dataSharing: !preferences.dataSharing,
    });
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your LocalLens experience
        </p>
      </div>

      {/* Favorite Profile */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Favorite Profile
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROFILE_OPTIONS.map((profile) => (
            <motion.button
              key={profile.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProfileSelect(profile.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                preferences.favoriteProfile === profile.id
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {profile.label}
                </h4>
                {preferences.favoriteProfile === profile.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get updates about new neighborhoods and features
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                preferences.notifications
                  ? "bg-primary"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                animate={{
                  x: preferences.notifications ? 24 : 4,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full"
              />
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Data Sharing */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Anonymous Data Sharing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help improve LocalLens by sharing anonymized usage data
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDataSharing}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                preferences.dataSharing
                  ? "bg-primary"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                animate={{
                  x: preferences.dataSharing ? 24 : 4,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full"
              />
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.section>
  );
}
