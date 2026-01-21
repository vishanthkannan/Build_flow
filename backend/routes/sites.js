const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private (Manager & Supervisor)
router.get('/', protect, async (req, res) => {
    try {
        const sites = await Site.find({});
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a site
// @route   POST /api/sites
// @access  Private/Manager
router.post('/', protect, managerOnly, async (req, res) => {
    const { name, location } = req.body;

    try {
        const site = new Site({
            name,
            location,
        });

        const createdSite = await site.save();
        res.status(201).json(createdSite);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
