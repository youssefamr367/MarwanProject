import express from "express";
import ProductController from "../controllers/productController.js";
const router = express.Router();

router.post("/CreateProduct", ProductController.createProduct);

router.get("/getAllProduct", ProductController.getAllProducts);

router.get("/GetbyProductId/:productId", ProductController.getProductById);
router.put("/updateByProductId/:productId", ProductController.updateProduct);
router.delete("/deleteByProductId/:productId", ProductController.deleteProduct);
export default router;
