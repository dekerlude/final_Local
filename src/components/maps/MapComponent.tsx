"use client";

import dynamic from "next/dynamic";
import { NeighborhoodBasic } from "@/types/api";
import { LocalityGeoPoint } from "@/types/locality";

const MapLibreMap = dynamic(() => import("./MapLibreMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-[2.5rem] bg-[#fefae0] border border-[#01472e]/10 animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#01472e] border-t-transparent animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#01472e]/70">
        Loading MapLibre Engine...
      </span>
    </div>
  ),
});

export interface MapComponentProps {
  locations?: NeighborhoodBasic[];
  selectedLocation?: NeighborhoodBasic | null;
  onSelectLocation?: (_location: NeighborhoodBasic) => void;
  geoPoints?: LocalityGeoPoint[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  className?: string;
  showFilters?: boolean;
}

export function MapComponent({
  locations = [],
  selectedLocation = null,
  onSelectLocation,
  geoPoints = [],
  center,
  zoom = 13,
  interactive = true,
  className = "w-full h-full min-h-[420px]",
  showFilters = true,
}: MapComponentProps) {
  return (
    <MapLibreMap
      neighborhoods={locations}
      selectedNeighborhood={selectedLocation || (locations.length === 1 ? locations[0] : null)}
      onSelectNeighborhood={onSelectLocation}
      geoPoints={geoPoints}
      center={center}
      zoom={zoom}
      interactive={interactive}
      className={className}
      showFilters={showFilters}
    />
  );
}

export default MapComponent;
