let dbInitialized = false;
let app = null;
let ensureDbConnection = null;

export default async function handler(req, res) {
  try {
    // Lazy import to avoid import-time failures crashing the function
    if (!app || !ensureDbConnection) {
      const mod = await import("../backend/server.js");
      app = mod.default;
      ensureDbConnection = mod.ensureDbConnection;
    }

    if (!dbInitialized) {
      await ensureDbConnection();
      dbInitialized = true;
    }
  } catch (err) {
    console.error("Import/DB init failed:", err && err.stack ? err.stack : err);
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .send(JSON.stringify({ error: err.message || "Import/DB initialization failed", stack: err.stack }));
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error("Unhandled error in app handler:", err && err.stack ? err.stack : err);
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .send(JSON.stringify({ error: err.message || "Internal server error", stack: err.stack }));
  }
}
