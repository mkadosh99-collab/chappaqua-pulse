import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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
  "sports",
  "holiday",
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

export const cuisineTypes = [
  "italian",
  "american",
  "french",
  "spanish",
  "mediterranean",
  "asian",
  "mexican",
  "steakhouse",
  "seafood",
  "cafe",
] as const;

export type CuisineType = (typeof cuisineTypes)[number];

export const priceRanges = ["$", "$$", "$$$", "$$$$"] as const;
export type PriceRange = (typeof priceRanges)[number];

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull().$type<CuisineType>(),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  priceRange: text("price_range").$type<PriceRange>(),
  hours: text("hours"),
  imageUrl: text("image_url"),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export const specialTypes = ["weekly", "holiday", "happy-hour", "brunch"] as const;
export type SpecialType = (typeof specialTypes)[number];

export const specials = pgTable("specials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().$type<SpecialType>(),
  price: text("price"),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  daysAvailable: text("days_available"),
  isActive: boolean("is_active").default(true),
});

export const insertSpecialSchema = createInsertSchema(specials).omit({
  id: true,
});

export type InsertSpecial = z.infer<typeof insertSpecialSchema>;
export type Special = typeof specials.$inferSelect;

export interface RestaurantWithSpecials extends Restaurant {
  specials: Special[];
}
