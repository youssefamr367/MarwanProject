import express from "express";
import Glass from "../models/Glass.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const d = new Glass(req.body);
    await d.save();
    res.status(201).json(d);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const all = await Glass.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Glass.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Glass not found" });
    res.json({ message: "Glass deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
