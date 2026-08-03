"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { 
  Search, 
  Loader2, 
  ArrowRight, 
  Map, 
  Sparkles, 
  Plus, 
  Minus, 
  Newspaper,
  History
} from "lucide-react";

import { ComparisonHeader } from "@/components/compare/ComparisonHeader";
import { ScoreComparison } from "@/components/compare/ScoreComparison";
import { CategoryComparison } from "@/components/compare/CategoryComparison";
import { NeighborhoodComparison } from "@/components/compare/NeighborhoodComparison";
 
import { searchLocalitySuggestions, LocalitySuggestion } from "@/services/search";
import { CompareResponse } from "@/types/compare";
import { LocalityReport } from "@/types/locality";
import { clientCache } from "@/lib/clientCache";

interface NeighborhoodComparisonData {
  id: number | string;
  name: string;
  overall_score: number;
  population: number;
  area_sqmi: number;
  latitude: number;
  longitude: number;
  categoryScores: Record<string, number>;
}

interface RecentComparison {
  queryA: string;
  queryB: string;
  timestamp: number;
}

// Factor mappings for client-side personalization calculation
export const FACTOR_MAPPING: Record<string, string> = {
  'Safety & Crime': 'SAFETY',
  'Safety': 'SAFETY',
  'Environment & Air Quality': 'ENVIRONMENT',
  'Green Spaces': 'ENVIRONMENT',
  'Parks & Recreation': 'ENVIRONMENT',
  'Public Transport': 'CONNECTIVITY',
  'Transit': 'CONNECTIVITY',
  'Basic Amenities': 'INFRASTRUCTURE',
  'Schools': 'EDUCATION',
  'Education': 'EDUCATION',
  'Healthcare': 'HEALTHCARE',
  'Hospitals': 'HEALTHCARE',
  'Affordability': 'AFFORDABILITY',
  'Budget': 'AFFORDABILITY',
  'Nightlife': 'NIGHTLIFE',
  'Traffic & Commute': 'TRAFFIC',
  'Work Commute': 'TRAFFIC',
  'Walkability': 'WALKABILITY',
  'Restaurants': 'RESTAURANTS',
  'Dining': 'RESTAURANTS',
  'Shopping': 'SHOPPING',
  'Family Friendly': 'FAMILY_FRIENDLY',
};

export const ALL_FACTORS = [
  'Safety & Crime',
  'Environment & Air Quality',
  'Public Transport',
  'Basic Amenities',
  'Schools',
  'Healthcare',
  'Affordability',
  'Nightlife',
  'Parks & Recreation',
  'Traffic & Commute',
  'Walkability',
  'Restaurants',
  'Shopping',
  'Family Friendly',
];

const mapResponseToComparisonData = (res: LocalityReport): NeighborhoodComparisonData => {
  return {
    id: res.id,
    name: res.localityName,
    overall_score: res.overallScore,
    population: parseInt(res.population?.replace(/[^0-9]/g, "") || "0", 10) || 120000,
    area_sqmi: res.poiCensus?.radiusKm ? Math.round(Math.PI * Math.pow(res.poiCensus.radiusKm, 2) * 0.3861) : 2.5,
    latitude: res.latitude,
    longitude: res.longitude,
    categoryScores: {
      SAFETY: res.categoryScores?.safetyAndCrime || 50,
      CONNECTIVITY: res.categoryScores?.publicTransport || 50,
      HEALTHCARE: res.categoryScores?.healthcare || 50,
      EDUCATION: res.categoryScores?.schools || 50,
      ENVIRONMENT: res.categoryScores?.environmentAndAirQuality || 50,
      INFRASTRUCTURE: res.categoryScores?.basicAmenities || 50,
    }
  };
};

const deriveStatsFromData = (data: NeighborhoodComparisonData) => {
  return {
    population: data.population,
    walkScore: Math.round(data.categoryScores.CONNECTIVITY * 1.1),
    priceIndex: Math.round(100 - data.categoryScores.INFRASTRUCTURE * 0.8),
    transit: data.categoryScores.CONNECTIVITY > 80 ? "Excellent" : data.categoryScores.CONNECTIVITY > 60 ? "Good" : "Fair",
    housing: data.categoryScores.INFRASTRUCTURE > 80 ? "High-Rise Apartments" : "Mixed-Use Residential",
    vibe: data.categoryScores.SAFETY > 80 ? "Safe & Historic" : "Vibrant & Active",
  };
};

// Autocomplete SearchBox Component with Keyboard Navigation
interface SearchBoxProps {
  label: string;
  query: string;
  setQuery: (_val: string) => void;
  onEnter: () => void;
  placeholder?: string;
}

function SearchBox({ label, query, setQuery, onEnter, placeholder }: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(query);
  const [suggestions, setSuggestions] = useState<LocalitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(query || "");
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocalitySuggestions(trimmed, 5);
        setSuggestions(results);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Locality search suggestion error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [inputValue]);

  const handleSelect = (s: string) => {
    setInputValue(s);
    setQuery(s);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setShowSuggestions(true);
      return;
    }
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
        handleSelect(selected.formattedAddress || `${selected.name}, ${selected.city || selected.state}`);
      } else {
        setShowSuggestions(false);
        setQuery(inputValue);
        onEnter();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e]/60 mb-2 ml-1">
        {label}
      </p>
      <div className="relative group bg-secondary border border-[#01472e]/10 rounded-full focus-within:border-[#01472e] focus-within:ring-2 focus-within:ring-[#01472e]/10 shadow-sm transition-all duration-300">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#01472e]/40 group-focus-within:text-[#01472e] transition-colors pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-14 pr-12 py-4 rounded-full bg-transparent text-sm text-[#01472e] placeholder:text-[#01472e]/30 focus:outline-none font-sans"
          placeholder={placeholder || "Search neighborhood..."}
        />
        {isLoading && (
          <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#01472e] animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#01472e]/10 shadow-lg overflow-hidden z-50 max-h-[220px] overflow-y-auto"
          >
            {suggestions.map((s, i) => {
              const isSelected = selectedIndex === i;
              const displayName = s.formattedAddress || `${s.name}, ${s.city || s.state}`;
              return (
                <button
                  key={s.id || i}
                  type="button"
                  onClick={() => handleSelect(displayName)}
                  className={clsx(
                    "w-full text-left px-6 py-4 border-b border-[#01472e]/5 last:border-none text-sm font-sans font-medium transition-colors",
                    isSelected ? "bg-[#ccd5ae]/30 text-[#01472e]" : "hover:bg-[#ccd5ae]/10 text-[#01472e]"
                  )}
                >
                  {s.name} <span className="text-xs text-[#01472e]/50 font-sans">({s.city}, {s.state})</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compare Page Main Component
export default function ComparePage() {
  const router = useRouter();

  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [recentComparisons, setRecentComparisons] = useState<RecentComparison[]>([]);

 
  // Set default comparison search fields to Sector 17 and Sector 22 Chandigarh
  useEffect(() => {
    setQueryA("Sector 17, Chandigarh");
    setQueryB("Sector 22, Chandigarh");
  }, []);

  // Load recent comparisons on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_comparisons");
      if (stored) {
        setRecentComparisons(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load recent comparisons history", e);
    }
  }, []);

  const canCompare = queryA.trim().length > 0 && queryB.trim().length > 0;

  const handleCompare = async (locA = queryA, locB = queryB) => {
    const cleanA = locA.trim();
    const cleanB = locB.trim();
    if (cleanA.length === 0 || cleanB.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Verbose logging in Debug Mode as requested by Step 11
    console.log("[Compare Debug] Current Search Queries:", { cleanA, cleanB });

    try {
      console.log("[Compare Debug] Outgoing API Request: POST /api/compare");

      // Check client-side cache first!
      const cachedReportA = clientCache.get(cleanA);
      const cachedReportB = clientCache.get(cleanB);

      const payload: any = {
        locationA: cleanA,
        locationB: cleanB,
      };

      if (cachedReportA) {
        payload.reportA = cachedReportA;
        console.log(`[Cache Debug] Compare page reusing cached report for Location A: "${cleanA}"`);
      }
      if (cachedReportB) {
        payload.reportB = cachedReportB;
        console.log(`[Cache Debug] Compare page reusing cached report for Location B: "${cleanB}"`);
      }

      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[Compare Debug] Incoming API Response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to compare localities.");
      }

      setResult(data.data);

      // Cache returned reports on client side
      if (data.data.locationA) {
        clientCache.set(cleanA, data.data.locationA);
      }
      if (data.data.locationB) {
        clientCache.set(cleanB, data.data.locationB);
      }

      // Save to recent comparisons in localStorage
      const newComparison: RecentComparison = {
        queryA: cleanA,
        queryB: cleanB,
        timestamp: Date.now()
      };
      
      try {
        const stored = localStorage.getItem("recent_comparisons");
        let list: RecentComparison[] = stored ? JSON.parse(stored) : [];
        list = list.filter(historyItem => 
          !(historyItem.queryA.toLowerCase() === cleanA.toLowerCase() && historyItem.queryB.toLowerCase() === cleanB.toLowerCase()) &&
          !(historyItem.queryA.toLowerCase() === cleanB.toLowerCase() && historyItem.queryB.toLowerCase() === cleanA.toLowerCase())
        );
        list.unshift(newComparison);
        list = list.slice(0, 5);
        localStorage.setItem("recent_comparisons", JSON.stringify(list));
        setRecentComparisons(list);
      } catch (e) {
        console.warn("Failed to save comparison to history", e);
      }
    } catch (err: any) {
      console.error("[Compare Debug] API Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `Check out this comparison: ${result.locationA.localityName} vs ${result.locationB.localityName}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Neighborhood Comparison",
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert(text);
    }
  };

  const handleExport = () => {
    if (!result || !n1Data || !n2Data) return;
    const csv = [
      ["Neighborhood", n1Data.name, n2Data.name],
      ["Overall Score", n1Data.overall_score, n2Data.overall_score],
      ["Personalized Score", profile1Score, profile2Score],
      ["Safety", n1Data.categoryScores.SAFETY, n2Data.categoryScores.SAFETY],
      ["Connectivity", n1Data.categoryScores.CONNECTIVITY, n2Data.categoryScores.CONNECTIVITY],
      ["Healthcare", n1Data.categoryScores.HEALTHCARE, n2Data.categoryScores.HEALTHCARE],
      ["Education", n1Data.categoryScores.EDUCATION, n2Data.categoryScores.EDUCATION],
      ["Environment", n1Data.categoryScores.ENVIRONMENT, n2Data.categoryScores.ENVIRONMENT],
      ["Infrastructure", n1Data.categoryScores.INFRASTRUCTURE, n2Data.categoryScores.INFRASTRUCTURE],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute("download", `comparison-${n1Data.name.toLowerCase()}-vs-${n2Data.name.toLowerCase()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Map backend results to standard comparison metrics
  const n1Data = result ? mapResponseToComparisonData(result.locationA) : null;
  const n2Data = result ? mapResponseToComparisonData(result.locationB) : null;

  const profile1Score = n1Data ? n1Data.overall_score : 0;
  const profile2Score = n2Data ? n2Data.overall_score : 0;

  const categoryComparison = n1Data && n2Data ? [
    { category: "SAFETY", score1: n1Data.categoryScores.SAFETY, score2: n2Data.categoryScores.SAFETY },
    { category: "CONNECTIVITY", score1: n1Data.categoryScores.CONNECTIVITY, score2: n2Data.categoryScores.CONNECTIVITY },
    { category: "HEALTHCARE", score1: n1Data.categoryScores.HEALTHCARE, score2: n2Data.categoryScores.HEALTHCARE },
    { category: "EDUCATION", score1: n1Data.categoryScores.EDUCATION, score2: n2Data.categoryScores.EDUCATION },
    { category: "ENVIRONMENT", score1: n1Data.categoryScores.ENVIRONMENT, score2: n2Data.categoryScores.ENVIRONMENT },
    { category: "INFRASTRUCTURE", score1: n1Data.categoryScores.INFRASTRUCTURE, score2: n2Data.categoryScores.INFRASTRUCTURE },
  ] : [];

  const stats1 = n1Data ? deriveStatsFromData(n1Data) : null;
  const stats2 = n2Data ? deriveStatsFromData(n2Data) : null;

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Sticky comparison header showing Locality names side by side */}
      <ComparisonHeader
        neighborhood1={result ? result.locationA.localityName : "Select Area A"}
        neighborhood2={result ? result.locationB.localityName : "Select Area B"}
        onBack={() => router.push("/app")}
        onShare={handleShare}
        onExport={handleExport}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
          
          {/* Main search form wrapper supporting Enter submissions */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCompare(queryA, queryB);
            }}
            className="bg-[#fefae0] border border-[#01472e]/10 rounded-[2.5rem] p-8 sm:p-10 shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 w-full">
                <SearchBox 
                  label="Location A" 
                  query={queryA} 
                  setQuery={setQueryA} 
                  onEnter={() => handleCompare(queryA, queryB)}
                  placeholder="e.g. Sector 17 Chandigarh, Bandra West Mumbai"
                />
              </div>
              <div className="hidden md:flex items-center justify-center pb-4 text-[#01472e]/30">
                <span className="font-display italic text-2xl">VS</span>
              </div>
              <div className="flex-1 w-full">
                <SearchBox 
                  label="Location B" 
                  query={queryB} 
                  setQuery={setQueryB} 
                  onEnter={() => handleCompare(queryA, queryB)}
                  placeholder="e.g. Sector 22 Chandigarh, Koramangala Bangalore"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={loading || !canCompare}
                className="h-14 px-8 rounded-full bg-[#01472e] text-[#fefae0] font-sans font-bold uppercase tracking-wider text-sm flex items-center gap-3 hover:bg-[#013522] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:-translate-y-0.5 animate-premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Compare Locations
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent Comparisons Section */}
          {recentComparisons.length > 0 && !result && !loading && (
            <motion.section 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-forest" />
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e]/60">
                  Recent Comparisons
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentComparisons.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryA(item.queryA);
                      setQueryB(item.queryB);
                      handleCompare(item.queryA, item.queryB);
                    }}
                    className="p-5 text-left bg-white border border-[#01472e]/10 rounded-2xl hover:bg-[#ccd5ae]/10 hover:border-[#01472e]/20 transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 truncate pr-2">
                        <p className="text-xs font-sans font-bold text-[#01472e] truncate">
                          {item.queryA.split(",")[0]} vs {item.queryB.split(",")[0]}
                        </p>
                        <p className="text-[10px] text-[#01472e]/40 font-medium">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#01472e]/30 group-hover:text-[#01472e] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 shadow-sm"
            >
              <h3 className="font-bold mb-2">Comparison Error</h3>
              <p>{error}</p>
            </motion.div>
          )}

          {/* Loading Skeletal State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-[#01472e]/60 font-sans gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Loading spatial comparisons...</span>
            </div>
          )}

          {result && n1Data && n2Data && stats1 && stats2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-20 pt-8 border-t border-[#01472e]/10 relative z-10"
            >
              {/* Score comparisons with dynamic crowns and tie badges */}
              <ScoreComparison
                name1={n1Data.name}
                score1={profile1Score}
                name2={n2Data.name}
                score2={profile2Score}
              />

 
              {/* Side-by-side interactive OpenStreetMap embeds */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-forest" />
                  <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
                    Location Maps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Map A */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e] text-center">
                      {n1Data.name} Map
                    </h3>
                    <div className="overflow-hidden border border-[#01472e]/10 rounded-[2.5rem] h-[350px] shadow-sm">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${n1Data.longitude - 0.012},${n1Data.latitude - 0.01},${n1Data.longitude + 0.012},${n1Data.latitude + 0.01}&layer=mapnik&marker=${n1Data.latitude},${n1Data.longitude}`}
                        className="w-full h-full border-none"
                        title={`${n1Data.name} Map`}
                      />
                    </div>
                  </div>

                  {/* Map B */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e] text-center">
                      {n2Data.name} Map
                    </h3>
                    <div className="overflow-hidden border border-[#01472e]/10 rounded-[2.5rem] h-[350px] shadow-sm">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${n2Data.longitude - 0.012},${n2Data.latitude - 0.01},${n2Data.longitude + 0.012},${n2Data.latitude + 0.01}&layer=mapnik&marker=${n2Data.latitude},${n2Data.longitude}`}
                        className="w-full h-full border-none"
                        title={`${n2Data.name} Map`}
                      />
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Category Scores breakdown bar meters */}
              <CategoryComparison categories={categoryComparison} />

              {/* General Neighborhood Characteristics comparison */}
              <NeighborhoodComparison
                name1={n1Data.name}
                stats1={stats1}
                name2={n2Data.name}
                stats2={stats2}
              />

              {/* Claude AI Verdict Summary */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-forest" />
                  <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
                    AI Comparison Verdict
                  </h2>
                </div>

                <div className="bg-[#01472e] text-[#fefae0] rounded-[2.5rem] p-8 sm:p-12 shadow-xl space-y-10 border border-[#01472e]/10">
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#e2b764]">
                      Claude AI Verdict
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-display leading-tight">
                      Winner: <span className="text-[#e2b764] italic">{result.comparison.winner}</span>
                    </h3>
                    <p className="text-sm sm:text-base text-[#fefae0]/85 leading-relaxed font-sans font-medium">
                      {result.comparison.overall}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    {[
                      { title: "For Families", text: result.comparison.betterForFamilies },
                      { title: "For Students", text: result.comparison.betterForStudents },
                      { title: "For Professionals", text: result.comparison.betterForProfessionals },
                      { title: "Connectivity", text: result.comparison.betterConnectivity },
                      { title: "Healthcare", text: result.comparison.betterHealthcare },
                      { title: "Nightlife", text: result.comparison.betterNightlife },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3 hover:bg-white/10 transition-colors duration-300">
                        <h4 className="text-[#e2b764] font-sans font-bold text-xs uppercase tracking-wider">{item.title}</h4>
                        <p className="text-xs text-[#fefae0]/80 leading-relaxed font-sans font-medium">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Side-by-Side Pros and Cons */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Area A Pros/Cons */}
                <div className="bg-[#fefae0]/50 border border-[#01472e]/10 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                  <h3 className="text-lg font-sans font-bold uppercase tracking-wider text-[#01472e]">
                    {result.locationA.localityName} Pros & Cons
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-forest mb-2">Advantages</h4>
                      <ul className="space-y-2">
                        {result.locationA.pros.map((pro, i) => (
                          <li key={i} className="text-xs font-sans font-medium text-[#01472e]/90 flex items-start gap-2">
                            <Plus className="w-3.5 h-3.5 text-forest mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#01472e]/5">
                      <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-red-700 mb-2">Considerations</h4>
                      <ul className="space-y-2">
                        {result.locationA.cons.map((con, i) => (
                          <li key={i} className="text-xs font-sans font-medium text-[#01472e]/90 flex items-start gap-2">
                            <Minus className="w-3.5 h-3.5 text-red-700 mt-0.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Area B Pros/Cons */}
                <div className="bg-[#fefae0]/50 border border-[#01472e]/10 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                  <h3 className="text-lg font-sans font-bold uppercase tracking-wider text-[#01472e]">
                    {result.locationB.localityName} Pros & Cons
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-forest mb-2">Advantages</h4>
                      <ul className="space-y-2">
                        {result.locationB.pros.map((pro, i) => (
                          <li key={i} className="text-xs font-sans font-medium text-[#01472e]/90 flex items-start gap-2">
                            <Plus className="w-3.5 h-3.5 text-forest mt-0.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-[#01472e]/5">
                      <h4 className="text-xs font-sans font-bold uppercase tracking-wide text-red-700 mb-2">Considerations</h4>
                      <ul className="space-y-2">
                        {result.locationB.cons.map((con, i) => (
                          <li key={i} className="text-xs font-sans font-medium text-[#01472e]/90 flex items-start gap-2">
                            <Minus className="w-3.5 h-3.5 text-red-700 mt-0.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Side-by-Side Latest News */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-forest" />
                  <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
                    Civic & Regional News
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* News A */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e]">
                      {result.locationA.localityName} News
                    </h3>
                    <div className="space-y-3">
                      {result.locationA.latestNewsNormalized.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="bg-white border border-[#01472e]/10 p-5 rounded-2xl space-y-2 shadow-xs">
                          <h4 className="text-xs font-bold text-[#01472e] leading-snug">{item.headline}</h4>
                          <p className="text-[10px] text-[#01472e]/60 font-semibold">{item.source} • {item.published_time ? new Date(item.published_time).toLocaleDateString() : 'Recent'}</p>
                          <p className="text-xs text-[#01472e]/80 leading-relaxed font-sans">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* News B */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#01472e]">
                      {result.locationB.localityName} News
                    </h3>
                    <div className="space-y-3">
                      {result.locationB.latestNewsNormalized.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="bg-white border border-[#01472e]/10 p-5 rounded-2xl space-y-2 shadow-xs">
                          <h4 className="text-xs font-bold text-[#01472e] leading-snug">{item.headline}</h4>
                          <p className="text-[10px] text-[#01472e]/60 font-semibold">{item.source} • {item.published_time ? new Date(item.published_time).toLocaleDateString() : 'Recent'}</p>
                          <p className="text-xs text-[#01472e]/80 leading-relaxed font-sans">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
