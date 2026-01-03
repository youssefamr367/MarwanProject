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

// Import and register routes from backend
async function setupRoutes() {
  try {
    const ProductRoutes = (await import("../backend/routes/ProductRoute.js")).default;
    const OrderRoutes = (await import("../backend/routes/OrderRoute.js")).default;
    const SupplierRoutes = (await import("../backend/routes/SupplierRoute.js")).default;
    const FabricRoutes = (await import("../backend/routes/FabricRoute.js")).default;
    const EshraRoutes = (await import("../backend/routes/EshraRoute.js")).default;
    const PaintingRoutes = (await import("../backend/routes/PaintingRoute.js")).default;
    const MarbleRoutes = (await import("../backend/routes/MarbleRoute.js")).default;
    const DehnatRoutes = (await import("../backend/routes/DehnatRoute.js")).default;

    app.use("/api/Product", ProductRoutes);
    app.use("/api/Order", OrderRoutes);
    app.use("/api/suppliers", SupplierRoutes);
    app.use("/api/fabrics", FabricRoutes);
    app.use("/api/eshra", EshraRoutes);
    app.use("/api/paintings", PaintingRoutes);
    app.use("/api/marbles", MarbleRoutes);
    app.use("/api/dehnat", DehnatRoutes);

    console.log("✅ All routes registered");
  } catch (err) {
    console.error("❌ Error registering routes:", err);
  }
}

// Register routes on module load
await setupRoutes();

export default app;
