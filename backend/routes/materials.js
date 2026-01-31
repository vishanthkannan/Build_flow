const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private (Manager & Supervisor)
router.get('/', protect, async (req, res) => {
    try {
        const materials = await Material.find({});
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a material
// @route   POST /api/materials
// @access  Private/Manager
router.post('/', protect, async (req, res) => {
    const { name, unit, base_price, shop_name } = req.body;

    try {
        const material = new Material({
            name,
            unit,
            base_price,
            shop_name,
        });

        const createdMaterial = await material.save();
        res.status(201).json(createdMaterial);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
