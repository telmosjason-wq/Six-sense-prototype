# UI Redesign: Light Theme Specification

## Status: Draft — Accounts view implemented, pending approval before full rollout

## Overview

The current prototype uses an all-dark theme. The proposed redesign shifts the main content area to a light/white aesthetic while keeping the left navigation dark — matching modern CRM patterns (Crisp, Attio, Linear).

A toggle currently exists in the Accounts view to switch between light and dark modes for comparison.

## Design Direction

### Reference Images (from Jason's uploads)
- **Image 1 (Crisp Companies table):** White bg, subtle gray borders, colored status badges, company avatars with colored backgrounds, numbered rows, generous row height
- **Image 4 (Crisp Contacts + Add Column):** Clean column headers with icons, "Add Column" dropdown with field type picker
- **Image 5 (Crisp Contacts compact):** Status dots, clean header with count, search on right
- **Image 6 (Crisp Company detail):** Left sidebar with company details, right panel with activity tabs (All/Notes/Conversations), timeline history
- **Image 7 (Crisp Search):** Command-palette style search overlay with category filters, recent searches

### Core Principles
- **Dark sidebar + light content:** Left nav stays `#0a0e17`, main content shifts to `#f8f9fb` / `#ffffff`
- **Subtle borders:** `#e5e7eb` instead of the dark `#1e293b`
- **Colored pill badges:** Soft background tints (e.g., green text on green/5% bg) with rounded corners
- **Company avatars:** Deterministic color from company name hash, first letter, rounded square (8px radius)
- **Generous spacing:** 14px row padding, 32px page padding, 24px section gaps
- **No gradients or glow effects:** Clean, flat, professional

## Color Palettes

### Sidebar (unchanged)
```
bg:         #0a0e17
bgPanel:    #0d1321
border:     #1e293b
text:       #e2e8f0
textMuted:  #8892a4
accent:     #22d3ee
```

### Main Content (new)
```
bg:         #f8f9fb    (page background)
bgCard:     #ffffff    (cards, tables, panels)
bgHover:    #f1f3f7    (row/item hover)
bgPanel:    #f3f4f8    (secondary panels)
border:     #e5e7eb    (primary borders)
borderLight:#d1d5db    (heavier borders)
text:       #1a1d23    (primary text)
textMuted:  #6b7280    (secondary text)
textDim:    #9ca3af    (tertiary/disabled text)
accent:     #0891b2    (primary action color)
accentLight:#ecfeff    (accent background tint)
```

### Semantic Colors (light variants)
```
green:      #059669    greenLight: #ecfdf5
orange:     #d97706    orangeLight:#fffbeb
red:        #dc2626    redLight:   #fef2f2
purple:     #7c3aed    purpleLight:#f5f3ff
blue:       #2563eb    blueLight:  #eff6ff
pink:       #db2777
```

## Component Specifications

### Table Rows
- Row height: ~50px (14px top/bottom padding + content)
- Numbered column (#) on left, 40px wide
- Hover: `#f1f3f7` background
- Border: `1px solid #e5e7eb` between rows
- Sticky header with white background

### Badges / Pills
- Border radius: 20px (fully rounded)
- Padding: 3px 10px
- Font: 11px, weight 600
- Color: semantic color at full saturation
- Background: semantic color at ~8% opacity (`color + "14"`)

### Company Avatars
- Size: 34x34px
- Border radius: 8px (rounded square)
- Background: hash-derived color at 10% opacity
- Border: 1.5px solid color at 19% opacity
- Content: First letter, 40% of size, weight 700

### Score Bars
- Width: 60px
- Height: 5px
- Track: `#e5e7eb`
- Fill: green (>70%), orange (40-70%), red (<40%)
- Label: 12px, weight 600, matching fill color

### Page Header
- Background: white (`#ffffff`)
- Bottom border: `1px solid #e5e7eb`
- Title: 22px, weight 700, `#1a1d23`
- Count badge: 16px, weight 500, `#9ca3af`
- Search input: 240px, 8px padding, 8px border-radius, `#f8f9fb` background
- Action buttons: 8px 14px padding, 8px border-radius, `#e5e7eb` border
- Primary button: `#0891b2` background, white text

### Stats Bar
- Inline (not cards), horizontal layout
- Number: 20px, weight 700
- Label: 12px, `#6b7280`
- Gap: 24px between stats

## Views to Redesign (in order)

### Phase 1: Accounts ✅ (implemented)
- [x] Light table with company avatars
- [x] Integrated header with search, sort, filter
- [x] Stats bar
- [x] Add Column dropdown with enrich option
- [x] Toggle between light/dark for comparison

### Phase 2: Contacts
- [ ] Same table treatment as accounts
- [ ] Contact avatars (circle, colored initials)
- [ ] Archetype badges as colored pills
- [ ] Signal field chips
- [ ] Score pills

### Phase 3: Activities Feed
- [ ] Light timeline/table
- [ ] Activity type filter pills
- [ ] Date range picker with light inputs
- [ ] Entity links

### Phase 4: Audiences
- [ ] Audience cards on light background
- [ ] Member table with light treatment
- [ ] Membership log with light timeline

### Phase 5: Content
- [ ] Content cards with light styling
- [ ] Engagement metrics

### Phase 6: Signals
- [ ] Signal config cards
- [ ] Signal detail with event ledger
- [ ] Chain visualization

### Phase 7: Modals (Account Detail, Contact Detail, Content Detail)
- [ ] Light modal backgrounds
- [ ] Tab styling update
- [ ] Field grids on white
- [ ] Activity timeline in light
- Note: These are complex — the company detail reference (Image 6) shows a split layout with left sidebar + right activity panel that could inform the redesign

### Phase 8: Intelligence / Scoring
- [ ] Light cards for scoring models
- [ ] Buying stage chart with light palette
- [ ] Graph visualization on light background
- [ ] Variant editor

### Phase 9: Workflows
- [ ] Light canvas with light grid
- [ ] Node cards with light borders
- [ ] Config panel

### Phase 10: RevvyAI
- [ ] Chat bubbles on light background
- [ ] Agent cards

## Additional UI Patterns from References

### Command Palette Search (Image 7)
- Floating overlay search with category tabs (Accounts, Contacts, Signals, etc.)
- Recent searches
- Keyboard hints (Select, Enter, Esc)
- Could replace or augment the current search input

### Add Column Dropdown (Image 4)
- Field type icons (Text, Number, Status, etc.)
- Segmented by type
- Currently partially implemented in Accounts view

### Company Detail Split Layout (Image 6)
- Left: Company details card + Contact details card
- Right: Activity feed with tabs (All, Notes, Conversations, Interactions, Reminders, Files)
- Timeline with icons per activity type
- Could inform AccountDetail modal redesign

## Implementation Notes

- Light palette defined in `src/components/ui/theme.js` as `L` export
- Dark palette preserved as `C` export (unchanged)
- `AccountsView` component at `src/views/AccountsView.jsx` is the reference implementation
- `uiMode` state in App.jsx controls toggle (currently only for Accounts)
- When rolling out to other views, each view gets its own component file in `src/views/`
- Shared light UI primitives (LBadge, ScorePill, CompanyAvatar) are currently in AccountsView — should be extracted to `src/components/ui/light.jsx` when scaling
