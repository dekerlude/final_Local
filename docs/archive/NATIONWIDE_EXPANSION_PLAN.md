# LocalLens Nationwide Expansion Plan

## Executive Summary

Transform LocalLens from a Chandigarh-only application into an AI-powered Neighborhood Intelligence Platform supporting any location in India.

**Key Principle**: Preserve existing frontend API contract while completely refactoring backend for scalability.

---

## Current Architecture Analysis

### Strengths ✅
- Live data fetching already implemented (OpenStreetMap integration)
- In-memory caching in place
- Modular service structure
- Deterministic scoring model
- Fallback mechanisms exist

### Limitations ❌
- Static JSON data (Chandigarh only)
- No persistent database
- Single data provider (OSM only)
- No API quota management
- No search history or user data persistence
- Difficult to scale beyond test data

---

## Proposed Nationwide Architecture

### 1. Data Provider System (Modular)

**Design Pattern**: Strategy Pattern for pluggable data providers

```
DataProvider (Interface)
├── GooglePlacesProvider
├── OpenStreetMapProvider  
├── OpenWeatherProvider (future)
├── Census API Provider (future)
└── Custom Data Provider (future)
```

**Each provider implements**:
- `search_location(query: str) -> List[LocationResult]`
- `get_location_details(lat, lon) -> LocationDetails`
- `get_nearby_amenities(lat, lon, radius) -> Dict[str, List[Amenity]]`
- `estimate_scores(amenities) -> Dict[str, int]`

### 2. Database Schema

**Core Tables**:
- `neighborhoods` (cached locations)
- `neighborhood_scores` (calculated metrics)
- `amenities_cache` (nearby places)
- `search_queries` (for analytics & repeated searches)
- `api_cache` (for intelligent caching)

### 3. Caching Strategy

**Multi-Layer Caching**:
1. **L1 In-Memory Cache** (session-level, fast)
2. **L2 Redis Cache** (optional, for multi-instance)
3. **L3 Database Cache** (persistent, with TTL)

**Cache Invalidation**:
- Amenities cache: 7 days (data changes slowly)
- Scores cache: 30 days (metrics are stable)
- Search results: 24 hours
- API responses: 1 hour (rate limiting)

### 4. API Quota Management

**Per Provider**:
- Google Places: 25,000 requests/day
- OpenStreetMap: Nominatim 1 req/sec, Overpass 10 slots
- Rate limiting with exponential backoff

### 5. Scoring Model (Deterministic)

**6 Core Metrics** (unchanged):
1. Safety (police, hospitals presence)
2. Healthcare (hospitals, clinics count)
3. Education (schools, universities count)
4. Connectivity (transit, roads availability)
5. Environment (parks, green spaces)
6. Infrastructure (amenities density)

**Algorithm** (unchanged):
- Collect nearby amenities
- Normalize counts to 0-100 scores
- Average for overall score
- Deterministic, repeatable results

---

## Implementation Roadmap

### Phase 1: Database Foundation (Week 1-2)
- [ ] Design and create database schema
- [ ] Implement ORM (SQLAlchemy)
- [ ] Migration scripts for existing data
- [ ] Backup of Chandigarh data

### Phase 2: Data Provider System (Week 2-3)
- [ ] Abstract DataProvider interface
- [ ] Refactor existing OSM provider
- [ ] Implement Google Places provider
- [ ] Provider factory & configuration
- [ ] Error handling & fallback logic

### Phase 3: Caching Layer (Week 3)
- [ ] Implement database caching
- [ ] Cache invalidation strategy
- [ ] TTL management
- [ ] Cache statistics tracking

### Phase 4: Search Enhancement (Week 4)
- [ ] Nationwide search with multiple providers
- [ ] Smart provider selection
- [ ] Result deduplication
- [ ] Location disambiguation

### Phase 5: API Enhancements (Week 4)
- [ ] Keep existing endpoints compatible
- [ ] Add nationwide data source
- [ ] Error handling for API failures
- [ ] Rate limiting

### Phase 6: Testing & Verification (Week 5)
- [ ] End-to-end flow testing
- [ ] Load testing
- [ ] API quota monitoring
- [ ] Performance benchmarking

---

## API Contract (UNCHANGED)

### Frontend → Backend (Preserved)

**Search Endpoint**:
```
GET /api/maps/search?q=Koramangala
Response: { query, results: [{ id, name, city, state, latitude, longitude }], count }
```

**Neighborhood Endpoint**:
```
GET /api/maps/neighborhood/{id}
Response: { id, name, city, state, latitude, longitude, overall_score, metrics: [{ name, score, description }] }
```

**Personalize Endpoint**:
```
POST /personalize
Request: { neighborhood_id, priorities: [...] }
Response: { personalizedScore, factorBreakdown, strongestFactors, weakestFactors }
```

**Summary Endpoint**:
```
POST /summary
Request: { neighborhood_id, priorities, personalizedScore, factorBreakdown }
Response: { summary: "AI insight..." }
```

---

## Files to Create/Modify

### New Files
- `backend/database/models.py` - SQLAlchemy ORM models
- `backend/database/schemas.py` - Pydantic schemas
- `backend/database/init_db.py` - Database initialization
- `backend/providers/base.py` - Abstract DataProvider
- `backend/providers/google_places.py` - Google implementation
- `backend/providers/openstreetmap.py` - Refactored OSM
- `backend/providers/factory.py` - Provider selection logic
- `backend/cache/cache_manager.py` - Caching logic
- `backend/cache/models.py` - Cache database models
- `backend/config.py` - Configuration management
- `backend/migrations/` - Database migrations
- `tests/test_providers.py` - Provider tests
- `tests/test_nationwide_search.py` - Integration tests

### Modified Files
- `backend/app.py` - Add database initialization
- `backend/maps/routes.py` - Use new provider system
- `backend/maps/scoring.py` - Use cached data
- `backend/services/ai.py` - No changes needed
- `backend/requirements.txt` - Add sqlalchemy, google-maps-services

---

## Configuration

**Environment Variables**:
```
# Database
DATABASE_URL=sqlite:///locallens.db  # Or postgresql://...

# Google Places API
GOOGLE_PLACES_API_KEY=your_key_here

# OSM (already working, no key needed)

# Cache Settings
CACHE_TTL_AMENITIES=604800  # 7 days
CACHE_TTL_SCORES=2592000    # 30 days
CACHE_TTL_SEARCH=86400      # 24 hours

# Feature Flags
USE_GOOGLE_PLACES=true
USE_OPENSTREETMAP=true
PRIMARY_PROVIDER=google_places  # Fallback to osm
```

---

## Quality Checklist

- [ ] Every API endpoint tested with nationwide locations
- [ ] Search flow verified end-to-end
- [ ] Error handling tested (API down, invalid location, quota exceeded, missing keys)
- [ ] Cache hits and misses verified
- [ ] Performance tested with concurrent requests
- [ ] Database migrations tested
- [ ] Deterministic scoring validated
- [ ] Frontend functionality unchanged
- [ ] Fallback mechanisms working

---

## Success Criteria

✅ Users can search ANY neighborhood in India
✅ Same workflow works nationwide
✅ Scores are deterministic and repeatable
✅ Frontend remains unchanged
✅ Performance acceptable (<2s for search, <1s for neighborhood)
✅ API quotas respected
✅ Error handling graceful

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| API quota exceeded | Rate limiting + caching + fallback |
| Invalid location | Validation + multiple provider attempts |
| API key missing | Clear error message + fallback mode |
| Database down | In-memory cache + mock data |
| Slow responses | Aggressive caching + async where possible |
| Data inconsistency | Validation layer + deterministic scoring |

---

## Next Steps

1. Review this plan
2. Approve implementation approach
3. Begin Phase 1: Database setup
4. Proceed with phased rollout
5. No commit until full review

