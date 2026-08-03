LocalLens/
│
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                     # Home/Search
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── personalize/
│   │   └── page.tsx
│   │
│   └── summary/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── ProgressCircle.tsx
│   │
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchCard.tsx
│   │
│   ├── dashboard/
│   │   ├── ScoreCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── MetricsGrid.tsx
│   │   └── ScoreBreakdown.tsx
│   │
│   ├── personalize/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileSelector.tsx
│   │   └── PersonalizedScore.tsx
│   │
│   └── summary/
│       ├── SummaryCard.tsx
│       └── AIExplanation.tsx
│
├── lib/
│   ├── api.ts
│   ├── constants.ts
│   ├── scoring.ts
│   └── utils.ts
│
├── hooks/
│   ├── useNeighborhood.ts
│   ├── useSearch.ts
│   └── useSummary.ts
│
├── types/
│   ├── neighborhood.ts
│   ├── profile.ts
│   ├── score.ts
│   └── api.ts
│
├── backend/
│   ├── app.py
│   │
│   ├── routes/
│   │   ├── search.py
│   │   ├── neighborhood.py
│   │   ├── personalize.py
│   │   └── summary.py
│   │
│   ├── services/
│   │   ├── scoring.py
│   │   ├── ai.py
│   │   └── mapbox.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── models.py
│   │
│   └── schemas/
│       └── neighborhood.py
│
├── database/
│   └── schema.sql
│
├── public/
│   ├── logo.svg
│   ├── icons/
│   └── images/
│
├── .env.local
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── CLAUDE.md
└── tokens.css
