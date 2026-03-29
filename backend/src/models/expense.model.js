const prisma = require('../config/prisma');

class ExpenseModel {

    static async getExpensesByUserId(userId) {
        return await prisma.expense.findMany({
            where: {
                submittedById: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

}

module.exports = ExpenseModel;