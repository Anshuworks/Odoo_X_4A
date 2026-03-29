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
}

module.exports = ExpenseController;
