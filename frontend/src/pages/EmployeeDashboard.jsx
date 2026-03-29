import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { mockExpenses, categories, ocrMockData } from '../data/mockData';
import { Plus, Scan, Upload, DollarSign, Clock, CheckCircle, XCircle, Loader2, FileCheck } from 'lucide-react';

const EmployeeDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('submit');
  const [activeTab, setActiveTab] = useState('All');
  const [expenses, setExpenses] = useState(mockExpenses.filter(e => e.employee === 'Alex Morgan'));
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    amount: '', category: '', description: '', date: '', receipt: null
  });

  const handleOCR = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setForm({ ...form, ...ocrMockData });
    }, 1800);
  };

  const handleSubmit = () => {
    if (!form.amount || !form.category || !form.description || !form.date) return;
    const newExpense = {
      id: Date.now(),
      employee: user.name,
      description: form.description,
      category: form.category,
      date: form.date,
      amount: parseFloat(form.amount),
      status: 'Pending',
      receipt: form.receipt?.name || null,
    };
    setExpenses([newExpense, ...expenses]);
    setForm({ amount: '', category: '', description: '', date: '', receipt: null });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setActivePage('expenses');
  };

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];
  const filteredExpenses = activeTab === 'All' ? expenses : expenses.filter(e => e.status === activeTab);

  const pending = expenses.filter(e => e.status === 'Pending').length;
  const approved = expenses.filter(e => e.status === 'Approved').length;
  const rejected = expenses.filter(e => e.status === 'Rejected').length;
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const expenseColumns = [
    { key: 'description', label: 'Description', render: (val) => <span className="font-medium text-slate-800">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-600">{val}</span> },
    { key: 'date', label: 'Date', render: (val) => <span className="font-mono text-xs text-slate-500">{val}</span> },
    { key: 'amount', label: 'Amount', render: (val) => <span className="font-semibold font-mono">${val.toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="employee" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} title={activePage === 'submit' ? 'Submit Expense' : 'My Expenses'} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Success toast */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg">
              <FileCheck size={18} />
              <span className="text-sm font-semibold">Expense submitted successfully!</span>
            </div>
          )}

          {/* SUBMIT EXPENSE */}
          {activePage === 'submit' && (
            <div className="max-w-2xl">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-slate-800">New Expense</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Fill in the details or scan your receipt</p>
                  </div>
                  {/* OCR Button */}
                  <button
                    onClick={handleOCR}
                    disabled={scanning}
                    className="btn-secondary gap-2"
                  >
                    {scanning ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-brand-500" />
                        <span className="text-brand-500 font-semibold">Scanning…</span>
                      </>
                    ) : (
                      <>
                        <Scan size={15} />
                        Scan Receipt
                      </>
                    )}
                  </button>
                </div>

                {scanning && (
                  <div className="mb-5 p-4 bg-brand-50 border border-brand-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Scan size={16} className="text-brand-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-700">OCR Processing</p>
                        <p className="text-xs text-brand-500">Extracting amount, date, and description from receipt…</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Amount ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Description</label>
                    <input
                      type="text"
                      placeholder="Brief description of the expense"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Receipt</label>
                    <label className="input flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                      <Upload size={15} className="text-slate-400 flex-shrink-0" />
                      <span className={`text-sm truncate ${form.receipt ? 'text-slate-700' : 'text-slate-400'}`}>
                        {form.receipt ? form.receipt.name : 'Upload receipt…'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setForm({ ...form, receipt: e.target.files[0] })}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button onClick={() => setForm({ amount: '', category: '', description: '', date: '', receipt: null })} className="btn-secondary">
                    Clear
                  </button>
                  <button onClick={handleSubmit} className="btn-primary">
                    <Plus size={15} /> Submit Expense
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY EXPENSES */}
          {activePage === 'expenses' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Claimed', value: `$${total.toFixed(2)}`, icon: DollarSign, color: 'gradient-bg' },
                  { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-400' },
                  { label: 'Approved', value: approved, icon: CheckCircle, color: 'bg-emerald-400' },
                  { label: 'Rejected', value: rejected, icon: XCircle, color: 'bg-red-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={17} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-lg font-bold text-slate-800 font-display">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Expense History</h3>
                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                    {tabs.map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Table columns={expenseColumns} data={filteredExpenses} emptyMessage="No expenses in this category" />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
