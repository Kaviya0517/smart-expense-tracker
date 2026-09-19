const Expense = require('../models/expense');
const Receipt = require('../models/receipt');

// GET ALL EXPENSES FOR LOGGED IN USER
const getAllExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy } = req.query;

    // Build filter object
    let filter = { user: req.user.id };

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Determine sort order
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sortBy === 'amount-asc') {
      sortObj = { amount: 1 };
    } else if (sortBy === 'amount-desc') {
      sortObj = { amount: -1 };
    } else if (sortBy === 'date-asc') {
      sortObj = { date: 1 };
    } else if (sortBy === 'date-desc') {
      sortObj = { date: -1 };
    }

    // Get expenses
    const expenses = await Expense.find(filter)
      .populate('receipt', 'imagePath')
      .sort(sortObj);

    // Calculate totals
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = {};
    expenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    res.status(200).json({
      count: expenses.length,
      total,
      byCategory,
      expenses
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SINGLE EXPENSE
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('receipt');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure expense belongs to logged in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(expense);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE EXPENSE MANUALLY (without receipt)
const createExpense = async (req, res) => {
  try {
    const { merchant, amount, category, date, description } = req.body;

    // Validate required fields
    if (!merchant || !amount || !category) {
      return res.status(400).json({ message: 'merchant, amount, and category are required' });
    }

    const expense = await Expense.create({
      user: req.user.id,
      merchant,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      description: description || '',
      isManual: true
    });

    res.status(201).json({
      message: 'Expense created',
      expense
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { merchant, amount, category, date, description } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check authorization
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields if provided
    if (merchant) expense.merchant = merchant;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (description) expense.description = description;

    await expense.save();

    res.status(200).json({
      message: 'Expense updated',
      expense
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check authorization
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If expense has a receipt, delete the receipt too
    if (expense.receipt) {
      await Receipt.findByIdAndDelete(expense.receipt);
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Expense deleted'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET EXPENSE STATS (for dashboard)
const getExpenseStats = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    // Total spent
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Average expense
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    // Count by category
    const byCategory = {};
    expenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + 1;
    });

    // Last 7 days total
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = expenses
      .filter(exp => new Date(exp.date) >= sevenDaysAgo)
      .reduce((sum, exp) => sum + exp.amount, 0);

    // This month total
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonth = expenses
      .filter(exp => new Date(exp.date) >= monthStart)
      .reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({
      totalSpent: totalSpent.toFixed(2),
      avgExpense: avgExpense.toFixed(2),
      totalExpenses: expenses.length,
      expensesByCategory: byCategory,
      last7Days: last7Days.toFixed(2),
      thisMonth: thisMonth.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
};