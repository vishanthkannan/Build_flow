const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true,
    },
    // "Material (manager list or manual entry)"
    material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: false, // If manual entry, this might be null
    },
    material_name: {
        type: String,
        required: true, // Always have a name
    },
    quantity: {
        type: Number,
        required: true,
    },
    price_per_unit: {
        type: Number,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    bill_number: {
        type: String,
        required: false,
    },
    bill_name: { // shop name
        type: String,
        required: false,
    },
    bill_type: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    rejection_reason: {
        type: String,
        default: '',
    },
    is_price_changed: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
