"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdvertisementCarousel() {
  const [posters, setPosters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosters() {
      try {
        const res = await fetch("/api/posters");
        const data = await res.json();
        if (data.success && data.posters && data.posters.length > 0) {
          setPosters(data.posters);
        }
      } catch (err) {
        console.error("Failed to load posters", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosters();
  }, []);

  // Auto rotation
  useEffect(() => {
    if (posters.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [posters.length, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  };

  if (isLoading || posters.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-16 px-0 sm:px-0">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6 px-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#01472e]/60 block mb-1">
            Featured Businesses
          </span>
          <h2 className="text-2xl sm:text-3xl font-display uppercase text-[#01472e]">
            Local Highlights
          </h2>
        </div>
      </div>
      
      <div 
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-[#01472e]/10 bg-[#01472e]/5 backdrop-blur-md group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Blur Effect */}
        <AnimatePresence initial={false}>
          <motion.img
            key={`bg-${currentIndex}`}
            src={posters[currentIndex]}
            alt="Advertisement Background"
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 transform scale-125"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {/* Foreground Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`fg-${currentIndex}`}
            src={posters[currentIndex]}
            alt={`Featured Advertisement ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            loading="lazy"
          />
        </AnimatePresence>

        {/* Controls */}
        {posters.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#01472e] shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 hover:scale-110 active:scale-95"
              aria-label="Previous advertisement"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-[#01472e] shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 hover:scale-110 active:scale-95"
              aria-label="Next advertisement"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
              {posters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? "bg-[#01472e] w-6" 
                      : "bg-[#01472e]/40 hover:bg-[#01472e]/60"
                  }`}
                  aria-label={`Go to advertisement ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
