const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/expenses
router.post('/', authenticate, ExpenseController.createExpense);

router.get('/pending', authenticate, ExpenseController.getPendingExpenses);

router.get('/my', authenticate, ExpenseController.getMyExpenses);

// GET /my, GET /team placeholders remain if needed
module.exports = router;
