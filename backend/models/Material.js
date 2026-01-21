const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
        // e.g. 'kg', 'bags', 'liters'
    },
    base_price: {
        type: Number,
        required: true,
    },
    shop_name: {
        type: String,
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
