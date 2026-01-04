import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Supplier from "../models/SupplierModel.js";
import Fabric from "../models/Fabric.js";
import Eshra from "../models/Eshra.js";
import Painting from "../models/Painting.js";
import Marble from "../models/Marble.js";
import Glass from "../models/Glass.js";

const validateIds = async (Model, ids, label) => {
  if (!ids) return;
  const count = await Model.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length)
    throw new Error(`One or more ${label} IDs are invalid`);
};

class ProductController {
  static async createProduct(req, res) {
    try {
      const {
        productId,
        name,
        description,
        fabrics,
        eshra,
        paintings,
        marble,
        glass,
        supplier,
        images,
      } = req.body;

      if (await Product.exists({ productId })) {
        return res.status(400).json({ message: "Product ID already exists." });
      }
      if (
        !supplier ||
        !mongoose.isValidObjectId(supplier) ||
        !(await Supplier.exists({ _id: supplier }))
      ) {
        return res.status(400).json({ message: "Invalid supplier ID" });
      }

      // Validate all lookup‐arrays
      await Promise.all([
        validateIds(Fabric, fabrics, "fabric"),
        validateIds(Eshra, eshra, "eshra"),
        validateIds(Painting, paintings, "painting"),
        validateIds(Marble, marble, "marble"),
        validateIds(Glass, glass, "glass"),
      ]);

      const newProduct = await Product.create({
        productId,
        name,
        description,
        fabrics,
        eshra,
        paintings,
        marble,
        glass,
        supplier,
        images,
      });
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const prods = await Product.find()
        .populate("fabrics")
        .populate("eshra")
        .populate("paintings")
        .populate("marble")
        .populate("glass")
        .populate("supplier");
      res.json(prods);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const p = await Product.findOne({ productId: req.params.productId })
        .populate("fabrics")
        .populate("eshra")
        .populate("paintings")
        .populate("marble")
        .populate("glass")
        .populate("supplier");
      if (!p) return res.status(404).json({ message: "Product not found" });
      res.json(p);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const updates = req.body;
      if (updates.supplier) {
        if (
          !mongoose.isValidObjectId(updates.supplier) ||
          !(await Supplier.exists({ _id: updates.supplier }))
        ) {
          return res.status(400).json({ message: "Invalid supplier ID" });
        }
      }
      await Promise.all([
        validateIds(Fabric, updates.fabrics, "fabric"),
        validateIds(Eshra, updates.eshra, "eshra"),
        validateIds(Painting, updates.paintings, "painting"),
        validateIds(Marble, updates.marble, "marble"),
        validateIds(Glass, updates.glass, "glass"),
      ]);

      const updated = await Product.findOneAndUpdate(
        { productId: req.params.productId },
        updates,
        { new: true, runValidators: true }
      )
        .populate("fabrics")
        .populate("eshra")
        .populate("paintings")
        .populate("marble")
        .populate("glass")
        .populate("supplier");

      if (!updated)
        return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const del = await Product.findOneAndDelete({
        productId: req.params.productId,
      });
      if (!del) return res.status(404).json({ message: "Product not found" });
      res.json({ message: "Deleted." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default ProductController;
