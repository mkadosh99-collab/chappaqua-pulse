# Chappaqua Pulse - Design Guidelines

## Design Approach
**System**: Material Design principles adapted for local event discovery
**References**: Eventbrite, Meetup, modern community calendar platforms
**Core Principle**: Information-dense yet scannable layout optimized for quick event discovery

## Typography System

**Primary Font**: Inter (Google Fonts)
**Secondary Font**: System UI fallback

Hierarchy:
- App Title/Header: 2xl (24px), semibold
- Section Headers: xl (20px), semibold
- Event Titles: lg (18px), medium
- Event Details: base (16px), regular
- Metadata/Labels: sm (14px), medium
- Timestamps/Fine Print: xs (12px), regular

## Layout & Spacing

**Container**: max-w-7xl centered with px-4 md:px-6 lg:px-8
**Spacing Scale**: Use Tailwind units of 2, 3, 4, 6, 8, 12
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Element margins: m-2 to m-4

**Grid System**:
- Desktop: 2-3 column event card grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Tablet: 2 columns
- Mobile: Single column stack

## Component Library

### Header/Navigation
- Fixed top bar with app branding
- Quick filter chips (Community, Library, Arts, Recreation, Schools)
- Week selector navigation (< Previous Week | Current Week | Next Week >)
- Search bar for event lookup

### Event Cards
Material-inspired elevated cards with:
- Category badge (top-left corner, small rounded pill)
- Event title (prominent, medium weight)
- Date/time row with calendar icon
- Location with map pin icon
- Brief description (2-line truncate)
- "Learn More" text link (bottom-right)
- Subtle shadow (shadow-md) with hover lift (hover:shadow-lg)
- Rounded corners (rounded-lg)
- Padding: p-6

### Filter Bar
- Horizontal scrollable chip list on mobile
- Category pills with count badges
- "All Events" default state
- Active state with subtle background

### Weekly View Header
- Large week range display ("Dec 2-8, 2024")
- Navigation arrows on sides
- "Today" quick jump button
- Events count indicator

### Calendar Mode (Alternative View)
- Traditional 7-day grid layout
- Event dots/indicators on dates
- Click to expand day details
- Toggle between list/calendar views

### Empty States
- Friendly illustration placeholder
- "No events this week" message
- Suggestion to check other weeks or categories

### Loading States
- Skeleton cards matching event card layout
- Smooth fade-in transitions

## Responsive Behavior

**Desktop (lg+)**:
- 3-column event grid
- Persistent sidebar filters (optional left rail)
- Full navigation visible

**Tablet (md)**:
- 2-column event grid
- Horizontal filter chips
- Compact header

**Mobile (base)**:
- Single column stack
- Sticky filter bar below header
- Simplified navigation
- Bottom sheet for filters (optional)

## Information Hierarchy

Event cards prioritize:
1. Category visual identifier (badge)
2. Event title (largest text)
3. Date/time (icon + bold text)
4. Location (icon + regular text)
5. Description preview
6. Action link

## Interactions

- Cards: Smooth hover elevation (transition-shadow duration-200)
- Filter chips: Active state with subtle scale
- Week navigation: Instant update (no page refresh)
- Search: Debounced with loading indicator
- No distracting animations - keep interactions purposeful

## Layout Structure

**Main Container**:
```
[Fixed Header with Navigation + Filters]
[Week Range Display with Navigation]
[Event Grid Container]
  - Event cards in responsive grid
  - Auto-height based on content
[Footer with source attribution]
```

## Images

**Small Event Thumbnails** (if available from sources):
- Aspect ratio: 16:9
- Size: Small thumbnail in top portion of card
- Fallback: Category-based gradient or icon
- Not required - many events won't have images

**No Hero Image**: This is a functional app, not a marketing page - lead directly with the weekly event listings

## Key Design Details

- Use subtle dividers between days/sections
- Implement subtle micro-interactions on card hover
- Category color-coding system (assigned per category type)
- Consistent iconography using Heroicons
- "Last Updated" timestamp in footer
- Source attribution links
- Mobile-optimized tap targets (min 44px)

## Accessibility

- Semantic HTML throughout
- ARIA labels on filter chips and navigation
- Keyboard navigation support
- Focus indicators on interactive elements
- Sufficient contrast ratios
- Screen reader friendly event details