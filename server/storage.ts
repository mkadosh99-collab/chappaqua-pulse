import { type Event, type InsertEvent, type EventCategory } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private lastUpdated: Date | null = null;

  constructor() {
    this.events = new Map();
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
    const event: Event = { ...insertEvent, id };
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
}

export const storage = new MemStorage();
