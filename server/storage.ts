import { 
  users, type User, type InsertUser,
  tours, type Tour, type InsertTour,
  pointsOfInterest, type PointOfInterest, type InsertPointOfInterest
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods (from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tour methods
  createTour(tour: InsertTour): Promise<Tour>;
  getTour(id: number): Promise<Tour | undefined>;
  getAllTours(): Promise<Tour[]>;
  updateTour(id: number, tour: Partial<Tour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;
  
  // Point of Interest methods
  createPoint(point: InsertPointOfInterest): Promise<PointOfInterest>;
  getPoint(id: number): Promise<PointOfInterest | undefined>;
  getPointsByTourId(tourId: number): Promise<PointOfInterest[]>;
  updatePoint(id: number, point: Partial<PointOfInterest>): Promise<PointOfInterest | undefined>;
  deletePoint(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private points: Map<number, PointOfInterest>;
  private userId: number;
  private tourId: number;
  private pointId: number;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.points = new Map();
    this.userId = 1;
    this.tourId = 1;
    this.pointId = 1;
  }

  // User methods (from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Tour methods
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.tourId++;
    const tour: Tour = { 
      ...insertTour, 
      id,
      description: insertTour.description || null,
      createdById: insertTour.createdById || null
    };
    this.tours.set(id, tour);
    return tour;
  }

  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async getAllTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async updateTour(id: number, tourUpdate: Partial<Tour>): Promise<Tour | undefined> {
    const existingTour = this.tours.get(id);
    if (!existingTour) return undefined;
    
    const updatedTour: Tour = { ...existingTour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }

  async deleteTour(id: number): Promise<boolean> {
    // First delete all associated points
    const tourPoints = await this.getPointsByTourId(id);
    for (const point of tourPoints) {
      await this.deletePoint(point.id);
    }
    
    return this.tours.delete(id);
  }

  // Point of Interest methods
  async createPoint(insertPoint: InsertPointOfInterest): Promise<PointOfInterest> {
    const id = this.pointId++;
    const point: PointOfInterest = { 
      ...insertPoint, 
      id,
      description: insertPoint.description || null,
      photoFilename: insertPoint.photoFilename || null,
      audioFilename: insertPoint.audioFilename || null,
      videoFilename: insertPoint.videoFilename || null,
      order: insertPoint.order || null
    };
    this.points.set(id, point);
    return point;
  }

  async getPoint(id: number): Promise<PointOfInterest | undefined> {
    return this.points.get(id);
  }

  async getPointsByTourId(tourId: number): Promise<PointOfInterest[]> {
    return Array.from(this.points.values())
      .filter(point => point.tourId === tourId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async updatePoint(id: number, pointUpdate: Partial<PointOfInterest>): Promise<PointOfInterest | undefined> {
    const existingPoint = this.points.get(id);
    if (!existingPoint) return undefined;
    
    const updatedPoint: PointOfInterest = { ...existingPoint, ...pointUpdate };
    this.points.set(id, updatedPoint);
    return updatedPoint;
  }

  async deletePoint(id: number): Promise<boolean> {
    return this.points.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Tour methods
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const [tour] = await db
      .insert(tours)
      .values(insertTour)
      .returning();
    return tour;
  }

  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour || undefined;
  }

  async getAllTours(): Promise<Tour[]> {
    return await db.select().from(tours);
  }

  async updateTour(id: number, tourUpdate: Partial<Tour>): Promise<Tour | undefined> {
    const [updatedTour] = await db
      .update(tours)
      .set(tourUpdate)
      .where(eq(tours.id, id))
      .returning();
    
    return updatedTour || undefined;
  }

  async deleteTour(id: number): Promise<boolean> {
    // First delete all associated points
    const points = await this.getPointsByTourId(id);
    for (const point of points) {
      await this.deletePoint(point.id);
    }
    
    await db
      .delete(tours)
      .where(eq(tours.id, id));
    
    return true;
  }

  // Point of Interest methods
  async createPoint(insertPoint: InsertPointOfInterest): Promise<PointOfInterest> {
    const [point] = await db
      .insert(pointsOfInterest)
      .values(insertPoint)
      .returning();
    
    return point;
  }

  async getPoint(id: number): Promise<PointOfInterest | undefined> {
    const [point] = await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.id, id));
    
    return point || undefined;
  }

  async getPointsByTourId(tourId: number): Promise<PointOfInterest[]> {
    return await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.tourId, tourId))
      .orderBy(pointsOfInterest.order);
  }

  async updatePoint(id: number, pointUpdate: Partial<PointOfInterest>): Promise<PointOfInterest | undefined> {
    const [updatedPoint] = await db
      .update(pointsOfInterest)
      .set(pointUpdate)
      .where(eq(pointsOfInterest.id, id))
      .returning();
    
    return updatedPoint || undefined;
  }

  async deletePoint(id: number): Promise<boolean> {
    await db
      .delete(pointsOfInterest)
      .where(eq(pointsOfInterest.id, id));
    
    return true;
  }
}

// Use the database storage
export const storage = new DatabaseStorage();
