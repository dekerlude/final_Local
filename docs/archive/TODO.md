# LocalLens MVP – Development Roadmap

**Project:** LocalLens – AI-Powered Neighborhood Score
**Team Size:** 4 Developers
**Estimated Timeline:** 4–6 hours per developer
**Target Completion:** Single sprint (ideally within 24 developer-hours)

---

## 1. User Stories

### MVP Stories (Required for Demo)

**US-01: Search a Neighborhood**
- As a user, I want to search for any neighborhood, so that I can evaluate it.
- Priority: P0 – MVP Critical
- Demo Value: Essential (entry point to workflow)

**US-02: View Raw Neighborhood Score**
- As a user, I want to see an overall score (0–100) for a neighborhood, so that I can understand its overall quality.
- Priority: P0 – MVP Critical
- Demo Value: Essential (core feature)
- Depends on: US-01

**US-03: Select User Profile**
- As a user, I want to select my profile (Family/Student/Professional), so that the score reflects my priorities.
- Priority: P0 – MVP Critical
- Demo Value: Essential (personalization)
- Depends on: US-02

**US-04: View Personalized Score**
- As a user, I want to see my personalized score based on my profile, so that the score is tailored to my needs.
- Priority: P0 – MVP Critical
- Demo Value: Essential (personalization result)
- Depends on: US-03

**US-05: Read AI-Generated Summary**
- As a user, I want to read an AI explanation of the score, so that I understand why this neighborhood is (or isn't) a good fit.
- Priority: P0 – MVP Critical
- Demo Value: Essential (conclusion of workflow)
- Depends on: US-04

**US-06: Responsive UI Experience**
- As a user, I want the interface to work smoothly on desktop and mobile, so that I can use LocalLens anywhere.
- Priority: P0 – MVP Critical
- Demo Value: Required for professional appearance
- Depends on: All UI tasks

**US-07: Error Handling & Loading States**
- As a user, I want to see clear loading states and error messages, so that I understand what's happening and why something failed.
- Priority: P1 – MVP Important
- Demo Value: Professional polish
- Depends on: All backend integrations

### LATER Stories (Post-MVP)

**US-08: Compare Multiple Neighborhoods**
- As a user, I want to compare multiple neighborhoods side-by-side, so that I can choose between options.
- Status: LATER (out of MVP scope)

**US-09: Score Category Breakdown**
- As a user, I want to see scores for individual categories (safety, education, etc.), so that I understand what drives the overall score.
- Status: LATER (scope limitation)

**US-10: Interactive Map**
- As a user, I want to visualize the neighborhood on a map, so that I can see its location and surrounding context.
- Status: LATER (nice-to-have, not critical for MVP)

**US-11: Data Freshness Indicator**
- As a user, I want to know when the neighborhood data was last updated, so that I trust the information's recency.
- Status: LATER (can be added post-launch)

---

## 2. Task Breakdown by Phase

### Phase 1: Project Setup & Infrastructure

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-01 | Initialize Next.js Project | Set up Next.js 15 with TypeScript, Tailwind CSS, and strict mode | package.json, tsconfig.json, tailwind.config.ts, app/layout.tsx, app/globals.css | None | M | feat: initialize Next.js 15 project with TypeScript and Tailwind |
| TASK-02 | Environment Configuration | Create .env.local template and configure API endpoints, API keys, and secrets | .env.local, .env.example | TASK-01 | S | feat: add environment variables and configuration |
| TASK-03 | FastAPI Backend Setup | Initialize FastAPI project with CORS, middleware, and basic structure | backend/app.py, backend/requirements.txt | None | M | feat: initialize FastAPI backend with middleware |
| TASK-04 | Database Schema & Migrations | Create PostgreSQL schema with PostGIS extension for neighborhood data | database/schema.sql | TASK-03 | M | feat: create PostgreSQL schema with PostGIS support |

### Phase 2: Shared Components & Utilities

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-05 | Create Base UI Components | Build reusable Button, Card, LoadingSpinner, ErrorMessage, ProgressCircle components | components/ui/*.tsx | TASK-01 | M | feat: create reusable UI components |
| TASK-06 | Create Layout Components | Build Navbar, Footer, PageContainer for consistent page structure | components/layout/*.tsx | TASK-01, TASK-05 | M | feat: create layout components |
| TASK-07 | TypeScript Type Definitions | Define types for Neighborhood, Profile, Score, API responses | types/*.ts | TASK-01 | M | feat: define TypeScript types and interfaces |
| TASK-08 | API Client Utilities | Create fetch wrapper, error handling, request/response interceptors | lib/api.ts | TASK-02, TASK-07 | M | feat: create API client utility functions |
| TASK-09 | Constants & Helpers | Define scoring weights, profile constants, utility functions | lib/constants.ts, lib/utils.ts | TASK-07 | S | feat: add constants and utility helpers |

### Phase 3: Frontend – Home/Search Page

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-10 | Build SearchBar Component | Create input field with auto-complete/suggestions | components/search/SearchBar.tsx | TASK-05, TASK-06 | S | feat: create SearchBar component |
| TASK-11 | Build SearchResults Component | Display search results as clickable list or cards | components/search/SearchResults.tsx, SearchCard.tsx | TASK-05, TASK-10 | S | feat: create SearchResults component |
| TASK-12 | Build Home Page | Create landing page with search hero, instructions | app/page.tsx | TASK-06, TASK-10, TASK-11 | M | feat: create home page with search interface |
| TASK-13 | Integrate Search API | Connect SearchBar to backend search endpoint, handle results and routing | lib/hooks/useSearch.ts | TASK-08, TASK-12 | M | feat: integrate neighborhood search API |

### Phase 4: Frontend – Dashboard Page

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-14 | Build ScoreCard Component | Create large, prominent score display (0–100) with visual indicator | components/dashboard/ScoreCard.tsx | TASK-05, TASK-06 | S | feat: create ScoreCard component |
| TASK-15 | Build MetricsGrid Component | Create grid layout for individual metrics (Safety, Healthcare, etc.) | components/dashboard/MetricsGrid.tsx, MetricCard.tsx | TASK-05, TASK-14 | M | feat: create MetricsGrid and MetricCard components |
| TASK-16 | Build Dashboard Page | Layout dashboard with score, metrics, and navigation | app/dashboard/page.tsx | TASK-06, TASK-14, TASK-15 | M | feat: create dashboard page layout |
| TASK-17 | Connect Dashboard Data | Fetch neighborhood data and scores, display in components | lib/hooks/useNeighborhood.ts | TASK-08, TASK-16 | M | feat: fetch and display neighborhood data on dashboard |

### Phase 5: Frontend – Personalization Page

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-18 | Build ProfileCard Component | Create visual card for each profile (Family/Student/Professional) | components/personalize/ProfileCard.tsx | TASK-05, TASK-06 | S | feat: create ProfileCard component |
| TASK-19 | Build ProfileSelector Component | Display profile options, handle selection state | components/personalize/ProfileSelector.tsx | TASK-05, TASK-18 | S | feat: create ProfileSelector component |
| TASK-20 | Build Personalize Page | Layout with profile selection and visual flow | app/personalize/page.tsx | TASK-06, TASK-19 | S | feat: create personalize page layout |
| TASK-21 | Implement Profile-Based Score Weighting | Calculate personalized score based on selected profile weights | lib/scoring.ts, lib/hooks/useSummary.ts | TASK-09, TASK-20 | M | feat: implement profile-based score personalization |

### Phase 6: Frontend – Summary Page

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-22 | Build SummaryCard Component | Create card for displaying AI-generated explanation | components/summary/SummaryCard.tsx | TASK-05, TASK-06 | S | feat: create SummaryCard component |
| TASK-23 | Build AIExplanation Component | Display AI summary text with formatting and readability | components/summary/AIExplanation.tsx | TASK-05, TASK-22 | S | feat: create AIExplanation component |
| TASK-24 | Build Summary Page | Layout with summary card and call-to-action buttons | app/summary/page.tsx | TASK-06, TASK-22, TASK-23 | S | feat: create summary page layout |

### Phase 7: Backend – Database & Models

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-25 | Create Database Connection | Set up SQLAlchemy, connection pooling, transaction handling | backend/database/connection.py | TASK-03, TASK-04 | M | feat: set up database connection and ORM |
| TASK-26 | Implement Scoring Algorithm | Create scoring logic for each category (Safety, Healthcare, Education, etc.) | backend/services/scoring.py | TASK-09, TASK-25 | L | feat: implement scoring algorithm for neighborhoods |

### Phase 8: Backend – Search & Neighborhood Endpoints

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-27 | Search Endpoint with Mapbox | Create /search endpoint, integrate Mapbox geocoding for neighborhood lookup | backend/routes/search.py, backend/services/mapbox.py | TASK-03, TASK-25, TASK-26 | M | feat: create search endpoint with Mapbox integration |
| TASK-28 | Neighborhood Data Endpoint | Create /neighborhood/{id} endpoint returning score and metrics | backend/routes/neighborhood.py, backend/schemas/neighborhood.py | TASK-25, TASK-26, TASK-27 | M | feat: create neighborhood data endpoint |

### Phase 9: Backend – Personalization & AI

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-29 | Personalization Endpoint | Create /personalize endpoint accepting profile, return weighted scores | backend/routes/personalize.py | TASK-26, TASK-28 | M | feat: create personalization endpoint with profile weighting |
| TASK-30 | Integrate OpenAI API | Set up OpenAI client, create prompt templates for AI summary generation | backend/services/ai.py | TASK-03 | M | feat: integrate OpenAI API for summary generation |
| TASK-31 | Summary Endpoint | Create /summary endpoint generating AI explanation based on profile | backend/routes/summary.py | TASK-29, TASK-30 | M | feat: create AI summary generation endpoint |

### Phase 10: Integration & Polish

| Task ID | Title | Description | Files | Depends On | Effort | Commit Message |
|---------|-------|-------------|-------|-----------|--------|-----------------|
| TASK-32 | Full API Integration | Connect all frontend components to backend endpoints, test request/response flow | Multiple | All backend tasks | L | feat: integrate frontend with backend APIs |
| TASK-33 | Error Handling | Implement error boundaries, fallback states, user-friendly error messages | Multiple | TASK-32 | M | feat: add comprehensive error handling and validation |
| TASK-34 | Loading States | Add loading spinners and skeleton screens throughout workflow | Multiple | TASK-32 | S | feat: add loading states and transitions |
| TASK-35 | Responsive Design | Test and fix mobile responsiveness, ensure all screens work on <375px width | Multiple | TASK-32 | M | feat: ensure responsive design across devices |
| TASK-36 | Performance Optimization | Optimize images, lazy load components, minimize API calls | Multiple | TASK-32 | M | feat: optimize performance and load times |
| TASK-37 | End-to-End Testing | Manual testing of complete workflow: search → score → personalize → summary | Multiple | TASK-32 | M | test: verify complete user workflow end-to-end |
| TASK-38 | Demo Polish & Documentation | Final UI tweaks, add realistic copy, prepare demo script | Multiple | TASK-37 | M | docs: finalize demo and add inline documentation |

---

## 3. Task Organization by Development Order

```
Setup & Infrastructure
├── TASK-01: Initialize Next.js
├── TASK-02: Environment Config
├── TASK-03: FastAPI Setup
└── TASK-04: Database Schema

        ↓

Shared Components & Utilities
├── TASK-05: Base UI Components
├── TASK-06: Layout Components
├── TASK-07: TypeScript Types
├── TASK-08: API Client
└── TASK-09: Constants & Helpers

        ↓

Frontend Foundation (Parallel)
├── TASK-10: SearchBar Component
├── TASK-11: SearchResults Component
├── TASK-12: Home Page
├── TASK-13: Search API Integration
├── TASK-14: ScoreCard Component
├── TASK-15: MetricsGrid Components
├── TASK-16: Dashboard Page
├── TASK-17: Dashboard Data Integration
├── TASK-18: ProfileCard Component
├── TASK-19: ProfileSelector Component
├── TASK-20: Personalize Page
├── TASK-21: Score Personalization Logic
├── TASK-22: SummaryCard Component
├── TASK-23: AIExplanation Component
└── TASK-24: Summary Page

        ↓

Backend Implementation (Parallel with Frontend)
├── TASK-25: Database Connection
├── TASK-26: Scoring Algorithm
├── TASK-27: Search Endpoint
├── TASK-28: Neighborhood Data Endpoint
├── TASK-29: Personalization Endpoint
├── TASK-30: OpenAI Integration
└── TASK-31: Summary Endpoint

        ↓

Integration & Polish
├── TASK-32: Full API Integration
├── TASK-33: Error Handling
├── TASK-34: Loading States
├── TASK-35: Responsive Design
├── TASK-36: Performance Optimization
├── TASK-37: End-to-End Testing
└── TASK-38: Demo Polish
```

---

## 4. Developer Assignment

### Developer 1: Frontend Foundation
**Focus:** Project setup, shared components, search page, navigation

| Task | Hours | Status |
|------|-------|--------|
| TASK-01 | 1.5 | Setup |
| TASK-02 | 0.5 | Setup |
| TASK-05 | 1.5 | Components |
| TASK-06 | 1.5 | Components |
| TASK-07 | 1.0 | Utilities |
| TASK-08 | 1.5 | Utilities |
| TASK-09 | 0.5 | Utilities |
| TASK-10 | 0.75 | Search |
| TASK-11 | 1.0 | Search |
| TASK-12 | 1.0 | Search Page |
| TASK-13 | 1.5 | Search Integration |

**Total:** ~12.75 hours | **Bottleneck:** None – can start immediately

---

### Developer 2: Dashboard & Personalization
**Focus:** Dashboard, metrics, personalization flow

| Task | Hours | Status |
|------|-------|--------|
| TASK-14 | 0.75 | Dashboard |
| TASK-15 | 1.5 | Dashboard |
| TASK-16 | 1.0 | Dashboard Page |
| TASK-17 | 1.5 | Dashboard Integration |
| TASK-18 | 0.75 | Personalization |
| TASK-19 | 0.75 | Personalization |
| TASK-20 | 0.75 | Personalization Page |
| TASK-21 | 1.5 | Scoring Logic |

**Total:** ~8.75 hours | **Bottleneck:** TASK-13 (search integration must be complete)

---

### Developer 3: Backend & Database
**Focus:** Database, scoring algorithm, core endpoints

| Task | Hours | Status |
|------|-------|--------|
| TASK-03 | 1.0 | Backend Setup |
| TASK-04 | 1.5 | Database |
| TASK-25 | 1.5 | Database |
| TASK-26 | 2.0 | Scoring Algorithm |
| TASK-27 | 2.0 | Search Endpoint |
| TASK-28 | 1.5 | Neighborhood Endpoint |
| TASK-29 | 1.5 | Personalization Endpoint |

**Total:** ~11 hours | **Bottleneck:** None – can start immediately

---

### Developer 4: AI Integration, Summary, Testing & Polish
**Focus:** OpenAI integration, summary page, testing, final polish

| Task | Hours | Status |
|------|-------|--------|
| TASK-22 | 0.75 | Summary Page |
| TASK-23 | 0.75 | Summary Page |
| TASK-24 | 0.75 | Summary Page |
| TASK-30 | 1.5 | AI Integration |
| TASK-31 | 1.5 | Summary Endpoint |
| TASK-32 | 2.0 | Full Integration |
| TASK-33 | 1.5 | Error Handling |
| TASK-34 | 1.0 | Loading States |
| TASK-35 | 1.5 | Responsive Design |
| TASK-36 | 1.0 | Performance |
| TASK-37 | 1.5 | E2E Testing |
| TASK-38 | 1.0 | Demo Polish |

**Total:** ~14.75 hours | **Bottleneck:** All frontend and backend must complete first

---

## 5. Sprint Plan

### Sprint 1: Foundation (Hours 0–2.5 per developer)

**Goals:** Project setup, shared infrastructure, basic components

| Developer | Tasks | Deliverable |
|-----------|-------|-------------|
| Dev 1 | TASK-01, 02, 05, 06, 07, 08, 09 | Reusable components, API client, TypeScript types |
| Dev 2 | Blocked (waiting for Dev 1) | Can review CLAUDE.md and plan component props |
| Dev 3 | TASK-03, 04, 25 | FastAPI app, database schema, connection setup |
| Dev 4 | Blocked (waiting for Dev 3) | Can outline OpenAI integration approach |

**Merge Plan:**
- Dev 1 → main: components, utilities, types
- Dev 3 → main: backend setup and database

---

### Sprint 2: Feature Implementation (Hours 2.5–5 per developer)

**Goals:** Build all major features (search, dashboard, personalization, summary)

| Developer | Tasks | Deliverable |
|-----------|-------|-------------|
| Dev 1 | TASK-10, 11, 12, 13 | Home page with fully functional search |
| Dev 2 | TASK-14, 15, 16, 17, 18, 19, 20, 21 | Dashboard and personalization pages |
| Dev 3 | TASK-26, 27, 28, 29 | Scoring algorithm, search, neighborhood, personalization endpoints |
| Dev 4 | TASK-22, 23, 24, 30, 31 | Summary page and AI integration |

**Merge Plan:**
- Dev 1 → main: search page functionality
- Dev 2 → main: dashboard and personalization
- Dev 3 → main: backend endpoints
- Dev 4 → main: summary page and AI service

---

### Sprint 3: Integration & Polish (Hours 5–6.5+ per developer)

**Goals:** Connect frontend to backend, error handling, testing, demo readiness

| Developer | Tasks | Deliverable |
|-----------|-------|-------------|
| Dev 1 | Support TASK-32 | Verify search integration works end-to-end |
| Dev 2 | Support TASK-32 | Verify personalization integration works end-to-end |
| Dev 3 | Support TASK-32 | Verify all endpoints working with frontend |
| Dev 4 | TASK-32, 33, 34, 35, 36, 37, 38 | Full integration, testing, demo-ready application |

**Merge Plan:**
- Dev 4 → main: integrated, tested, demo-ready version

---

## 6. Timeline Validation

### Workload Analysis

| Metric | Value |
|--------|-------|
| Total Tasks | 38 |
| Estimated Hours (avg 60 min/task) | ~38 hours |
| Developer Hours Available | 4 devs × 6 hours = 24 hours |
| Workload per Developer | 9.5 hours average |
| Parallel Efficiency (theoretical) | 80–85% |
| Realistic Timeline | **5–6 hours per developer** |

### Can the MVP Be Completed?

**YES, with careful dependency management and parallel work.**

**Critical Path:**
1. Setup & Shared Components (Dev 1): 2.5 hours
2. All Frontend Pages (Dev 1, 2): 2 hours
3. All Backend Endpoints (Dev 3): 2.5 hours
4. Integration & Testing (Dev 4): 1.5 hours

**Total Critical Path:** ~6 hours (sequential)

**With Parallel Work (all 4 devs):** ~3 hours actual wall-clock time

### If Timeline Slips

**If ONLY 4 hours available per developer:**

Move these tasks to LATER (post-MVP):
- ❌ TASK-35: Responsive Design (can be simplified to desktop-first)
- ❌ TASK-36: Performance Optimization (ship as-is, optimize later)

**Keep all MVP features:**
- ✅ TASK-27: Search
- ✅ TASK-28: Neighborhood Score
- ✅ TASK-29: Personalization
- ✅ TASK-31: AI Summary

**Effort:** Removing TASK-35 & TASK-36 saves ~2.5 hours, making the project feasible in 4 hours per developer.

---

## 7. Definition of Done

### Feature Completion Checklist

- [ ] **US-01: Search Neighborhood**
  - [ ] User can type a neighborhood name
  - [ ] Search results are displayed (name, location, basic info)
  - [ ] User can select a neighborhood to proceed
  - [ ] API responds within <2 seconds
  - [ ] Graceful handling of no results

- [ ] **US-02: View Neighborhood Score**
  - [ ] Score (0–100) is displayed prominently
  - [ ] Visual indicator (color, icon) matches score level
  - [ ] Score breakdown shows individual metrics (Safety, Healthcare, Education, etc.)
  - [ ] All metrics are populated with real data

- [ ] **US-03: Select User Profile**
  - [ ] Three profile options are visible (Family, Student, Professional)
  - [ ] User can select exactly one profile
  - [ ] Selection is visually clear
  - [ ] User can change selection before proceeding

- [ ] **US-04: View Personalized Score**
  - [ ] Score updates based on selected profile
  - [ ] Weights are applied correctly (Family ≠ Student ≠ Professional)
  - [ ] Score changes are visible (animation or clear update)
  - [ ] Score remains between 0–100

- [ ] **US-05: Read AI-Generated Summary**
  - [ ] AI summary is generated for selected profile
  - [ ] Summary mentions why the score was given
  - [ ] Summary is relevant to the selected profile
  - [ ] Summary is 2–4 sentences (concise)
  - [ ] No API errors or fallback text visible

- [ ] **US-06: Responsive UI Experience**
  - [ ] All pages render correctly on desktop (1920px)
  - [ ] All pages render correctly on tablet (768px)
  - [ ] All pages render correctly on mobile (375px)
  - [ ] Text is readable at all breakpoints
  - [ ] Touch targets are ≥44px (mobile)
  - [ ] No horizontal scroll on mobile
  - [ ] Images scale appropriately

- [ ] **US-07: Error Handling & Loading States**
  - [ ] Loading spinners appear during API calls
  - [ ] Spinners are removed when data loads
  - [ ] Error messages appear if API fails
  - [ ] Error messages explain what went wrong
  - [ ] User can retry failed actions
  - [ ] No console errors during normal workflow

### Code Quality Checklist

- [ ] **TypeScript**
  - [ ] All files use `strict: true`
  - [ ] No `any` types without explanation
  - [ ] All function parameters are typed
  - [ ] All API responses are typed

- [ ] **Component Architecture**
  - [ ] All components are functional (no class components)
  - [ ] Components are under 300 lines
  - [ ] Props are clearly defined
  - [ ] Business logic is separated from UI

- [ ] **Styling**
  - [ ] All styles use Tailwind CSS
  - [ ] No inline styles
  - [ ] Color palette matches tokens.css
  - [ ] Font sizes are consistent

- [ ] **API Integration**
  - [ ] All endpoints have proper error handling
  - [ ] Requests include proper headers (Content-Type, Authorization)
  - [ ] Responses are validated before rendering
  - [ ] API calls don't exceed rate limits

### Testing Checklist

- [ ] **Happy Path Testing**
  - [ ] User can search → score → select profile → personalize → read summary
  - [ ] Complete workflow takes <2 minutes
  - [ ] No errors or warnings appear
  - [ ] All data is displayed correctly

- [ ] **Edge Cases**
  - [ ] Searching for non-existent neighborhood shows error
  - [ ] Navigating back doesn't lose user progress
  - [ ] Changing profile recalculates score correctly
  - [ ] Searching for special characters doesn't break app

- [ ] **Performance**
  - [ ] Page loads in <3 seconds
  - [ ] Search results appear in <2 seconds
  - [ ] Score calculation completes in <1 second
  - [ ] AI summary generates in <5 seconds
  - [ ] No memory leaks (dev tools)

### Demo Readiness Checklist

- [ ] **Copy & Content**
  - [ ] All placeholder text is removed
  - [ ] All button labels are clear and actionable
  - [ ] Error messages are user-friendly
  - [ ] No "Lorem Ipsum" or dev text

- [ ] **Visual Polish**
  - [ ] Spacing and padding are consistent
  - [ ] Colors match design tokens
  - [ ] Hover states are visible
  - [ ] Transitions are smooth (no jarring jumps)
  - [ ] Logo/branding is visible

- [ ] **Data Accuracy**
  - [ ] Sample neighborhoods have realistic scores
  - [ ] Personalized scores differ meaningfully by profile
  - [ ] AI summaries are relevant and accurate
  - [ ] No hardcoded test data visible

- [ ] **Team Sign-Off**
  - [ ] Code review completed by at least one other developer
  - [ ] All PRs merged to main
  - [ ] main branch is deployable
  - [ ] Demo script is prepared

---

## 8. Git Workflow

### Branch Naming Convention

```
feature/<task-id>-<description>
Example: feature/TASK-01-next-setup
```

### Commit Message Convention

```
<type>(<scope>): <subject>

<body (optional)>
```

**Types:** `feat`, `fix`, `docs`, `test`, `chore`, `refactor`
**Scope:** Component/module name (e.g., `SearchBar`, `scoring-api`)
**Subject:** Imperative mood, lowercase, no period, <50 chars

**Examples:**
```
feat(SearchBar): add autocomplete suggestions

fix(dashboard): correct metric calculation for safety score

docs(api): update endpoint documentation
```

### Pull Request Workflow

1. **Create a feature branch** from latest main
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/TASK-XX-description
   ```

2. **Commit early and often** (one commit per logical change)
   ```bash
   git commit -m "feat(component): add feature"
   ```

3. **Push to remote** when ready for code review
   ```bash
   git push -u origin feature/TASK-XX-description
   ```

4. **Open a Pull Request** on GitHub
   - Link to the task (e.g., "Closes TASK-01")
   - Describe what changed and why
   - Mention any dependencies

5. **Code Review**
   - At least one other developer must approve
   - Resolve all comments before merging

6. **Merge to main**
   - Use "Squash and Merge" for small changes
   - Use "Create a merge commit" for complex features
   - Delete feature branch after merge

7. **Pull latest main regularly** (at least daily)
   ```bash
   git checkout main
   git pull origin main
   ```

### Merge Conflict Resolution

- **Prevent conflicts:** Each developer works on separate components
- **If conflicts occur:**
  1. Pull latest main: `git pull origin main`
  2. Resolve conflicts manually
  3. Test thoroughly
  4. Commit and push

---

## 9. Daily Standup Template

Each developer reports at start of day:

```
Yesterday:
- Completed TASK-XX: [description]
- Completed TASK-YY: [description]

Today:
- Starting TASK-ZZ: [description]
- Blocked by: [if any]

Blockers:
- [List any obstacles]

Help needed:
- [Any requests for other devs]
```

---

## 10. Deployment & Demo Checklist

### Pre-Demo

- [ ] All tasks completed and merged to main
- [ ] main branch tested end-to-end
- [ ] Environment variables configured (.env.local)
- [ ] Backend running locally
- [ ] Frontend running locally
- [ ] Database populated with test data
- [ ] OpenAI API key configured

### Demo Script (2 minutes)

1. **Home Page (10 sec)**
   - Show search interface
   - Highlight call-to-action

2. **Search (20 sec)**
   - Type neighborhood name
   - Show results appear
   - Click to select

3. **Dashboard (30 sec)**
   - Show overall score
   - Explain metric breakdown
   - Highlight safety/education/etc.

4. **Personalization (20 sec)**
   - Show three profile options
   - Select one profile (e.g., Family)
   - Show score updates

5. **Summary (30 sec)**
   - Read AI-generated explanation
   - Highlight profile-specific insights
   - Show conclusion

6. **Closeout (10 sec)**
   - Demo complete in ~2 minutes
   - Highlight simplicity and speed

### Post-Demo Checklist

- [ ] Gather feedback from stakeholders
- [ ] Document any bugs or issues
- [ ] Note feature requests for LATER
- [ ] Celebrate completion! 🎉

---

## 11. Risk Mitigation

### Known Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OpenAI API quota exceeded | High | Use fallback summary template, test with mock responses |
| Mapbox geocoding slow | Medium | Cache results, add timeout of 3 seconds |
| Database connection drops | High | Implement connection pooling, retry logic |
| TypeScript strict mode delays | Low | Allow one "any" per file with explanation |
| Mobile responsiveness takes time | Medium | Use pre-built responsive Tailwind utilities |
| Async state management | Medium | Use React Query or custom hooks consistently |

### Contingency Plans

**If timeline slips by 1 hour:**
- Remove TASK-36 (performance optimization)
- Ship with basic performance, optimize post-launch

**If timeline slips by 2+ hours:**
- Remove TASK-35 (responsive design)
- Implement desktop-first, add mobile support in v1.1
- Still keep all MVP features

**If backend endpoints are delayed:**
- Frontend developers mock API responses
- Backend developers continue in parallel
- Integration happens in Sprint 3

**If AI integration fails:**
- Use hardcoded summary templates by profile
- Add note: "AI summaries coming in v1.1"
- Ship product with static summaries

---

## 12. Success Metrics

After completion, measure:

- **User Workflow Time:** Target <2 minutes (tracked in demo)
- **API Response Time:** All endpoints <2 seconds
- **Page Load Time:** <3 seconds on 4G
- **Error Rate:** <5% of requests
- **Responsive Design:** 100% pass on desktop, tablet, mobile

---

## 13. Post-MVP Roadmap (LATER)

Once MVP is shipped, prioritize in this order:

1. **Neighborhood Comparison** (US-08) – 8 hours
2. **Score Category Breakdown** (US-09) – 6 hours
3. **Interactive Map** (US-10) – 10 hours
4. **Data Freshness Indicator** (US-11) – 4 hours
5. **Property Recommendations** – 12 hours
6. **Resident Reviews** – 16 hours

---

## 14. Key Contacts & Resources

| Role | Name | Responsibility |
|------|------|-----------------|
| Project Lead | [TBD] | Sprint planning, blockers, final approval |
| Frontend Lead | Developer 1 | TypeScript, component architecture |
| Backend Lead | Developer 3 | API design, database schema |
| QA / Testing | Developer 4 | E2E testing, demo readiness |

### External Resources

- **Design Tokens:** `tokens.css` (source of truth for colors, fonts)
- **Component Library:** `scaffold.md` (directory structure reference)
- **API Documentation:** Backend docstrings (OpenAPI auto-generated)
- **Mapbox Docs:** https://docs.mapbox.com/
- **OpenAI Docs:** https://platform.openai.com/docs

---

## 15. Summary

| Aspect | Value |
|--------|-------|
| **MVP Features** | 4 core features (Search, Score, Personalize, Summary) |
| **Total Tasks** | 38 tasks across all phases |
| **Developer Team** | 4 developers |
| **Estimated Timeline** | 5–6 hours per developer (24–30 total hours) |
| **Critical Path** | ~6 hours sequential / ~3 hours parallel |
| **Demo Target** | <2 minutes user workflow |
| **Target Completion** | Single sprint (24–30 hours total) |
| **Repository** | https://github.com/dekerlude/LocalLens |

---

**Last Updated:** July 28, 2026

**Status:** Ready for development ✅

