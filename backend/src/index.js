require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth.routes');
const userRoutes     = require('./routes/user.routes');
const expenseRoutes  = require('./routes/expense.routes');
const approvalRoutes = require('./routes/approval.routes');
const companyRoutes  = require('./routes/company.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals',approvalRoutes);
app.use('/api/company',  companyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

