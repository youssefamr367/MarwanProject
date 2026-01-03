import express from "express";
import Marble from "../models/Marble.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const m = new Marble(req.body);
    await m.save();
    res.status(201).json(m);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const all = await Marble.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Marble.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Marble not found" });
    res.json({ message: "Marble deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
