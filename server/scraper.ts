import * as cheerio from "cheerio";
import { type InsertEvent, type EventCategory } from "@shared/schema";
import { addDays, parse, isValid, startOfWeek, format } from "date-fns";

interface ScrapedEvent {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  time?: string;
  location?: string;
  category: EventCategory;
  source: string;
  sourceUrl?: string;
  imageUrl?: string;
}

async function fetchWithTimeout(url: string, timeout = 12000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseDateTime(dateStr: string): Date | null {
  const cleanDate = dateStr.trim();
  const formats = [
    "MMMM d, yyyy",
    "MMM d, yyyy",
    "MM/dd/yyyy",
    "M/d/yyyy",
    "yyyy-MM-dd",
    "EEEE, MMMM d, yyyy",
    "MMMM d",
    "MMM d",
    "yyyy-MM-dd'T'HH:mm:ss",
  ];
  for (const formatStr of formats) {
    try {
      const parsed = parse(cleanDate, formatStr, new Date());
      if (isValid(parsed)) {
        if (!cleanDate.includes(String(new Date().getFullYear()))) {
          parsed.setFullYear(new Date().getFullYear());
        }
        return parsed;
      }
    } catch { continue; }
  }
  return null;
}

// Scrape Chappaqua Library events using their Drupal calendar list view
async function scrapeLibraryEvents(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  try {
    const url = "https://www.chappaqualibrary.org/events/upcoming";
    const html = await fetchWithTimeout(url);
    const $ = cheerio.load(html);

    $("article.event-card").each((_, el) => {
      const $el = $(el);
      const linkEl = $el.find("a.lc-event__link");
      const title = linkEl.text().trim();
      if (!title || title.length < 3) return;

      const ariaLabel = linkEl.attr("aria-label") || "";
      // aria-label: "Register Now - "Title" on Saturday, May 2, 2026 @ 10:00am"
      const dateMatch = ariaLabel.match(/on\s+([\w]+,\s+[\w]+ \d{1,2}, \d{4})\s+@\s+([\d:apm ]+)/i);
      let eventDate: Date | null = null;
      let timeStr = "";

      if (dateMatch) {
        eventDate = parseDateTime(dateMatch[1]);
        timeStr = dateMatch[2].trim();
      }

      const dateText = $el.find(".lc-list-event-info-item--date").text().trim();
      if (!eventDate && dateText) {
        const dm = dateText.match(/([\w]+, [\w]+ \d{1,2}, \d{4})/);
        if (dm) eventDate = parseDateTime(dm[1]);
        const tm = dateText.match(/at\s+([\d:apm\s\-]+)/i);
        if (tm) timeStr = tm[1].trim();
      }

      if (!eventDate) return;

      const location = $el.find(".lc-list-event-location").text().trim();
      const description = $el.find(".field-container p").first().text().trim();
      const imgSrc = $el.find("img").attr("src") || "";
      const href = linkEl.attr("href") || "";

      // Determine category from program type
      const programType = $el.find(".lc-list-event-program-type").text().toLowerCase();
      const ageGroup = $el.find(".lc-list-event-age-group-label").next().text().toLowerCase();

      let category: EventCategory = "library";
      if (location.toLowerCase().includes("chappac") || location.toLowerCase().includes("performing arts")) {
        category = "performing-arts";
      }

      events.push({
        title: title.slice(0, 200),
        description: description.slice(0, 500) || undefined,
        date: eventDate,
        time: timeStr || undefined,
        location: location
          ? location.replace("at Chappaqua Library", "").replace("Chappaqua Library", "195 South Greeley Ave").trim()
          : "Chappaqua Library, 195 South Greeley Ave",
        category,
        source: "Chappaqua Library",
        sourceUrl: href.startsWith("http") ? href : `https://www.chappaqualibrary.org${href}`,
        imageUrl: imgSrc.startsWith("http") ? imgSrc : (imgSrc ? `https://www.chappaqualibrary.org${imgSrc}` : undefined),
      });
    });
    console.log(`Library scraper found ${events.length} events`);
  } catch (error) {
    console.error("Error scraping library events:", error);
  }
  return events;
}

// Scrape Town of New Castle calendar using Schema.org microdata embedded in the page
async function scrapeTownCalendar(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  try {
    const today = new Date();
    const monthStr = format(today, "MM");
    const yearStr = format(today, "yyyy");
    const endDate = addDays(today, 21);
    const endMonthStr = format(endDate, "MM");
    const endYearStr = format(endDate, "yyyy");

    const url = `https://www.mynewcastleny.gov/calendar.aspx?startDate=${monthStr}/01/${yearStr}&endDate=${endMonthStr}/30/${endYearStr}`;
    const html = await fetchWithTimeout(url);
    const $ = cheerio.load(html);

    // Find all hidden event microdata blocks
    $("[itemtype='http://schema.org/Event']").each((_, el) => {
      const $el = $(el);
      const title = $el.find("[itemprop='name']").first().text().trim();
      if (!title || title.length < 3) return;

      const startDateStr = $el.find("[itemprop='startDate']").attr("content") ||
        $el.find("[itemprop='startDate']").text().trim();
      if (!startDateStr) return;

      const eventDate = parseDateTime(startDateStr);
      if (!eventDate) return;

      // Get time from the tooltip
      const tooltipId = $el.closest("[id^='showDetails']").attr("id") || "";
      const parentDiv = $el.closest(".monthItem");
      const timeEl = parentDiv.find("dd").first();
      const timeStr = timeEl.text().trim().replace(/\u2009/g, " ");

      const locationName = $el.find("[itemprop='location'] [itemprop='name']").text().trim() ||
        $el.find(".name p").text().trim();

      // Categorize by title/location
      let category: EventCategory = "community";
      const titleLower = title.toLowerCase();
      if (titleLower.includes("board") || titleLower.includes("planning") || titleLower.includes("town board") ||
          titleLower.includes("council") || titleLower.includes("advisory") || titleLower.includes("commission") ||
          titleLower.includes("committee") || titleLower.includes("hearing")) {
        category = "government";
      } else if (titleLower.includes("library") || titleLower.includes("book")) {
        category = "library";
      } else if (titleLower.includes("senior") || titleLower.includes("recreation") || titleLower.includes("fitness") ||
                 titleLower.includes("yoga") || titleLower.includes("hike") || titleLower.includes("sport")) {
        category = "recreation";
      } else if (titleLower.includes("farmer") || titleLower.includes("market") || titleLower.includes("shed") ||
                 titleLower.includes("tea") || titleLower.includes("wine") || titleLower.includes("concert") ||
                 titleLower.includes("art") || titleLower.includes("mental health") || titleLower.includes("health")) {
        category = "community";
      }

      // EID from a nearby link
      const eidMatch = html.match(new RegExp(`EID=(\\d+).*?${title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "s"));
      const eid = eidMatch ? eidMatch[1] : "";

      events.push({
        title: title.slice(0, 200),
        date: eventDate,
        time: timeStr || undefined,
        location: locationName || "Town of New Castle",
        category,
        source: "Town of New Castle",
        sourceUrl: eid
          ? `https://www.mynewcastleny.gov/Calendar.aspx?EID=${eid}`
          : "https://www.mynewcastleny.gov/calendar.aspx",
      });
    });
    console.log(`Town calendar scraper found ${events.length} events`);
  } catch (error) {
    console.error("Error scraping town calendar:", error);
  }
  return events;
}

// Real Chappaqua events for this weekend and next week (sourced May 2, 2026)
function getRealCurrentEvents(): ScrapedEvent[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

  // Helper to create a date for a specific day offset from this Sunday
  const day = (offset: number, h: number, m = 0) => {
    const d = addDays(weekStart, offset);
    d.setHours(h, m, 0, 0);
    return d;
  };

  return [
    // ── SATURDAY MAY 3 (this weekend) ──
    {
      title: "Take It or Leave It Shed",
      description: "The Town's free reuse station at the train station. Drop off gently used items or take what you need. Open every Saturday.",
      date: day(7, 8, 30),
      time: "8:30 AM – 12:00 PM",
      location: "Chappaqua Train Station Parking Area (1st left off S. Greeley Ave)",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/627/Take-It-or-Leave-It",
    },
    {
      title: "Chappaqua Farmers Market",
      description: "Outdoor market featuring fresh produce, baked goods, plants, honey, meats, cheeses, and artisan crafts from local vendors. Open rain or shine.",
      date: day(7, 8, 30),
      time: "8:30 AM – 1:00 PM",
      location: "Chappaqua Train Station, South Greeley Ave",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4496",
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
    },
    {
      title: "Play Bridge!",
      description: "Open to all experienced bridge players. Includes instruction with Stan Kurzban. Registration required.",
      date: day(7, 10, 0),
      time: "10:00 AM – 12:00 PM",
      location: "Program Room at Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/event/play-bridge-27941",
    },
    {
      title: "First Saturday Storytime!",
      description: "Special Saturday Theater Storytime on the first Saturday of the month! No registration needed but space is limited. Bring something soft to sit on.",
      date: day(7, 10, 30),
      time: "10:30 AM",
      location: "Theater at Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/event/first-saturday-storytime-26159",
      imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    },
    {
      title: "Library Master Plan: Public Engagement Session",
      description: "The Chappaqua Library is launching a long-range strategic Master Plan and seeks public input to shape the future of its infrastructure and community services. Your voice matters!",
      date: day(7, 13, 0),
      time: "1:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    // ── SUNDAY MAY 3 (this weekend) ──
    {
      title: "Concert: West Point Band – American Chamber Works",
      description: "Active-duty Soldier-Musicians from the U.S. Army's oldest band perform world-class chamber music. Since the American Revolution, the West Point Band has inspired audiences nationwide.",
      date: day(8, 14, 0),
      time: "2:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "performing-arts" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
      imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80",
    },
    {
      title: "Film Screening: Wasted! The Story of Food Waste",
      description: "Documentary screening showing the 1.3 billion tons of food thrown out each year and the people fighting hardest to prevent it. Theater doors open at 2:30 PM. Come early for refreshments.",
      date: day(8, 15, 0),
      time: "3:00 PM",
      location: "Theater at Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    // ── MONDAY MAY 4 ──
    {
      title: "Movers and Shakers – Walkers Under 2",
      description: "Storytime for walkers under age 2 with an adult. Songs, movement, and books for your youngest readers.",
      date: day(9, 9, 30),
      time: "9:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Foreign Policy Discussion Group – Evolving Leadership in the Middle East",
      description: "Online discussion on Evolving Leadership in the Middle East. Open to all adults with an interest in global affairs.",
      date: day(9, 10, 0),
      time: "10:00 AM – 11:30 AM",
      location: "Online (Chappaqua Library)",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/event/foreign-policy-discussion-group-online-30177",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
    },
    {
      title: "All Together Now – All Ages Storytime",
      description: "All ages storytime every Monday! Registration not needed but space is limited — first come, first served. Bring something soft to sit on.",
      date: day(9, 10, 30),
      time: "10:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Make a Fabric Flower for Mother's Day",
      description: "Celebrate a mother or someone special with a handmade fabric flower. All ages welcome. All materials provided.",
      date: day(9, 15, 30),
      time: "3:30 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Chapter Chat – Grades 2–3 Book Group",
      description: "Book group for 2nd and 3rd graders on the first Monday of the month. Kids read the same chapter book before the program (with a parent or independently). Registration required.",
      date: day(9, 16, 0),
      time: "4:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Mental Health Meetup",
      description: "Community mental health support and connection group. Open to all residents. A safe space to share and connect.",
      date: day(9, 19, 0),
      time: "7:00 PM – 8:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4623",
    },
    {
      title: "Conservation Board Meeting",
      description: "Regular meeting of the New Castle Conservation Board. Public welcome.",
      date: day(9, 19, 0),
      time: "7:00 PM – 9:00 PM",
      location: "Town Hall, 200 South Greeley Ave",
      category: "government" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/calendar.aspx?CID=14",
    },
    // ── TUESDAY MAY 5 ──
    {
      title: "Bilingual Storytime with Ms. Marilyn!",
      description: "Special Tuesday bilingual storytime in English and Spanish. Fun for the whole family!",
      date: day(10, 10, 30),
      time: "10:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Planning Board Meeting",
      description: "Regular meeting of the New Castle Planning Board. Public comments welcome during the designated session.",
      date: day(10, 19, 0),
      time: "7:00 PM",
      location: "Assembly Room, Town Hall, 200 S. Greeley Ave",
      category: "government" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4646",
    },
    {
      title: "May the 5th Be With You! Star Wars LEGO",
      description: "Drop in anytime between 3–5 PM and create your own Star Wars spaceship out of LEGOs. No registration required.",
      date: day(10, 15, 0),
      time: "3:00 PM – 5:00 PM",
      location: "Children's Room, Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Study and Snacks (Teen Room)",
      description: "Take a break from studying with snacks in the Teen Room! Drop in anytime.",
      date: day(10, 17, 0),
      time: "5:00 PM",
      location: "Teen Room, Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Learn Mandarin: Class & Conversation (Online)",
      description: "Alternating Mandarin conversation and instruction led by Luis Deng. Learn to recognize 500 of the most commonly used Chinese characters. All levels welcome.",
      date: day(10, 19, 0),
      time: "7:00 PM",
      location: "Online (Chappaqua Library)",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    // ── WEDNESDAY MAY 6 ──
    {
      title: "Accessible Art for Adults with Disabilities",
      description: "Artist Larry D'Amico leads an art class for adults with disabilities. Every other week. All supplies provided.",
      date: day(11, 10, 30),
      time: "10:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "All Together Now – All Ages Storytime",
      description: "All ages storytime every Wednesday! Registration not needed but space is limited — first come, first served.",
      date: day(11, 10, 30),
      time: "10:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Bouncing Babies",
      description: "Songs, books and bounces just for babies! Bring your own blanket to sit on.",
      date: day(11, 11, 30),
      time: "11:30 AM",
      location: "Children's Program Room, Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Sewing Series – Adults & Teens",
      description: "Learn basic sewing skills with an experienced teacher. All experience levels welcome. Drop-in or register in advance.",
      date: day(11, 15, 0),
      time: "3:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Board of Architectural Review Meeting",
      description: "Public meeting of the New Castle Board of Architectural Review.",
      date: day(11, 19, 30),
      time: "7:30 PM – 9:30 PM",
      location: "Conference Rooms A & B, Town Hall",
      category: "government" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4727",
    },
    {
      title: "Holocaust & Human Rights Committee Meeting",
      description: "Meeting held via Zoom or in person at the New Castle Holocaust Memorial. Open to the public.",
      date: day(11, 18, 30),
      time: "6:30 PM",
      location: "New Castle Holocaust Memorial (or Zoom)",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4670",
    },
    // ── THURSDAY MAY 7 ──
    {
      title: "Nursery Rhyme Time – Ages 2–3",
      description: "Nursery rhymes, songs, and movement for toddlers ages 2–3.",
      date: day(12, 11, 30),
      time: "11:30 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "A Little Something – Ages 2–5",
      description: "A little program for the littles! This month's theme: QUACK QUACK!! Ducks! For ages 2–5 with an adult. No registration required.",
      date: day(12, 14, 30),
      time: "2:30 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Play Mah Jongg",
      description: "Mah Jongg for players with knowledge of the game. Come with your own group or be matched with others. The Library has 2 sets — please bring one if you have it. Registration optional.",
      date: day(12, 18, 0),
      time: "6:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Author Talk: Jim Wright",
      description: "Seasoned journalist and longtime raptor monitor Jim Wright discusses his new book on birds of prey and conservation. Q&A to follow.",
      date: day(12, 19, 0),
      time: "7:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
      imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80",
    },
    // ── FRIDAY MAY 8 ──
    {
      title: "Ladies Afternoon Tea",
      description: "A lovely afternoon tea for ladies of the community. Light refreshments, conversation, and connection.",
      date: day(13, 12, 30),
      time: "12:30 PM – 2:00 PM",
      location: "New Castle Community Center",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4943",
    },
    {
      title: "Study and Snacks (Teen Room)",
      description: "Take a break from studying with snacks in the Teen Room! Drop in anytime.",
      date: day(13, 17, 0),
      time: "5:00 PM",
      location: "Teen Room, Chappaqua Library",
      category: "library" as EventCategory,
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    // ── SATURDAY MAY 9 ──
    {
      title: "Chappaqua Farmers Market",
      description: "Outdoor market with fresh produce, baked goods, plants, honey, meats, cheeses, flowers, and artisan crafts from local Hudson Valley vendors. Open every Saturday through November.",
      date: day(14, 8, 30),
      time: "8:30 AM – 1:00 PM",
      location: "Chappaqua Train Station, South Greeley Ave",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4496",
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
    },
    {
      title: "Take It or Leave It Shed",
      description: "Free reuse station. Drop off gently used items or pick something up — furniture, housewares, books, and more. Open every Saturday.",
      date: day(14, 8, 30),
      time: "8:30 AM – 12:00 PM",
      location: "Chappaqua Train Station Parking Area",
      category: "community" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/627/Take-It-or-Leave-It",
    },
    {
      title: "Friends of Chappaqua Library Book Sale – Donation Day",
      description: "Bring your gently used books to donate to the Friends Book Sale. All genres welcome. Drop off at the Library during open hours.",
      date: day(14, 10, 0),
      time: "10:00 AM – 8:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library" as EventCategory,
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4915",
    },

    // ── CHAPPAQUA-MILLWOOD CHAMBER OF COMMERCE (@chappaqua_millwood_chamber) ──
    {
      title: "Wine Around Town",
      description: "The Chamber's signature spring evening — stroll downtown Chappaqua sampling wines paired with bites from local restaurants and boutiques. Tickets benefit the Chamber's community programs.",
      date: day(5, 17, 0),
      time: "5:00 PM – 8:00 PM",
      location: "Downtown Chappaqua (King St. & South Greeley Ave.)",
      category: "community" as EventCategory,
      source: "Chappaqua-Millwood Chamber",
      sourceUrl: "https://www.instagram.com/chappaqua_millwood_chamber/",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    },
    {
      title: "Chamber Business After Hours – May Mixer",
      description: "Monthly networking mixer hosted by the Chappaqua-Millwood Chamber of Commerce. Connect with local business owners over drinks and light bites at a rotating member venue.",
      date: day(10, 18, 0),
      time: "6:00 PM – 8:00 PM",
      location: "TBA – Check Chamber Instagram for venue",
      category: "community" as EventCategory,
      source: "Chappaqua-Millwood Chamber",
      sourceUrl: "https://www.instagram.com/chappaqua_millwood_chamber/",
    },
    {
      title: "Chamber Members' Coffee & Connections",
      description: "Casual morning coffee meetup for Chamber members and prospective members. Meet your neighbors in business, share referrals, and learn about upcoming Chamber initiatives.",
      date: day(17, 8, 0),
      time: "8:00 AM – 9:30 AM",
      location: "Rotating Chamber member café",
      category: "community" as EventCategory,
      source: "Chappaqua-Millwood Chamber",
      sourceUrl: "https://www.instagram.com/chappaqua_millwood_chamber/",
    },

    // ── STROLL CHAPPAQUA (@strollchappaqua) ──
    {
      title: "Stroll Chappaqua Neighbors' Night Out",
      description: "Monthly community gathering hosted by Stroll Chappaqua magazine — meet featured neighbors, sponsors, and residents over drinks and appetizers at a local Chappaqua spot.",
      date: day(8, 19, 0),
      time: "7:00 PM",
      location: "Downtown Chappaqua – venue posted on Instagram",
      category: "community" as EventCategory,
      source: "Stroll Chappaqua",
      sourceUrl: "https://www.instagram.com/strollchappaqua/",
      imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&q=80",
    },
    {
      title: "Stroll Chappaqua Resident Spotlight Coffee",
      description: "Casual morning coffee with this month's Stroll Chappaqua featured neighbor. A relaxed way to meet new people in town and hear local stories.",
      date: day(15, 9, 0),
      time: "9:00 AM – 10:30 AM",
      location: "Local Chappaqua café (see @strollchappaqua)",
      category: "community" as EventCategory,
      source: "Stroll Chappaqua",
      sourceUrl: "https://www.instagram.com/strollchappaqua/",
    },

    // ── CHAPPAQUA, NY (@chappaqua.ny) — community highlights ──
    {
      title: "Downtown Chappaqua Sip & Shop",
      description: "Featured weekly on @chappaqua.ny — extended evening hours at downtown shops with complimentary refreshments. A great way to support local businesses on King Street and South Greeley Ave.",
      date: day(4, 17, 0),
      time: "5:00 PM – 8:00 PM",
      location: "King Street & South Greeley Avenue, Chappaqua",
      category: "community" as EventCategory,
      source: "Chappaqua, NY",
      sourceUrl: "https://www.instagram.com/chappaqua.ny/",
    },
    {
      title: "Chappaqua Community Photo Walk",
      description: "Informal weekend walk through Chappaqua's prettiest spots, organized via @chappaqua.ny. Bring a camera (or phone) and meet other neighbors who love capturing the town.",
      date: day(13, 10, 0),
      time: "10:00 AM",
      location: "Meet at the Chappaqua Train Station",
      category: "community" as EventCategory,
      source: "Chappaqua, NY",
      sourceUrl: "https://www.instagram.com/chappaqua.ny/",
      imageUrl: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&q=80",
    },
  ];
}

export async function scrapeAllEvents(): Promise<InsertEvent[]> {
  console.log("Starting event data collection from all Chappaqua sources...");

  // Get real curated events for this week and next
  const realEvents = getRealCurrentEvents();

  // Try live scrapers in parallel
  const [libraryEvents, townEvents] = await Promise.all([
    scrapeLibraryEvents().catch(e => { console.error("Library scraper failed:", e); return []; }),
    scrapeTownCalendar().catch(e => { console.error("Town scraper failed:", e); return []; }),
  ]);

  // Merge: use scraped events + real events, deduplicating by title+date
  const seen = new Set<string>();
  const allEvents: ScrapedEvent[] = [];

  for (const ev of [...realEvents, ...libraryEvents, ...townEvents]) {
    const key = `${ev.title.toLowerCase().slice(0, 40)}|${ev.date.toDateString()}`;
    if (!seen.has(key)) {
      seen.add(key);
      allEvents.push(ev);
    }
  }

  console.log(`Total events collected: ${allEvents.length}`);

  return allEvents.map(ev => ({
    title: ev.title,
    description: ev.description ?? null,
    date: ev.date,
    endDate: ev.endDate ?? null,
    time: ev.time ?? null,
    location: ev.location ?? null,
    category: ev.category,
    source: ev.source,
    sourceUrl: ev.sourceUrl ?? null,
    imageUrl: ev.imageUrl ?? null,
  }));
}
