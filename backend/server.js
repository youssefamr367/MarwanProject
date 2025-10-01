import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables
dotenv.config();

const app = express();

// Enable JSON body parsing
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://*.vercel.app"]
      : "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Routes
import ProductRoutes from "./routes/ProductRoute.js";
import OrderRoutes from "./routes/OrderRoute.js";
import SupplierRoutes from "./routes/SupplierRoute.js";
import FabricRoutes from "./routes/FabricRoute.js";
import EshraRoutes from "./routes/EshraRoute.js";
import PaintingRoutes from "./routes/PaintingRoute.js";
import MarbleRoutes from "./routes/MarbleRoute.js";
import DehnatRoutes from "./routes/DehnatRoute.js";

// Register API endpoints
const safeUse = (label, path, routeModule) => {
  try {
    console.log(`Registering route: ${label} at path: "${path}"`);
    app.use(path, routeModule);
    console.log(`✅ Mounted ${label}`);
  } catch (err) {
    console.error(`❌ Error in ${label}:`, err.message);
  }
};

safeUse("ProductRoutes", "/api/Product", ProductRoutes);
safeUse("OrderRoutes", "/api/Order", OrderRoutes);
safeUse("SupplierRoutes", "/api/suppliers", SupplierRoutes);
safeUse("FabricRoutes", "/api/fabrics", FabricRoutes);
safeUse("EshraRoutes", "/api/eshra", EshraRoutes);
safeUse("PaintingRoutes", "/api/paintings", PaintingRoutes);
safeUse("MarbleRoutes", "/api/marbles", MarbleRoutes);
safeUse("DehnatRoutes", "/api/dehnat", DehnatRoutes);

// Serve frontend static files in production (must be last)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
// Lazy DB connector for serverless environments
export async function ensureDbConnection() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("🔗 MongoDB already connected");
      return;
    }

    // Check if connection is in progress
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ MongoDB connection in progress, waiting...");
      // Wait for connection to complete
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        mongoose.connection.once("connected", () => {
          clearTimeout(timeout);
          resolve();
        });

        mongoose.connection.once("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      return;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
      // In production (Vercel) we must have a Mongo URI configured. Fail fast so
      // the deployment logs show a clear error and the frontend receives a 500.
      if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        const msg =
          "MONGO_URI not set in environment - cannot connect to database";
        console.error("\u274c", msg);
        throw new Error(msg);
      }
      // Local/dev: warn but allow running without DB for purely frontend work.
      console.warn(
        "MONGO_URI not set — skipping DB connection (allowed in local dev)"
      );
      return;
    }
    // Set up connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("🔗 MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    await mongoose.connect(uri, {
      // Serverless-specific options
      maxPoolSize: 1, // Maintain only one connection in serverless
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });
    console.log("🔗 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

// Export app for Vercel
export default app;

// Start server only if running locally (not on Vercel)
if (!process.env.VERCEL) {
  // Try to connect DB in local/dev mode so the app works when run directly
  ensureDbConnection().catch(() => {});

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}
