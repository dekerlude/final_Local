"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ChevronRight,
  Loader2,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { searchLocalitySuggestions, LocalitySuggestion } from "@/services/search";
import { fadeInUp, containerVariants, itemVariants } from "@/hooks/usePageAnimation";
import { AdvertisementCarousel } from "@/components/common/AdvertisementCarousel";

interface NotableLocality {
  name: string;
  city: string;
  state: string;
  tag: string;
  description: string;
}

const TRENDING_CHIPS: Array<{ label: string; query: string }> = [
  { label: "Koramangala, Bangalore", query: "Koramangala Bangalore" },
  { label: "Sector 17, Chandigarh", query: "Sector 17 Chandigarh" },
  { label: "Bandra West, Mumbai", query: "Bandra West Mumbai" },
  { label: "Connaught Place, New Delhi", query: "Connaught Place New Delhi" },
  { label: "Indiranagar, Bangalore", query: "Indiranagar Bangalore" },
  { label: "Jubilee Hills, Hyderabad", query: "Jubilee Hills Hyderabad" },
  { label: "Anna Nagar, Chennai", query: "Anna Nagar Chennai" },
  { label: "Salt Lake, Kolkata", query: "Salt Lake Kolkata" },
  { label: "Koregaon Park, Pune", query: "Koregaon Park Pune" },
];

const NOTABLE_MUNICIPALITIES: NotableLocality[] = [
  {
    name: "Sector 17",
    city: "Chandigarh",
    state: "Chandigarh",
    tag: "Civic Core",
    description: "Le Corbusier's pedestrianized plaza hub with exceptional green canopy and civic symmetry.",
  },
  {
    name: "Koramangala",
    city: "Bangalore",
    state: "Karnataka",
    tag: "Tech & Dining Hub",
    description: "Dense culinary, startup, and transit ecosystem with high commercial vibrancy.",
  },
  {
    name: "Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    tag: "Coastal Cultural District",
    description: "Iconic sea-facing avenues, heritage architecture, and bustling lifestyle avenues.",
  },
  {
    name: "Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    tag: "Heritage Central Metro",
    description: "Georgian radial colonial arcade housing major financial institutions and transit nodes.",
  },
  {
    name: "Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    tag: "Upscale Residential",
    description: "Prominent residential enclave known for green topography, high-end dining, and embassies.",
  },
  {
    name: "Salt Lake City (Bidhannagar)",
    city: "Kolkata",
    state: "West Bengal",
    tag: "Planned Township",
    description: "Grid-planned sector layout with tree-lined boulevards, IT sectors, and high tranquility.",
  },
];

export default function AppHome() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocalitySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isNavigating, startTransition] = useTransition();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search for locality suggestions (300ms, >= 2 chars)
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocalitySuggestions(trimmed, 7);
        setSuggestions(results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Locality search suggestion error:", err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Handle outside clicks to dismiss suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigateToLocality = (destination: string) => {
    const trimmed = destination.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    startTransition(() => {
      router.push(`/app/neighborhood/${encodeURIComponent(trimmed)}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setShowSuggestions(true);
      return;
    }

    // Total selectable options: direct option (index -1) + suggestion items (0 to suggestions.length - 1)
    const totalOptions = suggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        handleNavigateToLocality(`${selected.name} ${selected.city || selected.state}`);
      } else {
        handleNavigateToLocality(query);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden pt-24 pb-28">
      {/* Decorative Cartographic Vector Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        <svg
          className="absolute top-10 right-[-15%] w-[800px] h-[800px] text-[#01472e]/5"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.15" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" />
        </svg>
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HERO SEARCH HEADER */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e9edc9] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#01472e] mb-6 border border-[#01472e]/10">
            <Sparkles className="w-3.5 h-3.5 text-[#01472e]" />
            Nationwide Locality Intelligence
          </span>
          <h1 className="text-5xl sm:text-7xl font-display uppercase tracking-tight text-[#01472e] leading-none mb-6">
            Search Any Indian Locality
          </h1>
          <p className="text-base sm:text-lg text-[#01472e]/80 font-sans leading-relaxed">
            Search any neighborhood, sector, or district across India for real-time infrastructure, safety, connectivity, and spatial analytics.
          </p>
        </motion.div>

        {/* SEARCH BAR CONTAINER */}
        <motion.div
          variants={itemVariants}
          ref={searchContainerRef}
          className="relative max-w-3xl mx-auto mb-10"
        >
          <div className="relative group shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-[#fefae0] border-2 border-[#01472e]/20 focus-within:border-[#01472e] focus-within:ring-4 focus-within:ring-[#01472e]/10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#01472e]/60 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Sector 17 Chandigarh, Koramangala Bangalore, Bandra West..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-16 pr-36 py-5 rounded-[2.5rem] bg-transparent text-lg sm:text-xl text-[#01472e] placeholder:text-[#01472e]/40 focus:outline-none transition-all font-sans font-medium"
              aria-label="Search locality across India"
              autoComplete="off"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isLoadingSuggestions && (
                <Loader2 className="w-5 h-5 text-[#01472e]/60 animate-spin mr-1" />
              )}
              <button
                onClick={() => handleNavigateToLocality(query)}
                disabled={!query.trim() || isNavigating}
                className="px-5 py-3 rounded-full bg-[#01472e] text-[#fefae0] text-xs font-bold font-sans uppercase tracking-wider hover:bg-[#01472e]/90 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              >
                {isNavigating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Analyze <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* REAL-TIME DEBOUNCED SUGGESTIONS DROPDOWN */}
          <AnimatePresence>
            {showSuggestions && query.trim().length >= 2 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-3 bg-[#fefae0] border-2 border-[#01472e]/20 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {/* Direct AI Query Action */}
                <button
                  onClick={() => handleNavigateToLocality(query)}
                  className={`w-full text-left px-6 py-4 border-b border-[#01472e]/10 transition-colors flex items-center justify-between group ${
                    selectedIndex === -1
                      ? "bg-[#e9edc9] text-[#01472e]"
                      : "bg-[#e9edc9]/50 hover:bg-[#e9edc9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#01472e] text-[#fefae0] flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#01472e] text-sm font-sans">
                        Generate AI Spatial Report for &quot;{query}&quot;
                      </div>
                      <div className="text-xs text-[#01472e]/70 font-sans font-medium">
                        Live infrastructure scoring, amenities aggregation, and editorial narrative
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#01472e] opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Suggestions List */}
                {suggestions.length > 0 ? (
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-[#01472e]/10">
                    {suggestions.map((item, idx) => {
                      const isSelected = selectedIndex === idx;
                      const subtitle = [item.city, item.state].filter(Boolean).join(", ") || item.formattedAddress;

                      return (
                        <button
                          key={item.id || `${item.name}-${idx}`}
                          onClick={() => handleNavigateToLocality(`${item.name} ${item.city || item.state}`)}
                          className={`w-full text-left px-6 py-3.5 transition-colors flex items-center justify-between group ${
                            isSelected ? "bg-[#ccd5ae]/60" : "hover:bg-[#ccd5ae]/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-[#01472e] mt-1 shrink-0" />
                            <div>
                              <div className="font-bold text-[#01472e] text-sm font-sans flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.type && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#01472e]/10 text-[#01472e] uppercase tracking-wider">
                                    {item.type}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#01472e]/70 mt-0.5 font-sans font-medium line-clamp-1">
                                {subtitle}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#01472e] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                ) : !isLoadingSuggestions ? (
                  <div className="p-6 text-center text-[#01472e]/70 font-sans text-sm">
                    <p className="font-semibold text-[#01472e]">No specific matching locality pinned</p>
                    <p className="text-xs mt-1">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-[#e9edc9] border border-[#01472e]/20 text-[10px] font-mono">Enter</kbd> to generate an AI report directly for &quot;{query}&quot;.
                    </p>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TRENDING INDIA LOCALITY CHIPS */}
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto mb-16 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#01472e]/70 block mb-3">
            Trending Nationwide Searches
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRENDING_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleNavigateToLocality(chip.query)}
                className="px-4 py-2 rounded-full bg-[#e9edc9]/70 hover:bg-[#e9edc9] border border-[#01472e]/15 text-xs font-bold text-[#01472e] transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
              >
                <Compass className="w-3.5 h-3.5 text-[#01472e]/70" />
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* NOTABLE MUNICIPALITIES EDITORIAL GRID */}
        <motion.section variants={fadeInUp} className="border-t border-[#01472e]/15 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#01472e]/60 block mb-1">
                Featured Locations
              </span>
              <h2 className="text-3xl sm:text-4xl font-display uppercase text-[#01472e]">
                Notable Indian Municipalities
              </h2>
            </div>
            <p className="text-xs text-[#01472e]/70 font-sans max-w-sm">
              Click any benchmark locality to view its comprehensive spatial profile and live amenity network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NOTABLE_MUNICIPALITIES.map((loc) => (
              <motion.div
                key={loc.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleNavigateToLocality(`${loc.name} ${loc.city}`)}
                className="cursor-pointer group rounded-[2rem] p-7 bg-[#fefae0] border border-[#01472e]/15 hover:border-[#01472e]/40 shadow-sm hover:shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#01472e] text-[#fefae0]">
                      {loc.tag}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#e9edc9] flex items-center justify-center text-[#01472e] group-hover:bg-[#01472e] group-hover:text-[#fefae0] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-display uppercase text-[#01472e] mb-1">
                    {loc.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#01472e]/70 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#01472e]/60" />
                    {loc.city}, {loc.state}
                  </p>

                  <p className="text-xs text-[#01472e]/80 font-sans leading-relaxed">
                    {loc.description}
                  </p>
                </div>

                <div className="border-t border-[#01472e]/10 pt-4 mt-6 flex items-center justify-between text-[11px] font-bold text-[#01472e]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" /> Complete Profile
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    Explore &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FEATURED BUSINESS ADVERTISEMENTS CAROUSEL */}
        <motion.section variants={fadeInUp} className="w-full">
          <AdvertisementCarousel />
        </motion.section>


      </motion.div>
    </div>
  );
}
