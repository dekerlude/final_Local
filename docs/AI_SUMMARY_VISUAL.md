# AI Summary Interface - Visual Reference

## Full Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ AI-Powered Analysis                       [AI Generated]    │
│  Personalized insights for Families                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [sparkle]  Brooklyn Heights stands out as an excellent        │
│  residential area with strong infrastructure, exceptional       │
│  schools, and a vibrant yet family-friendly community.         │
│  The neighborhood benefits from strategic location...          │
│                                                                 │
│  [fade-in animation, 0.6s]                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📈 Analysis Confidence                                 92%     │
│                                                                 │
│  ████████████████████████████████████████████████ 92%          │
│                                                                 │
│  Based on comprehensive data analysis across 6 factors         │
│  [bar animates 0% → 92% over 1.5s]                            │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────┬───────────────────────────┐
│  ✓ Strengths (Green)      │  ⚠ Trade-offs (Orange)    │
├───────────────────────────┼───────────────────────────┤
│  • Top-rated schools      │  • High cost of living    │
│  • Low crime rate         │  • Limited parking        │
│  • Excellent healthcare   │  • Traffic congestion     │
│  • Well-maintained parks  │  • Limited nightlife      │
│  • Strong walkability      │  • Noise from traffic     │
│  • Diverse dining         │  • Fewer affordable homes │
│                           │                           │
│  [fade + slide right]     │  [fade + slide left]      │
│  [50ms stagger between]   │  [50ms stagger between]   │
└───────────────────────────┴───────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🎯 Personalized Recommendation (Purple)                        │
│                                                                 │
│  Highly recommended for families seeking excellent schools     │
│  and safety. The neighborhood offers stability, strong          │
│  educational institutions, and family-oriented amenities.      │
│                                                                 │
│  Best for:                                                      │
│  → Growing families with school-age children                   │
│  → Professionals prioritizing education                        │
│  → Those seeking safe, established neighborhoods               │
│                                                                 │
│  Reconsider if:                                                 │
│  → Young professionals seeking nightlife                       │
│  → Budget-conscious renters (high costs)                       │
│  → Those requiring parking for commuting                       │
│                                                                 │
│  [Tags: ✓ Excellent for families | ✓ Strong schools | ⚠ High cost]
│                                                                 │
│  [fade-in animation, 0.8s]                                     │
└─────────────────────────────────────────────────────────────────┘

✨ Powered by machine learning trained on 10,000+ neighborhoods
```

---

## Mobile Layout (Single Column)

```
┌─────────────────────────────┐
│ ✨ AI-Powered Analysis       │
│ Insights for Families        │
│                [AI Generated]│
└─────────────────────────────┘

┌─────────────────────────────┐
│ [sparkle] Brooklyn Heights  │
│ stands out as excellent...  │
│                             │
│ [full width, wrapping text] │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 📈 Confidence          92%   │
│                             │
│ ███████████████████████ 92% │
│                             │
│ Based on comprehensive      │
│ data analysis across        │
│ 6 factors                   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✓ Strengths                 │
│                             │
│ • Top-rated schools         │
│ • Low crime rate            │
│ • Excellent healthcare      │
│ • Well-maintained parks     │
│ • Strong walkability        │
│ • Diverse dining            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ⚠ Trade-offs                │
│                             │
│ • High cost of living       │
│ • Limited parking           │
│ • Traffic congestion        │
│ • Limited nightlife         │
│ • Noise from traffic        │
│ • Fewer affordable homes    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🎯 Recommendation           │
│                             │
│ Highly recommended for      │
│ families seeking excellent  │
│ schools and safety...       │
│                             │
│ Best for: Growing families  │
│ Reconsider: Night seekers   │
│                             │
│ [Tags stack vertically]     │
└─────────────────────────────┘
```

---

## Confidence Score Variants

### 92% - Excellent Confidence (Green)
```
┌─────────────────────────────┐
│ 📈 Analysis Confidence 92%  │
│                             │
│ ████████████████████████ 92%│
│                             │
│ Comprehensive data analysis │
└─────────────────────────────┘
[Green color scheme - solid confidence]
```

### 78% - Good Confidence (Blue)
```
┌─────────────────────────────┐
│ 📈 Analysis Confidence 78%  │
│                             │
│ ███████████████████░░ 78%   │
│                             │
│ Extensive data analysis     │
└─────────────────────────────┘
[Blue color scheme - reliable]
```

### 65% - Moderate Confidence (Amber)
```
┌─────────────────────────────┐
│ 📈 Analysis Confidence 65%  │
│                             │
│ ████████████░░░░░░░░░ 65%   │
│                             │
│ Moderate data coverage      │
└─────────────────────────────┘
[Amber color scheme - use caution]
```

---

## Animation Sequence Timeline

```
Time    Component              Action
────────────────────────────────────────────────────────
0ms     Page load begins
│
100ms   Header                 Fade in + scale (0.6s)
│
200ms   Summary Card           Fade in (0.6s, 0.2s delay)
│
400ms   Confidence Score       
│       Title                  Fade in
│       Percentage             Fade in (3xl, bold)
│       Progress bar           Animate: 0% → 92% (1.5s)
│
800ms   Pros List
│       Item 1                 Fade in + slide right (0.4s)
│       Item 2                 Fade in + slide right (0.4s, +50ms)
│       Item 3                 Fade in + slide right (0.4s, +100ms)
│       ...                    [etc, 50ms stagger]
│
        Cons List (parallel)
│       Item 1                 Fade in + slide left (0.4s)
│       Item 2                 Fade in + slide left (0.4s, +50ms)
│       ...                    [etc, 50ms stagger]
│
1400ms  Recommendation Card    Fade in (0.6s, 0.8s delay)
│
1600ms  Tags                   Fade in (0.4s)
│
2000ms  ✨ Icon               Start rotating (3s loop, infinite)
│       Animation complete
```

---

## Color Reference

### By Confidence Level
```
85%+  │ ██████████████████████████ │ Green   (#10B981)
      │ Excellent confidence        │
──────┼─────────────────────────────┼─────────────────
70-84%│ ██████████████████░░░░░░░░░ │ Blue    (#3B82F6)
      │ Good confidence             │
──────┼─────────────────────────────┼─────────────────
50-69%│ █████████░░░░░░░░░░░░░░░░░░ │ Amber   (#F59E0B)
      │ Moderate confidence         │
──────┼─────────────────────────────┼─────────────────
<50%  │ ███░░░░░░░░░░░░░░░░░░░░░░░░ │ Orange  (#F97316)
      │ Low confidence (hidden)     │
```

### By Section
```
Summary Card
├─ Gradient: Blue-50 → Blue-100
├─ Text: Gray-800 (light) / Gray-200 (dark)
└─ Icon: Blue-600

Pros Card (Strengths)
├─ Gradient: Green-50 → Green-100
├─ Icon: Green-600
├─ Dots: Green-600
└─ Text: Gray-800

Cons Card (Trade-offs)
├─ Gradient: Orange-50 → Orange-100
├─ Icon: Orange-600
├─ Dots: Orange-600
└─ Text: Gray-800

Recommendation Card
├─ Gradient: Purple-50 → Purple-100
├─ Icon: Purple-600
└─ Text: Gray-800
```

---

## Interactive States

### Hover (Desktop)
```
Card at rest:
┌─────────────────┐
│ Content         │
└─────────────────┘
Shadow: 0 1px 3px

Card on hover:
┌─────────────────┐
│ Content         │ ← Lifts 4px
└─────────────────┘
Shadow: 0 4px 12px, larger blur
Transition: 200ms ease-out
```

### Focus (Keyboard)
```
Interactive element:
┌─────────────────┐
│ [content]       │
├─ Ring: 2px solid primary
└─ Offset: 2px
```

---

## Responsive Behavior

### Desktop (≥1024px)
- Pros/Cons in 2-column grid
- Cards side-by-side
- Full animation sequence

### Tablet (640-1023px)
- Pros/Cons still 2-column but narrower
- Cards still side-by-side
- Same animations

### Mobile (<640px)
- All sections stack vertically
- Single column layout
- Full-width cards
- Same animations (entrance times adjust for visibility)

---

## Accessibility Features (Visual)

```
✓ High contrast text (8:1 ratio minimum)
  └─ Black text on white: 21:1 ✓
  └─ Gray-700 on white: 10:1 ✓

✓ Color + icon indicates meaning
  └─ Green + ✓ = strengths
  └─ Orange + ⚠ = cautions
  └─ Purple + 🎯 = recommendation

✓ Focus visible (keyboard navigation)
  └─ 2px blue ring around focused element
  └─ 2px offset for visibility

✓ Motion respects preferences
  └─ @media (prefers-reduced-motion)
  └─ Animations: 0ms or very fast

✓ Semantic structure
  └─ Proper heading hierarchy (h2, h3)
  └─ List items in <ul> or <ol>
  └─ Roles and aria-labels where needed
```

---

## Component Spacing

```
Header → Summary:        32px gap
Summary → Confidence:    24px gap
Confidence → Grid:       24px gap
Grid (columns):          24px gap (between Pros/Cons)
Grid items (vertical):   12px gap
Grid → Recommendation:   24px gap
Recommendation → Footer: 16px gap

Internal padding:        24px (cards)
                         12px (list items)
```

---

## Loading State

```
Before data loads:
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Skeleton shimmer
├─────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓                   │
├─────────────────────────────┤
│ ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓          │
│ ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓          │
│ ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓          │

Shimmer animation: Left-to-right wave, 2s loop
```

---

## Typography Hierarchy

```
Header:           Heading 2, 24px, Bold
Sub-header:       Body, 14px, Regular (secondary text)

Section titles:   Heading 3, 18px, Semibold
Summary:          Body Large, 18px, Regular
List items:       Body, 16px, Regular
Supporting text:  Body Small, 14px, Regular, muted

Recommendation:   Body Large, 18px, Regular
Tags:             Label, 14px, Medium

Confidence %:     Display, 30px, Bold
Confidence label: Body Small, 14px, Regular
```

---

## Visual Hierarchy (Importance)

```
1. Confidence Score (largest visual element)
   └─ Shows credibility at a glance

2. Pros & Cons Grid (balanced visibility)
   └─ Main decision factors

3. Recommendation Card (action guidance)
   └─ Helps finalize decision

4. Summary Card (context)
   └─ Supporting narrative

5. Footer (disclosure)
   └─ Data source attribution
```

---

## Dark Mode Notes

All colors automatically adjust:
- Blue-50 → Blue-950/20 (lighter)
- Text: Gray-800 → Gray-100 (lighter)
- Backgrounds remain readable with adjusted opacity
- Icon colors slightly lighter for visibility
- Contrast maintained at 7:1 minimum

```
Light mode:  Blue-50 background, Gray-800 text
Dark mode:   Blue-950/20 background, Gray-100 text
             ↓
             Both readable with proper contrast
```
