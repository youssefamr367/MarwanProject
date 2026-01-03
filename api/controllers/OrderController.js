import Order from "../models/Ordermodel.js";
import Product from "../models/productModel.js";

class OrderController {
  static async createOrder(req, res) {
    try {
      const { orderId, items, statusSla } = req.body;
      const out = [];

      for (const it of items) {
        const prod = await Product.findOne({ productId: it.productId }).select(
          " _id fabrics eshra paintings marble dehnat"
        );
        if (!prod) {
          return res
            .status(404)
            .json({ message: `Product ${it.productId} not found` });
        }
        // ensure each chosen ID is allowed
        for (const field of [
          "fabrics",
          "eshra",
          "paintings",
          "marble",
          "dehnat",
        ]) {
          const incoming = it[field] || [];
          const allowed = prod[field].map((x) => x.toString());
          const bad = incoming.filter((id) => !allowed.includes(id));
          if (bad.length) {
            return res.status(400).json({
              message: `Invalid ${field} IDs for product ${it.productId}: ${bad}`,
            });
          }
        }
        out.push({
          product: prod._id,
          fabrics: it.fabrics,
          eshra: it.eshra,
          paintings: it.paintings,
          marble: it.marble,
          dehnat: it.dehnat,
          supplier: it.supplierId,
        });
      }

      const order = await Order.create({
        orderId,
        items: out,
        statusSla: statusSla || undefined,
        statusHistory: [{ status: "New", date: new Date() }],
      });
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const list = await Order.find()
        .populate("items.product")
        .populate("items.supplier")
        .populate("items.fabrics")
        .populate("items.eshra")
        .populate("items.paintings")
        .populate("items.marble")
        .populate("items.dehnat");
      res.json(list);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const o = await Order.findOne({ orderId: req.params.orderId })
        .populate("items.product")
        .populate("items.supplier")
        .populate("items.fabrics")
        .populate("items.eshra")
        .populate("items.paintings")
        .populate("items.marble")
        .populate("items.dehnat");
      if (!o) return res.status(404).json({ message: "Order not found" });
      res.json(o);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateOrder(req, res) {
    try {
      console.log("🔄 Update order request:", req.params.orderId, req.body);

      // First find the order
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (!order) return res.status(404).json({ message: "Order not found" });

      console.log("📋 Current order status:", order.status);
      console.log("📋 Current status history:", order.statusHistory);

      // Update the order fields (allow updating statusSla as well)
      Object.assign(order, req.body);

      console.log("📋 New order status:", order.status);
      console.log("📋 Status modified:", order.isModified("status"));

      // Save the order to trigger middleware
      const updated = await order.save();

      console.log("✅ Order saved successfully");
      console.log("📋 Updated status history:", updated.statusHistory);

      // Populate the updated order
      const populatedOrder = await Order.findById(updated._id)
        .populate("items.product")
        .populate("items.supplier")
        .populate("items.fabrics")
        .populate("items.eshra")
        .populate("items.paintings")
        .populate("items.marble")
        .populate("items.dehnat");

      res.json(populatedOrder);
    } catch (err) {
      console.error("❌ Error updating order:", err);
      res.status(400).json({ message: err.message });
    }
  }

  static async deleteOrder(req, res) {
    try {
      const del = await Order.findOneAndDelete({ orderId: req.params.orderId });
      if (!del) return res.status(404).json({ message: "Order not found" });
      res.json({ message: "Order deleted." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getOrdersByStatus(req, res) {
    try {
      const { status } = req.params;
      if (!["New", "manufacturing", "Done"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const list = await Order.find({ status })
        .populate("items.product")
        .populate("items.supplier")
        .populate("items.fabrics")
        .populate("items.eshra")
        .populate("items.paintings")
        .populate("items.marble")
        .populate("items.dehnat");
      res.json(list);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getOrderStatusHistory(req, res) {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId }).select(
        "orderId statusHistory"
      );
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order.statusHistory);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Test endpoint to fix existing orders without statusHistory
  static async fixExistingOrders(req, res) {
    try {
      console.log("🔧 Fixing existing orders without statusHistory...");

      const orders = await Order.find({ statusHistory: { $exists: false } });
      console.log(`Found ${orders.length} orders without statusHistory`);

      for (const order of orders) {
        console.log(
          `Fixing order ${order.orderId} with status: ${order.status}`
        );
        order.statusHistory = [{ status: order.status, date: order.createdAt }];
        await order.save();
      }

      res.json({ message: `Fixed ${orders.length} orders` });
    } catch (err) {
      console.error("❌ Error fixing orders:", err);
      res.status(400).json({ message: err.message });
    }
  }
}

export default OrderController;
