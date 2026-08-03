# LocalLens Nationwide Expansion: Architectural Design

**Date**: 2026-07-30  
**Status**: PROPOSED FOR REVIEW  
**Scope**: Transform from Chandigarh-only to nationwide India support

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Current vs Proposed](#current-vs-proposed)
3. [Core Design Principles](#core-design-principles)
4. [Data Layer Architecture](#data-layer-architecture)
5. [Provider System](#provider-system)
6. [Search Architecture](#search-architecture)
7. [Scoring Architecture](#scoring-architecture)
8. [Caching Strategy](#caching-strategy)
9. [Database Schema](#database-schema)
10. [API Changes](#api-changes)
11. [Implementation Phases](#implementation-phases)
12. [Backward Compatibility](#backward-compatibility)

---

## Architecture Overview

### Vision
Transform LocalLens into a **scalable neighborhood intelligence platform** that:
- Supports searching ANY location in India (cities, neighborhoods, sectors, PIN codes)
- Uses real, authoritative data from multiple providers
- Maintains deterministic, explainable scoring
- Preserves the existing frontend experience completely
- Allows adding new data providers without changing business logic

### Design Constraints
1. **Don't break existing APIs** - All current endpoints remain compatible
2. **Frontend-agnostic** - No frontend changes required
3. **Data-driven scoring** - All scores based on real data, not fake/deterministic
4. **Provider-agnostic** - Easy to add/swap data sources
5. **Deterministic results** - Same location + same profile = same score always
6. **Graceful degradation** - Partial data still produces valid scores

---

## Current vs Proposed

### Current State: Single-City, File-Based

```
Frontend → FastAPI → Hardcoded JSON (60 neighborhoods) → Fake Scoring
                      ↓ (optional)
                      OpenStreetMap (fallback only)
```

**Problems:**
- Only 60 pre-defined neighborhoods
- Scores not backed by real data
- No persistence or caching
- Can't add new locations without code changes

### Proposed State: Multi-City, Data-Driven, Provider-Based

```
Frontend → FastAPI → Search Engine → Provider Layer → Data Pipeline
                     ↓                                ↓
                     Normalization → Database ← Cache Layer
                     ↓
                     Scoring Engine (real data)
                     ↓
                     Personalization
                     ↓
                     Gemini Insights
```

**Benefits:**
- Support unlimited locations across India
- Real, authoritative data from multiple sources
- Intelligent caching to minimize API costs
- Add new providers without changing scoring logic
- Deterministic scoring backed by data
- Full audit trail of data sources

---

## Core Design Principles

### 1. Separation of Concerns

**Three Independent Layers:**

```
┌─────────────────────────────────────┐
│  API Layer (routes, schemas)        │  ← Minimal changes
├─────────────────────────────────────┤
│  Business Logic (search, scoring)   │  ← Heavily refactored
├─────────────────────────────────────┤
│  Data Layer (providers, cache, db)  │  ← New architecture
└─────────────────────────────────────┘
```

### 2. Provider Abstraction

**All external data through providers:**
- Each provider implements a standard interface
- Providers are independent/replaceable
- Results normalized into common schema
- Failed provider doesn't break system (fallback to cached/partial data)

### 3. Deterministic Scoring

**Scoring must be reproducible:**
- Same location + same profile = same score (always)
- Scores backed by data snapshots (date-stamped)
- No randomization or Gemini-generated scores
- Gemini only *explains* data, never *generates* scores

### 4. Backward Compatibility

**Existing APIs remain unchanged:**
- `/api/maps/search` accepts same format, returns same format
- `/api/maps/neighborhood/{id}` works with any ID
- `/personalize` unchanged
- `/summary` unchanged
- All tests pass

### 5. Configuration-Driven Behavior

**No hardcoding of cities:**
- City/region selected via query parameter or config
- Data sources configurable
- Cache TTL configurable per provider
- All constants in config files or env vars

---

## Data Layer Architecture

### Three-Tier Data Strategy

```
┌──────────────────────────────────────────────────────┐
│ Tier 1: Cache (Redis/Database)                       │
│ - Fastest reads                                       │
│ - Minimizes external API calls                       │
│ - TTL-based expiration                               │
└──────┬───────────────────────────────────────────────┘
       │
       ├─→ Cache miss, proceed to Tier 2
       │
┌──────▼───────────────────────────────────────────────┐
│ Tier 2: Live Providers (API-based)                   │
│ - Google Places / Geocoding                          │
│ - OpenStreetMap / Nominatim                          │
│ - Weather / AQI APIs                                 │
│ - Government datasets (where available)              │
│ - Results cached in Tier 1                           │
└──────┬───────────────────────────────────────────────┘
       │
       ├─→ Provider fails/partial, proceed to Tier 3
       │
┌──────▼───────────────────────────────────────────────┐
│ Tier 3: Database (pre-indexed, fallback)             │
│ - Historical data indexed by location                │
│ - Periodically synced from Tier 2                    │
│ - Always available (no API failure)                  │
│ - Older but reliable                                 │
└──────────────────────────────────────────────────────┘
```

### Data Freshness Strategy

| Data Type | Source | Cache TTL | Update Frequency |
|-----------|--------|-----------|------------------|
| Location Geocoding | Google/OSM | 30 days | On-demand |
| Crime/Safety | Government Data | 90 days | Monthly |
| Schools | Government Data | 90 days | Annual |
| Healthcare | Google Places | 7 days | Weekly |
| Transit | Google Maps | 7 days | Weekly |
| Air Quality | CPCB/AQI APIs | 1 day | Hourly |
| Weather | OpenWeather | 6 hours | Hourly |
| Amenities (General) | OSM | 30 days | On-demand |

---

## Provider System

### Provider Interface (Abstract Base)

```python
class DataProvider(ABC):
    """All providers implement this interface"""
    
    @abstractmethod
    def search(self, query: str, state: str, city: str = None) -> List[Location]:
        """Search locations by name/query"""
        pass
    
    @abstractmethod
    def get_location_details(self, location_id: str) -> LocationDetails:
        """Get detailed info for a location"""
        pass
    
    @abstractmethod
    def get_metrics(self, location: Location) -> MetricsData:
        """Get all scoring metrics for location"""
        pass
    
    @abstractmethod
    def get_metric(self, location: Location, metric: str) -> float:
        """Get single metric (e.g., air_quality_index)"""
        pass
    
    def supports_metric(self, metric: str) -> bool:
        """Declare which metrics this provider supplies"""
        pass
    
    def is_available(self) -> bool:
        """Check if provider is available (API up, auth valid, etc.)"""
        pass
```

### Built-In Providers

#### 1. OpenStreetMap/Nominatim Provider
```
Provider: osm_nominatim
Metrics:
  - location.geocoding ✅
  - amenities.nearby ✅
  - infrastructure.transit ✅
  - environment.parks ✅
  - safety.police_stations ✅
Cache TTL: 30 days
Cost: Free
Limitations: Limited semantic info
```

#### 2. Google Maps Provider
```
Provider: google_maps
Metrics:
  - location.geocoding ✅
  - amenities.schools ✅
  - amenities.hospitals ✅
  - amenities.shopping ✅
  - infrastructure.transit ✅
  - neighborhood.rating (user reviews) ✅
Cache TTL: 7 days
Cost: ~$2-5 per 1000 requests
Limitations: Requires API key
```

#### 3. Air Quality Provider
```
Provider: air_quality_waqi / aqi_india
Metrics:
  - environment.aqi ✅
  - environment.pollution ✅
Cache TTL: 1 day
Cost: Free (some APIs free tier limited)
Limitations: Coverage varies by location
```

#### 4. Weather Provider
```
Provider: openweather / imd_india
Metrics:
  - environment.temperature ✅
  - environment.rainfall ✅
Cache TTL: 6 hours
Cost: Free (with limitations)
Limitations: Historical data requires premium
```

#### 5. Government Data Provider
```
Provider: govt_data_india
Metrics:
  - demographics.population ✅
  - economics.literacy_rate ✅
  - safety.crime_data ✅
  - education.schools_count ✅
Cache TTL: 90 days (annual government releases)
Cost: Free
Limitations: Data lag (6-12 months behind)
```

#### 6. Database Provider (Fallback)
```
Provider: database_cache
Metrics:
  - All cached metrics from previous queries
Cache TTL: N/A (persisted)
Cost: Free (internal only)
Limitations: Requires prior searches
```

---

## Search Architecture

### Search Pipeline

```
Input: Search Query (e.g., "Sector 17 Chandigarh")
       ↓
Parse Query
  - Extract: neighborhood/area name, city, state, PIN code
  ↓
Check Cache
  - Return if exact match cached and fresh
  ↓ (miss)
Search Providers (in order of precision/cost)
  1. Google Geocoding (most accurate)
  2. OpenStreetMap Nominatim (free, reliable)
  3. Government boundary data (administrative divisions)
  4. Database fallback (historical results)
  ↓
Normalize Results
  - Common schema: id, name, address, coordinates, metadata
  - Rank by relevance
  ↓
Cache Results
  - Store in cache layer
  ↓
Return to Frontend
  - Max 10 results (ranked by relevance)
```

### Search Result Schema

```python
class LocationSearchResult:
    location_id: str              # Unique ID (osm_123456 or goog_xyz)
    name: str                     # Sector 17 Chandigarh
    formatted_address: str        # "Sector 17, Chandigarh, Punjab 160017, India"
    city: str                     # "Chandigarh"
    state: str                    # "Punjab"
    pin_code: Optional[str]       # "160017"
    latitude: float
    longitude: float
    boundary: Optional[Polygon]   # GIS polygon of area (if available)
    primary_provider: str         # "google" or "osm" or "govt_data"
    alternative_ids: Dict[str, str]  # {"osm": "123456", "google": "ChIJ..."}
    confidence: float             # 0-1, how sure we are of the match
    last_verified: datetime       # When this data was last validated
```

---

## Scoring Architecture

### Scoring Pipeline

```
Location Selected: "Sector 17 Chandigarh"
  ↓
Get Location ID + Coordinates
  ↓
Build Metrics Matrix (10 factors)
  ┌─────────────────────────────────┐
  │ Safety & Crime                  │ ← Crime database / Police data
  │ Environment & Air Quality       │ ← AQI API / CPCB data
  │ Public Transport                │ ← Google Transit / OSM data
  │ Basic Amenities                 │ ← Google Places / OSM
  │ Schools & Education             │ ← Government / Google Places
  │ Healthcare                      │ ← Hospital locations / Google Places
  │ Affordability                   │ ← Real estate / Price databases
  │ Nightlife & Social              │ ← Google Places / Foursquare
  │ Parks & Recreation              │ ← OSM / Google Places
  │ Traffic & Commute               │ ← Google Maps / Mobility data
  └─────────────────────────────────┘
  ↓
Calculate Base Scores (0-100 for each factor)
  ↓
Personalization Weight Factors by User Profile
  ↓
Generate Factor Breakdown
  ↓
Calculate Personalized Score (weighted average)
  ↓
Return Detailed Result
  - Overall score
  - Factor scores
  - Data sources used
  - Confidence/freshness info
```

### Metric Calculation Examples

#### Safety & Crime
```
Raw Data: Crime rate (crimes per 10,000 population)
Formula: 
  - 0-10 crimes/10k → Score 90-100
  - 10-20 crimes/10k → Score 80-90
  - 20-50 crimes/10k → Score 50-80
  - 50+ crimes/10k → Score 0-50
Data Source: National Crime Records Bureau / Police Department
Update Frequency: Quarterly
```

#### Air Quality
```
Raw Data: AQI (Air Quality Index) scale 0-500
Formula:
  - AQI 0-50 (Good) → Score 95-100
  - AQI 51-100 (Satisfactory) → Score 80-95
  - AQI 101-200 (Moderately Polluted) → Score 50-80
  - AQI 201-300 (Poorly Polluted) → Score 20-50
  - AQI 300+ (Severely Polluted) → Score 0-20
Data Source: WAQI / AQI India / CPCB
Update Frequency: Daily (real-time)
```

#### Healthcare Accessibility
```
Raw Data: Hospital/clinic proximity and rating
Formula:
  - Hospitals within 1km, avg rating 4.0+ → Score 95-100
  - Hospitals within 2km, avg rating 3.5+ → Score 80-95
  - Hospitals within 5km, avg rating 3.0+ → Score 60-80
  - Hospitals within 10km, avg rating 2.5+ → Score 40-60
  - No hospitals within 10km → Score 0-40
Data Source: Google Places / OSM / Government Hospital Directory
Update Frequency: Weekly
```

#### Public Transport
```
Raw Data: Distance to nearest transit, frequency, coverage
Formula:
  - Within 0.5km of metro/bus stop, 5+ buses/hour → Score 95-100
  - Within 1km of transit, 3+ buses/hour → Score 80-95
  - Within 2km of transit, regular service → Score 60-80
  - Within 5km of transit, limited service → Score 40-60
  - No transit within 5km → Score 0-40
Data Source: Google Maps / GMIS (Government transit data)
Update Frequency: Weekly
```

### Scoring Guarantees

**Determinism:** 
```
search("Sector 17", "Chandigarh") + personalize(Family profile)
  = Always returns exactly the same score
  (unless underlying data refreshes)
```

**Data Attribution:**
```
Each score includes:
  - Raw metric value (e.g., "AQI: 87")
  - Data source (e.g., "WAQI as of 2026-07-30")
  - Calculation method (transparent formula)
  - Confidence (0-100%)
```

**Immutability Until Update:**
```
Once a score is calculated, it's immutable until:
  - Cache expires (per metric)
  - Data is refreshed (scheduled or on-demand)
  - User explicitly requests "refresh data"
```

---

## Caching Strategy

### Cache Hierarchy

```
L1: In-Memory Cache (FastAPI memory)
    - Latest 100 searches
    - TTL: 1 hour
    - Cost: RAM (low)
    - Speed: <1ms

L2: Database Cache (PostgreSQL)
    - All previous searches/locations
    - TTL: Per metric (1 day - 90 days)
    - Cost: Disk storage (low)
    - Speed: 10-50ms

L3: External API Cache
    - Rate limit handling
    - Response caching per provider
    - TTL: 24-30 hours
    - Cost: API quota savings

L4: Cold Data (Archive)
    - Historical scores for analytics
    - No TTL (permanent)
    - Speed: Secondary indexes
```

### Cache Invalidation Rules

```
Cache Entry Invalidated When:

1. TTL Expires (age > max_age)
2. Location Moves (coordinates change significantly)
3. Manual Refresh (user requests "get latest data")
4. Provider Updates (new data released by provider)
5. Data Quality Issue (confidence drops below threshold)
6. API Error Recovery (after provider comes back online)

Smart Invalidation:
- If provider A is down, don't invalidate that metric
- Fall back to cached data from provider B
- Retry failed requests exponentially (1s, 2s, 4s, 8s max)
```

### Cache Cost Analysis

**Example: Sector 17 Chandigarh Search**

```
Scenario 1: Cache HIT (subsequent search)
- Cost: $0 (no API calls)
- Time: <10ms

Scenario 2: Cache MISS (first search)
- Google Geocoding: $0.005
- Google Places (Schools/Healthcare): $0.02
- AQI API: $0 (free tier)
- Total: ~$0.025 per first search

With 1000 searches/month:
- 80% hit rate (typical): 800 hits × $0 = $0
- 20% miss rate: 200 misses × $0.025 = $5/month
- Total monthly API cost: ~$5 (free tier likely covers it)
```

---

## Database Schema

### Core Tables

#### neighborhoods
```sql
CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    location_id VARCHAR(100) UNIQUE NOT NULL,  -- "osm_123456" or "goog_xyz"
    osm_id BIGINT,
    google_place_id VARCHAR(255),
    
    name VARCHAR(255) NOT NULL,
    formatted_address VARCHAR(500),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(10),
    
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geometry GEOMETRY(POLYGON, 4326),  -- PostGIS boundary
    
    area_sqkm DECIMAL(10, 2),
    population INT,
    
    primary_provider VARCHAR(50),  -- "google", "osm", "govt_data"
    alternative_providers TEXT,     -- JSON: {"osm": "123456", "google": "..."}
    
    is_verified BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(3, 2),  -- 0.0-1.0
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    
    INDEX idx_city_state (city, state),
    INDEX idx_coordinates (latitude, longitude),
    INDEX idx_location_id (location_id)
);
```

#### metrics_data
```sql
CREATE TABLE metrics_data (
    id SERIAL PRIMARY KEY,
    neighborhood_id INT REFERENCES neighborhoods(id),
    
    metric_name VARCHAR(100),  -- "safety_crime_rate", "aqi", "schools_count"
    metric_value DECIMAL(10, 2),
    metric_unit VARCHAR(50),    -- "crimes_per_10k", "index", "count"
    
    score DECIMAL(3, 1),        -- Calculated score 0-100
    
    data_provider VARCHAR(50),  -- Which provider supplied this
    data_source_url VARCHAR(500),
    raw_data JSONB,             -- Original data from provider
    
    confidence DECIMAL(3, 2),
    is_estimated BOOLEAN,       -- Whether value is interpolated
    
    measured_at TIMESTAMP,      -- When data was measured
    cached_at TIMESTAMP,        -- When we fetched/cached it
    expires_at TIMESTAMP,       -- When we should refresh
    
    UNIQUE(neighborhood_id, metric_name),
    INDEX idx_neighborhood_metric (neighborhood_id, metric_name),
    INDEX idx_expires (expires_at)
);
```

#### search_cache
```sql
CREATE TABLE search_cache (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    
    results JSONB,  -- Cached search results
    result_count INT,
    
    top_result_neighborhood_id INT,
    top_result_confidence DECIMAL(3, 2),
    
    search_provider VARCHAR(50),  -- Which provider returned these results
    search_time_ms INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count INT DEFAULT 0,
    
    INDEX idx_search_query (search_query, city, state),
    INDEX idx_expires (expires_at)
);
```

#### personalized_scores
```sql
CREATE TABLE personalized_scores (
    id SERIAL PRIMARY KEY,
    neighborhood_id INT REFERENCES neighborhoods(id),
    
    profile_type VARCHAR(50),  -- "family", "student", "professional"
    priorities JSONB,           -- Array of 5 selected priorities
    
    overall_score DECIMAL(5, 2),
    factor_scores JSONB,        -- All 10 factors with scores
    
    data_freshness JSONB,       -- When each metric was last updated
    metrics_used JSONB,         -- Which metrics contributed to score
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    INDEX idx_neighborhood_profile (neighborhood_id, profile_type),
    INDEX idx_expires (expires_at)
);
```

#### api_call_log
```sql
CREATE TABLE api_call_log (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50),
    endpoint VARCHAR(255),
    request_params JSONB,
    response_status INT,
    response_time_ms INT,
    error_message TEXT,
    
    cost_cents DECIMAL(5, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_provider_date (provider, created_at)
);
```

---

## API Changes

### Backward Compatible Changes

**No Breaking Changes** - All existing endpoints work exactly as before:

```
GET /api/maps/search?q=Sector+17                     ✅ UNCHANGED
GET /api/maps/neighborhood/{id}                      ✅ UNCHANGED
POST /personalize {neighborhood_id, priorities}      ✅ UNCHANGED
POST /summary {personalized_score, priorities}       ✅ UNCHANGED
```

### New Optional Parameters

```
GET /api/maps/search?q=Sector+17&city=Chandigarh&state=Punjab&live=true
  - city: Filter results to specific city (optional)
  - state: Filter to state (optional)
  - live: Force fresh data (bypass cache) (optional)
  - limit: Max results (default 10, currently 5) (optional)
  - provider: Prefer specific provider (optional)

GET /api/maps/neighborhood/{id}?city=Chandigarh&live=false
  - city: Clarify which neighborhood (if ambiguous) (optional)
  - live: Force fresh data (optional)
  - metrics: Which metrics to include (optional, default all)
```

### New Endpoints (Optional Future)

```
GET /api/locations/nearby?lat=30.7333&lon=76.7794&radius_km=5
  - Find neighborhoods near coordinates

GET /api/providers/status
  - Show which data providers are available/healthy

GET /api/cache/stats
  - Cache hit rate, API costs, data freshness

POST /api/locations/refresh/{id}
  - Force refresh data for a location
```

---

## Implementation Phases

### Phase 1: Architecture Review ✅ DONE
- Analyze current backend
- Identify Chandigarh-specific code
- Design new architecture
- Present for approval

### Phase 2: Search Engine Refactor
- Implement provider abstraction
- Build OpenStreetMap/Nominatim provider
- Build Google Geocoding provider
- Implement unified search logic
- Support nationwide location searches
- Maintain backward compatibility

### Phase 3: Data Collection System
- Build provider registry
- Implement each provider (OSM, Google, AQI, Weather, Govt)
- Error handling and fallback logic
- Rate limiting and cost tracking
- Tests for each provider

### Phase 4: Data Normalization
- Define common data schema
- Transform provider outputs
- Implement normalization logic
- Validation and quality checks
- Test with real data

### Phase 5: Database Migration
- Create new schema
- Migrate existing Chandigarh data
- Implement ORM layer
- Connection pooling
- Tests for persistence

### Phase 6: Scoring Engine Refactor
- Replace deterministic scoring with data-driven
- Implement metric calculation formulas
- Build scoring pipeline
- Validate scores are correct
- Tests for scoring logic

### Phase 7: Caching Layer
- Implement cache abstraction
- Hook up database cache
- Implement cache invalidation
- Add cache metrics
- Tests for cache behavior

### Phase 8: Frontend Integration Testing
- Verify existing APIs work
- Test nationwide searches in UI
- Test personalization workflow
- Test AI summary generation
- Verify no frontend changes needed

### Phase 9: Testing & Documentation
- Comprehensive test suite
- API documentation update
- Architecture documentation
- Deployment guide
- Performance benchmarks

---

## Backward Compatibility Guarantee

### API Level
✅ All existing endpoints return same schema  
✅ All existing query parameters work  
✅ All existing response formats unchanged  
✅ Behavior identical for Chandigarh locations  

### Database Level
✅ Existing tables coexist with new schema  
✅ Migration path for existing data  
✅ No data loss  

### Frontend Level
✅ No changes required  
✅ Works with old and new backend  
✅ Gradual rollout possible  

### Configuration Level
✅ Existing environment variables continue working  
✅ New env vars optional (fallback to defaults)  
✅ No forced configuration changes  

---

## Migration Path

### Week 1: Phases 1-2
- Architecture review approved
- Provider abstraction implemented
- Search refactored for nationwide support
- Tests passing

### Week 2: Phases 3-4
- Data providers implemented
- Normalization logic working
- Real data flowing through pipeline
- Validation complete

### Week 3: Phases 5-6
- Database schema migrated
- Scoring data-driven
- Performance validated
- Tests passing

### Week 4: Phases 7-9
- Caching implemented
- Frontend integration verified
- Comprehensive testing
- Documentation complete
- Ready for production

---

## Open Questions for Review

1. **Data Provider Priorities**: Which providers should we prioritize first? (Google Maps requires API key; OSM free but less detailed)

2. **Cache Backend**: Use PostgreSQL alone or add Redis for L1 cache?

3. **Geographic Scope**: Start with major Indian cities only, or include all towns/villages?

4. **Real Estate Data**: Should "Affordability" metric come from a real estate API (like 99acres, MagicBricks) or use proxy metrics?

5. **Crime Data**: Which government crime database is most reliable? (NCRB releases annual data with 6+ month lag)

6. **Language Support**: Support regional languages or English-only initially?

7. **Authentication**: Any providers require authentication we haven't addressed?

---

**Next Steps**: 
- Review this architecture document
- Provide feedback on design choices
- Approve or request changes
- Proceed to detailed phase-by-phase implementation

