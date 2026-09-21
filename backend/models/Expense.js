const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  adminId: { type: String, required: true }, // Multi-tenant isolation
  title: { type: String, required: true },   // e.g., "Water Can", "Practice Balls"
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  monthCovered: { type: String, required: true } // Ties the expense to a specific month
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);