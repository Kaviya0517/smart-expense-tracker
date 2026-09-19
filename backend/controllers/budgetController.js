const Budget = require('../models/Budget');
const Expense = require('../models/expense');

// GET ALL BUDGETS FOR USER
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id, isActive: true });

    // Calculate spent amount for each budget this month
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Expense.aggregate([
          {
            $match: {
              user: req.user._id,
              category: budget.category,
              date: { $gte: monthStart }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        return {
          ...budget.toObject(),
          spent: spent[0]?.total || 0,
          remaining: budget.limit - (spent[0]?.total || 0),
          percentageUsed: ((spent[0]?.total || 0) / budget.limit * 100).toFixed(1)
        };
      })
    );

    res.status(200).json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SINGLE BUDGET
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE BUDGET
const createBudget = async (req, res) => {
  try {
    const { category, limit, alertThreshold } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: 'category and limit are required' });
    }

    // Check if budget for this category already exists
    const existing = await Budget.findOne({ 
      user: req.user.id, 
      category,
      isActive: true 
    });

    if (existing) {
      return res.status(400).json({ message: 'Budget for this category already exists' });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      alertThreshold: alertThreshold || 80
    });

    res.status(201).json({
      message: 'Budget created',
      budget
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE BUDGET
const updateBudget = async (req, res) => {
  try {
    const { limit, alertThreshold } = req.body;

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (limit) budget.limit = limit;
    if (alertThreshold) budget.alertThreshold = alertThreshold;

    await budget.save();

    res.status(200).json({
      message: 'Budget updated',
      budget
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE BUDGET
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    budget.isActive = false;
    await budget.save();

    res.status(200).json({ message: 'Budget deleted' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CHECK BUDGET ALERTS
const checkBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id, isActive: true });
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const alerts = [];

    for (let budget of budgets) {
      const spent = await Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            category: budget.category,
            date: { $gte: monthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const spentAmount = spent[0]?.total || 0;
      const percentageUsed = (spentAmount / budget.limit) * 100;

      if (percentageUsed >= budget.alertThreshold) {
        alerts.push({
          category: budget.category,
          limit: budget.limit,
          spent: spentAmount,
          remaining: budget.limit - spentAmount,
          percentageUsed: percentageUsed.toFixed(1),
          status: percentageUsed >= 100 ? 'exceeded' : 'warning'
        });
      }
    }

    res.status(200).json({
      hasAlerts: alerts.length > 0,
      alerts
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetAlerts
};