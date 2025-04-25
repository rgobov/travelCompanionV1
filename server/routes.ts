import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { 
  insertTourSchema, 
  insertPointOfInterestSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

// Define interface for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories for photos, audio, and videos
const photosDir = path.join(uploadDir, "photos");
const audioDir = path.join(uploadDir, "audio");
const videosDir = path.join(uploadDir, "videos");

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Configure storage for file uploads
const fileStorage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    // Determine the destination directory based on file type
    let dest;
    if (file.fieldname === "photo") {
      dest = photosDir;
    } else if (file.fieldname === "audio") {
      dest = audioDir;
    } else if (file.fieldname === "video") {
      dest = videosDir;
    } else {
      dest = uploadDir;
    }
    cb(null, dest);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: function(req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // Validate file types
    if (file.fieldname === "photo") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed for photos"));
      }
    } else if (file.fieldname === "audio") {
      if (!file.mimetype.startsWith("audio/")) {
        return cb(new Error("Only audio files are allowed for audio guides"));
      }
    } else if (file.fieldname === "video") {
      if (!file.mimetype.startsWith("video/")) {
        return cb(new Error("Only video files are allowed for video uploads"));
      }
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API error handler middleware
  const handleApiError = (err: any, res: any) => {
    console.error("API Error:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    return res.status(500).json({ message: err.message || "Internal server error" });
  };

  // Tours routes
  // GET /api/tours - Get all tours
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getAllTours();
      res.json(tours);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // GET /api/tours/:id - Get a specific tour
  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tour = await storage.getTour(tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(tour);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // POST /api/tours - Create a new tour
  app.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // PUT /api/tours/:id - Update a tour
  app.put("/api/tours/:id", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tourUpdate = insertTourSchema.partial().parse(req.body);
      
      const updatedTour = await storage.updateTour(tourId, tourUpdate);
      
      if (!updatedTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(updatedTour);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // DELETE /api/tours/:id - Delete a tour
  app.delete("/api/tours/:id", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const success = await storage.deleteTour(tourId);
      
      if (!success) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Points of Interest routes
  // GET /api/tours/:tourId/points - Get all points for a tour
  app.get("/api/tours/:tourId/points", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const points = await storage.getPointsByTourId(tourId);
      res.json(points);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // GET /api/points/:id - Get a specific point
  app.get("/api/points/:id", async (req, res) => {
    try {
      const pointId = parseInt(req.params.id);
      const point = await storage.getPoint(pointId);
      
      if (!point) {
        return res.status(404).json({ message: "Point not found" });
      }
      
      res.json(point);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // POST /api/tours/:tourId/points - Create a new point
  app.post("/api/tours/:tourId/points", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      
      // Verify the tour exists
      const tour = await storage.getTour(tourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      // Create point with the associated tour ID
      const pointData = {
        ...req.body,
        tourId // Ensure tourId is set correctly
      };
      
      const validatedData = insertPointOfInterestSchema.parse(pointData);
      const point = await storage.createPoint(validatedData);
      
      res.status(201).json(point);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // PUT /api/points/:id - Update a point
  app.put("/api/points/:id", async (req, res) => {
    try {
      const pointId = parseInt(req.params.id);
      const pointUpdate = insertPointOfInterestSchema.partial().parse(req.body);
      
      const updatedPoint = await storage.updatePoint(pointId, pointUpdate);
      
      if (!updatedPoint) {
        return res.status(404).json({ message: "Point not found" });
      }
      
      res.json(updatedPoint);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // DELETE /api/points/:id - Delete a point
  app.delete("/api/points/:id", async (req, res) => {
    try {
      const pointId = parseInt(req.params.id);
      const success = await storage.deletePoint(pointId);
      
      if (!success) {
        return res.status(404).json({ message: "Point not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // File upload routes
  // POST /api/upload/photo - Upload a photo for a point
  app.post("/api/upload/photo", upload.single("photo"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the filename to be saved with the point
      res.json({ 
        filename: req.file.filename,
        path: `/api/media/photos/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // POST /api/upload/audio - Upload an audio file for a point
  app.post("/api/upload/audio", upload.single("audio"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the filename to be saved with the point
      res.json({ 
        filename: req.file.filename,
        path: `/api/media/audio/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // POST /api/upload/video - Upload a video file for a point
  app.post("/api/upload/video", upload.single("video"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the filename to be saved with the point
      res.json({ 
        filename: req.file.filename,
        path: `/api/media/videos/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Serve media files
  app.get("/api/media/photos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(photosDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filePath);
  });

  app.get("/api/media/audio/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(audioDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filePath);
  });
  
  app.get("/api/media/videos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(videosDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filePath);
  });

  const httpServer = createServer(app);

  return httpServer;
}
