const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    number_of_days: {
        type: Number,
        required: true,
    },
    wage_per_day: {
        type: Number,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
