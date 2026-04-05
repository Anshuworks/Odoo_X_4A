require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');
const fs = require('fs');

const authRoutes     = require('./routes/auth.routes');
const userRoutes     = require('./routes/user.routes');
const expenseRoutes  = require('./routes/expense.routes');
const approvalRoutes = require('./routes/approval.routes');
const companyRoutes  = require('./routes/company.routes');
const billRoutes     = require('./routes/bill.routes');
const currencyRoutes = require('./routes/currency.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads/receipts directory');
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals',approvalRoutes);
app.use('/api/company',  companyRoutes);
app.use('/api/bills',    billRoutes);
app.use('/api/currency', currencyRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
