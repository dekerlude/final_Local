# Backend Architecture Report – LocalLens MVP

**Date:** 2026-07-30  
**Status:** Analysis Complete – Ready for Implementation  
**Author:** Claude Code Analysis  
**Scope:** MVP Features Only (Search, Score, Personalize, Summary)

---

## Executive Summary

This report documents the complete backend architecture required to support the LocalLens frontend. The frontend has been fully implemented with the following major features:

1. **Search Neighborhoods** – Global neighborhood search interface
2. **View Neighborhood Details** – Detailed neighborhood cards with metrics
3. **Personalize Score** – Priority-based personalized scoring (5 factors from 10)
4. **AI Summary** – OpenAI-generated explanations of scores
5. **Neighborhood Comparison** (FUTURE) – Side-by-side comparison
6. **User Profile** (FUTURE) – Settings, saved neighborhoods, search history

The backend must provide:
- **Search API** – Find neighborhoods by name/city
- **Neighborhood Details API** – Overall score + 6 categorical metrics
- **Personalization API** – Weighted score based on user priorities
- **Summary API** – AI-generated explanation of personalized score
- **Database** – PostgreSQL + PostGIS for storing neighborhood data

---

## Part 1: Complete API Contract

### Base URL
```
http://localhost:8000
```

All endpoints return JSON responses with proper HTTP status codes.

---

### 1.1 Search Neighborhoods

**Endpoint:** `GET /api/maps/search`

**Purpose:** Find neighborhoods by name or city (case-insensitive substring match)

**Query Parameters:**
| Parameter | Type | Required | Min Length | Description |
|-----------|------|----------|-----------|-------------|
| `q` | string | Yes | 1 | Search query (neighborhood or city name) |

**Request Example:**
```bash
GET /api/maps/search?q=brooklyn
```

**Response Model (200 OK):**
```typescript
{
  "query": "brooklyn",
  "results": [
    {
      "id": 1,
      "name": "Brooklyn Heights",
      "city": "Brooklyn",
      "state": "NY",
      "latitude": 40.6958,
      "longitude": -73.9911
    }
  ],
  "count": 1
}
```

**Response Fields:**
- `query` (string) – The search query that was submitted
- `results` (array) – List of matching neighborhoods
  - `id` (integer) – Unique neighborhood identifier
  - `name` (string) – Neighborhood name
  - `city` (string) – City name
  - `state` (string) – State abbreviation (e.g., "NY")
  - `latitude` (float) – Geographic latitude
  - `longitude` (float) – Geographic longitude
- `count` (integer) – Number of results returned (should match `results.length`)

**Error Responses:**
- `422 Validation Error` – Missing or invalid `q` parameter
  ```json
  {
    "detail": [
      {
        "loc": ["query", "q"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }
  ```

**Data Guarantees:**
- Case-insensitive substring matching (e.g., "BROOKLYN", "brooklyn", "brooklyn" all match "Brooklyn Heights")
- Returns up to 5 results per search
- Results include all fields needed by frontend
- `count` always equals `len(results)`

**Frontend Usage:**
```typescript
// From src/app/app/page.tsx
const response = await apiClient.get<SearchResponse>("/api/maps/search", {
  params: { q: searchQuery },
});
```

---

### 1.2 Get Neighborhood Details

**Endpoint:** `GET /api/maps/neighborhood/{neighborhood_id}`

**Purpose:** Retrieve full neighborhood data with overall score and 6 category scores

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `neighborhood_id` | integer | Yes | The neighborhood ID from search results |

**Request Example:**
```bash
GET /api/maps/neighborhood/1
```

**Response Model (200 OK):**
```typescript
{
  "id": 1,
  "name": "Brooklyn Heights",
  "city": "Brooklyn",
  "state": "NY",
  "latitude": 40.6958,
  "longitude": -73.9911,
  "population": 35000,
  "area_sqmi": 0.56,
  "overall_score": 72,
  "metrics": [
    {
      "name": "Safety",
      "score": 75,
      "description": "Crime rate and public safety measures"
    },
    {
      "name": "Healthcare",
      "score": 68,
      "description": "Access to hospitals and medical facilities"
    },
    {
      "name": "Education",
      "score": 72,
      "description": "School quality and educational institutions"
    },
    {
      "name": "Connectivity",
      "score": 78,
      "description": "Public transit and traffic conditions"
    },
    {
      "name": "Environment",
      "score": 70,
      "description": "Green spaces and air quality"
    },
    {
      "name": "Infrastructure",
      "score": 68,
      "description": "Roads, utilities, and public services"
    }
  ]
}
```

**Response Fields:**
- `id` (integer) – Neighborhood ID (matches request)
- `name` (string) – Neighborhood name
- `city` (string) – City name
- `state` (string) – State abbreviation
- `latitude` (float) – Geographic latitude
- `longitude` (float) – Geographic longitude
- `population` (integer) – Estimated population
- `area_sqmi` (float) – Area in square miles
- `overall_score` (integer, 0-100) – Average of all 6 metric scores
- `metrics` (array of MetricScore objects) – Exactly 6 items in this order:
  1. Safety
  2. Healthcare
  3. Education
  4. Connectivity
  5. Environment
  6. Infrastructure

**MetricScore Fields:**
- `name` (string) – One of the 6 metric names above
- `score` (integer, 0-100) – Score for this metric
- `description` (string) – Human-readable description of the metric

**Error Responses:**
- `404 Not Found` – Neighborhood ID doesn't exist
  ```json
  {
    "detail": "Neighborhood not found"
  }
  ```

**Data Guarantees:**
- Always returns exactly 6 metrics in the order listed above
- Metrics are ALWAYS in this order (don't randomize or change order)
- `overall_score` = average of all 6 metric scores
- All scores are 0-100 (inclusive)
- Same neighborhood ID always returns same scores (deterministic)
- `population` and `area_sqmi` are realistic estimates

**Frontend Usage:**
```typescript
// From src/app/app/neighborhood/[id]/page.tsx
const response = await apiClient.get<NeighborhoodResponse>(
  `/api/maps/neighborhood/${neighborhoodId}`
);
```

---

### 1.3 Personalize Score

**Endpoint:** `POST /personalize`

**Purpose:** Calculate personalized neighborhood score based on user's 5 selected priorities

**Request Body:**
```typescript
{
  "neighborhood_id": 1,
  "priorities": [
    "Safety & Crime",
    "Schools",
    "Healthcare",
    "Environment & Air Quality",
    "Public Transport"
  ]
}
```

**Request Fields:**
- `neighborhood_id` (integer) – ID from search/neighborhood endpoints
- `priorities` (array of strings) – EXACTLY 5 unique priority strings

**Valid Priority Values (must use exactly these strings):**
1. "Safety & Crime"
2. "Environment & Air Quality"
3. "Public Transport"
4. "Basic Amenities"
5. "Schools"
6. "Healthcare"
7. "Affordability"
8. "Nightlife"
9. "Parks & Recreation"
10. "Traffic & Commute"

**Response Model (200 OK):**
```typescript
{
  "personalizedScore": 74.5,
  "factorBreakdown": {
    "Safety & Crime": 75,
    "Environment & Air Quality": 70,
    "Public Transport": 78,
    "Basic Amenities": 50,
    "Schools": 72,
    "Healthcare": 68,
    "Affordability": 50,
    "Nightlife": 50,
    "Parks & Recreation": 70,
    "Traffic & Commute": 22  // Inverse of connectivity
  },
  "strongestFactors": [
    "Public Transport",
    "Safety & Crime",
    "Schools"
  ],
  "weakestFactors": [
    "Traffic & Commute",
    "Basic Amenities",
    "Affordability"
  ]
}
```

**Response Fields:**
- `personalizedScore` (float) – Weighted score (0-100) based on priorities
- `factorBreakdown` (object) – Score for ALL 10 factors
  - Each key is a valid priority string
  - Each value is 0-100
  - Includes ALL 10 factors, not just selected 5
- `strongestFactors` (array of 3 strings) – Top 3 factors by score
- `weakestFactors` (array of 3 strings) – Bottom 3 factors by score

**Scoring Algorithm:**
1. User selects 5 priorities in order (ranked 1-5)
2. Assign weights: rank 1=10, 2=8, 3=6, 4=4, 5=2
3. Unselected factors get weight 1
4. Normalize weights to sum to 1.0
5. Calculate weighted average: `personalizedScore = Σ(factor_score × weight)`
6. Return all 10 factor scores (not just selected 5)
7. Identify top 3 and bottom 3 factors by score

**Error Responses:**
- `400 Bad Request` – Invalid priorities
  ```json
  {
    "detail": "Exactly 5 priorities must be selected"
  }
  ```
- `404 Not Found` – Neighborhood not found
  ```json
  {
    "detail": "Neighborhood not found"
  }
  ```

**Frontend Usage:**
```typescript
// From src/app/personalize/page.tsx
const response = await apiClient.post('/personalize', {
  neighborhood_id: parseInt(neighborhoodId!),
  priorities,
});
```

---

### 1.4 Generate AI Summary

**Endpoint:** `POST /summary`

**Purpose:** Generate AI-powered explanation of personalized neighborhood score

**Request Body:**
```typescript
{
  "neighborhood_id": 1,
  "priorities": [
    "Safety & Crime",
    "Schools",
    "Healthcare",
    "Environment & Air Quality",
    "Public Transport"
  ],
  "personalizedScore": 74.5,
  "factorBreakdown": {
    "Safety & Crime": 75,
    "Environment & Air Quality": 70,
    "Public Transport": 78,
    "Basic Amenities": 50,
    "Schools": 72,
    "Healthcare": 68,
    "Affordability": 50,
    "Nightlife": 50,
    "Parks & Recreation": 70,
    "Traffic & Commute": 22
  }
}
```

**Request Fields:**
- `neighborhood_id` (integer) – Neighborhood being evaluated
- `priorities` (array) – User's 5 selected priorities
- `personalizedScore` (float) – Score from personalization endpoint
- `factorBreakdown` (object) – All 10 factor scores from personalization endpoint

**Response Model (200 OK):**
```typescript
{
  "summary": "Brooklyn Heights is an excellent match for those prioritizing safety and education. The neighborhood excels in public transportation and school quality, making it ideal for families. However, traffic congestion and limited affordability may be considerations. Overall, this community offers strong infrastructure and connectivity for professionals and families alike."
}
```

**Response Fields:**
- `summary` (string) – AI-generated explanation (150-300 words)

**Summary Content Requirements:**
The AI summary must:
1. Explain how the neighborhood aligns with user's stated priorities
2. Discuss why strongest factors matter for their needs
3. Acknowledge trade-offs (weakest factors)
4. Suggest what type of person/lifestyle would thrive there
5. Provide practical observations

**AI Constraints:**
- ONLY explain provided data (never invent statistics)
- NEVER generate or estimate scores
- NEVER make claims about data not provided
- Focus on interpretation using ONLY provided numbers
- Keep tone balanced and helpful
- Length: 150-300 words

**Error Responses:**
- `400 Bad Request` – Missing required fields
- `404 Not Found` – Neighborhood not found
- `500 Internal Server Error` – OpenAI API failure (fallback with generic message)

**Frontend Usage:**
```typescript
// From src/app/personalize/page.tsx
const response = await apiClient.post('/summary', {
  neighborhood_id: parseInt(neighborhoodId!),
  priorities,
  personalizedScore: result.personalizedScore,
  factorBreakdown: result.factorBreakdown,
});
```

---

### 1.5 Health Check

**Endpoint:** `GET /health`

**Purpose:** Simple health check to verify backend is running

**Response Model (200 OK):**
```typescript
{
  "status": "ok"
}
```

---

## Part 2: Frontend to Backend Data Flow

### 2.1 Complete User Workflow

```
1. User opens app at /app
   └─> No API calls yet (just UI rendering)

2. User types in search box
   └─> GET /api/maps/search?q={query}
   └─> Frontend receives list of neighborhoods
   └─> Display in dropdown

3. User clicks on neighborhood from search results
   └─> Navigate to /app/neighborhood/{id}
   └─> GET /api/maps/neighborhood/{id}
   └─> Frontend displays:
       - Neighborhood name, city, state
       - Overall score
       - 6 metric cards with scores
       - "Personalize My Score" button

4. User clicks "Personalize My Score"
   └─> Navigate to /app/personalize?neighborhoodId={id}
   └─> Display priority selector (5 of 10)
   └─> No API call yet (just UI state)

5. User selects 5 priorities in order
   └─> POST /personalize
   └─> Request: { neighborhood_id, priorities }
   └─> Response: personalizedScore, factorBreakdown, strongestFactors, weakestFactors
   └─> Frontend displays:
       - New personalized score
       - Strengths (top 3 factors)
       - Trade-offs (bottom 3 factors)

6. (Optional) User clicks "Generate AI Insight"
   └─> POST /summary
   └─> Request: { neighborhood_id, priorities, personalizedScore, factorBreakdown }
   └─> Response: { summary }
   └─> Frontend displays AI-generated explanation

7. (FUTURE) User navigates to /app/compare
   └─> Compare two neighborhoods with profile selection
   └─> Currently uses mock data

8. (FUTURE) User navigates to /app/profile
   └─> View saved neighborhoods
   └─> View search history
   └─> Manage preferences
   └─> Currently uses mock data
```

---

## Part 3: Complete Data Model

### 3.1 Data Entities

#### Neighborhood
- `id` (integer, PK) – Unique identifier
- `name` (string) – Neighborhood name
- `city` (string) – City name
- `state` (string) – State abbreviation
- `country` (string) – Country (default: "USA")
- `latitude` (numeric 10,8) – Geographic latitude
- `longitude` (numeric 11,8) – Geographic longitude
- `geom` (PostGIS Point, SRID 4326) – Geographic point (derived from lat/lon)
- `created_at` (datetime) – Record creation time
- `updated_at` (datetime) – Last update time

#### Score
- `id` (integer, PK) – Unique identifier
- `neighborhood_id` (integer, FK) – Reference to Neighborhood
- `overall_score` (numeric 3,1) – Average of all 6 metric scores (0-100)
- `safety_score` (numeric 3,1) – Safety metric (0-100)
- `connectivity_score` (numeric 3,1) – Connectivity/Transport metric (0-100)
- `healthcare_score` (numeric 3,1) – Healthcare metric (0-100)
- `education_score` (numeric 3,1) – Education metric (0-100)
- `environment_score` (numeric 3,1) – Environment metric (0-100)
- `infrastructure_score` (numeric 3,1) – Infrastructure metric (0-100)
- `data_source` (string) – Source of data (e.g., "mock", "census", "api")
- `last_updated` (datetime) – When scores were last calculated
- `created_at` (datetime) – Record creation time

**Note:** The personalization system handles mapping from 6 database metrics to 10 priority factors in backend/services/scoring.py

### 3.2 Factor Mapping (Database → Priority System)

The personalization system maps 6 database metrics to 10 user-facing priority factors:

| Database Field | Metric Name | Priority Factor | Note |
|---|---|---|---|
| safety_score | Safety | "Safety & Crime" | Direct |
| education_score | Education | "Schools" | Direct |
| healthcare_score | Healthcare | "Healthcare" | Direct |
| connectivity_score | Connectivity | "Public Transport" | Direct mapping |
| connectivity_score | Connectivity | "Traffic & Commute" | Inverse (100 - connectivity_score) |
| environment_score | Environment | "Environment & Air Quality" | Direct |
| environment_score | Environment | "Parks & Recreation" | Derived from environment |
| infrastructure_score | Infrastructure | "Basic Amenities" | Derived from infrastructure |
| (new field needed) | Affordability | "Affordability" | Currently mock (50) |
| (new field needed) | Nightlife | "Nightlife" | Currently mock (50) |

**Current Issue:** The personalization endpoint in `backend/routes/personalize.py` is trying to map these but has TODOs for missing fields.

---

## Part 4: Current Backend Implementation Status

### 4.1 What's Already Built

✅ **Core FastAPI Setup**
- `backend/app.py` – FastAPI application with CORS, routers, health check
- Routes registered and ready

✅ **Maps/Search Module**
- `backend/maps/routes.py` – Search and neighborhood endpoints (working)
- `backend/maps/models.py` – Pydantic response models
- `backend/maps/scoring.py` – Mock scoring algorithm
- `backend/maps/data/neighborhoods.json` – Mock data file

✅ **Personalization Routes**
- `backend/routes/personalize.py` – Personalization endpoint (partially working)
- `backend/routes/summary.py` – Summary endpoint (partially working)

✅ **AI Service**
- `backend/services/ai.py` – OpenAI integration with proper constraints
- `backend/services/personalization.py` – Wrapper for personalization logic
- `backend/services/scoring.py` – Personalized scoring algorithm

✅ **Database Setup**
- `backend/database/models.py` – SQLAlchemy ORM models (Neighborhood, Score)
- `backend/database/connection.py` – Database connection pooling
- `backend/database/schema.sql` – PostgreSQL schema with PostGIS

✅ **Schemas**
- `backend/schemas/neighborhood.py` – Pydantic request/response models

### 4.2 What's Missing or Incomplete

❌ **Personalization Service Issues**
- Maps 6 database metrics to 10 priority factors
- Missing 4 factor scores (Affordability, Nightlife, Basic Amenities, Parks & Recreation)
- Uses mock values (50) for unmapped factors
- Needs database extensions to support all 10 factors

❌ **Database Data**
- Schema exists but no actual neighborhood data
- Mock data in JSON file is used instead of database
- Need to populate neighborhoods and scores tables

❌ **Live Data Services**
- `backend/maps/services/live_data.py` – Partially implemented
- Mapbox integration for geocoding not fully tested
- Fallback logic for when live data unavailable

❌ **Error Handling**
- Limited validation on inputs
- Inconsistent error messages
- No rate limiting or request throttling

---

## Part 5: Recommended Architecture

### 5.1 Directory Structure

```
backend/
├── app.py                           # Main FastAPI application
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
│
├── config/
│   ├── __init__.py
│   ├── settings.py                  # Configuration management (database URL, API keys, etc.)
│   └── logging.py                   # Logging configuration
│
├── database/
│   ├── __init__.py
│   ├── connection.py                # SQLAlchemy engine and session factory
│   ├── models.py                    # SQLAlchemy ORM models
│   └── schema.sql                   # PostgreSQL schema definition
│
├── schemas/
│   ├── __init__.py
│   ├── neighborhood.py              # Pydantic models for requests/responses
│   └── base.py                      # Base schema classes (optional)
│
├── routes/
│   ├── __init__.py
│   ├── search.py                    # Search endpoints
│   ├── neighborhood.py              # Neighborhood detail endpoints
│   ├── personalize.py               # Personalization endpoints
│   └── summary.py                   # AI summary endpoints
│
├── services/
│   ├── __init__.py
│   ├── scoring.py                   # Scoring algorithm (personalization)
│   ├── ai.py                        # OpenAI integration
│   ├── personalization.py           # Personalization business logic
│   ├── data_loading.py              # Neighborhood data loading/caching
│   └── mapbox.py                    # Mapbox geocoding service
│
├── repositories/
│   ├── __init__.py
│   ├── neighborhood.py              # Neighborhood queries
│   ├── score.py                     # Score queries
│   └── base.py                      # Base repository pattern
│
├── middleware/
│   ├── __init__.py
│   ├── error_handler.py             # Global error handling
│   └── request_logging.py           # Request/response logging
│
├── utils/
│   ├── __init__.py
│   ├── validators.py                # Input validation helpers
│   ├── exceptions.py                # Custom exception classes
│   └── constants.py                 # Magic numbers, factor mappings
│
├── data/
│   ├── neighborhoods.json           # Mock data (or seed data)
│   └── seed_script.py               # Script to populate database
│
└── tests/
    ├── __init__.py
    ├── conftest.py                  # Pytest configuration
    ├── test_search.py               # Search endpoint tests
    ├── test_neighborhood.py         # Neighborhood endpoint tests
    ├── test_personalize.py          # Personalization tests
    └── test_summary.py              # Summary generation tests
```

---

## Part 6: Core Implementation Requirements

### 6.1 Scoring Algorithm (CRITICAL)

**Current Implementation Location:** `backend/services/scoring.py`

**Algorithm Overview:**
```
1. Input: neighborhood_metrics (6 scores), priorities (5 strings)

2. Create weight mapping:
   - Rank 1 priority → weight 10
   - Rank 2 priority → weight 8
   - Rank 3 priority → weight 6
   - Rank 4 priority → weight 4
   - Rank 5 priority → weight 2
   - Unselected priorities → weight 1

3. Normalize weights:
   total_weight = sum(all weights)
   normalized_weight[i] = weight[i] / total_weight

4. Calculate personalized score:
   personalizedScore = Σ (factor_score[i] * normalized_weight[i])

5. Return:
   - personalizedScore (rounded to 1 decimal)
   - All 10 factor scores
   - Top 3 factors (by score)
   - Bottom 3 factors (by score)
```

**Example Calculation:**
```
Neighborhood: Brooklyn Heights
Metrics: safety=75, connectivity=78, healthcare=68, education=72, environment=70, infrastructure=68

User Priorities (in order):
1. Safety & Crime (weight=10)
2. Schools (weight=8)
3. Healthcare (weight=6)
4. Environment & Air Quality (weight=4)
5. Public Transport (weight=2)

Factor Mapping:
"Safety & Crime" → safety=75
"Schools" → education=72
"Healthcare" → healthcare=68
"Environment & Air Quality" → environment=70
"Public Transport" → connectivity=78
"Traffic & Commute" → 100-connectivity=22
"Basic Amenities" → infrastructure=68 (default)
"Affordability" → 50 (default)
"Nightlife" → 50 (default)
"Parks & Recreation" → environment=70 (default)

Weights:
safety_weight = 10, education_weight = 8, healthcare_weight = 6, environment_weight = 4, connectivity_weight = 2, others = 1 each
total = 10 + 8 + 6 + 4 + 2 + 1 + 1 + 1 + 1 + 1 = 35

Normalized weights:
safety: 10/35=0.286, education: 8/35=0.229, healthcare: 6/35=0.171, environment: 4/35=0.114, connectivity: 2/35=0.057, others: 1/35=0.029

personalizedScore = (75*0.286) + (72*0.229) + (68*0.171) + (70*0.114) + (78*0.057) + (22*0.057) + (68*0.029) + (50*0.029) + (50*0.029) + (70*0.029)
                 = 21.45 + 16.49 + 11.63 + 7.98 + 4.45 + 1.25 + 1.97 + 1.45 + 1.45 + 2.03
                 = 70.15
```

---

## Part 7: Database Setup

### 7.1 PostgreSQL + PostGIS Schema

**Required Extensions:**
- PostGIS (for geographic queries)

**Tables:**
```sql
-- neighborhoods table
CREATE TABLE neighborhoods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  country VARCHAR(255) DEFAULT 'USA',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  population INTEGER,
  area_sqmi DECIMAL(8, 2),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, city, state)
);
CREATE INDEX idx_neighborhoods_geom ON neighborhoods USING GIST(geom);
CREATE INDEX idx_neighborhoods_name ON neighborhoods(name);
CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);

-- scores table
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  neighborhood_id INTEGER NOT NULL UNIQUE REFERENCES neighborhoods(id) ON DELETE CASCADE,
  overall_score DECIMAL(3, 1) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  safety_score DECIMAL(3, 1) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 100),
  connectivity_score DECIMAL(3, 1) NOT NULL CHECK (connectivity_score >= 0 AND connectivity_score <= 100),
  healthcare_score DECIMAL(3, 1) NOT NULL CHECK (healthcare_score >= 0 AND healthcare_score <= 100),
  education_score DECIMAL(3, 1) NOT NULL CHECK (education_score >= 0 AND education_score <= 100),
  environment_score DECIMAL(3, 1) NOT NULL CHECK (environment_score >= 0 AND environment_score <= 100),
  infrastructure_score DECIMAL(3, 1) NOT NULL CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
  data_source VARCHAR(255),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_scores_neighborhood_id ON scores(neighborhood_id);
```

**Notes:**
- Scores table has UNIQUE constraint on neighborhood_id (1:1 relationship)
- All score columns are DECIMAL(3,1) to allow .5 values
- PostGIS geometry column for future geographic queries
- Indexes on commonly queried fields

### 7.2 Sample Data

The backend needs at least 5-10 neighborhoods with complete score data:

```sql
INSERT INTO neighborhoods (name, city, state, latitude, longitude, population, area_sqmi)
VALUES
  ('Brooklyn Heights', 'Brooklyn', 'NY', 40.6958, -73.9911, 35000, 0.56),
  ('Williamsburg', 'Brooklyn', 'NY', 40.7081, -73.9570, 60000, 1.2),
  ('Park Slope', 'Brooklyn', 'NY', 40.6628, -73.9776, 75000, 1.4),
  ('Astoria', 'Queens', 'NY', 40.7614, -73.9776, 100000, 2.1),
  ('Lower East Side', 'Manhattan', 'NY', 40.7150, -73.9859, 80000, 1.8),
  ('San Francisco Mission District', 'San Francisco', 'CA', 37.7599, -122.4148, 90000, 1.5),
  ('Oakland Lake Merritt', 'Oakland', 'CA', 37.8044, -122.2712, 65000, 1.2);

INSERT INTO scores (neighborhood_id, overall_score, safety_score, connectivity_score, healthcare_score, education_score, environment_score, infrastructure_score, data_source)
SELECT id, 72, 75, 78, 68, 72, 70, 68, 'mock'
FROM neighborhoods
WHERE name = 'Brooklyn Heights';
-- Repeat for other neighborhoods with varied scores
```

---

## Part 8: API Implementation Checklist

### 8.1 Search Endpoint (`GET /api/maps/search`)

**Implementation Checklist:**
- [ ] Accept `q` query parameter (required, min length 1)
- [ ] Perform case-insensitive substring matching on neighborhood name and city
- [ ] Return max 5 results
- [ ] Return SearchResponse with query, results, count
- [ ] Handle empty results gracefully
- [ ] Validate query parameter (422 on missing)

**Code Location:** `backend/routes/search.py` or `backend/maps/routes.py`

**Dependencies:**
- SQLAlchemy ORM (query neighborhoods)
- Pydantic (response validation)

---

### 8.2 Neighborhood Detail Endpoint (`GET /api/maps/neighborhood/{neighborhood_id}`)

**Implementation Checklist:**
- [ ] Accept neighborhood_id path parameter (integer)
- [ ] Query Neighborhood and Score tables
- [ ] Return NeighborhoodResponse with all required fields
- [ ] Ensure metrics are in correct order (Safety, Healthcare, Education, Connectivity, Environment, Infrastructure)
- [ ] Calculate overall_score as average of 6 metrics
- [ ] Return 404 if neighborhood not found
- [ ] Include population and area_sqmi

**Code Location:** `backend/maps/routes.py`

**Dependencies:**
- SQLAlchemy ORM
- Pydantic response models

---

### 8.3 Personalization Endpoint (`POST /personalize`)

**Implementation Checklist:**
- [ ] Accept POST request with neighborhood_id and priorities
- [ ] Validate exactly 5 unique priorities
- [ ] Validate priorities are from valid set (10 total)
- [ ] Fetch neighborhood scores from database
- [ ] Map 6 database metrics to 10 priority factors
- [ ] Calculate personalized score using algorithm in Part 6.1
- [ ] Return PersonalizedScoreResponse
- [ ] Include all 10 factor scores in factorBreakdown
- [ ] Identify top 3 and bottom 3 factors
- [ ] Handle 404 if neighborhood not found
- [ ] Handle validation errors (400)

**Code Location:** `backend/routes/personalize.py`

**Dependencies:**
- `backend/services/scoring.py` (algorithm)
- SQLAlchemy ORM
- Pydantic validation

---

### 8.4 Summary Endpoint (`POST /summary`)

**Implementation Checklist:**
- [ ] Accept POST request with full personalization data
- [ ] Validate all required fields present
- [ ] Call OpenAI API with proper constraints
- [ ] Format factor_breakdown as readable text for prompt
- [ ] Return AISummaryResponse with summary text
- [ ] Implement fallback for OpenAI failures
- [ ] Handle 404 if neighborhood not found
- [ ] Limit summary length to 300 tokens

**Code Location:** `backend/routes/summary.py`

**Dependencies:**
- `backend/services/ai.py` (OpenAI integration)
- OpenAI API key in environment
- SQLAlchemy ORM

---

## Part 9: Frontend-Backend Integration Points

### 9.1 API Client Configuration

**Frontend Configuration:** `src/lib/api.ts`

```typescript
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**Environment Variables Needed:**
- Frontend: `NEXT_PUBLIC_API_URL` – Backend URL (default: http://localhost:8000)
- Backend: `OPENAI_API_KEY` – OpenAI API key
- Backend: `DATABASE_URL` – PostgreSQL connection string

### 9.2 CORS Configuration

**Already Configured in `backend/app.py`:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Note:** This allows all origins. For production, restrict to specific frontend URLs.

### 9.3 Error Handling Contract

**Frontend Expects:**
- Proper HTTP status codes (200, 400, 404, 500)
- JSON error responses with `detail` field
- Clear error messages for validation failures
- Graceful fallbacks for AI failures (don't crash, show generic message)

**Example Error Response (400):**
```json
{
  "detail": "Exactly 5 priorities must be selected"
}
```

---

## Part 10: Data Guarantees and Constraints

### 10.1 Immutable Guarantees

The following MUST be guaranteed by the backend:

1. **Search Results:**
   - Case-insensitive substring matching
   - Max 5 results per query
   - Same query always returns same results (deterministic)
   - All required fields populated

2. **Neighborhood Metrics:**
   - Always exactly 6 metrics
   - Always in same order: Safety, Healthcare, Education, Connectivity, Environment, Infrastructure
   - Same neighborhood ID always returns same metrics
   - All scores 0-100

3. **Personalization:**
   - Input: exactly 5 unique priorities
   - Output: all 10 factor scores (not just selected 5)
   - Deterministic: same input always produces same output

4. **AI Summary:**
   - Only explains provided data (never invents stats)
   - Never generates scores or percentages
   - 150-300 words
   - Falls back gracefully on API failure

---

## Part 11: Testing Strategy

### 11.1 Unit Tests Required

```python
# test_scoring.py
def test_calculate_personalized_score():
    """Test scoring algorithm with known inputs/outputs"""

# test_search.py
def test_search_case_insensitive():
    """Test case-insensitive substring matching"""

def test_search_max_5_results():
    """Test max 5 results returned"""

# test_personalization.py
def test_exact_5_priorities_required():
    """Test validation of exactly 5 priorities"""

def test_factor_mapping():
    """Test 6 database metrics → 10 priority factors"""
```

### 11.2 Integration Tests Required

```python
# test_api_integration.py
def test_search_to_neighborhood_workflow():
    """Test full workflow: search → neighborhood detail"""

def test_neighborhood_to_personalize_workflow():
    """Test full workflow: neighborhood → personalization"""

def test_personalize_to_summary_workflow():
    """Test full workflow: personalization → AI summary"""
```

### 11.3 Manual Testing Checklist

- [ ] Search for "Brooklyn" – verify results appear
- [ ] Click neighborhood – verify details load
- [ ] Select 5 priorities – verify personalized score changes
- [ ] Check AI summary – verify it explains the score
- [ ] Test with different neighborhood IDs (1-7)
- [ ] Test with all 10 priority combinations
- [ ] Verify error handling (missing neighborhood, invalid priorities)

---

## Part 12: Deployment Configuration

### 12.1 Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/locallens
OPENAI_API_KEY=sk-...
LOG_LEVEL=INFO
ENVIRONMENT=development
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 12.2 Startup Checklist

1. [ ] PostgreSQL database created
2. [ ] PostGIS extension installed
3. [ ] Schema migrations applied
4. [ ] Sample data loaded
5. [ ] Environment variables configured
6. [ ] FastAPI server starts on port 8000
7. [ ] Health check endpoint returns 200
8. [ ] CORS allows frontend domain
9. [ ] OpenAI API key valid and has quota
10. [ ] Frontend can connect to backend

---

## Part 13: Future Expansion Points (NOT MVP)

These features are referenced in the frontend but not required for MVP:

### 13.1 Neighborhood Comparison (`/app/compare`)
- Compare 2 neighborhoods side-by-side
- Personalized comparison based on profile
- Category breakdowns
- Export to CSV
- Share comparison

**Backend Requirements:**
- No new endpoints needed (uses existing endpoints)
- Frontend orchestrates comparison logic

### 13.2 User Profile (`/app/profile`)
- Saved neighborhoods
- Search history
- User preferences
- Theme settings
- Account settings

**Backend Requirements:**
- New User table
- New SavedNeighborhood table
- New UserPreferences table
- New API endpoints (POST/GET /users, /saved-neighborhoods, etc.)

### 13.3 Geospatial Search
- Search neighborhoods near a location
- Search within radius
- Map visualization

**Backend Requirements:**
- Use PostGIS geometry functions
- Distance-based search endpoints
- Map tile server integration

---

## Part 14: Success Criteria

The backend is complete and ready for integration when:

✅ **API Contracts**
- [ ] All 4 endpoints implemented and return correct schema
- [ ] All error cases handled (400, 404, 500)
- [ ] CORS headers configured

✅ **Data Quality**
- [ ] At least 7 neighborhoods with complete score data
- [ ] All scores deterministic and consistent
- [ ] Database schema enforces constraints

✅ **Personalization**
- [ ] Scoring algorithm produces 0-100 scores
- [ ] All 10 factors included in response
- [ ] Top 3 and bottom 3 factors correct

✅ **AI Integration**
- [ ] OpenAI integration working
- [ ] Fallback for API failures implemented
- [ ] Summaries explain provided data only

✅ **Performance**
- [ ] Search completes in <1 second
- [ ] Neighborhood detail loads in <1 second
- [ ] Personalization calculates in <500ms
- [ ] AI summary generates in <5 seconds

✅ **Testing**
- [ ] Unit tests for scoring algorithm
- [ ] Integration tests for full workflow
- [ ] Manual testing of all major flows

---

## Part 15: Implementation Priority

### Phase 1 (CRITICAL - Do First)
1. Set up PostgreSQL + PostGIS
2. Implement `/api/maps/search` endpoint
3. Implement `/api/maps/neighborhood/{id}` endpoint
4. Load sample data
5. Test search → neighborhood workflow

### Phase 2 (CRITICAL - Do Second)
1. Implement `/personalize` endpoint
2. Verify scoring algorithm
3. Test personalization workflow
4. Test with all priority combinations

### Phase 3 (CRITICAL - Do Third)
1. Implement `/summary` endpoint
2. Set up OpenAI integration
3. Test AI summary generation
4. Implement fallback for API failures

### Phase 4 (OPTIONAL - Polish)
1. Add comprehensive error handling
2. Add request logging
3. Add database migrations
4. Performance optimization
5. Unit and integration tests

---

## Appendix A: Type Definitions Summary

### Frontend Type Definitions (for reference)

```typescript
// src/types/api.ts
export interface SearchResponse {
  query: string
  results: NeighborhoodBasic[]
  count: number
}

export interface NeighborhoodBasic {
  id: number
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
}

export interface NeighborhoodResponse {
  id: number
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
  population: number
  area_sqmi: number
  overall_score: number
  metrics: MetricScore[]
}

export interface MetricScore {
  name: string
  score: number
  description: string
}

export interface PersonalizationRequest {
  neighborhood_id: number
  priorities: string[]
}

export interface PersonalizedScoreResponse {
  personalizedScore: number
  factorBreakdown: Record<string, number>
  strongestFactors: string[]
  weakestFactors: string[]
}

export interface AISummaryRequest {
  neighborhood_id: number
  priorities: string[]
  personalizedScore: number
  factorBreakdown: Record<string, number>
}

export interface AISummaryResponse {
  summary: string
}
```

---

## Appendix B: Priority Factors Reference

**All 10 Valid Priority Factors:**

1. **Safety & Crime** – Maps to: `safety_score`
2. **Environment & Air Quality** – Maps to: `environment_score`
3. **Public Transport** – Maps to: `connectivity_score`
4. **Basic Amenities** – Maps to: `infrastructure_score` (derived)
5. **Schools** – Maps to: `education_score`
6. **Healthcare** – Maps to: `healthcare_score`
7. **Affordability** – Maps to: NEW FIELD NEEDED (currently 50)
8. **Nightlife** – Maps to: NEW FIELD NEEDED (currently 50)
9. **Parks & Recreation** – Maps to: `environment_score` (derived)
10. **Traffic & Commute** – Maps to: `100 - connectivity_score` (inverse)

---

## Appendix C: Backend Implementation Roadmap

```
Week 1:
├─ Day 1-2: Database setup + schema creation
├─ Day 3-4: Search endpoint implementation
├─ Day 5: Neighborhood detail endpoint

Week 2:
├─ Day 1-2: Personalization endpoint
├─ Day 3-4: AI summary endpoint + OpenAI integration
├─ Day 5: Error handling + validation

Week 3:
├─ Day 1-2: Unit testing
├─ Day 3-4: Integration testing
├─ Day 5: Documentation + deployment prep
```

---

## Summary

This report provides everything needed to implement the LocalLens backend without looking at the frontend again. The backend engineer should:

1. **Read Part 1** – Understand the complete API contract
2. **Follow Part 2** – Understand data flow
3. **Implement Part 5** – Recommended architecture
4. **Execute Part 6** – Scoring algorithm
5. **Build Part 7** – Database schema
6. **Implement Part 8** – Endpoints in order
7. **Test with Part 11** – Verify correctness
8. **Deploy using Part 12** – Configuration and startup

The frontend is ready. The backend is ready to be built. The specifications are complete and unambiguous.

---

**Report Generated:** 2026-07-30  
**Status:** ✅ Complete and Ready for Implementation  
**Next Step:** Backend engineer begins implementation using this report as the sole reference
