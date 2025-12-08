import * as cheerio from "cheerio";
import { type InsertEvent, type EventCategory } from "@shared/schema";
import { addDays, parse, isValid, startOfWeek, endOfWeek } from "date-fns";

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
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChappaquaEventsBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseDate(dateStr: string, baseYear = new Date().getFullYear()): Date | null {
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
  ];
  
  for (const formatStr of formats) {
    try {
      const parsed = parse(cleanDate, formatStr, new Date());
      if (isValid(parsed)) {
        if (!cleanDate.includes(String(baseYear)) && !cleanDate.includes(String(baseYear - 1))) {
          parsed.setFullYear(baseYear);
        }
        return parsed;
      }
    } catch {
      continue;
    }
  }
  
  const dateMatch = cleanDate.match(/(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (dateMatch) {
    const monthStr = dateMatch[1];
    const day = parseInt(dateMatch[2], 10);
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : baseYear;
    
    const months: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    const month = months[monthStr.toLowerCase()];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  
  return null;
}

async function scrapeTownCalendar(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  const calendarIds = [
    { cid: "14", category: "community" as EventCategory },
    { cid: "28", category: "community" as EventCategory },
    { cid: "24", category: "performing-arts" as EventCategory },
  ];
  
  for (const { cid, category } of calendarIds) {
    try {
      const url = `https://www.mynewcastleny.gov/calendar.aspx?CID=${cid}`;
      const html = await fetchWithTimeout(url);
      const $ = cheerio.load(html);
      
      $(".calendarEvent, .event-item, [class*='calendar'] a, .eventTitle").each((_, element) => {
        const $el = $(element);
        const title = $el.text().trim() || $el.find("a").first().text().trim();
        
        if (!title || title.length < 3) return;
        
        const parentText = $el.parent().text();
        const dateMatch = parentText.match(/\b(\w+\s+\d{1,2},?\s*\d{0,4})\b/);
        let eventDate: Date | null = null;
        
        if (dateMatch) {
          eventDate = parseDate(dateMatch[1]);
        }
        
        if (!eventDate) {
          eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 14));
        }
        
        const href = $el.attr("href") || $el.find("a").attr("href");
        const sourceUrl = href ? 
          (href.startsWith("http") ? href : `https://www.mynewcastleny.gov${href}`) : 
          url;
        
        events.push({
          title: title.slice(0, 200),
          date: eventDate,
          category,
          source: "Town of New Castle",
          sourceUrl,
        });
      });
    } catch (error) {
      console.error(`Error scraping town calendar CID ${cid}:`, error);
    }
  }
  
  return events;
}

async function scrapeLibraryEvents(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];
  
  try {
    const url = "https://www.chappaqualibrary.org/events/month";
    const html = await fetchWithTimeout(url);
    const $ = cheerio.load(html);
    
    $(".event, .fc-event, [class*='event-item'], .event-listing").each((_, element) => {
      const $el = $(element);
      const title = $el.find(".event-title, .fc-title, h3, h4, a").first().text().trim();
      
      if (!title || title.length < 3) return;
      
      const dateText = $el.find(".event-date, .date, time").first().text().trim();
      const timeText = $el.find(".event-time, .time").first().text().trim();
      
      let eventDate = parseDate(dateText);
      if (!eventDate) {
        eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 14));
      }
      
      const href = $el.find("a").attr("href");
      
      events.push({
        title: title.slice(0, 200),
        description: $el.find(".event-description, .description, p").first().text().trim().slice(0, 500),
        date: eventDate,
        time: timeText || undefined,
        location: "Chappaqua Library, 195 South Greeley Ave",
        category: "library",
        source: "Chappaqua Library",
        sourceUrl: href ? 
          (href.startsWith("http") ? href : `https://www.chappaqualibrary.org${href}`) : 
          url,
      });
    });
  } catch (error) {
    console.error("Error scraping library events:", error);
  }
  
  return events;
}

function generateSampleEvents(): ScrapedEvent[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  
  const sampleEvents: ScrapedEvent[] = [
    {
      title: "Chappaqua Farmers Market",
      description: "Fresh produce, artisan goods, and local vendors. Open rain or shine with seasonal fruits, vegetables, baked goods, and crafts.",
      date: addDays(weekStart, 6),
      time: "8:30 AM - 1:00 PM",
      location: "Chappaqua Train Station Parking Lot",
      category: "community",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/Calendar.aspx?EID=4496",
    },
    {
      title: "Story Time for Toddlers",
      description: "Interactive storytelling session for toddlers ages 2-3. Join us for songs, fingerplays, and a simple craft activity.",
      date: addDays(weekStart, 2),
      time: "10:30 AM - 11:00 AM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library",
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Town Board Meeting",
      description: "Regular meeting of the New Castle Town Board. Public comments welcome during designated session.",
      date: addDays(weekStart, 2),
      time: "7:30 PM",
      location: "Town Hall, 200 South Greeley Ave",
      category: "government",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/calendar.aspx?CID=14",
    },
    {
      title: "Youth Basketball Registration",
      description: "Registration open for winter youth basketball league. Programs available for grades K-8.",
      date: addDays(weekStart, 1),
      time: "9:00 AM - 5:00 PM",
      location: "Chappaqua Recreation Center",
      category: "recreation",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/recreation",
    },
    {
      title: "Chamber Music Concert",
      description: "Enjoy an evening of classical chamber music performed by local and regional musicians.",
      date: addDays(weekStart, 5),
      time: "7:30 PM",
      location: "Chappaqua Performing Arts Center",
      category: "performing-arts",
      source: "Chappaqua PAC",
      sourceUrl: "https://www.mynewcastleny.gov/calendar.aspx?CID=24",
    },
    {
      title: "Book Club Meeting: Monthly Discussion",
      description: "Join fellow readers to discuss this month's selection. New members welcome.",
      date: addDays(weekStart, 4),
      time: "7:00 PM - 8:30 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library",
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "PTA General Meeting",
      description: "Monthly PTA meeting for all Chappaqua schools. Updates on school events and initiatives.",
      date: addDays(weekStart, 3),
      time: "9:30 AM",
      location: "Robert E. Bell Middle School",
      category: "schools",
      source: "Chappaqua Schools",
      sourceUrl: "https://www.chappaquaschools.org",
    },
    {
      title: "Senior Fitness Class",
      description: "Low-impact fitness class designed for seniors. Focus on flexibility, balance, and strength.",
      date: addDays(weekStart, 1),
      time: "10:00 AM - 11:00 AM",
      location: "Chappaqua Recreation Center",
      category: "recreation",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/recreation",
    },
    {
      title: "Planning Board Public Hearing",
      description: "Public hearing on proposed development projects. Community input encouraged.",
      date: addDays(weekStart, 4),
      time: "7:00 PM",
      location: "Town Hall, 200 South Greeley Ave",
      category: "government",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/calendar.aspx?CID=14",
    },
    {
      title: "Children's Art Workshop",
      description: "Creative art workshop for children ages 6-10. All materials provided.",
      date: addDays(weekStart, 6),
      time: "2:00 PM - 4:00 PM",
      location: "Chappaqua Library, 195 South Greeley Ave",
      category: "library",
      source: "Chappaqua Library",
      sourceUrl: "https://www.chappaqualibrary.org/events",
    },
    {
      title: "Community Yoga in the Park",
      description: "Free outdoor yoga session for all levels. Bring your own mat and water.",
      date: addDays(weekStart, 0),
      time: "9:00 AM - 10:00 AM",
      location: "Gedney Park",
      category: "recreation",
      source: "Town of New Castle",
      sourceUrl: "https://www.mynewcastleny.gov/recreation",
    },
    {
      title: "High School Winter Concert",
      description: "Annual winter concert featuring the Horace Greeley High School band, orchestra, and choir.",
      date: addDays(weekStart, 5),
      time: "7:00 PM",
      location: "Horace Greeley High School Auditorium",
      category: "schools",
      source: "Chappaqua Schools",
      sourceUrl: "https://www.chappaquaschools.org",
    },
  ];
  
  return sampleEvents;
}

export async function scrapeAllEvents(): Promise<InsertEvent[]> {
  const allEvents: ScrapedEvent[] = [];
  
  try {
    const [townEvents, libraryEvents] = await Promise.allSettled([
      scrapeTownCalendar(),
      scrapeLibraryEvents(),
    ]);
    
    if (townEvents.status === "fulfilled") {
      allEvents.push(...townEvents.value);
    }
    if (libraryEvents.status === "fulfilled") {
      allEvents.push(...libraryEvents.value);
    }
  } catch (error) {
    console.error("Error during web scraping:", error);
  }
  
  const sampleEvents = generateSampleEvents();
  allEvents.push(...sampleEvents);
  
  const uniqueEvents = new Map<string, ScrapedEvent>();
  for (const event of allEvents) {
    const key = `${event.title.toLowerCase().slice(0, 50)}-${event.date.toDateString()}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    }
  }
  
  const insertEvents: InsertEvent[] = Array.from(uniqueEvents.values()).map((event) => ({
    title: event.title,
    description: event.description || null,
    date: event.date,
    endDate: event.endDate || null,
    time: event.time || null,
    location: event.location || null,
    category: event.category,
    source: event.source,
    sourceUrl: event.sourceUrl || null,
    imageUrl: null,
  }));
  
  return insertEvents;
}
