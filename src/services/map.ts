/**
 * Map Service for LocalLens
 * Modular wrapper around MapLibre GL JS with OpenStreetMap raster tiles,
 * custom SVG markers for locality centers & categorized amenities, and camera animations.
 */

import {
  Map as MapLibreInstance,
  Marker,
  Popup,
  LngLatBounds,
  NavigationControl,
  AttributionControl,
  StyleSpecification,
} from "maplibre-gl";
import { NeighborhoodBasic } from "@/types/api";
import { LocalityGeoPoint } from "@/types/locality";

// OpenStreetMap Raster Tile Style Definition
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-raster-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Category Color & Icon Mapping for POIs
export const CATEGORY_CONFIG: Record<
  LocalityGeoPoint["category"],
  { color: string; bg: string; label: string; iconSvg: string }
> = {
  healthcare: {
    color: "#dc2626",
    bg: "#fee2e2",
    label: "Healthcare",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  },
  education: {
    color: "#2563eb",
    bg: "#dbeafe",
    label: "Education",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
  },
  transit: {
    color: "#ea580c",
    bg: "#ffedd5",
    label: "Transit",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
  },
  park: {
    color: "#16a34a",
    bg: "#dcfce7",
    label: "Parks & Greenery",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2a1 1 0 0 1-.8-1.7L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17z"/><path d="M12 22v-3"/></svg>`,
  },
  market: {
    color: "#9333ea",
    bg: "#f3e8ff",
    label: "Markets & Retail",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  dining: {
    color: "#ca8a04",
    bg: "#fef9c3",
    label: "Dining & Cafes",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M18 8v14"/><path d="M6 2v20"/><path d="M6 7h4a2 2 0 0 0 2-2V2H6z"/></svg>`,
  },
};

export class MapService {
  private map: MapLibreInstance | null = null;
  private markers: Marker[] = [];

  /**
   * Initialize MapLibre GL on a target container element
   */
  initializeMap(
    container: HTMLElement | string,
    initialCenter: [number, number],
    initialZoom = 13,
    interactive = true
  ): MapLibreInstance {
    this.cleanup();

    const mapInstance = new MapLibreInstance({
      container,
      style: OSM_RASTER_STYLE,
      center: initialCenter, // [lng, lat]
      zoom: initialZoom,
      interactive,
      attributionControl: false,
    });

    this.map = mapInstance;

    if (interactive) {
      // Add standard controls
      mapInstance.addControl(
        new NavigationControl({ showCompass: true, showZoom: true }),
        "top-right"
      );
      mapInstance.addControl(
        new AttributionControl({
          compact: true,
          customAttribution: "OpenStreetMap contributors",
        }),
        "bottom-right"
      );
    }

    return mapInstance;
  }

  /**
   * Get current map instance
   */
  getMap(): MapLibreInstance | null {
    return this.map;
  }

  /**
   * Render central locality marker
   */
  addLocalityCenterMarker(
    location: NeighborhoodBasic,
    onNavigate?: (_id: string | number) => void
  ): Marker | null {
    if (!this.map) return null;

    const el = document.createElement("div");
    el.className = "locallens-center-marker cursor-pointer group";
    el.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="width: 44px; height: 44px; background-color: #01472e; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #fefae0; box-shadow: 0 12px 24px -4px rgba(1, 71, 46, 0.45); border: 3px solid #fefae0; transition: transform 0.2s ease;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        </div>
        <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid #01472e;"></div>
      </div>
    `;

    if (onNavigate) {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onNavigate(location.id);
      });
    }

    const popupHtml = `
      <div style="padding: 4px; font-family: inherit; min-width: 200px; text-align: left;">
        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background-color: #01472e; color: #fefae0; margin-bottom: 6px;">
          LOCALITY CENTER
        </span>
        <h4 style="font-size: 15px; font-weight: 700; color: #01472e; margin: 0 0 4px 0; line-height: 1.2;">
          ${location.name}
        </h4>
        <p style="font-size: 12px; color: rgba(1, 71, 46, 0.75); margin: 0 0 8px 0; display: flex; align-items: center; gap: 4px;">
          📍 ${location.city}, ${location.state}
        </p>
        <p style="font-size: 10px; font-family: monospace; color: rgba(1, 71, 46, 0.5); margin: 0 0 10px 0; border-bottom: 1px solid rgba(1, 71, 46, 0.1); padding-bottom: 6px;">
          LAT ${location.latitude.toFixed(4)}N / LON ${location.longitude.toFixed(4)}E
        </p>
      </div>
    `;

    const popup = new Popup({
      offset: [0, -32],
      className: "locallens-map-popup",
      closeButton: true,
    }).setHTML(popupHtml);

    const marker = new Marker({ element: el, anchor: "bottom" })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(this.map);

    this.markers.push(marker);
    return marker;
  }

  /**
   * Render categorized amenity POI markers
   */
  addPOIMarkers(geoPoints: LocalityGeoPoint[]): void {
    if (!this.map) return;

    for (const pt of geoPoints) {
      const conf = CATEGORY_CONFIG[pt.category] || CATEGORY_CONFIG.market;
      const walkMins = Math.max(1, Math.round(pt.distanceMeters / 80));

      const el = document.createElement("div");
      el.className = "locallens-poi-marker cursor-pointer";
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 32px; height: 32px; background-color: ${conf.color}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
            ${conf.iconSvg}
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${conf.color};"></div>
        </div>
      `;

      const popupHtml = `
        <div style="padding: 4px; font-family: inherit; min-width: 190px; text-align: left;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: ${conf.bg}; color: ${conf.color}; margin-bottom: 6px;">
            ${conf.label}
          </span>
          <h4 style="font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 4px 0; line-height: 1.2;">
            ${pt.name}
          </h4>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #4b5563; font-weight: 500; margin: 6px 0;">
            <span>${pt.distanceMeters}m away</span>
            <span>•</span>
            <span style="color: #6b7280;">~${walkMins} min walk</span>
          </div>
          ${
            pt.address
              ? `<p style="font-size: 10px; color: #6b7280; margin: 4px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 4px;">${pt.address}</p>`
              : ""
          }
        </div>
      `;

      const popup = new Popup({
        offset: [0, -26],
        className: "locallens-map-popup",
        closeButton: true,
      }).setHTML(popupHtml);

      const marker = new Marker({ element: el, anchor: "bottom" })
        .setLngLat([pt.longitude, pt.latitude])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push(marker);
    }
  }

  /**
   * Fit map viewport to encompass coordinates
   */
  fitBounds(coords: [number, number][], padding = 50, maxZoom = 15): void {
    if (!this.map || coords.length === 0) return;

    if (coords.length === 1) {
      this.map.flyTo({
        center: coords[0], // [lng, lat]
        zoom: 14,
        speed: 1.2,
        curve: 1.4,
      });
      return;
    }

    const bounds = new LngLatBounds(coords[0], coords[0]);
    for (const c of coords) {
      bounds.extend(c);
    }

    this.map.fitBounds(bounds, {
      padding: { top: padding, bottom: padding, left: padding, right: padding },
      maxZoom,
      duration: 1000,
    });
  }

  /**
   * Smooth camera flyTo animation
   */
  flyTo(center: [number, number], zoom = 14): void {
    if (!this.map) return;
    this.map.flyTo({
      center, // [lng, lat]
      zoom,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }

  /**
   * Clear all active markers
   */
  clearMarkers(): void {
    for (const marker of this.markers) {
      marker.remove();
    }
    this.markers = [];
  }

  /**
   * Teardown MapLibre instance and cleanup resources
   */
  cleanup(): void {
    this.clearMarkers();
    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {
        // Ignore container already removed errors
      }
      this.map = null;
    }
  }
}

export const mapService = new MapService();
export default mapService;
