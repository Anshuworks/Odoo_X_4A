# 💸 MoneyMatters — Reimbursement Management System

A modern SaaS-style frontend for expense reimbursement management.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Accounts

On the login page, click any demo account to auto-fill, then hit **Sign in**:

| Email | Role | Password |
|-------|------|----------|
| admin@acme.com | Admin | any |
| manager@acme.com | Manager | any |
| employee@acme.com | Employee | any |

> **Tip:** You can also type any email containing "admin", "manager", or leave it plain for Employee access.

---

## 📁 File Structure

```
src/
├── components/
│   ├── Sidebar.jsx        # Role-aware navigation sidebar
│   ├── Navbar.jsx         # Top bar with user info + search
│   ├── Table.jsx          # Reusable data table with empty state
│   ├── Modal.jsx          # Accessible modal dialog
│   └── StatusBadge.jsx    # Color-coded status pill
├── pages/
│   ├── AuthPage.jsx       # Login + Signup split-screen
│   ├── AdminDashboard.jsx # Users, Rules, All Expenses
│   ├── ManagerDashboard.jsx # Approval queue + team overview
│   └── EmployeeDashboard.jsx # Submit expenses + history
├── data/
│   └── mockData.js        # Mock users, expenses, rules
├── App.js                 # Router / role switcher
└── index.css              # Tailwind + custom component classes
```

---

## ✨ Features

### Auth Page
- Split-screen: branding left, form right
- Login / Signup toggle
- Role-based routing on sign in
- Demo account quick-fill

### Admin Dashboard
- Stats overview (users, pending, approved, total)
- **Users Table** — add/delete users, role badges
- **Approval Rules** — create sequential/parallel rules, multi-select approvers, % threshold
- **All Expenses** — full table with override approve/reject

### Manager Dashboard
- **Approval Queue** — filter Pending/Approved/Rejected
- Approve / Reject with optional comment
- **Team Overview** — per-employee stats cards

### Employee Dashboard
- **Submit Expense** — form with amount, category, description, date, file upload
- **OCR Scan** — simulates receipt scanning, auto-fills fields (1.8s mock delay)
- **My Expenses** — tabbed by status, with stats strip

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | Blue/Purple gradient (`#3d5aff` → `#8b5cf6`) |
| Font Display | Syne (700/800) |
| Font Body | DM Sans |
| Font Mono | JetBrains Mono |
| Border Radius | `rounded-xl` (12px), `rounded-2xl` (16px) |
| Shadow | Subtle 2-layer card shadow |
| Status: Pending | Amber |
| Status: Approved | Emerald |
| Status: Rejected | Red |

---

## 🛠 Tech Stack

- **React 18** — functional components + hooks
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon set
- **No Redux** — simple `useState` per page
- **No backend** — all mock data in `src/data/mockData.js`

---

## 🔌 API Integration Points

Replace mock data calls with real API calls in:
- `mockData.js` → fetch from `/api/expenses`, `/api/users`, etc.
- Action handlers in each Dashboard → `POST /api/expenses`, `PATCH /api/expenses/:id/status`
- Auth form → `POST /api/auth/login`, `POST /api/auth/signup`
