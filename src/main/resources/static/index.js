var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  coordinateSchema: () => coordinateSchema,
  insertPointOfInterestSchema: () => insertPointOfInterestSchema,
  insertTourSchema: () => insertTourSchema,
  insertUserSchema: () => insertUserSchema,
  pointsOfInterest: () => pointsOfInterest,
  tours: () => tours,
  users: () => users
});
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id)
});
var insertTourSchema = createInsertSchema(tours).pick({
  name: true,
  location: true,
  description: true,
  createdById: true
});
var pointsOfInterest = pgTable("points_of_interest", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").references(() => tours.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  photoFilename: text("photo_filename"),
  audioFilename: text("audio_filename"),
  videoFilename: text("video_filename"),
  order: integer("order")
});
var insertPointOfInterestSchema = createInsertSchema(pointsOfInterest).pick({
  tourId: true,
  name: true,
  description: true,
  latitude: true,
  longitude: true,
  photoFilename: true,
  audioFilename: true,
  videoFilename: true,
  order: true
});
var coordinateSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Tour methods
  async createTour(insertTour) {
    const [tour] = await db.insert(tours).values(insertTour).returning();
    return tour;
  }
  async getTour(id) {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour || void 0;
  }
  async getAllTours() {
    return await db.select().from(tours);
  }
  async updateTour(id, tourUpdate) {
    const [updatedTour] = await db.update(tours).set(tourUpdate).where(eq(tours.id, id)).returning();
    return updatedTour || void 0;
  }
  async deleteTour(id) {
    const points = await this.getPointsByTourId(id);
    for (const point of points) {
      await this.deletePoint(point.id);
    }
    await db.delete(tours).where(eq(tours.id, id));
    return true;
  }
  // Point of Interest methods
  async createPoint(insertPoint) {
    const [point] = await db.insert(pointsOfInterest).values(insertPoint).returning();
    return point;
  }
  async getPoint(id) {
    const [point] = await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.id, id));
    return point || void 0;
  }
  async getPointsByTourId(tourId) {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.tourId, tourId)).orderBy(pointsOfInterest.order);
  }
  async updatePoint(id, pointUpdate) {
    const [updatedPoint] = await db.update(pointsOfInterest).set(pointUpdate).where(eq(pointsOfInterest.id, id)).returning();
    return updatedPoint || void 0;
  }
  async deletePoint(id) {
    await db.delete(pointsOfInterest).where(eq(pointsOfInterest.id, id));
    return true;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var photosDir = path.join(uploadDir, "photos");
var audioDir = path.join(uploadDir, "audio");
var videosDir = path.join(uploadDir, "videos");
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
var fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
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
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit for videos
  },
  fileFilter: function(req, file, cb) {
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
async function registerRoutes(app2) {
  const handleApiError = (err, res) => {
    console.error("API Error:", err);
    if (err instanceof z2.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }
    return res.status(500).json({ message: err.message || "Internal server error" });
  };
  app2.get("/api/tours", async (req, res) => {
    try {
      const tours2 = await storage.getAllTours();
      res.json(tours2);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.get("/api/tours/:id", async (req, res) => {
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
  app2.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.put("/api/tours/:id", async (req, res) => {
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
  app2.delete("/api/tours/:id", async (req, res) => {
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
  app2.get("/api/tours/:tourId/points", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const points = await storage.getPointsByTourId(tourId);
      res.json(points);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.get("/api/points/:id", async (req, res) => {
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
  app2.post("/api/tours/:tourId/points", async (req, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const tour = await storage.getTour(tourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      const pointData = {
        ...req.body,
        tourId
        // Ensure tourId is set correctly
      };
      const validatedData = insertPointOfInterestSchema.parse(pointData);
      const point = await storage.createPoint(validatedData);
      res.status(201).json(point);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.put("/api/points/:id", async (req, res) => {
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
  app2.delete("/api/points/:id", async (req, res) => {
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
  app2.post("/api/upload/photo", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({
        filename: req.file.filename,
        path: `/api/media/photos/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.post("/api/upload/audio", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({
        filename: req.file.filename,
        path: `/api/media/audio/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.post("/api/upload/video", upload.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({
        filename: req.file.filename,
        path: `/api/media/videos/${req.file.filename}`
      });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  app2.get("/api/media/photos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(photosDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filePath);
  });
  app2.get("/api/media/audio/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(audioDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filePath);
  });
  app2.get("/api/media/videos/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(videosDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filePath);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
