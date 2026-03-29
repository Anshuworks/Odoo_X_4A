const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/expenses
router.post('/', authenticate, ExpenseController.createExpense);

// GET /my, GET /team placeholders remain if needed
module.exports = router;
