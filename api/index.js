import app, { ensureDbConnection } from "../backend/server.js";

let dbInitialized = false;

export default async function handler(req, res) {
  try {
    if (!dbInitialized) {
      // attempt to connect to DB; if MONGO_URI is not set, ensureDbConnection will warn and return
      await ensureDbConnection();
      dbInitialized = true;
    }
  } catch (err) {
    console.error("DB init failed:", err);
    // continue — route handlers may handle DB absence or we return 500
    return res.status(500).json({ error: "Database connection failed" });
  }

  return app(req, res);
}
