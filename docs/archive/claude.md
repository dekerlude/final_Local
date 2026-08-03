# Project

LocalLens is an AI-powered web application that generates a personalized Neighborhood Score to help users choose the right place to live.

Stack:
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- FastAPI
- PostgreSQL + PostGIS
- Mapbox
- OpenAI API

Design source:
tokens.css in project root.

---

# Experience Principles

- **Simple** – Show only information required to make a location decision.
- **Trustworthy** – Every score must be backed by measurable data.
- **Fast** – A user should complete the entire workflow in under two minutes.

If any screen violates these principles, it should not ship.

---

# Core User Flow

Home
→ Search Neighborhood
→ Generate Neighborhood Score
→ Select User Profile
→ View Personalized Score
→ Read AI Summary

This is the only workflow that matters for the MVP.

---

# MVP Scope

Implement only these features:

1. Search a neighborhood.
2. Generate an overall Neighborhood Score (0–100).
3. Personalize the score based on the selected profile:
   - Family
   - Student
   - Working Professional
4. Generate an AI summary explaining the score.

Do not build additional features unless explicitly requested.

---

# Conventions

- Use TypeScript with strict mode.
- Use reusable React components.
- Use functional components only.
- Use Tailwind CSS for styling.
- Keep components small and modular.
- Use realistic UI copy.
- No placeholder text such as "Lorem Ipsum."
- Prefer server components where appropriate.
- Keep business logic separate from UI.

---

# UI Guidelines

The interface should contain only four screens:

1. Home/Search
2. Neighborhood Dashboard
3. Personalized Score
4. AI Summary

Use a clean dashboard layout with minimal visual clutter.

The Neighborhood Score should be the primary visual element.

---

# Boundaries

Do NOT build:

- Property marketplace
- Resident reviews
- Business opportunity analysis
- Investment score
- Authentication
- Notifications
- Social features
- Payment system
- Admin dashboard
- Enterprise APIs

Do not introduce additional pages outside the MVP workflow.

Do not change the core workflow without approval.

Do not over-engineer the architecture.

---

# Success Criteria

The application is complete when a user can:

1. Search any neighborhood.
2. Generate a Neighborhood Score.
3. Choose a user profile.
4. Receive a personalized score.
5. Read an AI-generated explanation.
6. Finish the demo in under two minutes without errors.

---

# Future Features (Not in MVP)

- Neighborhood comparison
- Interactive map
- Property recommendations
- Resident reviews
- Business opportunity score
- Investment insights
- Enterprise API
