export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      hasMongoUri: !!process.env.MONGO_URI,
      mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
      mongoUriPrefix: process.env.MONGO_URI
        ? process.env.MONGO_URI.substring(0, 30) + "..."
        : "not set",
      mongoUriSuffix: process.env.MONGO_URI
        ? "..." +
          process.env.MONGO_URI.substring(process.env.MONGO_URI.length - 20)
        : "not set",
      tests: {},
    };

    // Test 1: Check if mongoose can be imported
    try {
      const mongoose = await import("mongoose");
      debugInfo.tests.mongooseImport = "success";
      debugInfo.tests.mongooseVersion = mongoose.default.version;
    } catch (err) {
      debugInfo.tests.mongooseImport = "failed";
      debugInfo.tests.mongooseError = err.message;
    }

    // Test 2: Try to parse the MONGO_URI
    if (process.env.MONGO_URI) {
      try {
        const url = new URL(process.env.MONGO_URI);
        debugInfo.tests.uriParsing = "success";
        debugInfo.tests.protocol = url.protocol;
        debugInfo.tests.hostname = url.hostname;
        debugInfo.tests.port = url.port;
        debugInfo.tests.database = url.pathname.substring(1);
        debugInfo.tests.hasAuth = !!(url.username && url.password);
      } catch (err) {
        debugInfo.tests.uriParsing = "failed";
        debugInfo.tests.uriError = err.message;
      }
    }

    // Test 3: Try to connect with basic options
    if (process.env.MONGO_URI) {
      try {
        const mongoose = await import("mongoose");

        // Set up connection options for serverless
        const options = {
          maxPoolSize: 1,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false,
        };

        // Try connection with timeout
        const connectPromise = mongoose.default.connect(
          process.env.MONGO_URI,
          options
        );
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout after 10 seconds")),
            10000
          )
        );

        await Promise.race([connectPromise, timeoutPromise]);

        debugInfo.tests.connection = "success";
        debugInfo.tests.connectionState =
          mongoose.default.connection.readyState;

        // Close the connection
        await mongoose.default.connection.close();
      } catch (err) {
        debugInfo.tests.connection = "failed";
        debugInfo.tests.connectionError = err.message;
        debugInfo.tests.connectionErrorType = err.name;
        debugInfo.tests.connectionErrorStack = err.stack;
        debugInfo.tests.connectionErrorCode = err.code;

        // Check if it's a network error
        if (
          err.message.includes("ENOTFOUND") ||
          err.message.includes("ECONNREFUSED")
        ) {
          debugInfo.tests.networkIssue = true;
        }
        if (err.message.includes("authentication")) {
          debugInfo.tests.authIssue = true;
        }
        if (err.message.includes("timeout")) {
          debugInfo.tests.timeoutIssue = true;
        }
      }
    }

    res.status(200).json(debugInfo);
  } catch (err) {
    res.status(500).json({
      error: "MongoDB debug failed",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
