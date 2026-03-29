const express = require('express');
const router = express.Router();
// 1. Import the whole class, don't use {}
const ExpenseController = require('../controllers/expense.controller');

// 2. Add a console log here to debug if it still fails
console.log("ExpenseController loaded:", !!ExpenseController);
console.log("getPendingExpenses method:", !!ExpenseController.getPendingExpenses);

// 3. Define routes using the class name
router.post('/create', ExpenseController.createExpense);

// Line 12 is usually here - it MUST use ExpenseController.getPendingExpenses
router.get('/my', ExpenseController.getMyExpenses);
router.get('/pending', ExpenseController.getPendingExpenses);

router.put('/approve/:id', ExpenseController.approveExpense);
router.put('/reject/:id', ExpenseController.rejectExpense);

module.exports = router;