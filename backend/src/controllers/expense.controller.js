const ExpenseService = require('../services/expense.service');

const createExpense = async (req, res) => {
  try {
    const user = req.user;

    // Only employees can create expenses
    if (user.role !== 'EMPLOYEE' && user.role !== 'Employee') {
      return res.status(403).json({ message: 'Forbidden: Only Employees can create expenses' });
    }

    const { amount, category, description } = req.body;

    // Validate required fields
    if (amount === undefined || !category || !description) {
      return res.status(400).json({ message: 'Missing required fields (amount, category, description)' });
    }

    const result = await ExpenseService.createExpense(req.body, user);

    return res.status(201).json(result);

  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createExpense
};