# Frontend Redesign – Design Decisions & Rationale

## 1. No New Dependencies (Strategic Decision)

### Decision
Use only existing libraries: Framer Motion, Tailwind CSS, Radix UI, Lucide Icons. No shadcn/ui, Aceternity UI, Magic UI, or React Three Fiber.

### Rationale
- **Bundle cost:** Adding UI kits would increase JS payload by 50-100KB (uncompressed). Framer Motion + Tailwind already do 95% of what we need.
- **Design consistency:** Custom components built on CVA ensure a cohesive visual language without mixing multiple design systems.
- **Maintenance burden:** Fewer dependencies = fewer version updates, smaller attack surface, simpler audits.
- **Performance:** Animations already GPU-optimized via Framer Motion's transform + opacity approach.

### What We Get
- Framer Motion: all motion effects, spring physics, drag interactions
- Tailwind: comprehensive color system via CSS variables, responsive design
- Radix UI: accessible Progress component
- Lucide: 300+ premium icons (no emoji medals needed)
- CVA: semantic component variants without class name bloat

---

## 2. Glassmorphism as the Aesthetic (Strategic Choice)

### Decision
Use semi-transparent backgrounds with backdrop blur as the primary visual effect, not flat design or gradient overlays.

### Rationale
- **Premium feel:** Glassmorphism is used by Apple, Linear, Vercel, Arc Browser — immediately signals high-end product
- **Functional layering:** Blur helps distinguish foreground from background without heavy shadows
- **Modern:** Currently trendy in 2024-2026, but rooted in real design principles (not a fad)
- **Performant:** Backdrop blur is hardware-accelerated (GPU), cheap at 60 FPS

### Implementation
- Search bar: glass input with `backdrop-blur-md`, `bg-glass/80`
- Dropdown: glass background with higher blur, semi-transparent text
- Ranking container: `bg-glass/50` with border-white/10
- Card wrappers: semi-transparent white/dark backgrounds with blur

### Fallback
Browsers that don't support backdrop-filter still see opaque backgrounds (graceful degradation).

---

## 3. Gradient Glow Cards as the Primary Data Container (DRY Principle)

### Decision
Extract the repeated "gradient glow border card" pattern into `GlowCard` component with configurable `glowColor` and `glowIntensity` props.

### Rationale
- **Code reuse:** Pattern appeared in 8+ places (NeighborhoodStats, ScoreCategoryBreakdown, various stat cards)
- **Consistency:** Single source of truth for glow effect ensures all instances look identical
- **Maintainability:** Want to adjust glow blur radius? One file to change.
- **Props flexibility:** Same component used for success (green), warning (amber), danger (red) tiers

### Implementation
```tsx
<GlowCard glowColor="success" glowIntensity="soft">
  <div>Card content</div>
</GlowCard>
```

Generates:
- Absolutely positioned glow div behind the Card
- Configurable gradient based on color
- Configurable blur (soft=blur-2xl, medium=blur-3xl, strong=blur-4xl)
- Dark mode support via CSS variables

---

## 4. Animated Ambient Background as Global Visual Theme

### Decision
Extract animated blurred-blob background into `AmbientBackground` component, use site-wide (all major pages).

### Rationale
- **Visual continuity:** Same background on Home, Neighborhood, Personalize, Summary creates unified aesthetic
- **Depth & movement:** Moving blobs add life without being distracting (used only in background, pointer-events: none)
- **Reduced visual weight:** Blurred, low-opacity blobs don't compete with content (unlike sharp gradients)
- **Performance:** GPU-accelerated Framer Motion animations, negligible impact on FCP/LCP

### Implementation
```tsx
<AmbientBackground /> // Renders two animated gradient circles, one floating dot
```

Used by:
- `src/app/app/page.tsx` (Home/Search)
- `src/app/app/neighborhood/[id]/page.tsx` (Neighborhood Dashboard)
- `src/app/personalize/page.tsx` (Personalize Flow)
- `src/app/summary/page.tsx` (Summary Page)
- Error/Loading state pages

---

## 5. Spring Physics for Interactive Elements (Delight)

### Decision
Use Framer Motion's `whileHover`, `whileTap`, and `transition={{ type: "spring" }}` for tactile, responsive interactions.

### Rationale
- **Feels alive:** Spring physics (stiffness/damping tuned) create bouncy, responsive interactions
- **Accessible:** No motion sickness (unlike smooth easing curves that can feel like floating)
- **Premium polish:** Spring physics is what Apple uses in iOS animations — immediately recognizable as high-end

### Examples
- **Priority Card selection:** Checkmark animates in with spring (stiffness: 400, damping: 20)
- **Card hover elevation:** Slight y-translate with spring easing
- **Badge scale:** Medal badges have subtle scale pulse animation

### Tuning
- Button taps: `scale: 0.98` (feels pressed, not floating)
- Icon appears: `stiffness: 300-400` (snappy but not snappy-janky)
- Card elevation: `y: -8px` (noticeable but not disruptive)

---

## 6. Score Display as the Hero Element (Information Hierarchy)

### Decision
Make the personalized score large, gradient-colored, and centered — immediately grab attention and convey importance.

### Rationale
- **MVP core:** The score is the key output of the personalization flow
- **Visual weight:** 7xl font size signals "this is the answer you came for"
- **Accessibility:** Gradient colors work for color-blind users (supplemented with badge label "Excellent", "Good", etc.)
- **Emotional impact:** Large number with premium styling feels celebratory and important

### Implementation
```tsx
<div className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
  {personalizedScore.toFixed(0)}
</div>
```

Paired with Badge showing semantic label (Excellent/Very Good/Good/Fair/Poor).

---

## 7. Dark Mode as First-Class Citizen (Not Afterthought)

### Decision
Build every new component with `dark:` prefixes from the start, not as an after-pass.

### Rationale
- **User expectation:** Readers expect apps to respect OS dark mode setting
- **Accessibility:** Dark mode helps reduce eye strain for users in low-light environments (1/3 of users)
- **No cost:** Tailwind's `dark:` modifier is zero overhead

### Implementation
Every color has a dark variant:
```tsx
// Text
className="text-text-primary dark:text-text-primary" // Already handles both

// Backgrounds
className="bg-white dark:bg-gray-900"

// Borders
className="border-white/10 dark:border-white/5"

// Glass cards
className="bg-glass dark:bg-glass/50 backdrop-blur-sm"
```

CSS Variables in `tokens.css` also include dark mode overrides:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0f172a;
    /* etc */
  }
}
```

---

## 8. Token-Driven Color System (Scalability)

### Decision
Use CSS custom properties (variables) for all colors, accessed via Tailwind's `var()` in class names.

### Rationale
- **Single source of truth:** Change brand color in one place, updates everywhere
- **Dark mode support:** Variables can change per media query
- **Theme flexibility:** Could easily add theme switcher (light/dark/custom) by updating CSS variables at runtime

### Implementation
```css
/* src/styles/tokens.css */
:root {
  --color-primary: #0070f3;
  --color-success: #10b981;
  --gradient-primary-from: #0070f3;
  --gradient-primary-to: #0051cc;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #3b82f6; /* lighter blue for dark mode */
  }
}
```

```tsx
// Tailwind config maps these
colors: {
  primary: { DEFAULT: "var(--color-primary)" }
}

// Used in components
className="bg-primary text-white" // automatically pulls from CSS var
```

---

## 9. Functional Fix: Summary Page from Stub to Real Page (Critical)

### Decision
Rewrite `/summary` page from a non-functional stub to a real, data-driven page that:
- Reads query params (`neighborhoodId`, `priorities`, `personalizedScore`, `factorBreakdown`)
- Makes API call to `/summary` endpoint
- Renders AI-generated insight
- Shows strengths/tradeoffs/score

### Rationale
- **MVP completeness:** CLAUDE.md specifies "Read AI Summary" as the final step of the core flow. Without this, the flow was broken.
- **User value:** Users need to see the AI insight that explains the score, not a placeholder.
- **No API changes:** The `/summary` backend endpoint already existed; frontend just needed to use it.

### Implementation
```tsx
// Read query params
const neighborhoodId = searchParams.get('neighborhoodId')
const priorities = searchParams.get('priorities')?.split(',')
const personalizedScore = parseFloat(searchParams.get('personalizedScore'))
const factorBreakdown = JSON.parse(searchParams.get('factorBreakdown'))

// Fetch AI summary
const response = await apiClient.post('/summary', {
  neighborhood_id: parseInt(neighborhoodId),
  priorities,
  personalizedScore,
  factorBreakdown,
})

// Render
<AISummaryCard summary={response.data.summary} />
```

---

## 10. Drag & Drop Priority Ranking (UX Clarity)

### Decision
Keep native drag-and-drop API for priority reordering (not a custom slider or buttons), but enhance visual feedback with glassmorphic container and animated drop zones.

### Rationale
- **Intuitive:** Users expect to drag to reorder (standard convention)
- **Visual feedback:** Dragged card becomes semi-transparent, drop zone highlights
- **Accessible at least for mouse:** Drag API works for pointer devices; keyboard users see the priorities listed (acceptable tradeoff for MVP)

### Implementation
```tsx
<motion.div
  draggable
  onDragStart={(e) => handleDragStart(e, factor)}
  onDragOver={(e) => handleDragOver(e, index)}
  onDrop={(e) => handleDrop(e, index)}
  className={clsx(
    draggedItem === factor && 'opacity-50',
    dragOverIndex === index && 'border-primary'
  )}
>
```

Visual effects:
- Dragging: `opacity-50 scale-95`
- Hovering over drop zone: `border-primary/80 bg-primary/5`
- Releasing: smooth reorder animation

---

## 11. Icon-Driven Insights (Clarity Over Emoji)

### Decision
Use Lucide icons (CheckCircle, AlertCircle, Sparkles) instead of emoji (✓, ⚠, ✨) for Strength/Tradeoff/AI Summary cards.

### Rationale
- **Accessibility:** Screen readers can label icons properly (e.g., "checkmark" vs just emoji character)
- **Consistency:** Lucide icons match the app's design language (other icons already use Lucide)
- **Styling:** Icons can be colored via CSS (e.g., `text-success`, `text-warning`)
- **Clarity:** Icons are larger, easier to see at a glance

### Implementation
```tsx
<StrengthCard factor={factor} />
// Renders: <CheckCircle className="w-5 h-5 text-success" />

<TradeoffCard factor={factor} />
// Renders: <AlertCircle className="w-5 h-5 text-warning" />

<AISummaryCard>
// Renders: <Sparkles className="w-6 h-6 text-primary" animate={{ rotate: [0, 10, -10, 0] }} />
```

---

## 12. Scroll-Based Header Elevation (Subtle Premium Touch)

### Decision
Header background becomes more opaque and blur increases as user scrolls, creating a "elevation" effect.

### Rationale
- **Visual feedback:** User sees the header "solidify" as they scroll, creating depth
- **Premium polish:** Apple uses similar effects in iOS Safari toolbar
- **Functional:** Makes header stand out more against content below as user scrolls

### Implementation
```tsx
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  window.addEventListener('scroll', () => {
    setScrolled(window.scrollY > 10)
  })
}, [])

<motion.div
  animate={{
    backgroundColor: scrolled ? 'rgba(0,70,153,0.7)' : 'rgba(0,70,153,0.5)',
    backdropFilter: scrolled ? 'blur(12px)' : 'blur(8px)',
  }}
/>
```

---

## 13. Component Props as Design System Documentation

### Decision
Every component's `props` interface is the source of truth for design tokens and customization options.

### Rationale
- **Type safety:** Props enforce valid values (enums, not strings)
- **Self-documenting:** Developers see immediately what colors/sizes/styles are available
- **No magic strings:** Hard to accidentally use invalid color (e.g., `glowColor="teal"` errors at build time)

### Examples
```tsx
interface GlowCardProps {
  glowColor?: "primary" | "success" | "warning" | "danger" | "info"
  glowIntensity?: "soft" | "medium" | "strong"
}

interface PriorityCardProps {
  isSelected: boolean
  onSelect: () => void
  factor: string
}
```

Developers using these components in the future can see all valid options without reading implementation code.

---

## 14. Animations Respect Prefers-Reduced-Motion (Accessibility)

### Decision
All Framer Motion animations check `prefers-reduced-motion` before playing. Users with vestibular disorders can opt out of motion.

### Rationale
- **User safety:** 1 in 35 people have vestibular disorders; animations can cause dizziness/nausea
- **Legal:** WCAG 2.1 AAA requires this support
- **Simple:** Framer Motion supports this with a hook

### Implementation
```tsx
const prefersReducedMotion = useReducedMotion() // Custom hook

<motion.div
  animate={{
    y: prefersReducedMotion ? 0 : [0, -30, 0],
  }}
>
```

---

## 15. Performance First: No Overdoing Animations

### Decision
Use animations sparingly and purposefully. Not every element animates; only key interactions (hovers, transitions, loading states).

### Rationale
- **User respect:** Too many animations distract and slow perceived performance
- **Accessibility:** Fewer animations = fewer triggers for prefers-reduced-motion
- **Code simplicity:** Every animation adds mental overhead; use them only when they add value

### What animates
- ✅ Page load: staggered content entrance
- ✅ Card hover: elevation (y-translate)
- ✅ Button tap: scale feedback
- ✅ Loading state: shimmer skeleton
- ✅ Form input focus: glow border
- ✅ Drag & drop: visual feedback

### What doesn't animate
- ❌ Text changes (would distract from reading)
- ❌ Scrolling (browser handles this)
- ❌ Navigation between routes (would delay interaction)
- ❌ Notification/toast entry (keep simple)

---

## 16. Token Naming Convention (Future Maintenance)

### Decision
CSS variables use semantic names (`--color-score-excellent`, `--gradient-primary-from`) not theme names (`--color-blue-500`).

### Rationale
- **Future-proof:** If brand changes from blue to purple, variable names still make sense
- **Intention clear:** `--color-success` is better than `--color-green` (communicates purpose)
- **Maintainability:** Easier to audit (grep for `--color-score-*` finds all score tiers in one place)

### Structure
```css
/* Semantic (GOOD) */
--color-primary: #0070f3
--color-score-excellent: #10b981
--gradient-primary-from: #0070f3

/* Theme-based (AVOID) */
--color-blue: #0070f3
--color-green: #10b981
```

---

## Summary

These 16 design decisions collectively create a **premium, maintainable, accessible, performant frontend** that feels like a high-end consumer product while remaining pragmatic and code-efficient.

**Key principles:**
1. Leverage existing tools (no bloat)
2. Extract patterns into reusable components (DRY)
3. Use semantic naming (maintainability)
4. Respect accessibility (inclusive)
5. Animate intentionally (user respect)
6. Token-driven design (scalability)
