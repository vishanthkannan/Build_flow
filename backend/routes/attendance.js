const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'manager' ? {} : { supervisor: req.user._id };
        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', protect, async (req, res) => {
    const { number_of_days, wage_per_day, date } = req.body;

    if (req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'Only supervisors can submit attendance' });
    }

    try {
        const total_amount = number_of_days * wage_per_day;
        const attendance = new Attendance({
            supervisor: req.user._id,
            number_of_days,
            wage_per_day,
            total_amount,
            date: date || Date.now()
        });
        const saved = await attendance.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/:id/status', protect, managerOnly, async (req, res) => {
    const { status } = req.body;
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Not found' });

        attendance.status = status;
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
