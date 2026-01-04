import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load env vars
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

// Lazy DB connection for serverless
let cachedDbPromise = null;
let lastConnectionError = null;

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
      console.error("❌", msg);
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
    cachedDbPromise = null;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("🔌 MongoDB disconnected");
    cachedDbPromise = null;
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
    cachedDbPromise = null;

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

export function getLastConnectionError() {
  return lastConnectionError;
}

// Placeholder route handlers - these will be registered dynamically
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/debug", (req, res) => {
  res.status(200).json({
    message: "Debug endpoint working",
    mongoUri: !!process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
  });
});

// Flag to track if routes are loaded
let routesLoaded = false;

// Import and register routes from backend
async function setupRoutes() {
  if (routesLoaded) return;

  try {
    console.log("📦 Attempting to load routes...");

    const ProductRoutes = (await import("./routes/ProductRoute.js")).default;
    console.log("✅ ProductRoute loaded");

    const OrderRoutes = (await import("./routes/OrderRoute.js")).default;
    console.log("✅ OrderRoute loaded");

    const SupplierRoutes = (await import("./routes/SupplierRoute.js")).default;
    console.log("✅ SupplierRoute loaded");

    const FabricRoutes = (await import("./routes/FabricRoute.js")).default;
    console.log("✅ FabricRoute loaded");

    const EshraRoutes = (await import("./routes/EshraRoute.js")).default;
    console.log("✅ EshraRoute loaded");

    const PaintingRoutes = (await import("./routes/PaintingRoute.js")).default;
    console.log("✅ PaintingRoute loaded");

    const MarbleRoutes = (await import("./routes/MarbleRoute.js")).default;
    console.log("✅ MarbleRoute loaded");

    const GlassRoutes = (await import("./routes/GlassRoute.js")).default;
    console.log("✅ GlassRoute loaded");

    app.use("/api/Product", ProductRoutes);
    console.log("✅ ProductRoute registered");

    app.use("/api/Order", OrderRoutes);
    console.log("✅ OrderRoute registered");

    app.use("/api/suppliers", SupplierRoutes);
    console.log("✅ SupplierRoute registered");

    app.use("/api/fabrics", FabricRoutes);
    console.log("✅ FabricRoute registered");

    app.use("/api/eshra", EshraRoutes);
    console.log("✅ EshraRoute registered");

    app.use("/api/paintings", PaintingRoutes);
    console.log("✅ PaintingRoute registered");

    app.use("/api/marbles", MarbleRoutes);
    console.log("✅ MarbleRoute registered");

    app.use("/api/glass", GlassRoutes);
    console.log("✅ GlassRoute registered");

    routesLoaded = true;
    console.log("✅✅ All routes registered successfully");
  } catch (err) {
    console.error("❌ Error registering routes:", err.message);
    console.error("❌ Error stack:", err.stack);
    routesLoaded = false;
  }
}

// Setup routes on first request
export async function initRoutes() {
  await setupRoutes();
}

export default app;
