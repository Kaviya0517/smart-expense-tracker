const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Groceries',
      'Food & Dining',
      'Transport',
      'Medical',
      'Entertainment',
      'Office & Supplies',
      'Travel',
      'Shopping',
      'Utilities',
      'Other'
    ],
    default: 'Other'
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  isManual: {
    type: Boolean,
    default: false       // false = added via receipt scan, true = typed manually
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);