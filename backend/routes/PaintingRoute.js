import express from 'express';
import Painting from '../models/Painting.js';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const p = new Painting(req.body);
        await p.save();
        res.status(201).json(p);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const all = await Painting.find();
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Painting.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Painting not found' });
        res.json({ message: 'Painting deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
