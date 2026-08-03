"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LocalityReport } from "@/types/locality";
import {
  ChevronLeft,
  MapPin,
  ArrowRight,
  Compass,
  Newspaper,
  GraduationCap,
  HeartPulse,
  Bus,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Utensils,
  TreePine,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { SingleNeighborhoodMap } from "@/components/maps/SingleNeighborhoodMap";
import { AILoadingScreen } from "@/components/common/AILoadingScreen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants, fadeInUp } from "@/hooks/usePageAnimation";
import { clientCache } from "@/lib/clientCache";

export default function NeighborhoodPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = typeof params.id === "string" ? params.id : null;
  const decodedQuery = rawId ? decodeURIComponent(rawId).replace(/-/g, " ") : "";

  const [report, setReport] = useState<LocalityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [streamProgress, setStreamProgress] = useState(0);
  const [streamMessage, setStreamMessage] = useState("Initializing AI Engine...");

  const fetchLocality = useCallback(async () => {
    if (!decodedQuery.trim()) {
      setError("No locality query provided.");
      setIsLoading(false);
      return;
    }

    // Check client-side cache first
    const cachedData = clientCache.get(decodedQuery);
    if (cachedData) {
      console.log(`[Cache Debug] Cache Hit (Memory/localStorage) for: "${decodedQuery}"`);
      setReport(cachedData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setStreamProgress(0);
    setStreamMessage("Request received");

    try {
      const response = await fetch("/api/locality/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: decodedQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to locality intelligence engine.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream not supported by browser");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the incomplete line in the buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentEvent = ""; // Blank line resets event
            continue;
          }
          
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.substring(6).trim();
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.substring(5).trim();
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                
                if (currentEvent === "complete") {
                  if (data.data) {
                    setReport(data.data);
                    // Store in client-side cache
                    clientCache.set(decodedQuery, data.data);
                  }
                  setIsLoading(false);
                } else if (currentEvent === "error") {
                  throw new Error(data.error || "Stream error");
                } else {
                  // Default message event
                  if (data.progress !== undefined) setStreamProgress(data.progress);
                  if (data.message) setStreamMessage(data.message);
                  if (data.partialData) {
                    setReport((prev) => {
                      if (!prev) return data.partialData as LocalityReport;
                      return { ...prev, ...data.partialData };
                    });
                  }
                }
              } catch (e) {
                console.error("SSE Parse Error:", e, dataStr);
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("[NeighborhoodPage] Failed to fetch locality intelligence:", err);
      let errorMsg = "Unable to generate locality intelligence report. Please check the locality name and try again.";
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  }, [decodedQuery]);

  useEffect(() => {
    fetchLocality();
  }, [fetchLocality]);

  const handlePersonalize = () => {
    if (report) {
      sessionStorage.setItem('current_locality_data', JSON.stringify(report));
    }
    router.push(`/personalize?neighborhoodId=${encodeURIComponent(report?.localityName || decodedQuery)}`);
  };

  const scores = report?.categoryScores || {
    safetyAndCrime: 80,
    environmentAndAirQuality: 75,
    publicTransport: 82,
    basicAmenities: 84,
    schools: 76,
    healthcare: 78,
    affordability: 70,
    nightlife: 65,
    parksAndRecreation: 75,
    trafficAndCommute: 72,
    walkability: 85,
    restaurants: 80,
    shopping: 78,
    familyFriendly: 82,
  };

  const indicatorMetrics = report ? [
    { name: "Safety & Security", score: scores.safetyAndCrime, description: report.safety || "Active neighborhood monitoring and civic security infrastructure." },
    { name: "Transit & Connectivity", score: scores.publicTransport, description: report.connectivity || "Arterial road network, public transit access, and walkability." },
    { name: "Healthcare Access", score: scores.healthcare, description: report.healthcare?.length ? `${report.healthcare.length} major medical centers and emergency healthcare hubs.` : "Local clinics, multi-specialty hospitals, and health dispensaries." },
    { name: "Education & Academies", score: scores.schools, description: report.education?.length ? `${report.education.length} recognized schools, colleges, and institutes.` : "Primary, secondary, and higher academic institutions." },
    { name: "Environmental Quality", score: scores.environmentAndAirQuality, description: report.airQuality ? `AQI ${report.airQuality.aqi} - ${report.airQuality.category}` : "Local parks, green spaces, and air quality baseline." },
    { name: "Infrastructure & Amenities", score: scores.basicAmenities, description: report.poiCensus?.totalAmenities ? `Over ${report.poiCensus.totalAmenities} verified places of interest and civic utilities.` : "Commercial markets, retail spaces, and civic amenities." },
  ] : [];

  const mapNeighborhoodData = report ? {
    id: report.id,
    name: report.localityName,
    city: report.city,
    state: report.state,
    latitude: report.latitude,
    longitude: report.longitude,
  } : null;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <AILoadingScreen key="loading" progress={streamProgress} message={streamMessage} />
      ) : error || !report ? (
        <motion.div 
          key="error"
          initial="hidden" animate="visible" exit="hidden" variants={containerVariants}
          className="min-h-screen bg-bg-primary flex items-center justify-center pt-24 pb-20 px-6"
        >
          <div className="text-center max-w-lg p-10 bg-[#fefae0] rounded-[3rem] border border-[#01472e]/15 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display uppercase tracking-tight text-[#01472e] mb-3">
              Intelligence Generation Error
            </h2>
            <p className="text-sm text-[#01472e]/80 font-sans leading-relaxed mb-8">
              {error || "Could not retrieve locality report for the specified query."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => fetchLocality()}
                className="w-full sm:w-auto bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90 gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry Analysis
              </Button>
              <Button
                onClick={() => router.push("/app")}
                variant="outline"
                className="w-full sm:w-auto border-[#01472e]/30 text-[#01472e]"
              >
                Back to Search
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="min-h-screen bg-bg-primary relative overflow-hidden pt-24 pb-20"
        >
          
          {/* Structural lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
            <div className="w-full h-full max-w-7xl mx-auto border-x border-[#01472e]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
            {/* Header Navigation */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
              <Button
                onClick={() => router.push("/app")}
                variant="ghost"
                size="sm"
                className="gap-2 -ml-3 text-[#01472e]/70 hover:text-[#01472e]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Search
              </Button>

              <button
                onClick={() => fetchLocality()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fefae0] hover:bg-[#e9edc9] border border-[#01472e]/15 text-xs font-bold text-[#01472e] transition-all"
                title="Refresh AI Analysis"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#01472e]/70" /> Refresh Intelligence
              </button>
            </motion.div>

            {/* Title Area */}
            <motion.div variants={itemVariants} className="mb-14 border-b border-[#01472e]/10 pb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#01472e] bg-[#e9edc9] px-3 py-1 rounded-full border border-[#01472e]/10">
                  AI Locality Intelligence
                </span>
                {report.country && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/60">
                    {report.country}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase tracking-tight leading-none text-[#01472e] mb-6">
                {report.localityName}
              </h1>

              <div className="flex items-center gap-2 text-base sm:text-lg text-[#01472e]/70 font-sans">
                <MapPin className="w-5 h-5 text-[#01472e]/60 flex-shrink-0" />
                <span>
                  {report.city ? `${report.city}, ` : ""}{report.state || "Geographic Zone"}
                </span>
              </div>
            </motion.div>

            {/* Key Metrics Columns */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-[#01472e]/10 pb-14 mb-16"
            >
              {/* Overall Livability Score */}
              <div className="lg:border-r border-[#01472e]/10 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/50 block mb-2">
                  Livability Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl sm:text-6xl font-display text-[#01472e]">{report.overallScore}</span>
                  <span className="text-sm font-bold text-[#01472e]/40">/100</span>
                </div>
                <p className="text-xs text-[#01472e]/60 font-sans mt-3 leading-relaxed font-medium">
                  Multi-factor assessment across transit, security, healthcare, and education.
                </p>
              </div>

              {/* Population Card */}
              <div className="lg:border-r border-[#01472e]/10 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/50 block mb-2">
                  Demographic / Population
                </span>
                <span className="text-2xl sm:text-3xl font-display text-[#01472e] block leading-tight">
                  {report.population || "Not Available"}
                </span>
                <p className="text-xs text-[#01472e]/60 font-sans mt-3 leading-relaxed font-medium">
                  Estimated resident count or demographic profile.
                </p>
              </div>

              {/* Safety Metric */}
              <div className="lg:border-r border-[#01472e]/10 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/50 block mb-2">
                  Safety Index
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl sm:text-6xl font-display text-[#01472e]">{scores.safetyAndCrime}</span>
                  <span className="text-sm font-bold text-[#01472e]/40">/100</span>
                </div>
                <p className="text-xs text-[#01472e]/60 font-sans mt-3 leading-relaxed font-medium">
                  Civic security, pedestrian lighting, and emergency response availability.
                </p>
              </div>

              {/* Connectivity Metric */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/50 block mb-2">
                  Connectivity Index
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl sm:text-6xl font-display text-[#01472e]">{scores.publicTransport}</span>
                  <span className="text-sm font-bold text-[#01472e]/40">/100</span>
                </div>
                <p className="text-xs text-[#01472e]/60 font-sans mt-3 leading-relaxed font-medium">
                  Road networks, public transit accessibility, and regional hubs.
                </p>
              </div>
            </motion.div>

            {/* Narrative Overview & Executive Summary Cards */}
            <section className="mb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overview Card */}
              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-[#01472e]" />
                    <h2 className="text-lg font-display uppercase tracking-wider text-[#01472e]">
                      Locality Overview
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-[#01472e]/85 leading-relaxed font-sans font-medium">
                    {report.overview || "Overview information is currently not available for this locality."}
                  </p>
                </div>

                {report.highlights && report.highlights.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#01472e]/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#01472e]/60 block mb-3">
                      Key Urban Highlights
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {report.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-[#e9edc9] text-xs font-bold text-[#01472e] border border-[#01472e]/10"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* AI Executive Summary Card */}
              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#e9edc9]/50 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#01472e]" />
                    <h2 className="text-lg font-display uppercase tracking-wider text-[#01472e]">
                      AI Executive Summary
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-[#01472e]/85 leading-relaxed font-sans font-medium">
                    {report.summary || "Summary evaluation is currently not available."}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#01472e]/10 flex items-center justify-between">
                  <span className="text-xs text-[#01472e]/60 font-sans font-medium">
                    Synthesized from verified public data and urban intelligence.
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#01472e] bg-[#01472e]/10 px-2.5 py-1 rounded-full">
                    Live Analysis
                  </span>
                </div>
              </Card>
            </section>

            {/* Urban Indicators Section */}
            <section className="mb-20">
              <div className="border-t border-[#01472e]/10 pt-10 mb-10">
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-[#01472e]">
                  Urban Indicators & Infrastructure Assessment
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {indicatorMetrics.map((metric) => (
                  <Card
                    key={metric.name}
                    className="p-7 flex flex-col justify-between border-[#01472e]/10 hover:border-[#01472e]/30 bg-[#fefae0] rounded-[2.5rem] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#01472e] font-sans">
                          {metric.name}
                        </h3>
                        <span className="text-2xl font-display text-[#01472e]">
                          {metric.score}
                        </span>
                      </div>

                      <div className="w-full bg-[#01472e]/10 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#01472e]/75 leading-relaxed font-sans font-medium">
                      {metric.description}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Real-Time Environmental & Civic Grounding Section */}
            <section className="mb-20">
              <div className="border-t border-[#01472e]/10 pt-10 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/60 block mb-1">
                      Empirical Grounding Engine
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-[#01472e]">
                      Live Environmental & Civic Infrastructure Grounding
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e9edc9] text-[#01472e] border border-[#01472e]/15">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" /> Grounded in OpenStreetMap & Open-Meteo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Live Air Quality Card */}
                <Card className="lg:col-span-5 p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[#01472e]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#01472e]">
                          Real-Time Air Quality
                        </h3>
                      </div>
                      {report.airQuality && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                            report.airQuality.aqi <= 50
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : report.airQuality.aqi <= 100
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : report.airQuality.aqi <= 150
                              ? "bg-orange-100 text-orange-800 border border-orange-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {report.airQuality.category}
                        </span>
                      )}
                    </div>

                    {report.airQuality ? (
                      <div className="space-y-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-display text-[#01472e]">
                            {report.airQuality.aqi}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#01472e]/50">
                            AQI Index {report.airQuality.usAqi ? `(US AQI: ${report.airQuality.usAqi})` : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-[#e9edc9]/60 p-3 rounded-2xl border border-[#01472e]/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#01472e]/60 block mb-1">
                              PM2.5 Concentration
                            </span>
                            <span className="text-lg font-bold font-mono text-[#01472e]">
                              {report.airQuality.pm25} <span className="text-xs font-normal">µg/m³</span>
                            </span>
                          </div>
                          <div className="bg-[#e9edc9]/60 p-3 rounded-2xl border border-[#01472e]/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#01472e]/60 block mb-1">
                              PM10 Concentration
                            </span>
                            <span className="text-lg font-bold font-mono text-[#01472e]">
                              {report.airQuality.pm10} <span className="text-xs font-normal">µg/m³</span>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#01472e]/80 leading-relaxed font-sans font-medium bg-[#fefae0] border border-[#01472e]/10 p-3.5 rounded-2xl">
                          <strong className="text-[#01472e] block mb-1">Health Advisory:</strong>
                          {report.airQuality.advisory}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#01472e]/60 font-sans">
                        Live environmental telemetry unavailable for this coordinate.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#01472e]/10 flex items-center justify-between text-[10px] text-[#01472e]/50 font-sans">
                    <span>Sensor Source: Open-Meteo Network</span>
                    <span>Real-Time Ingestion</span>
                  </div>
                </Card>

                {/* Verified POI Census Summary Card */}
                <Card className="lg:col-span-7 p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[#01472e]">
                          <Landmark className="w-4 h-4 text-[#01472e]" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#01472e]">
                          Verified OpenStreetMap POI Census
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-[#01472e] bg-[#e9edc9] px-2.5 py-1 rounded-full border border-[#01472e]/10">
                        2.5km Radius Scan
                      </span>
                    </div>

                    {report.poiCensus ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-2xl bg-[#fee2e2]/60 border border-red-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1">
                              🏥 Healthcare
                            </span>
                            <span className="text-2xl font-bold font-display text-red-900">
                              {report.poiCensus.healthcareCount}
                            </span>
                            <span className="text-[10px] text-red-700/80 block mt-0.5">facilities</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#dbeafe]/60 border border-blue-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                              🎓 Education
                            </span>
                            <span className="text-2xl font-bold font-display text-blue-900">
                              {report.poiCensus.educationCount}
                            </span>
                            <span className="text-[10px] text-blue-700/80 block mt-0.5">schools/colleges</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#ffedd5]/60 border border-amber-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                              🚌 Transit Hubs
                            </span>
                            <span className="text-2xl font-bold font-display text-amber-900">
                              {report.poiCensus.transitCount}
                            </span>
                            <span className="text-[10px] text-amber-700/80 block mt-0.5">stations & stops</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#dcfce7]/60 border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                              🌳 Parks & Green
                            </span>
                            <span className="text-2xl font-bold font-display text-emerald-900">
                              {report.poiCensus.parksCount}
                            </span>
                            <span className="text-[10px] text-emerald-700/80 block mt-0.5">recreation spaces</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#f3e8ff]/60 border border-purple-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block mb-1">
                              🛍️ Retail Markets
                            </span>
                            <span className="text-2xl font-bold font-display text-purple-900">
                              {report.poiCensus.marketsCount}
                            </span>
                            <span className="text-[10px] text-purple-700/80 block mt-0.5">shopping plazas</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#fef9c3]/60 border border-yellow-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-800 block mb-1">
                              🍽️ Dining Venues
                            </span>
                            <span className="text-2xl font-bold font-display text-yellow-900">
                              {report.poiCensus.diningCount}
                            </span>
                            <span className="text-[10px] text-yellow-700/80 block mt-0.5">eateries & cafes</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#01472e]/75 font-sans leading-relaxed">
                          Total <strong>{report.poiCensus.totalAmenities} verified amenities</strong> cataloged in OpenStreetMap geospatial index within 2.5km.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#01472e]/60 font-sans">
                        Geospatial census points aggregating from global database.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#01472e]/10 flex items-center justify-between text-[10px] text-[#01472e]/50 font-sans">
                    <span>Engine: OpenStreetMap Overpass QL</span>
                    <span>Distance Model: Haversine Geodesic</span>
                  </div>
                </Card>
              </div>
            </section>

            {/* Spatial Map & Geographic Coordinates */}
            <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 flex flex-col justify-between p-8 bg-[#fefae0] rounded-[2.5rem] border border-[#01472e]/10 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]/60 block mb-2">
                    Cartographic Details
                  </span>
                  <h3 className="text-2xl font-display uppercase text-[#01472e] mb-4">
                    Spatial Coordinates
                  </h3>
                  <p className="text-xs sm:text-sm text-[#01472e]/75 font-sans leading-relaxed mb-6">
                    Interactive OpenStreetMap rendering displaying categorized civic points of interest, transit stations, and health facilities.
                  </p>

                  <div className="space-y-3 font-mono text-xs text-[#01472e] bg-[#e9edc9]/50 p-4 rounded-[1.5rem] border border-[#01472e]/10">
                    <div>
                      <span className="font-bold">Latitude: </span>{report.latitude.toFixed(4)}° N
                    </div>
                    <div>
                      <span className="font-bold">Longitude: </span>{report.longitude.toFixed(4)}° E
                    </div>
                    <div>
                      <span className="font-bold">Location: </span>{report.localityName}, {report.city}
                    </div>
                    {report.geoPoints && (
                      <div>
                        <span className="font-bold">Geotagged POIs: </span>{report.geoPoints.length} pins plotted
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#01472e]/10 flex items-center justify-between text-xs text-[#01472e]/60 font-sans">
                  <span>OpenStreetMap / Nominatim</span>
                  <span className="font-bold text-[#01472e]">Verified Pins</span>
                </div>
              </div>

              <div className="lg:col-span-8 min-h-[480px] rounded-[2.5rem] overflow-hidden border border-[#01472e]/10 shadow-sm p-4 bg-[#fefae0]">
                <SingleNeighborhoodMap
                  neighborhood={mapNeighborhoodData!}
                  geoPoints={report.geoPoints}
                  heightClassName="h-full min-h-[480px]"
                />
              </div>
            </section>


            {/* Comprehensive Amenities & Facilities Grid */}
            <section className="mb-20">
              <div className="border-t border-[#01472e]/10 pt-10 mb-10">
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-[#01472e]">
                  Locality Amenities & Infrastructure
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Hospitals Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-[#01472e]" /> Healthcare
                      </h3>
                      {report.poiCensus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                          {report.poiCensus.healthcareCount} within 2.5km
                        </span>
                      )}
                    </div>
                    {report.healthcare && report.healthcare.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.healthcare.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>

                {/* Education Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#01472e]" /> Schools & Education
                      </h3>
                      {report.poiCensus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {report.poiCensus.educationCount} within 2.5km
                        </span>
                      )}
                    </div>
                    {report.education && report.education.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.education.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>

                {/* Markets Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#01472e]" /> Markets & Retail
                      </h3>
                      {report.poiCensus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          {report.poiCensus.marketsCount} within 2.5km
                        </span>
                      )}
                    </div>
                    {report.markets && report.markets.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.markets.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>

                {/* Restaurants Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#01472e]" /> Dining & Cafes
                      </h3>
                      {report.poiCensus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {report.poiCensus.diningCount} within 2.5km
                        </span>
                      )}
                    </div>
                    {report.restaurants && report.restaurants.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.restaurants.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>

                {/* Parks Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-[#01472e]" /> Parks & Greenery
                      </h3>
                      {report.poiCensus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {report.poiCensus.parksCount} within 2.5km
                        </span>
                      )}
                    </div>
                    {report.parks && report.parks.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.parks.map((p, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>

                {/* Tourist Places & Landmarks Card */}
                <Card className="p-8 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#01472e] mb-4 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#01472e]" /> Landmarks & Tourist Spots
                    </h3>
                    {report.touristPlaces && report.touristPlaces.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#01472e]/85 font-sans font-medium">
                        {report.touristPlaces.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] mt-2 flex-shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                    )}
                  </div>
                </Card>
              </div>
            </section>

            {/* Strengths & Tradeoffs (Pros & Cons) */}
            <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pros Card */}
              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm">
                <h3 className="text-lg font-display uppercase tracking-wider text-[#01472e] mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Locality Advantages & Strengths
                </h3>
                {report.pros && report.pros.length > 0 ? (
                  <ul className="space-y-3 font-sans text-sm text-[#01472e]/85">
                    {report.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          ✓
                        </span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                )}
              </Card>

              {/* Cons Card */}
              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm">
                <h3 className="text-lg font-display uppercase tracking-wider text-[#01472e] mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-700" /> Civic Considerations & Trade-offs
                </h3>
                {report.cons && report.cons.length > 0 ? (
                  <ul className="space-y-3 font-sans text-sm text-[#01472e]/85">
                    {report.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          !
                        </span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#01472e]/60 font-sans">Not Available</p>
                )}
              </Card>
            </section>

            {/* Connectivity & Safety Deep-Dive */}
            <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-[0.15em] text-[#01472e] mb-4 flex items-center gap-2 font-sans">
                    <Bus className="w-5 h-5 text-[#01472e]" /> Connectivity Evaluation
                  </h3>
                  <p className="text-sm text-[#01472e]/85 font-sans leading-relaxed font-medium">
                    {report.connectivity || "Connectivity details not available."}
                  </p>
                </div>
              </Card>

              <Card className="p-8 sm:p-10 border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-[0.15em] text-[#01472e] mb-4 flex items-center gap-2 font-sans">
                    <ShieldCheck className="w-5 h-5 text-[#01472e]" /> Safety & Security Profile
                  </h3>
                  <p className="text-sm text-[#01472e]/85 font-sans leading-relaxed font-medium">
                    {report.safety || "Safety evaluation not available."}
                  </p>
                </div>
              </Card>
            </section>

            {/* Latest Local News Card */}
            {report.latestNewsNormalized && report.latestNewsNormalized.length > 0 && (
              <section className="mb-20">
                <div className="border-t border-[#01472e]/10 pt-10 mb-10">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-[#01472e] flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-[#01472e]" /> Latest Civic & Locality News
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.latestNewsNormalized.map((news, idx) => (
                    <Card
                      key={idx}
                      className="p-8 flex flex-col justify-between border-[#01472e]/10 bg-[#fefae0] rounded-[2.5rem] shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#01472e]/60 block mb-2">
                          {news.source} • {news.published_time ? new Date(news.published_time).toLocaleDateString() : "Recent"}
                        </span>
                        <h3 className="text-base font-bold text-[#01472e] mb-3">
                          {news.headline}
                        </h3>
                        <p className="text-xs text-[#01472e]/75 leading-relaxed font-sans line-clamp-3 font-medium">
                          {news.summary}
                        </p>
                      </div>
                      {news.link && (
                        <a
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#01472e] mt-6 hover:underline"
                        >
                          Read full update <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Personalization Block */}
            <motion.div
              className="bg-[#e9edc9] rounded-[4rem] p-10 sm:p-16 text-center border border-[#01472e]/10 shadow-lg"
              variants={fadeInUp}
            >
              <h2 className="text-3xl sm:text-5xl font-display uppercase text-[#01472e] mb-4">
                Personalize for Your Lifestyle
              </h2>
              <p className="text-base text-[#01472e]/80 max-w-md mx-auto mb-8 font-sans">
                Tailor livability weights based on family schools, student budget, or professional connectivity priorities.
              </p>
              <Button
                onClick={handlePersonalize}
                size="lg"
                className="shadow-md bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90"
              >
                Personalize Locality Score <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
