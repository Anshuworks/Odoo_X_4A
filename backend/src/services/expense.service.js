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

  static async getPendingExpenses(user) {
    const approverId = user.user_id || user.userId || user.id;
    const expenses = await ExpenseModel.getPendingExpensesForApprover(approverId);
    return expenses || [];
  }


  static async approveExpense(expenseId, user) {
  const userId = user.user_id || user.userId || user.id;

  const expense = await ExpenseModel.getById(expenseId);

  if (!expense) throw new Error("Expense not found");

  // Check if current user is the approver
  if (expense.current_approver !== userId) {
    throw new Error("Not authorized to approve this expense");
  }

  // If Manager → send to Admin
  if (user.role?.toUpperCase() === 'MANAGER') {
    const admin = await ExpenseModel.getAdmin(); // simple helper

    return await ExpenseModel.updateExpense(expenseId, {
      current_approver: admin.id,
      status: 'PENDING'
    });
  }

  // If Admin → final approval
  if (user.role?.toUpperCase() === 'ADMIN') {
    return await ExpenseModel.updateExpense(expenseId, {
      status: 'APPROVED',
      current_approver: null
    });
  }
}

static async rejectExpense(expenseId, user) {
  const userId = user.user_id || user.userId || user.id;

  const expense = await ExpenseModel.getById(expenseId);

  if (!expense) throw new Error("Expense not found");

  if (expense.current_approver !== userId) {
    throw new Error("Not authorized");
  }

  return await ExpenseModel.updateExpense(expenseId, {
    status: 'REJECTED',
    current_approver: null
  });
}

}

module.exports = ExpenseService;
