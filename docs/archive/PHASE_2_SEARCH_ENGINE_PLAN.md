# Phase 2: Search Engine Refactor - Detailed Implementation Plan

**Objective**: Replace hardcoded JSON search with nationwide location search via provider abstraction

**Duration**: 3-4 days

**Output**: 
- Provider abstraction layer ✅
- Google Geocoding provider ✅
- OpenStreetMap provider ✅
- Unified search logic ✅
- All existing tests passing ✅

---

## Folder Structure After Phase 2

```
backend/
├── providers/                          # NEW: Provider abstraction layer
│   ├── __init__.py
│   ├── base.py                        # Abstract base class
│   ├── google_geocoding.py            # Google Geocoding API
│   ├── openstreetmap.py               # OSM/Nominatim API
│   ├── provider_registry.py           # Provider discovery/selection
│   └── schemas.py                     # Common schemas
│
├── maps/
│   ├── routes.py                      # REFACTORED: New search logic
│   ├── models.py                      # Unchanged
│   ├── scoring.py                     # Unchanged for now
│   ├── services/
│   │   └── live_data.py              # Refactored: Becomes OSM provider
│   └── data/
│       └── neighborhoods.json         # Still exists for seed data/fallback
│
├── database/
│   ├── models.py                      # NEW: Add SearchResult model
│   ├── connection.py                  # Unchanged
│   └── migrations/                    # NEW: For future migrations
│
├── app.py                             # Add provider initialization
└── config.py                          # NEW: Provider configuration

```

---

## Core Files to Create/Modify

### 1. `backend/providers/base.py` - Abstract Provider Interface

```python
# New file defining provider contract
from abc import ABC, abstractmethod
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel

class Location(BaseModel):
    """Normalized location result from any provider"""
    location_id: str              # "osm_123456" or "goog_ChIJ..."
    name: str                     # "Sector 17 Chandigarh"
    formatted_address: str        # Full address
    city: str
    state: str
    pin_code: Optional[str]
    latitude: float
    longitude: float
    provider: str                 # Which provider found this
    confidence: float             # 0-1, how sure we are
    country: str = "India"

class LocationDetails(BaseModel):
    """Extended details for a single location"""
    location_id: str
    location: Location
    description: Optional[str]
    types: List[str]              # ["locality", "administrative_area_level_3"]
    boundaries: Optional[Dict]    # GIS boundaries if available
    metadata: Dict                # Provider-specific extras

class DataProvider(ABC):
    """All providers implement this interface"""
    name: str
    priority: int                 # 0 (highest) to 100 (lowest)
    
    @abstractmethod
    def search(self, query: str, city: Optional[str], 
               state: Optional[str]) -> List[Location]:
        """Search locations by name"""
        pass
    
    @abstractmethod
    def get_location_details(self, location_id: str) -> LocationDetails:
        """Get extended details for a location"""
        pass
    
    def is_available(self) -> bool:
        """Check if provider is available/healthy"""
        return True
    
    def supports_region(self, state: str, city: Optional[str]) -> bool:
        """Return True if provider covers this region"""
        return True  # Default: global
```

**Design Notes**:
- `Location` is the normalized output all providers must return
- `DataProvider` is the interface all providers must implement
- `is_available()` allows checking health before using provider
- `supports_region()` allows region-specific providers

---

### 2. `backend/providers/google_geocoding.py` - Google Maps Provider

```python
# New file: Google Geocoding provider
import os
import requests
from typing import List, Optional
from .base import DataProvider, Location, LocationDetails

class GoogleGeocoder(DataProvider):
    name = "google_geocoding"
    priority = 10  # Higher priority (more accurate)
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not set")
        self.base_url = "https://maps.googleapis.com/maps/api"
    
    def search(self, query: str, city: Optional[str], 
               state: Optional[str]) -> List[Location]:
        """
        Search using Google Geocoding API
        
        Query: "Sector 17 Chandigarh"
        Returns: [Location, Location, ...]
        """
        # Construct search query
        if city:
            query = f"{query}, {city}"
        if state:
            query = f"{query}, {state}"
        query += ", India"  # Scope to India
        
        # Call Google API
        params = {
            "address": query,
            "key": self.api_key
        }
        response = requests.get(f"{self.base_url}/geocode/json", params=params)
        
        if response.status_code != 200:
            return []
        
        data = response.json()
        
        # Normalize results
        results = []
        for result in data.get("results", []):
            loc = self._normalize_result(result)
            results.append(loc)
        
        return results[:10]  # Return top 10
    
    def get_location_details(self, location_id: str) -> LocationDetails:
        """Get details for a Google place ID"""
        # location_id format: "goog_ChIJ..."
        place_id = location_id.replace("goog_", "")
        
        params = {
            "place_id": place_id,
            "key": self.api_key
        }
        response = requests.get(
            f"{self.base_url}/place/details/json", 
            params=params
        )
        
        if response.status_code != 200:
            raise ValueError(f"Failed to fetch details for {location_id}")
        
        result = response.json()["result"]
        
        # Return normalized details
        return LocationDetails(
            location_id=location_id,
            location=self._normalize_result(result),
            description=result.get("formatted_address"),
            types=result.get("types", []),
            metadata=result
        )
    
    def _normalize_result(self, result: dict) -> Location:
        """Convert Google result to Location"""
        address_components = result["address_components"]
        
        # Extract components
        city = self._extract_component(address_components, "locality")
        state = self._extract_component(address_components, "administrative_area_level_1")
        pin = self._extract_component(address_components, "postal_code")
        
        return Location(
            location_id=f"goog_{result.get('place_id', '')}",
            name=result["formatted_address"].split(",")[0],
            formatted_address=result["formatted_address"],
            city=city or "Unknown",
            state=state or "Unknown",
            pin_code=pin,
            latitude=result["geometry"]["location"]["lat"],
            longitude=result["geometry"]["location"]["lng"],
            provider="google_geocoding",
            confidence=0.95
        )
    
    @staticmethod
    def _extract_component(components: list, type_: str) -> Optional[str]:
        """Extract a component by type"""
        for comp in components:
            if type_ in comp["types"]:
                return comp["long_name"]
        return None
```

**Design Notes**:
- Uses Google Geocoding API (accurate, global)
- Normalizes Google's response to `Location` schema
- Handles search by query + optional city/state
- Returns up to 10 results

---

### 3. `backend/providers/openstreetmap.py` - OSM Provider

```python
# New file: OpenStreetMap/Nominatim provider
import requests
from typing import List, Optional
from .base import DataProvider, Location, LocationDetails

class OpenStreetMapProvider(DataProvider):
    name = "openstreetmap"
    priority = 20  # Lower priority (less accurate but free)
    
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org"
    
    def search(self, query: str, city: Optional[str], 
               state: Optional[str]) -> List[Location]:
        """
        Search using OSM Nominatim API
        
        Query: "Sector 17 Chandigarh"
        Returns: [Location, Location, ...]
        """
        # Construct search query
        if city:
            query = f"{query}, {city}"
        if state:
            query = f"{query}, {state}"
        query += ", India"
        
        # Call Nominatim API
        params = {
            "q": query,
            "format": "json",
            "addressdetails": 1,
            "limit": 10
        }
        headers = {"User-Agent": "LocalLens/1.0"}
        
        response = requests.get(
            f"{self.base_url}/search",
            params=params,
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            return []
        
        results = response.json()
        
        # Normalize results
        locations = []
        for result in results:
            loc = self._normalize_result(result)
            locations.append(loc)
        
        return locations
    
    def get_location_details(self, location_id: str) -> LocationDetails:
        """Get details for an OSM node/way"""
        osm_id = location_id.replace("osm_", "")
        
        params = {
            "osm_ids": osm_id,
            "format": "json",
            "addressdetails": 1
        }
        headers = {"User-Agent": "LocalLens/1.0"}
        
        response = requests.get(
            f"{self.base_url}/lookup",
            params=params,
            headers=headers
        )
        
        if response.status_code != 200:
            raise ValueError(f"Failed to fetch details for {location_id}")
        
        result = response.json()[0]
        
        return LocationDetails(
            location_id=location_id,
            location=self._normalize_result(result),
            description=result.get("display_name"),
            types=result.get("type", "").split(","),
            metadata=result
        )
    
    def _normalize_result(self, result: dict) -> Location:
        """Convert OSM result to Location"""
        address = result["address"]
        
        return Location(
            location_id=f"osm_{result['osm_id']}",
            name=result["name"],
            formatted_address=result["display_name"],
            city=address.get("city") or address.get("town"),
            state=address.get("state", ""),
            pin_code=address.get("postcode"),
            latitude=float(result["lat"]),
            longitude=float(result["lon"]),
            provider="openstreetmap",
            confidence=0.85
        )
```

**Design Notes**:
- Uses Nominatim API (free, open data)
- Slightly lower confidence than Google (0.85 vs 0.95)
- Same normalized output as Google provider
- Falls back gracefully if API down

---

### 4. `backend/providers/provider_registry.py` - Provider Orchestration

```python
# New file: Provider registry and orchestration
from typing import List, Optional, Dict
from .base import DataProvider, Location, LocationDetails
from .google_geocoding import GoogleGeocoder
from .openstreetmap import OpenStreetMapProvider

class ProviderRegistry:
    """
    Manages all data providers
    - Initialization and health checks
    - Fallback when provider fails
    - Deduplication of results
    """
    
    def __init__(self):
        self.providers: List[DataProvider] = []
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize providers in priority order"""
        # Try Google first (most accurate)
        try:
            self.providers.append(GoogleGeocoder())
        except Exception as e:
            print(f"Google Geocoder not available: {e}")
        
        # Always add OSM (free fallback)
        try:
            self.providers.append(OpenStreetMapProvider())
        except Exception as e:
            print(f"OpenStreetMap not available: {e}")
        
        # Sort by priority
        self.providers.sort(key=lambda p: p.priority)
    
    def search(self, query: str, city: Optional[str], 
               state: Optional[str]) -> List[Location]:
        """
        Search across all available providers
        
        1. Try Google (if available)
        2. Fall back to OSM
        3. Deduplicate results
        4. Return top 10 by confidence
        """
        results: Dict[str, Location] = {}
        
        for provider in self.providers:
            if not provider.is_available():
                continue
            
            try:
                locations = provider.search(query, city, state)
                for loc in locations:
                    # Deduplicate by formatted_address
                    key = f"{loc.latitude:.6f}:{loc.longitude:.6f}"
                    if key not in results or loc.confidence > results[key].confidence:
                        results[key] = loc
            except Exception as e:
                print(f"Provider {provider.name} failed: {e}")
                continue
        
        # Sort by confidence and return top 10
        sorted_results = sorted(
            results.values(),
            key=lambda x: x.confidence,
            reverse=True
        )
        
        return sorted_results[:10]
    
    def get_location_details(self, location_id: str) -> LocationDetails:
        """
        Get details for a location
        Uses the provider that originally found it
        """
        provider_name = location_id.split("_")[0]
        
        for provider in self.providers:
            if provider.name.startswith(provider_name):
                try:
                    return provider.get_location_details(location_id)
                except Exception as e:
                    print(f"Provider {provider.name} failed: {e}")
                    continue
        
        raise ValueError(f"Location {location_id} not found in any provider")
```

**Design Notes**:
- Tries providers in priority order (Google → OSM)
- Deduplicates results by coordinates
- Returns top 10 by confidence score
- Falls back gracefully when providers fail
- Extensible: add more providers by extending `DataProvider`

---

### 5. `backend/maps/routes.py` - Refactored Search Endpoint

```python
# REFACTORED: Replace existing search logic
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from .models import NeighborhoodBasic
from ..providers.provider_registry import ProviderRegistry

router = APIRouter(prefix="/api/maps", tags=["maps"])
provider_registry = ProviderRegistry()

@router.get("/search")
async def search_neighborhoods(
    q: str = Query(..., description="Search query (e.g., 'Sector 17')"),
    city: Optional[str] = Query(None, description="Filter to city"),
    state: Optional[str] = Query(None, description="Filter to state"),
    limit: int = Query(10, ge=1, le=20, description="Max results")
) -> List[NeighborhoodBasic]:
    """
    Search neighborhoods by name or location
    
    Supports nationwide searches across India
    
    Examples:
    - GET /api/maps/search?q=Sector+17&city=Chandigarh
    - GET /api/maps/search?q=Koramangala&city=Bangalore
    - GET /api/maps/search?q=Bandra+Mumbai
    - GET /api/maps/search?q=Anna+Nagar&state=Tamil+Nadu
    """
    
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=422,
            detail="Search query must be at least 2 characters"
        )
    
    try:
        # Search using provider registry
        locations = provider_registry.search(
            query=q.strip(),
            city=city,
            state=state
        )
        
        if not locations:
            return []
        
        # Convert to response schema
        results = []
        for loc in locations[:limit]:
            results.append(
                NeighborhoodBasic(
                    id=loc.location_id,
                    name=loc.name,
                    city=loc.city,
                    state=loc.state,
                    latitude=loc.latitude,
                    longitude=loc.longitude,
                    formatted_address=loc.formatted_address
                )
            )
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/neighborhood/{neighborhood_id}")
async def get_neighborhood(neighborhood_id: str):
    """
    Get detailed information for a neighborhood
    
    neighborhood_id format:
    - osm_123456 (OpenStreetMap)
    - goog_ChIJ... (Google)
    """
    
    try:
        # Get location details from provider
        details = provider_registry.get_location_details(neighborhood_id)
        
        # Calculate scores (Phase 6)
        # ... scoring logic ...
        
        return {
            "id": neighborhood_id,
            "name": details.location.name,
            "city": details.location.city,
            "state": details.location.state,
            "latitude": details.location.latitude,
            "longitude": details.location.longitude,
            "formatted_address": details.location.formatted_address,
            "provider": details.location.provider
        }
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Design Notes**:
- Replaces hardcoded JSON search logic
- Uses provider registry for nationwide support
- Same response format as before (backward compatible)
- New parameters: `city`, `state`, `limit`
- location_id now includes provider prefix (osm_, goog_)

---

### 6. `backend/config.py` - Configuration Management (NEW)

```python
# New file: Configuration for providers and behavior
import os
from typing import Dict, List

# Provider Configuration
PROVIDERS_ENABLED = {
    "google_geocoding": os.getenv("ENABLE_GOOGLE_GEOCODING", "true").lower() == "true",
    "openstreetmap": os.getenv("ENABLE_OPENSTREETMAP", "true").lower() == "true",
}

PROVIDER_PRIORITY = {
    "google_geocoding": 10,
    "openstreetmap": 20,
}

# API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Search Configuration
SEARCH_RESULT_LIMIT = 10
SEARCH_TIMEOUT_SECONDS = 10

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/locallens")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Feature Flags
ENABLE_LIVE_DATA = os.getenv("ENABLE_LIVE_DATA", "true").lower() == "true"
ENABLE_CACHING = os.getenv("ENABLE_CACHING", "true").lower() == "true"
CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", "24"))
```

---

### 7. `backend/app.py` - Initialize Providers

```python
# MODIFIED: FastAPI app to initialize provider registry
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .providers.provider_registry import ProviderRegistry
from .maps.routes import router as maps_router
from .routes.personalize import router as personalize_router
from .routes.summary import router as summary_router

app = FastAPI(
    title="LocalLens API",
    description="Neighborhood Intelligence Platform",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize providers at startup
@app.on_event("startup")
async def startup_event():
    print("Initializing data providers...")
    provider_registry = ProviderRegistry()
    print(f"✅ {len(provider_registry.providers)} providers initialized")

# Register routes
app.include_router(maps_router)
app.include_router(personalize_router)
app.include_router(summary_router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
```

---

## Testing Strategy

### Unit Tests: Provider Behavior

```python
# backend/tests/test_providers.py

def test_google_geocoder_search():
    """Google provider returns Location objects"""
    provider = GoogleGeocoder()
    results = provider.search("Sector 17", city="Chandigarh", state="Punjab")
    
    assert len(results) > 0
    assert all(isinstance(r, Location) for r in results)
    assert results[0].name
    assert results[0].latitude
    assert results[0].location_id.startswith("goog_")

def test_osm_provider_search():
    """OSM provider returns Location objects"""
    provider = OpenStreetMapProvider()
    results = provider.search("Sector 17", city="Chandigarh", state="Punjab")
    
    assert len(results) > 0
    assert all(isinstance(r, Location) for r in results)
    assert results[0].location_id.startswith("osm_")

def test_provider_deduplication():
    """Registry deduplicates by coordinates"""
    registry = ProviderRegistry()
    results = registry.search("Sector 17", "Chandigarh", "Punjab")
    
    coords = [f"{r.latitude}:{r.longitude}" for r in results]
    assert len(coords) == len(set(coords))  # No duplicates
```

### Integration Tests: API Endpoints

```python
# backend/tests/test_search_api.py

def test_search_endpoint_nationwide():
    """Search endpoint works for any Indian location"""
    from fastapi.testclient import TestClient
    from ..app import app
    
    client = TestClient(app)
    
    test_cases = [
        {"q": "Sector 17", "city": "Chandigarh"},
        {"q": "Koramangala", "city": "Bangalore"},
        {"q": "Bandra", "city": "Mumbai"},
        {"q": "Connaught Place", "city": "Delhi"},
    ]
    
    for case in test_cases:
        response = client.get("/api/maps/search", params=case)
        assert response.status_code == 200
        results = response.json()
        assert len(results) > 0
        assert results[0]["latitude"]
        assert results[0]["city"]

def test_search_endpoint_backward_compatible():
    """Old search format still works"""
    client = TestClient(app)
    
    # Old format: just ?q=
    response = client.get("/api/maps/search?q=Sector")
    assert response.status_code == 200
    
    results = response.json()
    assert all("id" in r for r in results)
    assert all("name" in r for r in results)
    assert all("latitude" in r for r in results)
```

---

## Migration Strategy: JSON to Providers

### Week 1: Parallel Running
- Deploy new provider system
- Keep JSON file as fallback
- Route searches through providers first, JSON fallback second

### Week 2: Remove JSON Dependency
- Once providers tested and stable
- Remove JSON file fallback
- All searches go through providers

### Rollback Plan
- If providers fail, revert to JSON-only
- Keeps service available even if Google API key missing
- No data loss

---

## Database Model Addition

```python
# backend/database/models.py - ADD:

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(Integer, primary_key=True)
    search_query = Column(String(255), nullable=False)
    location_id = Column(String(100), nullable=False)
    location_name = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    provider = Column(String(50))
    confidence = Column(Float)
    cached_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_search_location', 'search_query', 'location_id'),
        Index('idx_provider', 'provider'),
    )
```

---

## Acceptance Criteria

✅ **Nationwide Search Works**
- Searches for any Indian location return results
- Works for cities, neighborhoods, sectors, areas

✅ **Provider Abstraction Complete**
- Google and OSM providers implemented
- Easy to add more providers
- Clear interface contract

✅ **Backward Compatible**
- All existing tests pass
- Same response format
- Frontend needs zero changes

✅ **Graceful Fallback**
- If Google API unavailable, OSM still works
- If OSM down, system still responds
- No hard failures

✅ **Error Handling**
- Invalid queries return empty (not error)
- API failures handled gracefully
- Timeouts respected

---

## Timeline

**Day 1**:
- Create provider base class and schemas
- Implement GoogleGeocoder and OpenStreetMapProvider
- Write unit tests

**Day 2**:
- Create ProviderRegistry
- Refactor maps/routes.py
- Add config.py
- Update app.py startup

**Day 3**:
- Integration testing
- Backward compatibility verification
- Documentation

**Day 4**:
- Bug fixes
- Performance optimization
- Final testing

---

## Next Phase Dependencies

Phase 3 (Data Collection) needs:
- ✅ Provider abstraction (PHASE 2 delivers this)
- ✅ Normalized Location schema (PHASE 2 delivers this)
- Schema extensions for metrics data (Phase 3 will add)

Phase 5 (Database) needs:
- ✅ Providers working reliably (PHASE 2 ensures this)
- ✅ Location data normalization (PHASE 2 delivers this)

---

**Status**: Ready to implement Phase 2

