import express from "express";
import Eshra from "../models/Eshra.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const e = new Eshra(req.body);
    await e.save();
    res.status(201).json(e);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const all = await Eshra.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Eshra.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Eshra not found" });
    res.json({ message: "Eshra deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
