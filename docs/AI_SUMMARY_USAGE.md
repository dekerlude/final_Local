# AI Summary Component - Usage Guide

## Quick Start

### Basic Usage
```tsx
import { AIRefinedSummary } from "@/components/dashboard/AIRefinedSummary";
import { FAMILY_BROOKLYN_SUMMARY } from "@/components/dashboard/AIRefinedSummary.stories";

export function MyComponent() {
  return <AIRefinedSummary data={FAMILY_BROOKLYN_SUMMARY} />;
}
```

### With Mock Data
```tsx
import { AIRefinedSummary } from "@/components/dashboard/AIRefinedSummary";

const mockData = {
  summary: "Your analysis text here...",
  confidence: 92,
  pros: ["Pro 1", "Pro 2", ...],
  cons: ["Con 1", "Con 2", ...],
  recommendation: "Your recommendation here...",
  profile: "FAMILY" as const,
  score: 91,
};

export function MyComponent() {
  return <AIRefinedSummary data={mockData} />;
}
```

### With Loading State
```tsx
<AIRefinedSummary data={mockData} loading={true} />
```

---

## Data Structure

```typescript
interface AISummaryData {
  summary: string;              // 200-300 word analysis
  confidence: number;           // 0-100 percentage
  pros: string[];              // 6 items, specific and measurable
  cons: string[];              // 6 items, honest trade-offs
  recommendation: string;       // 2-3 paragraph guidance
  profile: UserProfile;         // "FAMILY" | "STUDENT" | "PROFESSIONAL"
  score: number;               // 0-100 overall score
}
```

---

## Component Structure

```
AIRefinedSummary
├── Header (Title + Badge)
├── Summary Card
├── Confidence Score (with animated bar)
├── Pros & Cons Grid
│   ├── Pros Card (Green)
│   └── Cons Card (Orange)
├── Recommendation Card (Purple)
└── Footer (Attribution)
```

---

## Styling Reference

### Colors
| Component | Theme | Hex | Variable |
|-----------|-------|-----|----------|
| Summary | Blue gradient | `#EFF6FF → #DBEAFE` | `from-blue-50 to-blue-100/50` |
| Confidence 85%+ | Green | `#10B981` | `bg-green-500` |
| Confidence 70-84% | Blue | `#3B82F6` | `bg-blue-500` |
| Pros | Green gradient | `#ECFDF5` | `from-green-50 to-green-100/50` |
| Cons | Orange gradient | `#FEF3C7` | `from-orange-50 to-orange-100/50` |
| Recommendation | Purple gradient | `#F3E8FF` | `from-purple-50 to-purple-100/50` |

### Animations
- **Summary:** Fade in, 0.6s, 0.2s delay
- **Confidence bar:** Fill 0-100%, 1.5s ease-out
- **Pros/Cons items:** Stagger left/right, 0.4s each, 50ms between
- **Icon:** Rotate, 3s loop, infinite

---

## Content Guidelines

### Summary (200-300 words)
✓ Start with key strengths
✓ Context for selected profile
✓ Acknowledge trade-offs
✓ Professional yet human tone

### Pros (6 items)
✓ Specific: "PS 8 in top 5% state rankings"
✗ Generic: "good schools"
✓ Measurable: "15% below NYC average crime"
✗ Vague: "safe area"

### Cons (6 items, called "Trade-offs")
✓ Real limitations: gentrification, homelessness
✓ Impact on profile: noise for families vs. students
✓ Specific: "median rent $2,200+ for 1BR"
✓ Honest: acknowledge what the neighborhood lacks

### Recommendation (2-3 paragraphs)
✓ "Best for" criteria
✓ "Reconsider if" situations
✓ Profile-specific guidance
✓ Non-judgmental tone

---

## Confidence Score Guide

### 85%+ (Excellent)
- Established neighborhood with abundant data
- Long history and stable patterns
- Comprehensive public records
- **Example:** Brooklyn Heights (92%)

### 70-84% (Good)
- Popular areas with good data coverage
- Clear metrics and patterns
- Some uncertainty in emerging factors
- **Example:** Mission District (85%)

### 50-69% (Moderate)
- Under development or changing areas
- Some metrics incomplete
- Future trajectory uncertain
- **Example:** Emerging neighborhood (62%)

### <50% (Low - Not recommended for display)
- Insufficient data for reliable scoring
- Too much uncertainty
- Would require disclaimers

---

## Responsive Behavior

### Desktop (lg)
```
┌─────────────────────┐
│   Header + Badge    │
├─────────────────────┤
│ Summary Card (full) │
├─────────────────────┤
│ Confidence (full)   │
├────────────┬────────┤
│   Pros     │  Cons  │
│ (50% each) │        │
├────────────┴────────┤
│ Recommendation (full)│
└─────────────────────┘
```

### Mobile (responsive)
```
┌──────────────┐
│ Header+Badge │
├──────────────┤
│Summary (100%)│
├──────────────┤
│Confidence(100%)
├──────────────┤
│ Pros (100%)  │
├──────────────┤
│ Cons (100%)  │
├──────────────┤
│ Recommend(100%)
└──────────────┘
```

---

## Integration Points

### In Dashboard
```tsx
// After profile selection
{selectedProfile && (
  <AIRefinedSummary
    data={personalisedAISummary}
    loading={isGenerating}
  />
)}
```

### With Real API
```typescript
// When ready to integrate AI service
const response = await generateNeighborhoodSummary({
  neighborhoodId: params.id,
  profile: selectedProfile,
  score: rawScore,
});

const aiData: AISummaryData = {
  summary: response.summary,
  confidence: response.confidence,
  pros: response.strengths,
  cons: response.tradeoffs,
  recommendation: response.guidance,
  profile: selectedProfile,
  score: rawScore,
};
```

---

## Accessibility Checklist

- [x] Contrast ratio 7:1 for all text
- [x] Color not used alone (icons + text)
- [x] Semantic HTML structure
- [x] Heading hierarchy (h2, h3)
- [x] Focus visible on interactive elements
- [x] Respects `prefers-reduced-motion`
- [x] Screen reader friendly labels
- [x] Alt text for icons
- [x] Keyboard navigable

---

## Performance Notes

- Component uses Framer Motion for animations
- Animations respect user preferences
- No external API calls within component (pass data as props)
- Lazy rendering of list items (staggered)
- Optimized for Light and Dark modes

---

## Known Limitations (MVP)

- Mock data only (no real AI integration)
- Fixed list of 6 pros/cons (could be variable length)
- No filtering or sorting of factors
- No drill-down into individual metrics
- No comparison to other neighborhoods
- No user feedback loop for AI improvement

---

## Future Enhancements

1. **Click-through sources:** Each pro/con links to data source
2. **Timeline view:** Historical trends in scores
3. **Factor weights:** Adjust importance of each category
4. **Comparison:** Side-by-side with other neighborhoods
5. **Export:** PDF or share-ready format
6. **Feedback:** "Was this helpful?" for AI tuning
7. **Explanations:** "Why did it score this way?"
8. **Customization:** User-provided factors and preferences

---

## Testing Strategy

### Visual Testing
- [ ] Light mode appearance
- [ ] Dark mode appearance
- [ ] Mobile responsiveness
- [ ] Animation smoothness
- [ ] Color contrast ratios

### Content Testing
- [ ] Profile-specific wording renders correctly
- [ ] Confidence score displays with correct color
- [ ] Pros/cons list items animate with stagger
- [ ] Recommendation shows personalized content

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] High contrast mode readable
- [ ] Motion respects `prefers-reduced-motion`

---

## Example Data Sets Included

1. **FAMILY_BROOKLYN_SUMMARY**
   - 92% confidence
   - Profile: Family
   - Score: 91
   - Use case: Established, data-rich neighborhood

2. **STUDENT_MISSION_DISTRICT_SUMMARY**
   - 85% confidence
   - Profile: Student
   - Score: 78
   - Use case: Urban, vibrant neighborhood

3. **PROFESSIONAL_CAPITOL_HILL_SUMMARY**
   - 88% confidence
   - Profile: Professional
   - Score: 85
   - Use case: Career-focused, social scene

4. **LOWCONF_EMERGING_SUMMARY**
   - 62% confidence
   - Profile: Professional
   - Score: 65
   - Use case: Under-development neighborhood

---

## Questions & Support

**Q: Can I change the number of pros/cons?**
A: Yes, just edit the array in your data object. Component handles variable lengths.

**Q: How do I customize colors?**
A: Edit the Tailwind classes or override via CSS. Color logic in `getConfidenceColor()` and `getConfidenceBg()`.

**Q: Can I use without mock data?**
A: Yes, pass your own `AISummaryData` object with real API responses.

**Q: Does this include AI generation?**
A: No, this is pure UI/UX design. It's a placeholder for future AI integration.
