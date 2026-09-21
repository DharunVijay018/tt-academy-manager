const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Get all expenses
router.get('/all', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const expenses = await Expense.find({ adminId }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add a new expense
router.post('/add', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    const newExpense = new Expense({ ...req.body, adminId });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const adminId = req.headers.adminid;
    await Expense.findOneAndDelete({ _id: req.params.id, adminId });
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;