---
name: Recreation & Parks scraper
description: Non-obvious gotchas for scraping New Castle Recreation events from the CivicPlus calendar.
---

# Recreation & Parks live scraper

The New Castle Recreation & Parks schedule is scraped from the town's CivicPlus
**monthly** calendar grid: `Calendar.aspx?month=<M>&year=<Y>&calType=0` (month is 1-based).
The department has no machine-readable feed and the RSS feed returns only 1 item — unusable.

Non-obvious gotchas (the reason this took several attempts):

- **Dates must come from the schema.org `startDate` microdata, never the DOM id suffix.**
  Each visible popover is `div[id^="parentdiv<EID>_<N>"]`, but `<N>` is a grid-cell index
  that overflows past month end (e.g. `_34`), so it is NOT the day-of-month.

- **Two nodes per event, paired by document order — not by title, not by DOM sibling.**
  Each visible popover (carries category via `.visuallyHidden`, time/location via dl dt/dd,
  and the EID) is immediately followed in document order by a hidden
  `[itemtype="http://schema.org/Event"]` block (carries `startDate`). They are NOT siblings,
  so cheerio `nextAll` fails — walk a combined selector in document order and pair each Event
  block with the popover seen just before it. Joining by title is wrong: recurring titles
  (e.g. "Senior Program: ...") repeat in a month with different EIDs/dates per occurrence.

- Only categories matching `/recreation|parks|senior|dance/i` are kept (dance → performing-arts).
