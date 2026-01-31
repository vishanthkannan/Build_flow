const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// @desc    Get all supervisors
// @route   GET /api/users/supervisors
// @access  Private/Manager
router.get('/supervisors', protect, managerOnly, async (req, res) => {
    try {
        const supervisors = await User.find({ role: 'supervisor' }).select('-password');
        res.json(supervisors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update supervisor (password/phone)
// @route   PUT /api/users/:id
// @access  Private/Manager
router.put('/:id', protect, managerOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.password) {
            user.password = req.body.password;
        }
        if (req.body.phone !== undefined) {
            user.phone = req.body.phone;
        }

        await user.save();
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete supervisor
// @route   DELETE /api/users/:id
// @access  Private/Manager
router.delete('/:id', protect, managerOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
