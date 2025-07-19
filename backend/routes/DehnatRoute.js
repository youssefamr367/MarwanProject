import express from 'express';
import Dehnat from '../models/Dehnat.js';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const d = new Dehnat(req.body);
        await d.save();
        res.status(201).json(d);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const all = await Dehnat.find();
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Dehnat.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Dehnat not found' });
        res.json({ message: 'Dehnat deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
