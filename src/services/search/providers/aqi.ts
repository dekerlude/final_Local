/**
 * Open-Meteo Air Quality Provider
 * Fetches real-time environmental data (AQI, PM2.5, PM10, NO2, O3) for any global coordinates.
 * Free, public, zero-API-key environmental telemetry.
 */

import { SearchProvider, SearchProviderResult } from "../types";
import { LocalityAirQuality } from "@/types/locality";

export class AirQualityProvider implements SearchProvider {
  name = "open-meteo-aqi";

  isEnabled(): boolean {
    return true;
  }

  async search(): Promise<SearchProviderResult> {
    // When called via the standard search interface without coordinates, returns empty
    return {
      providerName: this.name,
      success: true,
      items: [],
    };
  }

  /**
   * Fetch real-time air quality metrics for exact coordinates
   */
  async fetchAirQuality(lat: number, lon: number): Promise<LocalityAirQuality | null> {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "LocalLens-Intelligence/2.0",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const current = data.current;
      if (!current) return null;

      const aqi = typeof current.european_aqi === "number" ? current.european_aqi : 35;
      const usAqi = typeof current.us_aqi === "number" ? current.us_aqi : undefined;
      const pm25 = typeof current.pm2_5 === "number" ? Math.round(current.pm2_5 * 10) / 10 : 15;
      const pm10 = typeof current.pm10 === "number" ? Math.round(current.pm10 * 10) / 10 : 25;
      const no2 = typeof current.nitrogen_dioxide === "number" ? Math.round(current.nitrogen_dioxide * 10) / 10 : undefined;
      const o3 = typeof current.ozone === "number" ? Math.round(current.ozone * 10) / 10 : undefined;

      // Determine category based on US AQI or PM2.5 standard
      let category: LocalityAirQuality["category"] = "Good";
      let advisory = "Air quality is satisfactory and poses little or no health risk.";

      const effectiveAqi = usAqi !== undefined ? usAqi : aqi * 1.5;

      if (effectiveAqi <= 50) {
        category = "Good";
        advisory = "Clean and fresh air. Ideal conditions for outdoor workouts and family recreation.";
      } else if (effectiveAqi <= 100) {
        category = "Moderate";
        advisory = "Air quality is acceptable. Sensitive individuals should consider reducing prolonged heavy outdoor exertion.";
      } else if (effectiveAqi <= 150) {
        category = "Unhealthy for Sensitive Groups";
        advisory = "Children, elderly, and individuals with respiratory conditions should limit extended outdoor exposure.";
      } else if (effectiveAqi <= 200) {
        category = "Unhealthy";
        advisory = "Increased likelihood of adverse effects. Consider wearing masks and using indoor air filtration.";
      } else if (effectiveAqi <= 300) {
        category = "Very Unhealthy";
        advisory = "Health alert: Significant health risks for the general population. Avoid non-essential outdoor activities.";
      } else {
        category = "Hazardous";
        advisory = "Emergency health warnings. Entire population is more likely to be affected. Keep windows closed.";
      }

      return {
        aqi: Math.round(aqi),
        usAqi: usAqi ? Math.round(usAqi) : undefined,
        category,
        pm25,
        pm10,
        no2,
        o3,
        advisory,
        source: "Open-Meteo Global Environmental Sensor Network",
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("[AirQualityProvider] Failed to fetch air quality:", err);
      return null;
    }
  }
}
