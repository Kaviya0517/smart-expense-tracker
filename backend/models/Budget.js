const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    required: true
  },
  limit: {
    type: Number,
    required: true       // monthly budget limit in Rs
  },
  spent: {
    type: Number,
    default: 0           // calculated from expenses
  },
  alertThreshold: {
    type: Number,
    default: 80          // alert when 80% of budget is spent
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);