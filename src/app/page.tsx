"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ArrowRight, MapPin, Compass, ShieldCheck, Sparkles, Map, HeartPulse, GraduationCap } from "lucide-react";
import { fadeInUp, containerVariants, itemVariants } from "@/hooks/usePageAnimation";

// Floating Topographic SVG Component
function TopographyOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <svg className="absolute -top-12 -right-12 w-[500px] h-[500px] text-[#01472e]/5" viewBox="0 0 400 400" fill="none" stroke="currentColor">
        <path d="M50,300 Q120,250 200,280 T350,220" strokeWidth="1" />
        <path d="M30,280 Q110,220 190,260 T370,190" strokeWidth="1" />
        <path d="M70,320 Q140,270 220,300 T330,245" strokeWidth="1" />
        <path d="M10,260 Q90,190 170,240 T390,160" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M90,350 Q160,290 240,320 T310,270" strokeWidth="1" />
        <circle cx="200" cy="280" r="3" fill="#01472e" />
        <circle cx="200" cy="280" r="14" stroke="#01472e" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>

      <svg className="absolute top-[40%] -left-24 w-[600px] h-[600px] text-[#01472e]/5" viewBox="0 0 400 400" fill="none" stroke="currentColor">
        <path d="M100,50 Q180,120 150,200 T220,350" strokeWidth="1" />
        <path d="M120,30 Q200,100 170,180 T240,330" strokeWidth="1" />
        <path d="M80,70 Q160,140 130,220 T200,370" strokeWidth="1" />
        <path d="M140,10 Q220,80 190,160 T260,310" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="150" cy="200" r="3" fill="#01472e" />
        <circle cx="150" cy="200" r="12" stroke="#01472e" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary relative pt-20">
      <TopographyOverlay />

      <motion.div
        className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HERO SECTION */}
        <div className="min-h-[80vh] flex flex-col justify-center items-center text-center relative mb-24">
          <motion.div variants={itemVariants} className="max-w-5xl">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#01472e] mb-6 block">
              Neighborhood Intelligence Platform
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display uppercase leading-tight text-[#01472e] tracking-tight mb-8">
              Explore your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01472e] to-[#a3b18a]">neighborhood</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#01472e]/80 max-w-2xl mx-auto mb-12 font-sans leading-relaxed tracking-wide">
              An architectural and geographic analysis engine evaluated across safety, health, connectivity, schools, and lifestyle metrics.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push("/app")}
                size="lg"
                className="shadow-lg"
                aria-label="Start neighborhood search"
              >
                Search Map <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* ASYMMETRIC EDITORIAL GRID (FEATURES) */}
        <section className="mb-32">
          <div className="border-t border-[#01472e]/10 pt-16 mb-16 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-display uppercase text-[#01472e]">
              Evaluation Metrics
            </h2>
            <p className="text-sm font-sans tracking-wide text-[#01472e]/70 max-w-sm">
              We evaluate neighborhoods using multi-layered indicators to build a deep structural analysis of urban spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Asymmetric card 1 (Large - spans 7 cols) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="lg:col-span-7 bg-[#e9edc9] rounded-[2.5rem] p-8 sm:p-12 border border-[#01472e]/10 flex flex-col justify-between min-h-[400px] shadow-md transition-all duration-500 ease-premium"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#01472e] flex items-center justify-center mb-8 text-[#fefae0]">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-display uppercase text-[#01472e] mb-4">
                  Spatial Intelligence
                </h3>
                <p className="text-base text-[#01472e]/80 font-sans max-w-md leading-relaxed">
                  Evaluate neighborhoods across schools, connectivity, safety, and transit networks. We render physical city characteristics into clean, structured intelligence.
                </p>
              </div>
              <div className="border-t border-[#01472e]/10 pt-6 mt-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]">01 / Cartography Data</span>
                <span className="text-xs font-bold">10,000+ Districts</span>
              </div>
            </motion.div>

            {/* Asymmetric card 2 (Medium - spans 5 cols) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="lg:col-span-5 bg-[#ccd5ae] rounded-[2.5rem] p-8 sm:p-12 border border-[#01472e]/10 flex flex-col justify-between min-h-[400px] shadow-md transition-all duration-500 ease-premium"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#01472e] flex items-center justify-center mb-8 text-[#fefae0]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-display uppercase text-[#01472e] mb-4">
                  Tailored Fit
                </h3>
                <p className="text-base text-[#01472e]/80 font-sans leading-relaxed">
                  Adjust metrics dynamically to match your lifestyle profile: Student, Professional, or Family, and witness weights recalculate in real-time.
                </p>
              </div>
              <div className="border-t border-[#01472e]/10 pt-6 mt-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]">02 / Personalized Engine</span>
                <span className="text-xs font-bold">Weighted Scores</span>
              </div>
            </motion.div>

            {/* Asymmetric card 3 (Medium - spans 5 cols) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="lg:col-span-5 bg-[#fefae0] rounded-[2.5rem] p-8 sm:p-12 border border-[#01472e]/15 flex flex-col justify-between min-h-[400px] shadow-md transition-all duration-500 ease-premium"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#01472e] flex items-center justify-center mb-8 text-[#fefae0]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-display uppercase text-[#01472e] mb-4">
                  Narrative Analysis
                </h3>
                <p className="text-base text-[#01472e]/80 font-sans leading-relaxed">
                  AI reads, summarizes, and synthesizes score results into structured, long-form editorial profiles resembling neighborhood reviews in magazines.
                </p>
              </div>
              <div className="border-t border-[#01472e]/10 pt-6 mt-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]">03 / Narrative Insights</span>
                <span className="text-xs font-bold">Editorial Synthesis</span>
              </div>
            </motion.div>

            {/* Asymmetric card 4 (Large - spans 7 cols) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="lg:col-span-7 bg-[#e9edc9]/50 rounded-[2.5rem] p-8 sm:p-12 border border-[#01472e]/10 flex flex-col justify-between min-h-[400px] shadow-md transition-all duration-500 ease-premium"
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#01472e] flex items-center justify-center mb-8 text-[#fefae0]">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-display uppercase text-[#01472e] mb-4">
                  Comparative Analysis
                </h3>
                <p className="text-base text-[#01472e]/80 font-sans max-w-md leading-relaxed">
                  Compare two neighborhoods side-by-side. Our intelligence engine weighs categories in parallel, helping you evaluate tradeoffs dynamically.
                </p>
              </div>
              <div className="border-t border-[#01472e]/10 pt-6 mt-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e]">04 / Urban Tradeoffs</span>
                <span className="text-xs font-bold">Parallel Matrix</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LIVE DEMO: ARCHITECTURAL REPORT STYLE */}
        <section className="mb-32">
          <div className="border-t border-[#01472e]/10 pt-16 mb-16 text-center max-w-2xl mx-auto">
            <span className="px-3 py-1.5 rounded-full border border-[#01472e]/20 text-[10px] font-bold uppercase tracking-[0.2em] text-[#01472e] mb-4 inline-block">
              Interactive Blueprint
            </span>
            <h2 className="text-4xl sm:text-5xl font-display uppercase text-[#01472e] mb-6">
              Sample Assessment
            </h2>
            <p className="text-[#01472e]/80 font-sans leading-relaxed">
              Observe how our system parses, structures, and documents neighborhood dynamics in real-time.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#ccd5ae]/30 rounded-[3rem] p-6 sm:p-10 border border-[#01472e]/10 max-w-4xl mx-auto shadow-xl"
          >
            {/* Demo Dashboard Layout */}
            <div className="bg-[#fefae0] rounded-[2.5rem] p-8 sm:p-12 border border-[#01472e]/15 shadow-sm">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#01472e]/10 pb-8 mb-8">
                <div>
                  <h3 className="text-3xl sm:text-4xl font-display uppercase text-[#01472e]">
                    Brooklyn Heights
                  </h3>
                  <p className="text-sm text-[#01472e]/60 flex items-center gap-1.5 mt-2 font-medium">
                    <MapPin className="w-4 h-4" /> Brooklyn, New York
                  </p>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <AnimatedNumber value={87} className="text-6xl sm:text-7xl font-display text-[#01472e] leading-none" />
                  <span className="text-lg font-bold text-[#01472e]/50">/100</span>
                </div>
              </div>

              {/* Grid of Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Safety", value: 85, icon: ShieldCheck },
                  { label: "Schools", value: 92, icon: GraduationCap },
                  { label: "Healthcare", value: 89, icon: HeartPulse },
                  { label: "Connectivity", value: 72, icon: Compass },
                  { label: "Transport", value: 79, icon: Map },
                  { label: "Amenities", value: 83, icon: Sparkles },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-3xl bg-[#e9edc9]/40 border border-[#01472e]/5 hover:border-[#01472e]/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[#01472e]">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <AnimatedNumber value={item.value} className="text-xl sm:text-2xl font-display text-[#01472e]" />
                    </div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]/60">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Insight Paragraph */}
              <div className="p-8 rounded-[2rem] bg-[#e9edc9] border border-[#01472e]/10">
                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#01472e] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Narrative Assessment
                </h4>
                <p className="text-sm text-[#01472e]/90 leading-relaxed font-sans font-medium">
                  Brooklyn Heights registers a premium residential score driven by historic architectural integrity, massive tree cover, and highly structured school networks. The safety index performs strongly, and transit access points are dense, though real estate prices remain a clear barrier to access.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* BOTTOM CTA: Sage Panel */}
        <motion.div
          className="bg-[#ccd5ae] rounded-[5rem] p-12 sm:p-20 text-center relative overflow-hidden border border-[#01472e]/10 shadow-lg"
          variants={fadeInUp}
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-display uppercase text-[#01472e] mb-6">
              Locate your perfect neighborhood
            </h2>
            <p className="text-base text-[#01472e]/85 max-w-sm mx-auto mb-10 font-sans">
              Discover and compare locations based on structural urban metrics in under two minutes.
            </p>
            <Button
              onClick={() => router.push("/app")}
              variant="default"
              size="lg"
              className="shadow-md bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90"
            >
              Start Search <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
