# Nationwide Expansion - Verification Checklist

## Pre-Implementation

### ✅ Architecture Review
- [ ] Plan document reviewed
- [ ] Implementation guide reviewed
- [ ] Database schema approved
- [ ] API contract preserved (no breaking changes)
- [ ] Data providers architecture understood

### ✅ Requirements Confirmed
- [ ] Google Places API key available (or ready to skip)
- [ ] Database URL configured
- [ ] Python dependencies compatible
- [ ] Environment variables understood

---

## Phase-by-Phase Verification

### Phase 1: Database Foundation

**Verification Steps**:

```bash
# 1. Create database
python -c "from backend.database.session import init_db; init_db()"

# 2. Verify tables created
sqlite3 locallens.db ".tables"
# Expected output: api_cache amenities_cache neighborhood_scores neighborhood_scores search_queries
```

**Expected Results**:
- ✅ Database file created (locallens.db)
- ✅ All 5 tables exist
- ✅ Correct schema (columns, types, indexes)

---

### Phase 2: Data Providers

**Test 1: OpenStreetMap Provider**

```python
from backend.providers.factory import ProviderFactory

ProviderFactory.initialize()
osm_provider = ProviderFactory.get_provider("openstreetmap")

# Search test
results = osm_provider.search_location("Koramangala Bengaluru")
assert len(results) > 0, "OSM search failed"
assert "name" in results[0], "Missing location name"
assert "latitude" in results[0], "Missing latitude"
```

**Expected**:
- ✅ Returns list of results
- ✅ Each has: id, name, city, state, latitude, longitude

**Test 2: Google Places Provider** (if configured)

```python
# Only if GOOGLE_PLACES_API_KEY is set
if os.getenv("GOOGLE_PLACES_API_KEY"):
    google_provider = ProviderFactory.get_provider("google_places")
    results = google_provider.search_location("Bandra Mumbai")
    assert len(results) > 0, "Google search failed"
```

**Expected**:
- ✅ Returns structured location data
- ✅ Coordinates accurate

**Test 3: Provider Priority**

```python
providers = ProviderFactory.get_providers_ordered()
assert len(providers) >= 1, "No providers available"
assert providers[0].priority <= 1, "Priority ordering incorrect"
```

**Expected**:
- ✅ At least 1 provider available
- ✅ Ordered by priority

---

### Phase 3: Amenities Caching

**Test 1: Cache Miss**

```python
from backend.cache.cache_manager import CacheManager
from backend.database.session import SessionLocal

db = SessionLocal()

# First call = cache miss (fetch fresh data)
amenities1, source1 = CacheManager.get_or_fetch_amenities(
    db=db,
    neighborhood_id=999,
    latitude=13.0362,
    longitude=77.6245,  # Koramangala
    fetch_func=lambda lat, lon, r: osm_provider.get_nearby_amenities(lat, lon, r),
    data_source="test_osm"
)

assert amenities1 is not None, "Failed to fetch amenities"
assert "hospitals" in amenities1, "Missing hospitals key"
```

**Expected**:
- ✅ Amenities fetched successfully
- ✅ Contains keys: hospitals, schools, parks, restaurants, transport, police
- ✅ Cache entry created in DB

**Test 2: Cache Hit**

```python
# Second call = cache hit (same data, no API call)
import time
start = time.time()

amenities2, source2 = CacheManager.get_or_fetch_amenities(
    db=db,
    neighborhood_id=999,
    latitude=13.0362,
    longitude=77.6245,
    fetch_func=lambda lat, lon, r: osm_provider.get_nearby_amenities(lat, lon, r),
    data_source="test_osm"
)

elapsed = time.time() - start

assert amenities1 == amenities2, "Cache data mismatch"
assert elapsed < 0.1, f"Cache hit too slow: {elapsed}s"
```

**Expected**:
- ✅ Returns identical data instantly
- ✅ No API call made
- ✅ Response time < 100ms

---

### Phase 4: Scoring with Caching

**Test 1: Calculate Scores**

```python
overall, metrics = osm_provider.estimate_scores(amenities1)

assert 0 <= overall <= 100, f"Invalid overall score: {overall}"
assert len(metrics) == 6, f"Wrong number of metrics: {len(metrics)}"

required_metrics = {"safety", "healthcare", "education", "connectivity", "environment", "infrastructure"}
assert set(metrics.keys()) == required_metrics, "Missing metric keys"

for metric, score in metrics.items():
    assert 0 <= score <= 100, f"Invalid {metric} score: {score}"
```

**Expected**:
- ✅ Overall score 0-100
- ✅ 6 metrics present
- ✅ Each metric 0-100
- ✅ Deterministic (same amenities = same scores)

**Test 2: Score Determinism**

```python
# Calculate again with same amenities
overall2, metrics2 = osm_provider.estimate_scores(amenities1)

assert overall == overall2, "Overall score not deterministic"
assert metrics == metrics2, "Metrics not deterministic"
```

**Expected**:
- ✅ Identical scores for identical amenities
- ✅ Reproducible results

---

### Phase 5: End-to-End Search Flow

**Test 1: Search Endpoint**

```python
# Simulating: GET /api/maps/search?q=Koramangala

from backend.providers.factory import ProviderFactory

ProviderFactory.initialize()
provider = ProviderFactory.get_primary_provider()

results = provider.search_location("Koramangala Bengaluru")

assert len(results) > 0, "No search results"
result = results[0]

assert result["name"] == "Koramangala" or "Koramangala" in result["name"]
assert 12 < result["latitude"] < 14, f"Latitude out of range: {result['latitude']}"
assert 77 < result["longitude"] < 79, f"Longitude out of range: {result['longitude']}"
```

**Expected**:
- ✅ Finds Koramangala
- ✅ Correct city: Bengaluru
- ✅ Correct coordinates (within ~1 degree)

**Test 2: Neighborhood Details**

```python
# Simulating: GET /api/maps/neighborhood/{id}

neighborhood_id = 999  # Using test ID
lat, lon = results[0]["latitude"], results[0]["longitude"]

amenities = CacheManager.get_or_fetch_amenities(
    db=db,
    neighborhood_id=neighborhood_id,
    latitude=lat,
    longitude=lon,
    fetch_func=lambda lat, lon, r: provider.get_nearby_amenities(lat, lon, r)
)

overall_score, metrics = provider.estimate_scores(amenities)

response = {
    "id": neighborhood_id,
    "name": results[0]["name"],
    "city": results[0]["city"],
    "state": results[0]["state"],
    "latitude": lat,
    "longitude": lon,
    "overall_score": overall_score,
    "metrics": [{"name": k, "score": v, "description": "..."} for k, v in metrics.items()]
}

assert response["overall_score"] > 0
assert len(response["metrics"]) == 6
```

**Expected**:
- ✅ Returns all required fields
- ✅ Score is valid
- ✅ Metrics complete

---

## Multi-City Verification

### Test Nationwide Coverage

```python
test_locations = [
    ("Sector 17 Chandigarh", 30.7439, 76.7955),
    ("Koramangala Bengaluru", 13.0362, 77.6245),
    ("Bandra Mumbai", 19.0596, 72.8295),
    ("Connaught Place Delhi", 28.6328, 77.2197),
    ("Jubilee Hills Hyderabad", 17.3850, 78.4867),
    ("Anna Nagar Chennai", 13.1670, 80.2081),
    ("Salt Lake Kolkata", 22.5726, 88.3639),
    ("Vastrapur Ahmedabad", 23.0225, 72.5714),
    ("Hazratganj Lucknow", 26.8470, 80.9478),
]

for location, expected_lat, expected_lon in test_locations:
    print(f"\nTesting {location}...")
    
    results = provider.search_location(location)
    assert len(results) > 0, f"No results for {location}"
    
    result = results[0]
    lat_diff = abs(result["latitude"] - expected_lat)
    lon_diff = abs(result["longitude"] - expected_lon)
    
    assert lat_diff < 0.5, f"Latitude off by {lat_diff}°"
    assert lon_diff < 0.5, f"Longitude off by {lon_diff}°"
    
    print(f"  ✓ Found: {result['name']}, {result['city']}")
    print(f"  ✓ Coordinates: ({result['latitude']:.4f}, {result['longitude']:.4f})")
```

**Expected**:
- ✅ Finds all 9 test locations
- ✅ Coordinates within 0.5° accuracy
- ✅ Correct city names

---

## Error Handling Verification

### Test 1: Invalid Location

```python
results = provider.search_location("XYZ-INVALID-LOCATION-12345")
assert len(results) == 0, "Should return empty for invalid location"
```

**Expected**: ✅ Empty list (no crash)

### Test 2: API Key Missing

```python
# If Google Places configured without API key
try:
    from backend.providers.google_places import GooglePlacesProvider
    GooglePlacesProvider()
except ValueError:
    print("✓ Correct error for missing API key")
```

**Expected**: ✅ Graceful error, clear message

### Test 3: Database Down

```python
# Close database connection
db.close()

# Attempt cache access - should fail gracefully
try:
    CacheManager.get_api_cache(db, "test", "key")
except:
    print("✓ Handles database errors")
```

**Expected**: ✅ Appropriate error handling

---

## API Contract Verification

**Verify Frontend Endpoints Unchanged**:

```bash
# Test exact API contract
curl "http://localhost:8000/api/maps/search?q=Koramangala"
# Should still return: { "query": "...", "results": [...], "count": ... }

curl -X GET "http://localhost:8000/api/maps/neighborhood/1"
# Should still return: { "id", "name", "city", "state", "latitude", "longitude", "overall_score", "metrics": [...] }

curl -X POST "http://localhost:8000/personalize" -d '{"neighborhood_id": 1, "priorities": [...]}'
# Should still return: { "personalizedScore", "factorBreakdown", "strongestFactors", "weakestFactors" }
```

**Expected**: ✅ No breaking changes, all responses identical format

---

## Performance Verification

### Benchmark Results

**Metric**: Response times should be:
- Search (first time): < 2s
- Search (cached): < 100ms
- Neighborhood details (first time): < 3s
- Neighborhood details (cached): < 100ms
- Personalize: < 1s
- Summary (AI): < 5s

**Test**:

```python
import time

# Test 1: First search (API call)
start = time.time()
results = provider.search_location("Koramangala")
time1 = time.time() - start
assert time1 < 2.0, f"First search too slow: {time1}s"
print(f"✓ First search: {time1:.2f}s")

# Test 2: Cached search
start = time.time()
results = provider.search_location("Koramangala")
time2 = time.time() - start
assert time2 < 0.1, f"Cached search too slow: {time2}s"
print(f"✓ Cached search: {time2:.3f}s")
```

**Expected**: ✅ All within acceptable ranges

---

## Final Verification Checklist

### Database ✅
- [ ] Tables created
- [ ] Indexes working
- [ ] Foreign keys (if any)
- [ ] Schema matches design

### Providers ✅
- [ ] OSM provider working
- [ ] Google provider (if configured) working
- [ ] Factory selecting correctly
- [ ] Priority ordering correct
- [ ] Fallback working

### Caching ✅
- [ ] Cache hits tracked
- [ ] Cache misses tracked
- [ ] TTL respected
- [ ] Expiration working
- [ ] No stale data returned

### Scoring ✅
- [ ] Deterministic (repeatable)
- [ ] All 6 metrics present
- [ ] Scores 0-100 valid
- [ ] Overall score calculated correctly

### Search ✅
- [ ] Finds Indian locations
- [ ] Geographic accuracy
- [ ] Returns correct format
- [ ] Handles invalid input

### Error Handling ✅
- [ ] Invalid locations (no crash)
- [ ] API failures (graceful)
- [ ] Missing API keys (clear error)
- [ ] Database errors (handled)
- [ ] Quota limits (respected)

### Frontend Compatibility ✅
- [ ] Search endpoint compatible
- [ ] Neighborhood endpoint compatible
- [ ] Personalize endpoint compatible
- [ ] Summary endpoint compatible
- [ ] Response format unchanged
- [ ] No breaking changes

### Performance ✅
- [ ] Search < 2s (first), < 100ms (cached)
- [ ] Details < 3s (first), < 100ms (cached)
- [ ] Personalize < 1s
- [ ] Summary < 5s
- [ ] Concurrent requests handled
- [ ] No memory leaks

---

## Test Execution Command

```bash
# Run comprehensive verification
python -m pytest tests/test_nationwide_expansion.py -v --tb=short

# Or manual testing
python tests/manual_verification.py
```

---

## Sign-Off

**Implementation Status**: 🔴 Not Started

**When All Checks Passed**: ✅ Ready for Production

**Final Approval**: [ ] By Project Manager [ ] By Tech Lead

