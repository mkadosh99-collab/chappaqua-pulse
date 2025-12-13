import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeAllEvents } from "./scraper";
import { getChappaquaRestaurants, getRestaurantSpecials } from "./restaurant-data";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let scheduledRefreshInterval: NodeJS.Timeout | null = null;

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

async function refreshData() {
  try {
    console.log(`[${new Date().toISOString()}] Scheduled refresh starting...`);
    
    const events = await scrapeAllEvents();
    await storage.clearEvents();
    await storage.createManyEvents(events);
    console.log(`[${new Date().toISOString()}] Refreshed ${events.length} events`);
    
    storage.setLastUpdated(new Date());
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Scheduled refresh failed:`, error);
  }
}

function startScheduledRefresh() {
  if (scheduledRefreshInterval) {
    clearInterval(scheduledRefreshInterval);
  }
  
  scheduledRefreshInterval = setInterval(async () => {
    await refreshData();
  }, REFRESH_INTERVAL_MS);
  
  console.log(`Scheduled refresh started - will refresh every ${REFRESH_INTERVAL_MS / 1000 / 60} minutes`);
}

async function initializeData() {
  if (isInitialized) return;
  
  if (initializationPromise) {
    await initializationPromise;
    return;
  }
  
  initializationPromise = (async () => {
    try {
      console.log("Initializing data...");
      
      const events = await scrapeAllEvents();
      await storage.clearEvents();
      await storage.createManyEvents(events);
      console.log(`Loaded ${events.length} events`);
      
      const restaurantData = getChappaquaRestaurants();
      await storage.clearRestaurants();
      const createdRestaurants = await storage.createManyRestaurants(restaurantData);
      console.log(`Loaded ${createdRestaurants.length} restaurants`);
      
      const restaurantIds = new Map<string, string>();
      createdRestaurants.forEach((r) => restaurantIds.set(r.name, r.id));
      
      const specialsData = getRestaurantSpecials(restaurantIds);
      await storage.clearSpecials();
      await storage.createManySpecials(specialsData);
      console.log(`Loaded ${specialsData.length} specials`);
      
      storage.setLastUpdated(new Date());
      isInitialized = true;
      
      startScheduledRefresh();
    } catch (error) {
      console.error("Error initializing data:", error);
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
      await initializeData();
      
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

  app.get("/api/restaurants", async (req, res) => {
    try {
      await initializeData();
      
      const restaurantsWithSpecials = await storage.getRestaurantsWithSpecials();
      const lastUpdated = storage.getLastUpdated();
      
      res.json({
        restaurants: restaurantsWithSpecials,
        lastUpdated: lastUpdated?.toISOString() || null,
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ 
        error: "Failed to fetch restaurants",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/specials", async (req, res) => {
    try {
      await initializeData();
      
      const typeParam = req.query.type as string | undefined;
      
      let specials;
      if (typeParam) {
        specials = await storage.getSpecialsByType(typeParam as any);
      } else {
        specials = await storage.getActiveSpecials();
      }
      
      const restaurants = await storage.getRestaurants();
      const restaurantMap = new Map(restaurants.map(r => [r.id, r.name]));
      
      const specialsWithRestaurant = specials.map(special => ({
        ...special,
        restaurantName: restaurantMap.get(special.restaurantId) || "Unknown",
      }));
      
      const lastUpdated = storage.getLastUpdated();
      
      res.json({
        specials: specialsWithRestaurant,
        lastUpdated: lastUpdated?.toISOString() || null,
      });
    } catch (error) {
      console.error("Error fetching specials:", error);
      res.status(500).json({ 
        error: "Failed to fetch specials",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/refresh", async (req, res) => {
    try {
      console.log("Refreshing all data...");
      isInitialized = false;
      initializationPromise = null;
      await initializeData();
      
      res.json({
        success: true,
        lastUpdated: storage.getLastUpdated()?.toISOString(),
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ 
        error: "Failed to refresh data",
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
