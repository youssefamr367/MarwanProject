import express from "express";
import SupplierController from "../controllers/SupplierController.js";

const router = express.Router();

router.post("/create", SupplierController.createSupplier);
router.get("/all", SupplierController.getAllSuppliers);
router.delete("/:id", SupplierController.deleteSupplier);
router.put("/:id", SupplierController.updateSupplier);

export default router;
