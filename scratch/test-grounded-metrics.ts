import { SearchService } from "../src/services/search";
import { AIService } from "../src/services/ai";

async function runTest() {
  console.log("=== TESTING PHASE 3: DATA GROUNDING & HARD METRICS ===");
  const searchService = new SearchService();
  const aiService = new AIService();

  const query = "Koramangala Bangalore";
  console.log(`\nGathering multi-source context for: "${query}"...`);
  const context = await searchService.gatherContext(query);

  console.log("\n--- CONTEXT RETRIEVED ---");
  console.log(`Coordinates: Lat ${context.latitude}, Lon ${context.longitude}`);
  console.log(`Resolved Name: ${context.displayName}`);
  console.log(`City: ${context.city}, State: ${context.state}, Country: ${context.country}`);
  console.log(`Textual Items Found: ${context.items.length}`);

  if (context.airQuality) {
    console.log("\n--- LIVE AIR QUALITY (OPEN-METEO) ---");
    console.log(`AQI: ${context.airQuality.aqi} (${context.airQuality.category})`);
    console.log(`PM2.5: ${context.airQuality.pm25} µg/m³ | PM10: ${context.airQuality.pm10} µg/m³`);
    console.log(`Advisory: ${context.airQuality.advisory}`);
  } else {
    console.log("Air quality was not returned.");
  }

  if (context.poiCensus) {
    console.log("\n--- LIVE POI CENSUS (OPENSTREETMAP OVERPASS) ---");
    console.log(`Total Amenities in 2km: ${context.poiCensus.totalAmenities}`);
    console.log(`- Healthcare: ${context.poiCensus.healthcareCount}`);
    console.log(`- Education: ${context.poiCensus.educationCount}`);
    console.log(`- Transit Hubs: ${context.poiCensus.transitCount}`);
    console.log(`- Parks & Green: ${context.poiCensus.parksCount}`);
    console.log(`- Retail Markets: ${context.poiCensus.marketsCount}`);
    console.log(`- Dining/Cafes: ${context.poiCensus.diningCount}`);
  } else {
    console.log("POI Census was not returned.");
  }

  if (context.geoPoints && context.geoPoints.length > 0) {
    console.log(`\nPlotted Geopoints (${context.geoPoints.length} total):`);
    context.geoPoints.slice(0, 5).forEach((pt, i) => {
      console.log(`  ${i + 1}. [${pt.category.toUpperCase()}] ${pt.name} - ${pt.distanceMeters}m away`);
    });
  }

  console.log("\nSynthesizing AI Locality Report...");
  const report = await aiService.generateLocalityReport(query, context);

  console.log("\n--- FINAL SYNTHESIZED REPORT ---");
  console.log(`Locality: ${report.localityName} (${report.city}, ${report.state})`);
  console.log(`Overall Livability Score: ${report.overallScore}/100`);
  console.log(`Scores breakdown:`, report.categoryScores);
  console.log(`Report includes Air Quality:`, !!report.airQuality);
  console.log(`Report includes POI Census:`, !!report.poiCensus);
  console.log(`Report includes GeoPoints:`, report.geoPoints?.length || 0);

  console.log("\n[SUCCESS] Grounding Engine Test Complete!");
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
