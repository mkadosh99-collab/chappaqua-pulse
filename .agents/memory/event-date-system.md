---
name: Event date system (scraper)
description: How curated events get their dates, and how to add fixed-date events correctly.
---

# Event date system in server/scraper.ts

There are two kinds of curated events:

- **Recurring/weekly** events in `getRealCurrentEvents()` use a `day(offset, h, m)` helper that
  computes dates **relative to the current week's Sunday**. They re-anchor to whatever week the
  server is in, so they always show "this week / next week".
- **Fixed-calendar** events (e.g. the New Castle Parks & Rec 2026 season in `getParksAndRecEvents()`)
  must use absolute `new Date(year, monthIndex, day, h, m)` — `monthIndex` is 0-based (Jan=0).
  Do NOT use the relative `day()` helper for these, or they'll drift to the current week.

**Why:** mixing the two silently breaks fixed-date events — a "Dec 6 2026" event built with `day()`
would render in the current week instead.

# Month calendar range query

`GET /api/events` accepts either `weekStart` (single week) or `from`+`to` (arbitrary range, used by
the month calendar view). The route reuses `storage.getEventsByWeek(start, end)`, which is just an
inclusive date-range filter despite its name. The month view fetches the full visible grid
(start-of-week of month start .. end-of-week of month end).
