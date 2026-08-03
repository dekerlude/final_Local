# Frontend Redesign – Manual Testing Guide

## Prerequisites
- Dev server running: `npm run dev:frontend` (or `npm run dev` for full stack)
- Backend running (if testing the full personalize → summary flow)
- Open browser to http://localhost:3002 (or 3000 if port available)

---

## Test Cases

### ✅ Test 1: Home / Search Page
1. **Navigate to** `/app` (home/search page)
2. **Verify:**
   - [ ] Animated ambient blobs visible in background (2 large gradient circles)
   - [ ] Floating glowing particle visible on desktop (top-left area, may be subtle)
   - [ ] Search bar has glassmorphic effect (semi-transparent, blurred)
   - [ ] Type a neighborhood name (e.g., "Brooklyn", "Manhattan", "San Francisco")
   - [ ] Dropdown appears with glowing glass background
   - [ ] Hover over result card → see elevation effect (card rises slightly)
   - [ ] Click result → navigate to neighborhood dashboard

### ✅ Test 2: Neighborhood Dashboard
1. **After searching and selecting a neighborhood:**
2. **Verify:**
   - [ ] Ambient background animated (blobs moving smoothly)
   - [ ] "Overall Score" card has PRIMARY color glow
   - [ ] "Population" card has INFO (cyan) color glow
   - [ ] "Area" card has SUCCESS (green) color glow
   - [ ] "Categories" card has WARNING (amber) color glow
   - [ ] Large gradient score text visible in primary card
   - [ ] Hover over any stat card → glow intensity increases
   - [ ] Scroll down to metrics breakdown
   - [ ] Each metric card has color-coded glow based on score:
     - 80+: green glow (success)
     - 60-79: amber glow (warning)
     - <40: red glow (danger)
   - [ ] Score bars animate on page load (width grows from 0 to metric.score%)
   - [ ] "Personalize My Score" button visible at bottom

### ✅ Test 3: Personalize – Priority Selection
1. **Click "Personalize My Score"**
2. **Verify:**
   - [ ] Page has glassmorphic header and ambient background
   - [ ] Title is "What Matters to You?" (centered, large)
   - [ ] 10 priority cards visible in 2-column grid
   - [ ] Hover over priority card → see border change to blue, slight lift
   - [ ] Click priority card → custom checkbox animates in (checkmark appears)
   - [ ] Card background becomes `primary/10` (light blue)
   - [ ] Selected card's label shows count: "X/5 selected" (top-right)
   - [ ] Drag a selected priority card → it becomes semi-transparent during drag
   - [ ] Drop over another card → priorities reorder
   - [ ] When 5 selected, count badge animates to slight scale up
   - [ ] "Continue to Personalized Score" button enabled only when 5 selected
   - [ ] Click button → navigate to results page

### ✅ Test 4: Personalize – Score Results
1. **After selecting 5 priorities and clicking "Continue":**
2. **Verify:**
   - [ ] Large score display with GRADIENT text (e.g., "82")
   - [ ] Score badge shows label ("Excellent", "Good", etc.) with appropriate color
   - [ ] Ranked priorities list shows:
     - [ ] Medal emoji (🥇🥈🥉 4+) with animated glow
     - [ ] Factor name
     - [ ] Hoverable with border highlight
   - [ ] "Neighborhood Strengths" section with StrengthCard components:
     - [ ] Green CheckCircle icon
     - [ ] "Excellent" label
     - [ ] Factor name
     - [ ] Animate in on load
   - [ ] "Areas to Consider" section with TradeoffCard components:
     - [ ] Amber AlertCircle icon
     - [ ] "Trade-off" label
     - [ ] Factor name
   - [ ] "Full Analysis" button at bottom (was generating AI summary)

### ✅ Test 5: Summary Page (The Fix)
1. **Click "Full Analysis" button** (should now navigate to `/summary?...`)
2. **Verify:**
   - [ ] Summary page loads (was previously a stub)
   - [ ] Shows navigation: Back button, Home button
   - [ ] Displays score breakdown (same as previous page)
   - [ ] Shows neighborhood strengths (StrengthCard list)
   - [ ] Shows areas to consider (TradeoffCard list)
   - [ ] **AI Insight card** visible (this was missing before):
     - [ ] Sparkles icon animated (rotating)
     - [ ] Real AI-generated summary text displayed (not placeholder)
     - [ ] Glassmorphic background with gradient
   - [ ] CTA buttons: "Search Another" and "Explore More"
   - [ ] All text uses token-based colors (no hardcoded gray)

### ✅ Test 6: Dark Mode
1. **System settings:** Toggle OS dark mode (or browser dev tools)
2. **Verify across ALL pages:**
   - [ ] Background transitions from light gradient to dark gradient
   - [ ] Text colors invert appropriately (light text on dark, dark text on light)
   - [ ] Glassmorphic cards maintain visibility (background and borders adjust)
   - [ ] All glow effects (GlowCard, search bar, icons) remain visible
   - [ ] No hardcoded gray/white flashes
   - [ ] Accent colors (blue, green, amber, red) remain vibrant and accessible

### ✅ Test 7: Header Scroll Elevation
1. **Navigate to any page with scrollable content**
2. **Verify:**
   - [ ] Header (AppHeader) is initially semi-transparent with lighter blur
   - [ ] Scroll down the page
   - [ ] Header background becomes more opaque and blur increases
   - [ ] Transition is smooth (300ms easing)
   - [ ] Logo and navigation links remain visible throughout

### ✅ Test 8: Responsive Design
1. **Desktop (1024px+):**
   - [ ] Multi-column layouts (2-3 columns)
   - [ ] All cards properly spaced
   - [ ] Hover effects work

2. **Tablet (640px–1024px):**
   - [ ] Grid changes to 2 columns where applicable
   - [ ] Cards sized appropriately
   - [ ] Spacing adjusted

3. **Mobile (320px–640px):**
   - [ ] Single column layouts
   - [ ] Buttons stack vertically
   - [ ] Text size readable (no overflow)
   - [ ] Search bar full width
   - [ ] Priority cards single column
   - [ ] Touch targets at least 44px tall

### ✅ Test 9: Accessibility
1. **Keyboard navigation:**
   - [ ] Tab through all interactive elements (buttons, inputs, cards)
   - [ ] Focus ring visible on every focused element
   - [ ] Can activate buttons with Enter/Space
   - [ ] Can type in search input

2. **Screen reader (optional, using browser accessibility inspector):**
   - [ ] Buttons have accessible names (no icon-only buttons)
   - [ ] Form labels present
   - [ ] Headings in proper hierarchy (h1 → h2 → h3)

3. **Reduced motion:**
   - [ ] Browser dev tools → three dots → More Tools → Rendering → disable animations
   - [ ] Refresh page
   - [ ] Animations should not play (instant transitions)
   - [ ] Page remains fully functional and readable

### ✅ Test 10: Loading & Error States
1. **Simulate slow network (Chrome DevTools → Network → throttle to "Slow 3G")**
2. **Personalize page:**
   - [ ] While loading results, see LoadingState (with Skeleton components)
   - [ ] Skeleton shimmer animation smooth
   - [ ] Page transitions smoothly when content loads

3. **Simulate network error (offline mode or invalid request):**
   - [ ] ErrorState displays
   - [ ] AlertCircle icon shown
   - [ ] Error message readable
   - [ ] Retry button functional

### ✅ Test 11: Animation Smoothness
1. **Open browser DevTools → Performance tab**
2. **Record while:**
   - [ ] Hovering over cards (should see 60 FPS, no jank)
   - [ ] Dragging priority cards (smooth movement)
   - [ ] Scrolling page (smooth 60 FPS)
   - [ ] Page transitions (motion effects play smoothly)
3. **Verify:** No red frames in performance timeline (would indicate layout thrashing)

### ✅ Test 12: Complete User Flow (End-to-End)
1. Start at `/app`
2. Search for a neighborhood (e.g., "Brooklyn Heights")
3. Click result → Neighborhood Dashboard
4. Click "Personalize My Score"
5. Select 5 priorities, drag to rank, click "Continue"
6. See score results and "Full Analysis" button
7. Click "Full Analysis" → Summary page
8. Verify AI summary is displayed (not placeholder)
9. Click "Home" → back to search page
10. ✅ Flow complete without errors

---

## Performance Verification

### Bundle Size
- Dev server should start in <5 seconds (was ~3.4s in verification)
- No new npm packages (check `npm ls` output)

### Network Tab
- No new large assets
- CSS and JS loads without errors

### Console
- No console errors or warnings (TSLint clean)

---

## Visual Regressions Check

### Ensure No Breakage
- [ ] Previous functionality all works (search, navigate, personalize, API calls)
- [ ] No 404s for missing components or assets
- [ ] No console errors from missing imports
- [ ] Backend API still receives correct requests (no payload changes)

---

## Sign-Off

Once all checks pass:

```
✅ Design: Premium, Apple-like aesthetic achieved
✅ Functionality: All MVP features working, summary page fixed
✅ Accessibility: Dark mode, keyboard nav, reduced motion supported
✅ Responsive: Mobile-to-desktop layouts all responsive
✅ Performance: Type-safe, no new dependencies, smooth animations
✅ Code Quality: Clean, DRY, reusable primitives extracted
```

**Ready for commit and user review.**
