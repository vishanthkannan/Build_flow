const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// @desc    Get allocations for a supervisor (or all for manager)
// @route   GET /api/allocations
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let allocations;
        if (req.user.role === 'manager') {
            allocations = await Allocation.find({}).populate('supervisor', 'username');
        } else {
            allocations = await Allocation.find({ supervisor: req.user._id });
        }
        res.json(allocations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Allocate money to supervisor
// @route   POST /api/allocations
// @access  Private/Manager
router.post('/', protect, managerOnly, async (req, res) => {
    const { supervisor_id, amount } = req.body;

    try {
        const allocation = new Allocation({
            supervisor: supervisor_id,
            amount,
        });

        const createdAllocation = await allocation.save();
        res.status(201).json(createdAllocation);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
