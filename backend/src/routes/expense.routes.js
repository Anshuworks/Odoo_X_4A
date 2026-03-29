const express = require('express');
const router = express.Router();

const { createExpense } = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/expenses
router.post('/', authenticate, createExpense);

module.exports = router;
