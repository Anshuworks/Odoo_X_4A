const ExpenseModel = require('../models/expense.model');

class ExpenseService {
  static async createExpense(expenseDetails, user) {
    const { amount, category, description, date } = expenseDetails;

    // The requirements say: Set current_approver = manager_id (from user table)
    const managerId = user.manager_id || user.managerId;
    const userId = user.user_id || user.userId || user.id;

    const expenseData = {
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : undefined,
      submittedById: userId,
      companyId: user.company_id || user.companyId
    };

    const expense = await ExpenseModel.createExpense(expenseData);

    return {
      ...expense,
      status: 'PENDING',
      current_approver: managerId || null
    };
  }

  static async getMyExpenses(user) {
    const userId = user.user_id || user.userId || user.id;
    const companyId = user.company_id || user.companyId;

    const expenses = await ExpenseModel.getExpensesByUserId(userId, companyId);
    return expenses || [];
  }

  static async getPendingExpenses(user) {
    const approverId = user.user_id || user.userId || user.id;
    const companyId = user.company_id || user.companyId;

    const expenses = await ExpenseModel.getPendingExpensesForApprover(approverId, companyId);
    return expenses || [];
  }

  static async approveExpense(expenseId, user) {
    const userId = user.user_id || user.userId || user.id;
    const companyId = user.company_id || user.companyId;

    const expense = await ExpenseModel.getById(expenseId, companyId);

    if (!expense) throw new Error("Expense not found");

    // Skip current_approver check if they are the admin mapping
    if (user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'MANAGER') {
      if (user.role?.toUpperCase() === 'MANAGER') {
        const admin = await ExpenseModel.getAdmin(companyId);
        return await ExpenseModel.updateExpense(expenseId, {
          status: 'PENDING'
          // Note: Ignoring current_approver as it's not in Prisma schema. 
          // Recommend updating ApprovalSteps here.
        });
      }

      if (user.role?.toUpperCase() === 'ADMIN') {
        return await ExpenseModel.updateExpense(expenseId, {
          status: 'APPROVED'
        });
      }
    } else {
       throw new Error("Not authorized to approve this expense");
    }
  }

  static async rejectExpense(expenseId, user) {
    const userId = user.user_id || user.userId || user.id;
    const companyId = user.company_id || user.companyId;

    const expense = await ExpenseModel.getById(expenseId, companyId);

    if (!expense) throw new Error("Expense not found");

    if (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'MANAGER') {
      throw new Error("Not authorized");
    }

    return await ExpenseModel.updateExpense(expenseId, {
      status: 'REJECTED'
    });
  }
}

module.exports = ExpenseService;
