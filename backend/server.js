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
// Cached database connection promise
let cachedDbPromise = null;
let lastConnectionError = null;

// Lazy DB connector for serverless environments
export async function ensureDbConnection() {
  if (cachedDbPromise) {
    console.log("🔗 Using cached MongoDB connection promise");
    return cachedDbPromise;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      const msg =
        "MONGO_URI not set in environment - cannot connect to database";
      console.error("\u274c", msg);
      lastConnectionError = msg;
      throw new Error(msg);
    }
    console.warn(
      "MONGO_URI not set — skipping DB connection (allowed in local dev)"
    );
    return;
  }

  // Set up connection event handlers
  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
    cachedDbPromise = null; // Reset cache on error
  });

  mongoose.connection.on("disconnected", () => {
    console.log("🔌 MongoDB disconnected");
    cachedDbPromise = null; // Reset cache on disconnect
  });

  try {
    console.log("🔌 Creating new MongoDB connection");
    cachedDbPromise = mongoose.connect(uri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    await cachedDbPromise;
    console.log("🔗 MongoDB connected successfully");
    lastConnectionError = null;
    return cachedDbPromise;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    cachedDbPromise = null; // Reset cache on initial connection error

    // Cache the error for debugging
    lastConnectionError = {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    };

    // Provide more specific error information
    let errorMessage = err.message;
    if (err.message.includes("ENOTFOUND")) {
      errorMessage = "MongoDB host not found. Check your connection string.";
    } else if (err.message.includes("authentication")) {
      errorMessage = "MongoDB authentication failed. Check username/password.";
    } else if (err.message.includes("timeout")) {
      errorMessage = "MongoDB connection timeout. Check network access.";
    } else if (err.message.includes("ECONNREFUSED")) {
      errorMessage =
        "MongoDB connection refused. Check if the service is running.";
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = err;
    enhancedError.code = err.code;
    throw enhancedError;
  }
}

// Export error cache for debugging endpoint
export function getLastConnectionError() {
  return lastConnectionError;
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
