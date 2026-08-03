"use client";

import React from "react";
import { MapComponent } from "./MapComponent";
import { NeighborhoodBasic } from "@/types/api";
import { LocalityGeoPoint } from "@/types/locality";

interface SingleNeighborhoodMapProps {
  neighborhood: {
    id: number | string;
    name: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    map_details?: {
      embed_url?: string;
    };
  };
  geoPoints?: LocalityGeoPoint[];
  className?: string;
  heightClassName?: string;
}

export function SingleNeighborhoodMap({
  neighborhood,
  geoPoints = [],
  className = "",
  heightClassName = "h-[500px]",
}: SingleNeighborhoodMapProps) {
  const basicLocation: NeighborhoodBasic = {
    id: neighborhood.id,
    name: neighborhood.name,
    city: neighborhood.city,
    state: neighborhood.state,
    latitude: neighborhood.latitude,
    longitude: neighborhood.longitude,
  };

  return (
    <div className={`w-full ${heightClassName} ${className} z-0 relative`}>
      <MapComponent
        locations={[basicLocation]}
        selectedLocation={basicLocation}
        geoPoints={geoPoints}
        center={[neighborhood.longitude, neighborhood.latitude]}
        className="w-full h-full"
      />
    </div>
  );
}

export default SingleNeighborhoodMap;
