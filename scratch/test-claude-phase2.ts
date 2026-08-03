import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import { localityService } from "../src/services/locality";
import { claudeService } from "../src/services/claude";

async function testLocality(query: string) {
  console.log(`\n========================================`);
  console.log(`Testing Locality: "${query}"`);
  console.log(`========================================`);
  const start = Date.now();
  const report = await localityService.analyzeLocality(query);
  const duration = Date.now() - start;

  console.log(`[SUCCESS] Generated in ${duration}ms`);
  console.log(`Locality: ${report.localityName}, ${report.city}, ${report.state}`);
  console.log(`Overall Livability Score: ${report.overallScore}/100`);
  console.log(`Population: ${report.population}`);
  console.log(`Scores:`, report.categoryScores);
  console.log(`Highlights (${report.highlights.length}):`, report.highlights.slice(0, 3));
  console.log(`Healthcare (${report.healthcare.length}):`, report.healthcare.slice(0, 3));
  console.log(`Education (${report.education.length}):`, report.education.slice(0, 3));
  console.log(`Markets (${report.markets.length}):`, report.markets.slice(0, 3));
  console.log(`Restaurants (${report.restaurants.length}):`, report.restaurants.slice(0, 3));
  console.log(`Parks (${report.parks.length}):`, report.parks.slice(0, 3));
  console.log(`Tourist Places (${report.touristPlaces.length}):`, report.touristPlaces.slice(0, 3));
  console.log(`Overview: ${report.overview.substring(0, 140)}...`);
  console.log(`Connectivity: ${report.connectivity.substring(0, 140)}...`);
  console.log(`Safety: ${report.safety.substring(0, 140)}...`);
  console.log(`Pros:`, report.pros.slice(0, 2));
  console.log(`Cons:`, report.cons.slice(0, 2));
  console.log(`News Items: ${report.latestNewsNormalized.length} items`);
  console.log(`AQI:`, report.airQuality ? `${report.airQuality.aqi} (${report.airQuality.category})` : "N/A");
  console.log(`POI Census Total: ${report.poiCensus?.totalAmenities ?? 0}`);

  // Test personalized explanation
  const explanation = await claudeService.generatePersonalizedExplanation(
    report.localityName,
    report.overallScore,
    ["Safety", "Transit", "Healthcare"],
    {
      Safety: report.categoryScores.safety,
      Transit: report.categoryScores.connectivity,
      Healthcare: report.categoryScores.healthcare,
    },
    ["Safety", "Transit"],
    ["Environment"]
  );
  console.log(`\nPersonalized Explanation Preview:\n${explanation.substring(0, 250)}...\n`);
}

async function run() {
  const localities = [
    "Sector 17 Chandigarh",
    "Koramangala Bangalore",
    "Connaught Place Delhi",
  ];

  for (const loc of localities) {
    try {
      await testLocality(loc);
    } catch (err) {
      console.error(`[FAILED] Error testing "${loc}":`, err);
    }
  }
}

run();
