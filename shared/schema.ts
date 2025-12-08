import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const eventCategories = [
  "community",
  "library",
  "performing-arts",
  "recreation",
  "schools",
  "government",
] as const;

export type EventCategory = (typeof eventCategories)[number];

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  time: text("time"),
  location: text("location"),
  category: text("category").notNull().$type<EventCategory>(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  imageUrl: text("image_url"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const eventFiltersSchema = z.object({
  category: z.enum(eventCategories).optional(),
  weekStart: z.string().optional(),
  weekEnd: z.string().optional(),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;
