import { 
  type Event, 
  type InsertEvent, 
  type EventCategory,
  type Restaurant,
  type InsertRestaurant,
  type Special,
  type InsertSpecial,
  type RestaurantWithSpecials,
  type SpecialType,
  type BusinessSubmission,
  type InsertBusinessSubmission,
  type SubmissionStatus,
  businessSubmissions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getEvents(): Promise<Event[]>;
  getEventsByWeek(weekStart: Date, weekEnd: Date): Promise<Event[]>;
  getEventsByCategory(category: EventCategory): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  createManyEvents(events: InsertEvent[]): Promise<Event[]>;
  clearEvents(): Promise<void>;
  getLastUpdated(): Date | null;
  setLastUpdated(date: Date): void;
  
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  createManyRestaurants(restaurants: InsertRestaurant[]): Promise<Restaurant[]>;
  clearRestaurants(): Promise<void>;
  
  getSpecials(): Promise<Special[]>;
  getSpecialsByRestaurant(restaurantId: string): Promise<Special[]>;
  getSpecialsByType(type: SpecialType): Promise<Special[]>;
  getActiveSpecials(): Promise<Special[]>;
  createSpecial(special: InsertSpecial): Promise<Special>;
  createManySpecials(specials: InsertSpecial[]): Promise<Special[]>;
  clearSpecials(): Promise<void>;
  
  getRestaurantsWithSpecials(): Promise<RestaurantWithSpecials[]>;

  createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission>;
  getBusinessSubmissions(status?: SubmissionStatus): Promise<BusinessSubmission[]>;
  getApprovedBusinessSubmissions(): Promise<BusinessSubmission[]>;
  updateBusinessSubmissionStatus(id: string, status: SubmissionStatus): Promise<BusinessSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private restaurants: Map<string, Restaurant>;
  private specials: Map<string, Special>;
  private lastUpdated: Date | null = null;

  constructor() {
    this.events = new Map();
    this.restaurants = new Map();
    this.specials = new Map();
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByWeek(weekStart: Date, weekEnd: Date): Promise<Event[]> {
    const events = Array.from(this.events.values());
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  }

  async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    const events = Array.from(this.events.values());
    return events.filter((event) => event.category === category);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      id,
      title: insertEvent.title,
      description: insertEvent.description ?? null,
      date: insertEvent.date,
      endDate: insertEvent.endDate ?? null,
      time: insertEvent.time ?? null,
      location: insertEvent.location ?? null,
      category: insertEvent.category as Event["category"],
      source: insertEvent.source,
      sourceUrl: insertEvent.sourceUrl ?? null,
      imageUrl: insertEvent.imageUrl ?? null,
    };
    this.events.set(id, event);
    return event;
  }

  async createManyEvents(insertEvents: InsertEvent[]): Promise<Event[]> {
    const createdEvents: Event[] = [];
    for (const insertEvent of insertEvents) {
      const event = await this.createEvent(insertEvent);
      createdEvents.push(event);
    }
    return createdEvents;
  }

  async clearEvents(): Promise<void> {
    this.events.clear();
  }

  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  setLastUpdated(date: Date): void {
    this.lastUpdated = date;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRestaurantById(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = {
      id,
      name: insertRestaurant.name,
      cuisine: insertRestaurant.cuisine as Restaurant["cuisine"],
      description: insertRestaurant.description ?? null,
      address: insertRestaurant.address ?? null,
      phone: insertRestaurant.phone ?? null,
      website: insertRestaurant.website ?? null,
      priceRange: (insertRestaurant.priceRange as Restaurant["priceRange"]) ?? null,
      hours: insertRestaurant.hours ?? null,
      imageUrl: insertRestaurant.imageUrl ?? null,
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async createManyRestaurants(insertRestaurants: InsertRestaurant[]): Promise<Restaurant[]> {
    const createdRestaurants: Restaurant[] = [];
    for (const insertRestaurant of insertRestaurants) {
      const restaurant = await this.createRestaurant(insertRestaurant);
      createdRestaurants.push(restaurant);
    }
    return createdRestaurants;
  }

  async clearRestaurants(): Promise<void> {
    this.restaurants.clear();
  }

  async getSpecials(): Promise<Special[]> {
    return Array.from(this.specials.values());
  }

  async getSpecialsByRestaurant(restaurantId: string): Promise<Special[]> {
    const specials = Array.from(this.specials.values());
    return specials.filter((special) => special.restaurantId === restaurantId);
  }

  async getSpecialsByType(type: SpecialType): Promise<Special[]> {
    const specials = Array.from(this.specials.values());
    return specials.filter((special) => special.type === type);
  }

  async getActiveSpecials(): Promise<Special[]> {
    const specials = Array.from(this.specials.values());
    return specials.filter((special) => special.isActive);
  }

  async createSpecial(insertSpecial: InsertSpecial): Promise<Special> {
    const id = randomUUID();
    const special: Special = {
      id,
      restaurantId: insertSpecial.restaurantId,
      title: insertSpecial.title,
      description: insertSpecial.description ?? null,
      type: insertSpecial.type as Special["type"],
      price: insertSpecial.price ?? null,
      validFrom: insertSpecial.validFrom ?? null,
      validTo: insertSpecial.validTo ?? null,
      daysAvailable: insertSpecial.daysAvailable ?? null,
      isActive: insertSpecial.isActive ?? true,
    };
    this.specials.set(id, special);
    return special;
  }

  async createManySpecials(insertSpecials: InsertSpecial[]): Promise<Special[]> {
    const createdSpecials: Special[] = [];
    for (const insertSpecial of insertSpecials) {
      const special = await this.createSpecial(insertSpecial);
      createdSpecials.push(special);
    }
    return createdSpecials;
  }

  async clearSpecials(): Promise<void> {
    this.specials.clear();
  }

  async getRestaurantsWithSpecials(): Promise<RestaurantWithSpecials[]> {
    const restaurants = await this.getRestaurants();
    const result: RestaurantWithSpecials[] = [];
    
    for (const restaurant of restaurants) {
      const specials = await this.getSpecialsByRestaurant(restaurant.id);
      result.push({
        ...restaurant,
        specials,
      });
    }
    
    return result;
  }

  async createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const normalized = {
      ...submission,
      cluster: submission.cluster?.trim() || null,
      owner: submission.owner?.trim() || null,
      description: submission.description?.trim() || null,
      website: submission.website?.trim() || null,
      contactName: submission.contactName?.trim() || null,
      contactEmail: submission.contactEmail?.trim() || null,
    };
    const [created] = await db.insert(businessSubmissions).values(normalized).returning();
    return created;
  }

  async getBusinessSubmissions(status?: SubmissionStatus): Promise<BusinessSubmission[]> {
    if (status) {
      return db
        .select()
        .from(businessSubmissions)
        .where(eq(businessSubmissions.status, status))
        .orderBy(desc(businessSubmissions.createdAt));
    }
    return db
      .select()
      .from(businessSubmissions)
      .orderBy(desc(businessSubmissions.createdAt));
  }

  async getApprovedBusinessSubmissions(): Promise<BusinessSubmission[]> {
    return this.getBusinessSubmissions("approved");
  }

  async updateBusinessSubmissionStatus(
    id: string,
    status: SubmissionStatus,
  ): Promise<BusinessSubmission | undefined> {
    const [updated] = await db
      .update(businessSubmissions)
      .set({ status })
      .where(eq(businessSubmissions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new MemStorage();
