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

module.exports = router;
