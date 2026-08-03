import { SearchProvider, SearchProviderResult, SearchContextItem } from "../types";
import { LocalityPOICensus, LocalityGeoPoint } from "@/types/locality";

/**
 * Calculates geodesic distance in meters between two lat/lon coordinates using Haversine formula
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

export class OverpassProvider implements SearchProvider {
  name = "openstreetmap-overpass";

  private endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];

  isEnabled(): boolean {
    return true;
  }

  async search(): Promise<SearchProviderResult> {
    return {
      providerName: this.name,
      success: true,
      items: [],
    };
  }

  /**
   * Fetch live POI census and geotagged points for coordinates concurrently across mirrors
   */
  async fetchPOICensus(
    centerLat: number,
    centerLon: number,
    radiusMeters = 2000
  ): Promise<{ census: LocalityPOICensus; geoPoints: LocalityGeoPoint[]; items: SearchContextItem[] } | null> {
    const qlQuery = `[out:json][timeout:8];(node["amenity"~"hospital|clinic|pharmacy|doctors|school|college|university|restaurant|cafe|fast_food"](around:${radiusMeters},${centerLat},${centerLon});node["highway"="bus_stop"](around:${radiusMeters},${centerLat},${centerLon});node["railway"~"station|subway_entrance|tram_stop"](around:${radiusMeters},${centerLat},${centerLon});node["leisure"~"park|garden|pitch|playground"](around:${radiusMeters},${centerLat},${centerLon});node["shop"~"supermarket|convenience|mall|department_store"](around:${radiusMeters},${centerLat},${centerLon}););out body 120;`;

    const fetchSingleEndpoint = async (endpoint: string): Promise<OverpassElement[]> => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "LocalLens/2.0 (Civic Intelligence)",
        },
        body: `data=${encodeURIComponent(qlQuery)}`,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const elements: OverpassElement[] = json.elements || [];
      if (elements.length === 0) {
        throw new Error("No elements in response");
      }
      return elements;
    };

    try {
      const elements = await Promise.any(this.endpoints.map(fetchSingleEndpoint));

      const geoPoints: LocalityGeoPoint[] = [];
      const seenNames = new Set<string>();

      let healthcareCount = 0;
      let educationCount = 0;
      let transitCount = 0;
      let parksCount = 0;
      let marketsCount = 0;
      let diningCount = 0;

      const hospitalsList: { name: string; dist: number }[] = [];
      const schoolsList: { name: string; dist: number }[] = [];
      const transitList: { name: string; dist: number }[] = [];
      const parksList: { name: string; dist: number }[] = [];
      const marketsList: { name: string; dist: number }[] = [];
      const diningList: { name: string; dist: number }[] = [];

      for (const el of elements) {
        const lat = el.lat;
        const lon = el.lon;
        if (lat === undefined || lon === undefined) continue;

        const tags = el.tags || {};
        const rawName = tags.name || tags["name:en"] || tags.operator || tags.brand;
        const dist = getDistanceMeters(centerLat, centerLon, lat, lon);

        let category: LocalityGeoPoint["category"] | null = null;

        if (tags.amenity && /hospital|clinic|pharmacy|doctors/i.test(tags.amenity)) {
          category = "healthcare";
          healthcareCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            hospitalsList.push({ name: rawName, dist });
          }
        } else if (tags.amenity && /school|college|university|kindergarten/i.test(tags.amenity)) {
          category = "education";
          educationCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            schoolsList.push({ name: rawName, dist });
          }
        } else if (
          tags.highway === "bus_stop" ||
          (tags.railway && /station|subway_entrance|tram_stop/i.test(tags.railway))
        ) {
          category = "transit";
          transitCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            transitList.push({ name: rawName, dist });
          }
        } else if (tags.leisure && /park|garden|pitch|playground/i.test(tags.leisure)) {
          category = "park";
          parksCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            parksList.push({ name: rawName, dist });
          }
        } else if (tags.shop && /supermarket|convenience|mall|department_store/i.test(tags.shop)) {
          category = "market";
          marketsCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            marketsList.push({ name: rawName, dist });
          }
        } else if (tags.amenity && /restaurant|cafe|fast_food/i.test(tags.amenity)) {
          category = "dining";
          diningCount++;
          if (rawName && !seenNames.has(rawName)) {
            seenNames.add(rawName);
            diningList.push({ name: rawName, dist });
          }
        }

        if (category && rawName) {
          geoPoints.push({
            id: `${el.type}-${el.id}`,
            name: rawName,
            category,
            latitude: lat,
            longitude: lon,
            distanceMeters: dist,
            address: tags["addr:street"] || tags["addr:full"] || undefined,
          });
        }
      }

      // Sort geoPoints by proximity to center
      geoPoints.sort((a, b) => a.distanceMeters - b.distanceMeters);

      const totalAmenities =
        healthcareCount +
        educationCount +
        transitCount +
        parksCount +
        marketsCount +
        diningCount;

      const extractNames = (list: { name: string; dist: number }[], limit = 6) =>
        list
          .sort((a, b) => a.dist - b.dist)
          .slice(0, limit)
          .map((item) => item.name);

      const census: LocalityPOICensus = {
        healthcareCount,
        educationCount,
        transitCount,
        parksCount,
        marketsCount,
        diningCount,
        totalAmenities,
        radiusKm: Math.round(radiusMeters / 1000),
        topHospitals: extractNames(hospitalsList),
        topSchools: extractNames(schoolsList),
        topTransitStops: extractNames(transitList),
        topParks: extractNames(parksList),
        topMarkets: extractNames(marketsList),
        topRestaurants: extractNames(diningList),
      };

      const sortAndFormat = (list: { name: string; dist: number }[], limit = 4) =>
        list
          .sort((a, b) => a.dist - b.dist)
          .slice(0, limit)
          .map((item) => `${item.name} (${item.dist}m)`)
          .join(", ");

      const items: SearchContextItem[] = [
        {
          title: `OpenStreetMap POI Census (${totalAmenities} verified amenities within ${Math.round(
            radiusMeters / 1000
          )}km)`,
          snippet: `Empirical infrastructure census: ${healthcareCount} healthcare facilities (${sortAndFormat(
            hospitalsList
          )}), ${educationCount} educational institutes (${sortAndFormat(
            schoolsList
          )}), ${transitCount} transit stops (${sortAndFormat(
            transitList
          )}), ${parksCount} parks/gardens (${sortAndFormat(
            parksList
          )}), ${marketsCount} retail supermarkets (${sortAndFormat(
            marketsList
          )}), ${diningCount} dining spots (${sortAndFormat(diningList)}).`,
          source: "OpenStreetMap (Overpass API)",
        },
      ];

      return {
        census,
        geoPoints: geoPoints.slice(0, 40), // Top 40 closest points
        items,
      };
    } catch (err) {
      console.warn("[OverpassProvider] All endpoints failed:", err);
      return null;
    }
  }
}
