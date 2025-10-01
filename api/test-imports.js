export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test importing the backend server
    try {
      const serverMod = await import("../backend/server.js");
      results.tests.serverImport = "success";
      results.tests.hasApp = !!serverMod.default;
      results.tests.hasEnsureDbConnection = !!serverMod.ensureDbConnection;
    } catch (err) {
      results.tests.serverImport = "failed";
      results.tests.serverError = err.message;
    }

    // Test importing ProductController directly
    try {
      const productController = await import(
        "../backend/controllers/productController.js"
      );
      results.tests.productControllerImport = "success";
      results.tests.hasProductController = !!productController.default;
    } catch (err) {
      results.tests.productControllerImport = "failed";
      results.tests.productControllerError = err.message;
    }

    // Test importing OrderController
    try {
      const orderController = await import(
        "../backend/controllers/OrderController.js"
      );
      results.tests.orderControllerImport = "success";
      results.tests.hasOrderController = !!orderController.default;
    } catch (err) {
      results.tests.orderControllerImport = "failed";
      results.tests.orderControllerError = err.message;
    }

    // Test importing routes
    try {
      const productRoute = await import("../backend/routes/ProductRoute.js");
      results.tests.productRouteImport = "success";
      results.tests.hasProductRoute = !!productRoute.default;
    } catch (err) {
      results.tests.productRouteImport = "failed";
      results.tests.productRouteError = err.message;
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({
      error: "Test failed",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
