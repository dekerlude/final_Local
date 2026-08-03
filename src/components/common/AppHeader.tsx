"use client";

import { useState, useEffect } from "react";
import { User, Compass, Layers, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const centerNavItems = [
  { name: "Explore", href: "/app", icon: Compass },
  { name: "Compare", href: "/app/compare", icon: Layers },
];

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-premium border-b",
          scrolled
            ? "bg-bg-primary/80 backdrop-blur-md border-[#01472e]/10 shadow-md py-4"
            : "bg-transparent border-transparent py-6"
        )}
        role="banner"
        aria-label="Application navigation"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-8">
            {/* Logo Left */}
            <Link
              href="/"
              className="flex-shrink-0 flex items-center gap-2 group transition-all duration-300 hover:opacity-80"
            >
              <span className="text-xl sm:text-2xl font-display uppercase tracking-widest text-[#01472e]">
                LocalLens
              </span>
            </Link>

            {/* Desktop Navigation Centered */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {centerNavItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "relative text-[10px] font-sans font-bold uppercase tracking-[0.25em] py-1 transition-all duration-300 cursor-pointer block",
                        active
                          ? "text-[#01472e]"
                          : "text-[#01472e]/60 hover:text-[#01472e]"
                      )}
                    >
                      {item.name}
                      {active && (
                        <motion.span
                          layoutId="activeHeaderTab"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#01472e] rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Profile Right */}
            <div className="hidden md:flex items-center">
              <Link href="/app/profile">
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 border text-[10px] font-sans font-bold uppercase tracking-[0.25em] transition-all duration-300",
                    isActive("/app/profile")
                      ? "border-[#01472e] bg-[#01472e] text-[#fefae0]"
                      : "border-[#01472e]/20 text-[#01472e] hover:border-[#01472e] hover:bg-[#01472e]/5"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#01472e] hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden overflow-hidden border-t border-[#01472e]/10 bg-bg-primary mt-4"
              >
                <nav className="flex flex-col gap-2 py-4">
                  {centerNavItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                        <button
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold uppercase tracking-[0.2em]",
                            active
                              ? "bg-[#ccd5ae]/40 text-[#01472e]"
                              : "text-[#01472e] hover:bg-secondary"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </button>
                      </Link>
                    );
                  })}
                  <Link href="/app/profile" onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors text-xs font-bold uppercase tracking-[0.2em] border-t border-[#01472e]/10 mt-2",
                        isActive("/app/profile")
                          ? "bg-[#ccd5ae]/40 text-[#01472e]"
                          : "text-[#01472e] hover:bg-secondary"
                      )}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </Link>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
