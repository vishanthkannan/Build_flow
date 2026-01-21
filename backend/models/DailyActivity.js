const mongoose = require('mongoose');

const DailyActivitySchema = new mongoose.Schema({
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('DailyActivity', DailyActivitySchema);
