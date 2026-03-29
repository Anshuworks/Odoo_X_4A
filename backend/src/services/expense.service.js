const ExpenseModel = require('../models/expense.model');

class ExpenseService {
  static async createExpense(expenseDetails, user) {
    const { amount, category, description, date } = expenseDetails;

    // The requirements say: Set current_approver = manager_id (from user table)
    const managerId = user.manager_id || user.managerId;

    // Business logic for user id extraction
    const userId = user.user_id || user.userId || user.id;

    const expenseData = {
      amount,
      category,
      description,
      date,
      submittedById: userId
    };

    const expense = await ExpenseModel.createExpense(expenseData, managerId);

    // Response requirements: Return created expense with status and approver
    return {
      ...expense,
      status: 'PENDING',
      current_approver: managerId || null
    };
  }

  static async getMyExpenses(user) {
    const userId = user.user_id || user.userId || user.id;

    const expenses = await ExpenseModel.getExpensesByUserId(userId);

    return expenses || [];
  }

}

module.exports = ExpenseService;
