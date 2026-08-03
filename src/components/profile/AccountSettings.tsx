"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UserAccount {
  email: string;
  name: string;
  joinedAt: string;
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

export function AccountSettings() {
  const [account, setAccount] = useLocalStorage<UserAccount>(
    "user_account",
    {
      email: "aarzooxbajaj@gmail.com",
      name: "User",
      joinedAt: new Date().toISOString(),
    }
  );

  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(account.name);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSaveName = () => {
    if (nameValue.trim()) {
      setAccount({ ...account, name: nameValue });
      setEditName(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const formatJoinDate = () => {
    const date = new Date(account.joinedAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
          Account Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and privacy
        </p>
      </div>

      {/* Profile Info */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Profile
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Joined {formatJoinDate()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name field */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Display Name
              </label>
              {editName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    className="gap-2"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditName(false);
                      setNameValue(account.name);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-900 dark:text-white">{account.name}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditName(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Email field */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-900 dark:text-white flex-1">{account.email}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Email is read-only and used for account recovery
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Password
            </h3>
          </div>

          {!showPasswordForm ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="gap-2">Update Password</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Sign Out
              </h3>
              <p className="text-sm text-red-700 dark:text-red-200">
                Sign out of your account on this device
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.section>
  );
}
