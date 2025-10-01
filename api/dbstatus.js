export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    const uri = process.env.MONGO_URI || null;
    if (!uri) {
      return res.status(400).json({
        ok: false,
        message: "MONGO_URI not set",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    }

    // Lazy import the backend helper to avoid import-time crashes
    const mod = await import("../backend/server.js");
    if (!mod.ensureDbConnection) {
      return res.status(500).json({
        ok: false,
        message: "ensureDbConnection not available",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    }

    // Try to connect with a timeout
    const connectPromise = mod.ensureDbConnection();
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error("DB connect timed out")), 5000)
    );
    await Promise.race([connectPromise, timeout]);

    return res.status(200).json({
      ok: true,
      message: "DB connect succeeded",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("dbstatus error:", err && err.stack ? err.stack : err);
    return res.status(500).json({
      ok: false,
      error: err.message,
      message: "Database connection failed",
      environment: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
