import express from 'express';
import Fabric from '../models/Fabric.js';

const router = express.Router();

// Create a fabric option
router.post('/create', async (req, res) => {
    try {
        const f = new Fabric(req.body);
        await f.save();
        res.status(201).json(f);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// List all fabrics
router.get('/all', async (req, res) => {
    try {
        const all = await Fabric.find();
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a fabric by ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Fabric.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Fabric not found' });
        res.json({ message: 'Fabric deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
