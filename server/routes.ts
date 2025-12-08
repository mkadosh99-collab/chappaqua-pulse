import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeAllEvents } from "./scraper";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function initializeEvents() {
  if (isInitialized) return;
  
  if (initializationPromise) {
    await initializationPromise;
    return;
  }
  
  initializationPromise = (async () => {
    try {
      console.log("Initializing events data...");
      const events = await scrapeAllEvents();
      await storage.clearEvents();
      await storage.createManyEvents(events);
      storage.setLastUpdated(new Date());
      isInitialized = true;
      console.log(`Loaded ${events.length} events`);
    } catch (error) {
      console.error("Error initializing events:", error);
      throw error;
    }
  })();
  
  await initializationPromise;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/events", async (req, res) => {
    try {
      await initializeEvents();
      
      const weekStartParam = req.query.weekStart as string | undefined;
      
      let weekStart: Date;
      let weekEnd: Date;
      
      if (weekStartParam) {
        try {
          weekStart = parseISO(weekStartParam);
          if (isNaN(weekStart.getTime())) {
            weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
          }
        } catch {
          weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        }
      } else {
        weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      }
      
      weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      
      const events = await storage.getEventsByWeek(weekStart, weekEnd);
      const lastUpdated = storage.getLastUpdated();
      
      res.json({
        events,
        lastUpdated: lastUpdated?.toISOString() || null,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ 
        error: "Failed to fetch events",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/events/refresh", async (req, res) => {
    try {
      console.log("Refreshing events data...");
      const events = await scrapeAllEvents();
      await storage.clearEvents();
      await storage.createManyEvents(events);
      storage.setLastUpdated(new Date());
      
      res.json({
        success: true,
        count: events.length,
        lastUpdated: storage.getLastUpdated()?.toISOString(),
      });
    } catch (error) {
      console.error("Error refreshing events:", error);
      res.status(500).json({ 
        error: "Failed to refresh events",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      initialized: isInitialized,
      lastUpdated: storage.getLastUpdated()?.toISOString() || null,
    });
  });

  return httpServer;
}
