import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tour schema
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id),
});

export const insertTourSchema = createInsertSchema(tours).pick({
  name: true,
  location: true,
  description: true,
  createdById: true,
});

// Point of Interest schema
export const pointsOfInterest = pgTable("points_of_interest", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").references(() => tours.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  photoFilename: text("photo_filename"),
  audioFilename: text("audio_filename"),
  videoFilename: text("video_filename"),
  order: integer("order"),
});

export const insertPointOfInterestSchema = createInsertSchema(pointsOfInterest).pick({
  tourId: true,
  name: true,
  description: true,
  latitude: true,
  longitude: true,
  photoFilename: true, 
  audioFilename: true,
  videoFilename: true,
  order: true,
});

// Coordinate helper type for map coordinates
export const coordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Types exported for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;

export type PointOfInterest = typeof pointsOfInterest.$inferSelect;
export type InsertPointOfInterest = z.infer<typeof insertPointOfInterestSchema>;

export type Coordinate = z.infer<typeof coordinateSchema>;
