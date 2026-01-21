const express = require('express');
const router = express.Router();
const DailyActivity = require('../models/DailyActivity');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'manager' ? {} : { supervisor: req.user._id };
        const activities = await DailyActivity.find(query).sort({ date: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', protect, async (req, res) => {
    const { description, date } = req.body;
    try {
        const activity = new DailyActivity({
            supervisor: req.user._id,
            description,
            date: date || Date.now()
        });
        const saved = await activity.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const activity = await DailyActivity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Not found' });

        if (activity.supervisor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await activity.deleteOne();
        res.json({ message: 'Removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
