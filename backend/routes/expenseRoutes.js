const express = require('express');
const router = express.Router();
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (need JWT token)

// GET all expenses with filters & sorting
router.get('/', protect, getAllExpenses);

// GET stats/summary
router.get('/stats', protect, getExpenseStats);

// GET single expense
router.get('/:id', protect, getExpenseById);

// CREATE new expense manually
router.post('/', protect, createExpense);

// UPDATE expense
router.put('/:id', protect, updateExpense);

// DELETE expense
router.delete('/:id', protect, deleteExpense);

module.exports = router;