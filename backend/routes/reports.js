const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect, managerOnly } = require('../middleware/authMiddleware');
const { Parser } = require('json2csv');

router.get('/expenses', protect, managerOnly, async (req, res) => {
    try {
        const expenses = await Expense.find({ status: 'Approved' })
            .populate('supervisor', 'username')
            .populate('site', 'name')
            .sort({ date: -1 });

        const fields = [
            { label: 'Date', value: 'date' },
            { label: 'Site', value: 'site.name' },
            { label: 'Supervisor', value: 'supervisor.username' },
            { label: 'Material', value: 'material_name' },
            { label: 'Quantity', value: 'quantity' },
            { label: 'Price/Unit', value: 'price_per_unit' },
            { label: 'Total', value: 'total_amount' },
            { label: 'Bill No', value: 'bill_number' },
            { label: 'Shop Name', value: 'bill_name' },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(expenses);

        res.header('Content-Type', 'text/csv');
        res.attachment('expenses.csv');
        return res.send(csv);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating report');
    }
});

module.exports = router;
