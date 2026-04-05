const prisma = require('../config/prisma');

class ExpenseModel {

    static async createExpense(data) {
        return await prisma.expense.create({
            data: {
                ...data, // includes amount, category, description, date, submittedById, companyId
                currency: 'USD', // DB requires it
                status: 'PENDING'
            }
        });
    }

    static async getExpensesByUserId(userId, companyId) {
        return await prisma.expense.findMany({
            where: {
                submittedById: userId,
                companyId: companyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    static async getPendingExpensesForApprover(approverId, companyId) {
        return await prisma.expense.findMany({
            where: {
                companyId: companyId,
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

    static async getById(id, companyId) {
        return await prisma.expense.findFirst({
            where: { 
                id: id,
                companyId: companyId 
            }
        });
    }

    static async updateExpense(id, data) {
        return await prisma.expense.update({
            where: { id: id },
            data
        });
    }

    static async getAdmin(companyId) {
        return await prisma.user.findFirst({
            where: { 
                role: 'ADMIN',
                companyId: companyId
            }
        });
    }

}

module.exports = ExpenseModel;