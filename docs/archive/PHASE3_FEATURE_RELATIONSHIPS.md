# PHASE 3: FEATURE RELATIONSHIPS & DATA FLOWS

## COMPLETE MVP WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│ LANDING PAGE (/app/page.tsx)                               │
│ - Hero section, features, CTA                              │
│ [Get Started] → /app/app                                   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD (/app/app/page.tsx)                              │
│ - Search neighborhoods                                      │
│ - Browse recent searches                                    │
│ API: GET /api/maps/search?q=<query>                        │
│ [Click neighborhood] → /app/app/neighborhood/[id]          │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ NEIGHBORHOOD DETAIL (/app/app/neighborhood/[id])           │
│ - Display full neighborhood profile                         │
│ - Show overall score and metrics                            │
│ API: GET /api/maps/neighborhood/{id}                       │
│ [Personalize My Score] → /app/personalize?neighborhoodId   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ PERSONALIZATION (/app/personalize/page.tsx)                │
│ - Select 5 priorities (drag-drop)                          │
│ API: POST /personalize                                     │
│ API: POST /summary                                         │
│ Output: Score, factors, AI summary                         │
│ [Continue] → /app/summary or stay on page                  │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ SUMMARY (/app/summary/page.tsx)                            │
│ - Display personalized score                               │
│ - Display AI-generated explanation                         │
│ [New Search] → /app/app                                    │
└─────────────────────────────────────────────────────────────┘
```

## SECONDARY FEATURES

### Compare Feature
```
From Dashboard: Select 2+ neighborhoods
[Compare] → /app/app/compare
    ↓
Display side-by-side comparison
API: GET /api/maps/neighborhood/{id} for each
    ↓
[Personalize for X] → /app/personalize?neighborhoodId=X
```

### Profile Feature
```
From Header: [Profile] → /app/app/profile
    ↓
Settings (theme, preferences)
Search history (from localStorage)
Saved neighborhoods (from localStorage)
    ↓
[View saved] → /app/app/neighborhood/[id]
```

---

## CURRENT INTEGRATION STATUS

### ✅ FULLY CONNECTED
- Personalization page: Calls /personalize and /summary
- Error handling: Works properly
- Loading states: Implemented

### ⚠️ PARTIALLY CONNECTED
- Landing page: UI complete, navigation might not be wired
- Profile: Uses localStorage only (no API needed)

### ❌ NOT CONNECTED (Uses Demo Data)
- Dashboard: Uses DEMO_NEIGHBORHOODS instead of API
- Neighborhood Detail: Uses hardcoded data
- Compare: Uses demo data
- ALL pages: Cannot search real neighborhoods

---

## API ENDPOINTS AVAILABLE

### Maps Module (backend/maps/routes.py)
```
✅ GET /api/maps/search?q=<query>
   Returns: { query, results[], count }
   
✅ GET /api/maps/neighborhood/{id}
   Returns: { id, name, city, state, lat, lon, scores, metrics[] }
   
Status: IMPLEMENTED but NOT REGISTERED in app.py
```

### Personalization (backend/routes/)
```
✅ POST /personalize
   Input: { neighborhood_id, priorities[] }
   Returns: { personalizedScore, factorBreakdown{}, strongestFactors[], weakestFactors[] }
   
✅ POST /summary
   Input: { neighborhood_id, priorities[], personalizedScore, factorBreakdown{} }
   Returns: { summary: "AI-generated text" }
   
Status: IMPLEMENTED and REGISTERED
```

### Health Check
```
✅ GET /health
   Returns: { status: "ok" }
   Status: IMPLEMENTED and REGISTERED
```

---

## INTEGRATION BLOCKERS

### 🔴 BLOCKER #1: Maps Router Not Registered
- Location: backend/app.py
- Issue: Maps routes exist but not imported
- Impact: All map endpoints return 404
- Fix: 2 minutes

### 🔴 BLOCKER #2: Frontend Uses Demo Data
- Location: src/constants/demo-data.ts
- Issue: All pages hardcode neighborhoods
- Impact: Can't search real neighborhoods
- Fix: 2-3 hours

### 🟡 ISSUE #1: Missing API TypeScript Types
- Issue: Frontend lacks types for responses
- Impact: No type safety on API calls
- Fix: 30 minutes

### 🟡 ISSUE #2: Navigation Not Fully Wired
- Issue: Some page transitions undefined
- Impact: Can't navigate between pages
- Fix: 30 minutes

---

## FEATURE DEPENDENCY MAP

```
LANDING PAGE
  └─ No dependencies
  
DASHBOARD
  ├─ Dependency: GET /api/maps/search
  ├─ Uses: useLocalStorage (search history)
  └─ Exports: selectedNeighborhoodId → Neighborhood Detail

NEIGHBORHOOD DETAIL
  ├─ Dependency: GET /api/maps/neighborhood/{id}
  ├─ Uses: useLocalStorage (save to profile)
  └─ Exports: neighborhood, scores → Personalization

PERSONALIZATION
  ├─ Dependency: POST /personalize
  ├─ Dependency: POST /summary
  └─ Exports: personalizedScore, summary → Summary

COMPARE
  ├─ Dependency: GET /api/maps/neighborhood/{id} (per neighborhood)
  └─ Exports: comparison results → can navigate to Personalization

PROFILE
  ├─ Dependency: useLocalStorage (read from)
  ├─ Uses: Saved neighborhoods → Neighborhood Detail
  └─ Uses: Search history → can navigate to Neighborhood Detail
```

---

## INTEGRATION SEQUENCE

### Step 1: Fix Critical Blocker (10 min)
Register maps router in backend/app.py

### Step 2: Add TypeScript Types (30 min)
Create interfaces for API responses

### Step 3: Connect Dashboard to Search API (45 min)
Replace demo data with real API calls

### Step 4: Connect Neighborhood Detail to API (45 min)
Fetch neighborhood data from backend

### Step 5: Connect Compare to APIs (30 min)
Fetch data for each selected neighborhood

### Step 6: Wire Navigation (30 min)
Ensure all page transitions work

### Step 7: Test Complete Flow (45 min)
Search → Detail → Personalize → Summary

### Step 8: Error Handling (30 min)
Handle API failures, missing data

### Step 9: Polish (30 min)
Animations, transitions, edge cases

### Step 10: Final QA (30 min)
Desktop, mobile, dark mode, accessibility

**Total: ~4.5 hours**

---

## WHAT NEEDS TO HAPPEN IN PHASE 4

1. Remove DEMO_NEIGHBORHOODS usage everywhere
2. Add axios calls to all pages
3. Handle loading/error states
4. Add TypeScript types for responses
5. Wire all navigation
6. Test complete user flow
7. Verify all features work
8. Polish and optimize

---

## READINESS ASSESSMENT

### ✅ We Have
- Complete, professional UI
- All pages implemented
- Beautiful components
- Custom hooks
- Backend APIs ready
- Error handling framework
- Loading states
- Dark mode support

### ❌ We're Missing
- API integration (frontend → backend connection)
- Real data flow
- Navigation wiring
- TypeScript types

### 🎯 To Complete MVP
- Connect frontend to backend APIs
- Remove hardcoded demo data
- Wire navigation
- Test complete flow

**Status: 90% ready, 10% integration work remaining**

---

## PHASE 4 NEXT: INTEGRATE EVERYTHING

Ready to proceed with connecting all the pieces?
