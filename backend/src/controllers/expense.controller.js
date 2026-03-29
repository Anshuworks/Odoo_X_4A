const ExpenseService = require('../services/expense.service');

class ExpenseController {
  static async createExpense(req, res) {
    try {
      const user = req.user;

      // Error handling: If user is not Employee -> return 403
      if (user.role !== 'EMPLOYEE' && user.role !== 'Employee') {
        return res.status(403).json({ message: 'Forbidden: Only Employees can create expenses' });
      }

      const { amount, category, description, date } = req.body;

      // Error handling: If required fields missing -> return 400
      if (amount === undefined || !category || !description) {
        return res.status(400).json({ message: 'Bad Request: Missing required fields (amount, category, description)' });
      }

      const result = await ExpenseService.createExpense(req.body, user);

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getMyExpenses(req, res) {
    try {
      const user = req.user;

      const expenses = await ExpenseService.getMyExpenses(user);

      return res.status(200).json({
        success: true,
        data: expenses
      });

    } catch (error) {
      console.error('Error fetching expenses:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getPendingExpenses(req, res) {
    try {
      const user = req.user;

      if (user.role !== 'MANAGER' && user.role !== 'Manager' && user.role !== 'ADMIN' && user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden: Only Managers and Admins can access this resource' });
      }

      const expenses = await ExpenseService.getPendingExpenses(user);

      return res.status(200).json({
        success: true,
        data: expenses
      });

    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async approveExpense(req, res) {
    try {
      const result = await ExpenseService.approveExpense(
        req.params.id,
        req.user
      );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async rejectExpense(req, res) {
    try {
      const result = await ExpenseService.rejectExpense(
        req.params.id,
        req.user
      );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

}

module.exports = ExpenseController;
