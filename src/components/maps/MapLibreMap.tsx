"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { NeighborhoodBasic } from "@/types/api";
import { LocalityGeoPoint } from "@/types/locality";
import { MapService } from "@/services/map";
import {
  HeartPulse,
  GraduationCap,
  Bus,
  TreePine,
  ShoppingBag,
  Utensils,
  Layers,
  RotateCcw,
} from "lucide-react";

interface MapLibreMapProps {
  neighborhoods?: NeighborhoodBasic[];
  selectedNeighborhood?: NeighborhoodBasic | null;
  onSelectNeighborhood?: (_neighborhood: NeighborhoodBasic) => void;
  geoPoints?: LocalityGeoPoint[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  className?: string;
  showFilters?: boolean;
}

type FilterCategory = "all" | "healthcare" | "education" | "transit" | "park" | "market" | "dining";

export default function MapLibreMap({
  neighborhoods = [],
  selectedNeighborhood = null,
  onSelectNeighborhood,
  geoPoints = [],
  center,
  zoom = 13,
  interactive = true,
  className = "w-full h-full min-h-[420px]",
  showFilters = true,
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapServiceRef = useRef<MapService | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute primary center coordinate
  const mapCenter: [number, number] = useMemo(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      return center; // [lng, lat]
    }
    if (selectedNeighborhood) {
      return [selectedNeighborhood.longitude, selectedNeighborhood.latitude];
    }
    if (neighborhoods.length > 0) {
      return [neighborhoods[0].longitude, neighborhoods[0].latitude];
    }
    return [77.5946, 12.9716]; // Default Bangalore center [lng, lat]
  }, [center, selectedNeighborhood, neighborhoods]);

  // Filter geo points based on selected category
  const filteredGeoPoints = useMemo(() => {
    if (activeCategory === "all") return geoPoints;
    return geoPoints.filter((pt) => pt.category === activeCategory);
  }, [geoPoints, activeCategory]);

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: geoPoints.length,
      healthcare: 0,
      education: 0,
      transit: 0,
      park: 0,
      market: 0,
      dining: 0,
    };
    for (const pt of geoPoints) {
      if (counts[pt.category as FilterCategory] !== undefined) {
        counts[pt.category as FilterCategory]++;
      }
    }
    return counts;
  }, [geoPoints]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const mapService = new MapService();
    mapServiceRef.current = mapService;

    const mapInstance = mapService.initializeMap(
      containerRef.current,
      mapCenter,
      zoom,
      interactive
    );

    mapInstance.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      mapService.cleanup();
      mapServiceRef.current = null;
    };
  }, [mapCenter, zoom, interactive]);

  // Update Markers when data or category filter changes
  useEffect(() => {
    const service = mapServiceRef.current;
    if (!service || !isLoaded) return;

    service.clearMarkers();

    const allCoords: [number, number][] = [];

    // Add Central Locality Marker
    if (selectedNeighborhood) {
      service.addLocalityCenterMarker(selectedNeighborhood, (id) => {
        const found = neighborhoods.find((n) => n.id === id);
        if (found && onSelectNeighborhood) onSelectNeighborhood(found);
      });
      allCoords.push([selectedNeighborhood.longitude, selectedNeighborhood.latitude]);
    } else if (neighborhoods.length > 0) {
      for (const n of neighborhoods) {
        service.addLocalityCenterMarker(n, (id) => {
          const found = neighborhoods.find((nb) => nb.id === id);
          if (found && onSelectNeighborhood) onSelectNeighborhood(found);
        });
        allCoords.push([n.longitude, n.latitude]);
      }
    }

    // Add POI Amenity Markers
    if (filteredGeoPoints.length > 0) {
      service.addPOIMarkers(filteredGeoPoints);
      for (const pt of filteredGeoPoints) {
        allCoords.push([pt.longitude, pt.latitude]);
      }
    }

    // Adjust bounds if coordinates present
    if (allCoords.length > 0) {
      service.fitBounds(allCoords, 60, 15);
    }
  }, [isLoaded, selectedNeighborhood, neighborhoods, filteredGeoPoints, onSelectNeighborhood]);

  const handleRecenter = () => {
    if (mapServiceRef.current) {
      mapServiceRef.current.flyTo(mapCenter, zoom);
    }
  };

  const categories: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Pins", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "healthcare", label: "Healthcare", icon: <HeartPulse className="w-3.5 h-3.5 text-red-500" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> },
    { id: "transit", label: "Transit", icon: <Bus className="w-3.5 h-3.5 text-amber-500" /> },
    { id: "park", label: "Parks", icon: <TreePine className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: "market", label: "Markets", icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-500" /> },
    { id: "dining", label: "Dining", icon: <Utensils className="w-3.5 h-3.5 text-yellow-600" /> },
  ];

  return (
    <div className={`relative rounded-[2rem] overflow-hidden bg-[#e9edc9]/20 border border-[#01472e]/15 ${className}`}>
      {/* Category Filter Chips Overlay */}
      {showFilters && geoPoints.length > 0 && (
        <div className="absolute top-4 left-4 right-14 z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 bg-[#fefae0]/90 backdrop-blur-md rounded-2xl border border-[#01472e]/15 shadow-sm">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id];
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-[#01472e] text-[#fefae0] shadow-sm"
                    : "text-[#01472e]/80 hover:bg-[#e9edc9] hover:text-[#01472e]"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-[#e9edc9] text-[#01472e]" : "bg-[#01472e]/10 text-[#01472e]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Map Recenter Control */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fefae0]/90 hover:bg-[#fefae0] text-[#01472e] text-xs font-bold shadow-md border border-[#01472e]/15 backdrop-blur-md transition-all hover:scale-105"
          title="Reset Map View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Locality Center</span>
        </button>
      </div>

      {/* MapLibre DOM Container */}
      <div ref={containerRef} className="w-full h-full min-h-[420px]" />

      {/* Custom Global Popup Styling */}
      <style jsx global>{`
        .maplibregl-popup-content {
          padding: 12px 14px;
          border-radius: 18px;
          background: #fefae0;
          border: 1px solid rgba(1, 71, 46, 0.2);
          box-shadow: 0 12px 28px -6px rgba(1, 71, 46, 0.25);
          font-family: inherit;
        }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip {
          border-bottom-color: #fefae0;
        }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
          border-top-color: #fefae0;
        }
        .maplibregl-popup-anchor-left .maplibregl-popup-tip {
          border-right-color: #fefae0;
        }
        .maplibregl-popup-anchor-right .maplibregl-popup-tip {
          border-left-color: #fefae0;
        }
        .maplibregl-popup-close-button {
          font-size: 16px;
          padding: 4px 8px;
          color: #01472e;
          font-weight: bold;
        }
        .locallens-center-marker:hover > div > div:first-child {
          transform: scale(1.1);
        }
        .locallens-poi-marker:hover > div > div:first-child {
          transform: scale(1.15);
        }
        /* Hide scrollbars for chips */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
