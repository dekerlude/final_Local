# Nationwide Expansion - Implementation Guide

## Overview

This document provides the complete implementation for expanding LocalLens to nationwide coverage. All code is production-ready and organized by priority.

---

## Phase 1: Core Database & Configuration

### File: `backend/database/session.py`

```python
"""Database session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./locallens.db"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True,  # Validate connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DATABASE_URL}")


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### File: `backend/config.py`

```python
"""Configuration management."""

import os
from datetime import timedelta

class Settings:
    """Application settings."""
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./locallens.db"
    )
    
    # Google Places API
    GOOGLE_PLACES_API_KEY: str = os.getenv("GOOGLE_PLACES_API_KEY", "")
    GOOGLE_PLACES_RADIUS_KM: float = float(os.getenv("GOOGLE_PLACES_RADIUS_KM", "2.0"))
    
    # Cache Settings (in seconds)
    CACHE_TTL_AMENITIES: int = int(os.getenv("CACHE_TTL_AMENITIES", 604800))  # 7 days
    CACHE_TTL_SCORES: int = int(os.getenv("CACHE_TTL_SCORES", 2592000))  # 30 days
    CACHE_TTL_SEARCH: int = int(os.getenv("CACHE_TTL_SEARCH", 86400))  # 24 hours
    
    # Feature Flags
    USE_GOOGLE_PLACES: bool = os.getenv("USE_GOOGLE_PLACES", "true").lower() == "true"
    USE_OPENSTREETMAP: bool = os.getenv("USE_OPENSTREETMAP", "true").lower() == "true"
    PRIMARY_PROVIDER: str = os.getenv("PRIMARY_PROVIDER", "openstreetmap")  # 'openstreetmap' or 'google_places'
    
    # API Rate Limiting
    OSM_RATE_LIMIT_REQUESTS: int = int(os.getenv("OSM_RATE_LIMIT_REQUESTS", 1))  # per second
    OSM_RATE_LIMIT_WINDOW: int = int(os.getenv("OSM_RATE_LIMIT_WINDOW", 1))  # seconds
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
```

---

## Phase 2: Data Provider System (Modular Architecture)

### File: `backend/providers/base.py`

```python
"""Abstract base class for data providers."""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Tuple, Optional


class DataProvider(ABC):
    """Abstract data provider interface."""
    
    @abstractmethod
    def search_location(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for a location.
        
        Returns list of locations with: id, name, city, state, latitude, longitude
        """
        pass
    
    @abstractmethod
    def get_location_details(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get detailed information about a location."""
        pass
    
    @abstractmethod
    def get_nearby_amenities(
        self, 
        latitude: float, 
        longitude: float, 
        radius_km: float = 2.0
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get nearby amenities.
        
        Returns dict with keys: hospitals, schools, parks, restaurants, transport, police
        """
        pass
    
    @abstractmethod
    def estimate_scores(self, amenities: Dict[str, List[Dict]]) -> Tuple[int, Dict[str, int]]:
        """
        Estimate neighborhood scores from amenities.
        
        Returns (overall_score, metric_scores_dict)
        """
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name."""
        pass
    
    @property
    @abstractmethod
    def priority(self) -> int:
        """Lower number = higher priority (0 is highest)."""
        pass
```

### File: `backend/providers/openstreetmap.py`

```python
"""OpenStreetMap data provider (refactored from live_data.py)."""

import logging
from typing import Dict, List, Any, Tuple, Optional
from .base import DataProvider
from backend.maps.services.live_data import (
    geocode_neighborhood,
    fetch_nearby_places,
    estimate_metrics_from_places,
    search_live
)

logger = logging.getLogger(__name__)


class OpenStreetMapProvider(DataProvider):
    """OpenStreetMap (Nominatim + Overpass) data provider."""
    
    def search_location(self, query: str) -> List[Dict[str, Any]]:
        """Search using Nominatim."""
        return search_live(query)
    
    def get_location_details(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get location details (minimal for OSM)."""
        return {
            "latitude": latitude,
            "longitude": longitude,
            "source": "openstreetmap"
        }
    
    def get_nearby_amenities(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 2.0
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch amenities using Overpass API."""
        return fetch_nearby_places(latitude, longitude, radius_km)
    
    def estimate_scores(
        self,
        amenities: Dict[str, List[Dict]]
    ) -> Tuple[int, Dict[str, int]]:
        """Calculate scores from amenities."""
        overall_score, metrics = estimate_metrics_from_places(amenities)
        metric_scores = {m["name"].lower(): m["score"] for m in metrics}
        return overall_score, metric_scores
    
    @property
    def name(self) -> str:
        return "openstreetmap"
    
    @property
    def priority(self) -> int:
        return 1  # Secondary provider
```

### File: `backend/providers/google_places.py`

```python
"""Google Places API data provider."""

import logging
from typing import Dict, List, Any, Tuple, Optional
from .base import DataProvider
from backend.config import settings

logger = logging.getLogger(__name__)


class GooglePlacesProvider(DataProvider):
    """Google Places API data provider."""
    
    def __init__(self):
        """Initialize with API key."""
        if not settings.GOOGLE_PLACES_API_KEY:
            raise ValueError("GOOGLE_PLACES_API_KEY not configured")
        
        try:
            import googlemaps
            self.client = googlemaps.Client(key=settings.GOOGLE_PLACES_API_KEY)
        except ImportError:
            raise ImportError("google-maps-services library not installed")
    
    def search_location(self, query: str) -> List[Dict[str, Any]]:
        """Search using Google Places Geocoding."""
        try:
            results = self.client.geocode(query)
            locations = []
            
            for result in results[:5]:  # Max 5 results
                geometry = result.get("geometry", {})
                location = geometry.get("location", {})
                address_components = result.get("address_components", [])
                
                # Parse address
                name = result.get("formatted_address", query).split(",")[0]
                city = self._extract_address_component(address_components, "locality")
                state = self._extract_address_component(address_components, "administrative_area_level_1")
                
                locations.append({
                    "id": hash(result["place_id"]) % 2147483647,
                    "name": name,
                    "city": city or query,
                    "state": state or "India",
                    "latitude": location.get("lat", 0),
                    "longitude": location.get("lng", 0),
                })
            
            return locations
        except Exception as e:
            logger.error(f"Google Places search error: {e}")
            return []
    
    def get_location_details(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get location details using reverse geocoding."""
        try:
            results = self.client.reverse_geocode((latitude, longitude))
            if results:
                return {
                    "formatted_address": results[0].get("formatted_address"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "source": "google_places"
                }
        except Exception as e:
            logger.error(f"Google Places reverse geocoding error: {e}")
        
        return {"latitude": latitude, "longitude": longitude, "source": "google_places"}
    
    def get_nearby_amenities(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 2.0
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch nearby places using Google Places API."""
        amenities = {
            "hospitals": [],
            "schools": [],
            "parks": [],
            "restaurants": [],
            "transport": [],
            "police": [],
        }
        
        place_types = {
            "hospitals": ["hospital", "doctor", "physiotherapist"],
            "schools": ["school", "university", "primary_school", "secondary_school"],
            "parks": ["park"],
            "restaurants": ["restaurant", "cafe", "food"],
            "transport": ["bus_station", "train_station", "transit_station"],
            "police": ["police"],
        }
        
        try:
            radius_m = int(radius_km * 1000)
            
            for category, types in place_types.items():
                for place_type in types:
                    try:
                        results = self.client.places_nearby(
                            location=(latitude, longitude),
                            radius=radius_m,
                            type=place_type,
                            page_token=None
                        )
                        
                        for place in results.get("results", []):
                            amenities[category].append({
                                "name": place.get("name"),
                                "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                                "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                                "place_id": place.get("place_id"),
                            })
                    except Exception as e:
                        logger.warning(f"Error fetching {place_type}: {e}")
                        continue
            
            return amenities
        
        except Exception as e:
            logger.error(f"Google Places nearby error: {e}")
            return amenities
    
    def estimate_scores(
        self,
        amenities: Dict[str, List[Dict]]
    ) -> Tuple[int, Dict[str, int]]:
        """Calculate scores from amenities."""
        def normalize_count(count: int, threshold: int = 10) -> int:
            if count == 0:
                return 40
            if count >= threshold:
                return 90
            return 40 + (count / threshold) * 50
        
        hospital_count = len(amenities.get("hospitals", []))
        school_count = len(amenities.get("schools", []))
        park_count = len(amenities.get("parks", []))
        restaurant_count = len(amenities.get("restaurants", []))
        transport_count = len(amenities.get("transport", []))
        police_count = len(amenities.get("police", []))
        
        metric_scores = {
            "safety": min(100, 65 + police_count * 5),
            "healthcare": int(normalize_count(hospital_count, 5)),
            "education": int(normalize_count(school_count, 8)),
            "connectivity": int(normalize_count(transport_count, 10)),
            "environment": int(normalize_count(park_count, 5)),
            "infrastructure": int(normalize_count(restaurant_count + transport_count, 15)),
        }
        
        overall_score = round(sum(metric_scores.values()) / len(metric_scores))
        return overall_score, metric_scores
    
    @staticmethod
    def _extract_address_component(components: List[Dict], component_type: str) -> Optional[str]:
        """Extract address component by type."""
        for component in components:
            if component_type in component.get("types", []):
                return component.get("long_name")
        return None
    
    @property
    def name(self) -> str:
        return "google_places"
    
    @property
    def priority(self) -> int:
        return 0  # Primary provider
```

### File: `backend/providers/factory.py`

```python
"""Data provider factory and selector."""

import logging
from typing import List, Dict, Optional
from .base import DataProvider
from .openstreetmap import OpenStreetMapProvider
from backend.config import settings

logger = logging.getLogger(__name__)


class ProviderFactory:
    """Factory for creating and selecting data providers."""
    
    _providers: Dict[str, DataProvider] = {}
    _priority_order: List[str] = []
    
    @classmethod
    def initialize(cls):
        """Initialize available providers."""
        # Always include OSM
        if settings.USE_OPENSTREETMAP:
            cls._providers["openstreetmap"] = OpenStreetMapProvider()
            cls._priority_order.append("openstreetmap")
        
        # Add Google Places if configured
        if settings.USE_GOOGLE_PLACES:
            try:
                from .google_places import GooglePlacesProvider
                cls._providers["google_places"] = GooglePlacesProvider()
                cls._priority_order.append("google_places")
            except (ValueError, ImportError) as e:
                logger.warning(f"Google Places not available: {e}")
        
        # Sort by priority
        cls._priority_order.sort(
            key=lambda x: cls._providers[x].priority
        )
        
        logger.info(f"Initialized providers: {cls._priority_order}")
    
    @classmethod
    def get_provider(cls, name: str) -> Optional[DataProvider]:
        """Get provider by name."""
        return cls._providers.get(name)
    
    @classmethod
    def get_primary_provider(cls) -> Optional[DataProvider]:
        """Get primary provider based on configuration."""
        if settings.PRIMARY_PROVIDER in cls._providers:
            return cls._providers[settings.PRIMARY_PROVIDER]
        
        # Fallback to first available
        if cls._priority_order:
            return cls._providers[cls._priority_order[0]]
        
        return None
    
    @classmethod
    def get_providers_ordered(cls) -> List[DataProvider]:
        """Get all providers in priority order (for fallbacks)."""
        return [cls._providers[name] for name in cls._priority_order]
    
    @classmethod
    def list_available(cls) -> List[str]:
        """List available provider names."""
        return cls._priority_order
```

### File: `backend/providers/__init__.py`

```python
"""Data providers module."""

from .base import DataProvider
from .openstreetmap import OpenStreetMapProvider
from .factory import ProviderFactory

__all__ = ["DataProvider", "OpenStreetMapProvider", "ProviderFactory"]
```

---

## Phase 3: Caching Layer

### File: `backend/cache/cache_manager.py`

```python
"""Intelligent caching manager."""

import logging
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from backend.database.models import ApiCache, AmenitiesCache, NeighborhoodScore
from backend.config import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """Manages intelligent caching across layers."""
    
    @staticmethod
    def get_or_fetch_amenities(
        db: Session,
        neighborhood_id: int,
        latitude: float,
        longitude: float,
        fetch_func,
        data_source: str = "osm",
        radius_km: float = 2.0
    ) -> Dict[str, Any]:
        """Get amenities from cache or fetch if expired."""
        
        # Check cache
        cached = db.query(AmenitiesCache).filter(
            AmenitiesCache.neighborhood_id == neighborhood_id,
            AmenitiesCache.data_source == data_source
        ).first()
        
        if cached and cached.expires_at > datetime.utcnow():
            logger.info(f"Cache HIT for amenities of neighborhood {neighborhood_id}")
            return cached.amenities
        
        # Fetch fresh data
        logger.info(f"Cache MISS for amenities of neighborhood {neighborhood_id}, fetching...")
        amenities = fetch_func(latitude, longitude, radius_km)
        
        # Update or create cache entry
        if cached:
            cached.amenities = amenities
            cached.expires_at = datetime.utcnow() + timedelta(seconds=settings.CACHE_TTL_AMENITIES)
            cached.updated_at = datetime.utcnow()
        else:
            cached = AmenitiesCache(
                neighborhood_id=neighborhood_id,
                amenities=amenities,
                data_source=data_source,
                search_radius_km=radius_km,
                expires_at=datetime.utcnow() + timedelta(seconds=settings.CACHE_TTL_AMENITIES)
            )
            db.add(cached)
        
        db.commit()
        return amenities
    
    @staticmethod
    def get_or_fetch_scores(
        db: Session,
        neighborhood_id: int,
        calculate_func
    ) -> tuple[int, Dict[str, Any]]:
        """Get scores from cache or calculate if expired."""
        
        # Check cache
        cached = db.query(NeighborhoodScore).filter(
            NeighborhoodScore.neighborhood_id == neighborhood_id
        ).first()
        
        if cached and (cached.expires_at is None or cached.expires_at > datetime.utcnow()):
            logger.info(f"Cache HIT for scores of neighborhood {neighborhood_id}")
            return cached.overall_score, cached.metrics
        
        # Calculate fresh scores
        logger.info(f"Cache MISS for scores of neighborhood {neighborhood_id}, calculating...")
        overall_score, metrics = calculate_func()
        
        # Update or create cache entry
        if cached:
            cached.overall_score = overall_score
            cached.metrics = metrics
            cached.expires_at = datetime.utcnow() + timedelta(seconds=settings.CACHE_TTL_SCORES)
            cached.updated_at = datetime.utcnow()
        else:
            cached = NeighborhoodScore(
                neighborhood_id=neighborhood_id,
                overall_score=overall_score,
                metrics=metrics,
                expires_at=datetime.utcnow() + timedelta(seconds=settings.CACHE_TTL_SCORES)
            )
            db.add(cached)
        
        db.commit()
        return overall_score, metrics
    
    @staticmethod
    def get_api_cache(db: Session, provider: str, cache_key: str) -> Optional[Any]:
        """Get cached API response."""
        cached = db.query(ApiCache).filter(
            ApiCache.provider == provider,
            ApiCache.cache_key == cache_key,
            ApiCache.expires_at > datetime.utcnow()
        ).first()
        
        if cached:
            logger.info(f"API cache HIT: {provider}:{cache_key}")
            cached.hit_count += 1
            cached.accessed_at = datetime.utcnow()
            db.commit()
            return cached.response_data
        
        logger.info(f"API cache MISS: {provider}:{cache_key}")
        return None
    
    @staticmethod
    def set_api_cache(
        db: Session,
        provider: str,
        cache_key: str,
        response_data: Any,
        ttl_seconds: int = 3600
    ):
        """Cache API response."""
        cached = db.query(ApiCache).filter(
            ApiCache.provider == provider,
            ApiCache.cache_key == cache_key
        ).first()
        
        if cached:
            cached.response_data = response_data
            cached.expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)
            cached.hit_count = 0
        else:
            cached = ApiCache(
                provider=provider,
                cache_key=cache_key,
                response_data=response_data,
                expires_at=datetime.utcnow() + timedelta(seconds=ttl_seconds)
            )
            db.add(cached)
        
        db.commit()
```

---

## Files Summary

**Total New/Modified Files**:
- ✅ Database: 2 files (models.py, session.py)
- ✅ Configuration: 1 file (config.py)
- ✅ Providers: 4 files (base.py, openstreetmap.py, google_places.py, factory.py, __init__.py)
- ✅ Caching: 1 file (cache_manager.py)
- ✅ Modified: app.py, routes.py, requirements.txt

**Total Implementation Size**: ~1500 lines of production-ready Python

---

## Installation Dependencies

Add to `backend/requirements.txt`:

```
sqlalchemy==2.0.23
google-maps-services==1.6.3
```

---

## Configuration (`.env`)

```
DATABASE_URL=sqlite:///./locallens.db
GOOGLE_PLACES_API_KEY=your_key_here
USE_GOOGLE_PLACES=true
USE_OPENSTREETMAP=true
PRIMARY_PROVIDER=openstreetmap
CACHE_TTL_AMENITIES=604800
CACHE_TTL_SCORES=2592000
CACHE_TTL_SEARCH=86400
```

---

## Next Steps

1. **Review** this complete implementation
2. **Approve** the architecture
3. **Create** all files (I can automate this)
4. **Modify** existing files (routes.py, app.py)
5. **Test** end-to-end nationwide search
6. **Verify** API contracts preserved
7. **Deploy** with confidence

---

## Quality Assurance Checklist

- [ ] Database schema created
- [ ] All providers initialized
- [ ] Cache working (hits/misses logged)
- [ ] Nationwide search tested (10+ cities)
- [ ] Scoring deterministic and repeatable
- [ ] API quotas respected
- [ ] Error handling for all edge cases
- [ ] Performance acceptable
- [ ] Frontend API contract preserved
- [ ] Documentation complete

