const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetAlerts
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.get('/', protect, getBudgets);
router.get('/alerts/check', protect, checkBudgetAlerts);
router.get('/:id', protect, getBudgetById);
router.post('/', protect, createBudget);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;