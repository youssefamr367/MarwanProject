export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const debugInfo = {
      environment: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      hasMongoUri: !!process.env.MONGO_URI,
      mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
      mongoUriPrefix: process.env.MONGO_URI
        ? process.env.MONGO_URI.substring(0, 20) + "..."
        : "not set",
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Try to import and test the backend
    try {
      const mod = await import("../backend/server.js");
      debugInfo.backendImport = "success";
      debugInfo.hasEnsureDbConnection = !!mod.ensureDbConnection;

      // Try to test the connection
      if (mod.ensureDbConnection) {
        try {
          await mod.ensureDbConnection();
          debugInfo.dbConnection = "success";
        } catch (dbErr) {
          debugInfo.dbConnection = "failed";
          debugInfo.dbError = dbErr.message;
        }
      }
    } catch (importErr) {
      debugInfo.backendImport = "failed";
      debugInfo.importError = importErr.message;
    }

    res.status(200).json(debugInfo);
  } catch (err) {
    res.status(500).json({
      error: "Debug endpoint failed",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
