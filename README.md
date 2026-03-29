# 💸 MoneyMatters – Smart Reimbursement Management System

## 🚀 Overview
MoneyMatters is a full-stack expense reimbursement platform designed to simplify and automate the entire expense lifecycle — from submission to approval.

It replaces manual, error-prone processes with a clean, efficient, and scalable workflow system.

---

## 🎯 Problem Statement
Organizations struggle with:
- Manual expense tracking
- Lack of transparency
- Complex approval workflows
- Currency inconsistencies in global operations

---

## 💡 Solution
MoneyMatters provides:
- Automated expense submission
- Role-based approval workflows
- OCR-based receipt scanning
- Currency conversion for global transactions

---

## 🧩 Core Features

### 🔐 Authentication & User Management
- Auto company creation on signup
- Role-based access:
  - Admin
  - Manager
  - Employee

---

### 👨‍💻 Employee Features
- Submit expense claims
- Upload receipt
- OCR-based auto-fill (amount, date, description)
- View expense status (Pending / Approved / Rejected)

---

### 🧑‍⚖️ Manager Features
- View team expenses
- Approve / Reject requests
- Add comments

---

### 🏢 Admin Features
- Manage users and roles
- Define approval workflows
- View all expenses
- Override approvals

---

### 🔍 OCR & AI Features
- Scan receipt using OCR
- Automatically extract:
  - Amount
  - Date
  - Description
- Smart category detection

---

### 💱 Currency Conversion
- Detect currency from receipt
- Convert to company currency using exchange API

---

## 🔄 Approval Workflow
- Sequential approval system
- Expense flows from employee → manager → final decision
- Extendable for multi-level approval rules

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js (planned / integrated)

### APIs & Tools
- Tesseract.js (OCR)
- Exchange Rate API (currency conversion)

---

## 🧠 Key Highlights
- Built completely from scratch
- Clean and modern SaaS UI
- Real-world business use case
- Scalable architecture for future enhancements

---

## 📸 Demo Flow
1. Employee uploads receipt
2. OCR extracts data automatically
3. Expense submitted
4. Manager reviews and approves/rejects
5. Status updated in real-time

---

## 👨‍💻 Contributors

- **Your Name**
  - OCR implementation
  - Currency conversion feature
  - Employee dashboard development

- **Teammate 1**
  - Backend APIs
  - Approval logic

- **Teammate 2**
  - UI/UX design
  - Dashboard components

- **Teammate 3**
  - Integration & testing

---

## 🚀 Future Enhancements
- Multi-level approval rules
- Percentage-based approvals
- AI-based expense categorization
- Mobile responsiveness

---

## 🏁 Conclusion
MoneyMatters transforms traditional reimbursement systems into a smart, automated, and scalable solution — making every expense truly matter.

## Team Split (7 hrs)
- P1: Backend — Auth, User CRUD, Company, Currency API
- P2: Backend — Expenses, Approval Engine (sequential/conditional)
- P3: Frontend — Auth pages, Employee dashboard
- P4: Frontend — Manager/Admin dashboards, Rule builder
