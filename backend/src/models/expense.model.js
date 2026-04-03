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

    static async getPendingExpensesForApprover(approverId) {
        return await prisma.expense.findMany({
            where: {
                status: 'PENDING',
                approvalSteps: {
                    some: {
                        approverId: approverId,
                        status: 'PENDING'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    static async getById(id) {
        const prisma = require('../config/prisma');

        return await prisma.expense.findUnique({
            where: { id: parseInt(id) }
        });
    }

    static async updateExpense(id, data) {
        const prisma = require('../config/prisma');

        return await prisma.expense.update({
            where: { id: parseInt(id) },
            data
        });
    }

    static async getAdmin() {
        const prisma = require('../config/prisma');

        return await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
    }

}

module.exports = ExpenseModel;