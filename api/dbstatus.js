export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    const uri = process.env.MONGO_URI || null;
    if (!uri) {
      return res.status(400).send(JSON.stringify({ ok: false, message: "MONGO_URI not set" }));
    }

    // Lazy import the backend helper to avoid import-time crashes
    const mod = await import("../backend/server.js");
    if (!mod.ensureDbConnection) {
      return res.status(500).send(JSON.stringify({ ok: false, message: "ensureDbConnection not available" }));
    }

    // Try to connect with a timeout
    const connectPromise = mod.ensureDbConnection();
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("DB connect timed out")), 5000));
    await Promise.race([connectPromise, timeout]);

    return res.status(200).send(JSON.stringify({ ok: true, message: "DB connect succeeded" }));
  } catch (err) {
    console.error("dbstatus error:", err && err.stack ? err.stack : err);
    return res.status(500).send(JSON.stringify({ ok: false, error: err.message, stack: err.stack }));
  }
}
