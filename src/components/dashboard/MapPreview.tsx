"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Compass } from "lucide-react";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  neighborhoodName: string;
  onViewFullMap: () => void;
}

export function MapPreview({
  latitude,
  longitude,
  neighborhoodName,
  onViewFullMap,
}: MapPreviewProps) {
  // OpenStreetMap static tile bounding approximation
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.012}%2C${latitude - 0.012}%2C${longitude + 0.012}%2C${latitude + 0.012}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#01472e] flex items-center justify-center text-[#fefae0] shadow-sm">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-display uppercase text-[#01472e]">
            Location Cartography
          </h2>
          <p className="text-sm font-sans text-[#01472e]/70">
            OpenStreetMap spatial boundary and coordinate grid
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] bg-[#fefae0] border border-[#01472e]/15 shadow-sm p-2">
        <div className="relative rounded-[2rem] overflow-hidden h-72 bg-[#e9edc9]/40 flex items-center justify-center">
          <iframe
            title={`Cartography map for ${neighborhoodName}`}
            src={osmEmbedUrl}
            className="w-full h-full border-0 pointer-events-none opacity-80 contrast-105"
            loading="lazy"
          />

          {/* Locality badge overlay */}
          <div className="absolute top-4 left-4 bg-[#fefae0]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#01472e]/20 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#01472e] animate-ping" />
            <span className="text-xs font-bold text-[#01472e] uppercase tracking-wide">
              {neighborhoodName}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#01472e]/80 font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#01472e]" />
            <span>
              LAT: <strong className="text-[#01472e]">{latitude.toFixed(4)}°N</strong> &nbsp;|&nbsp; LON: <strong className="text-[#01472e]">{longitude.toFixed(4)}°E</strong>
            </span>
          </div>

          <Button
            onClick={onViewFullMap}
            className="w-full sm:w-auto bg-[#01472e] text-[#fefae0] hover:bg-[#01472e]/90 rounded-full font-bold px-6 shadow-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore Full Interactive Map
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

export default MapPreview;
