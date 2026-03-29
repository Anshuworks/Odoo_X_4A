import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { categories } from '../data/mockData';
import { getMyBills, createBill, uploadReceipt, scanReceipt, convertCurrency } from '../api';
import { Plus, Scan, Upload, DollarSign, Clock, CheckCircle, XCircle, Loader2, FileCheck, Coins } from 'lucide-react';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '₹' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'JPY', symbol: '¥' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
];

const EmployeeDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('submit');
  const [activeTab, setActiveTab] = useState('All');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    converted_amount_usd: 0,
    category: 'Other',
    description: '',
    receipt_url: '',
    receipt_file: null,
    receipt_name: ''
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await getMyBills();
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bills', err);
    }
  };

  // Handle Currency Conversion
  useEffect(() => {
    if (form.amount && form.currency) {
      const timer = setTimeout(() => {
        handleConversion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [form.amount, form.currency]);

  const handleConversion = async () => {
    if (!form.amount || isNaN(form.amount)) return;
    if (form.currency === 'USD') {
      setForm(prev => ({ ...prev, converted_amount_usd: parseFloat(form.amount) }));
      return;
    }

    setConverting(true);
    try {
      const res = await convertCurrency(form.currency, form.amount, 'USD');
      if (res.data.success) {
        setForm(prev => ({ ...prev, converted_amount_usd: res.data.convertedAmount }));
      }
    } catch (err) {
      console.error('Conversion failed', err);
    } finally {
      setConverting(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await uploadReceipt(formData);
      if (res.data.success) {
        setForm(prev => ({ 
          ...prev, 
          receipt_url: res.data.data.filePath, 
          receipt_name: res.data.data.filename,
          receipt_file: file
        }));
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle OCR Scan
  const handleOCR = async () => {
    if (!form.receipt_url) {
      alert('Please upload a receipt first to scan.');
      return;
    }

    setScanning(true);
    try {
      const res = await scanReceipt(form.receipt_url);
      if (res.data.success) {
        const { title, amount } = res.data.data;
        setForm(prev => ({ 
          ...prev, 
          title: title || prev.title, 
          amount: amount || prev.amount 
        }));
      }
    } catch (err) {
      alert('Scan failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.amount) return;
    setLoading(true);
    try {
      await createBill({
        title: form.title,
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        receipt_url: form.receipt_url
      });
      
      setForm({
        title: '',
        amount: '',
        currency: 'USD',
        converted_amount_usd: 0,
        category: 'Other',
        description: '',
        receipt_url: '',
        receipt_file: null,
        receipt_name: ''
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchBills();
      setActivePage('expenses');
    } catch (err) {
      console.error('Submit bill failed', err);
      alert(err.response?.data?.message || 'Failed to submit bill');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['All', 'Submitted', 'Admin Review', 'Manager Review', 'Completed'];
  
  const getTabFilter = (tab, bill) => {
    if (tab === 'All') return true;
    if (tab === 'Submitted') return bill.current_stage === 'submitted';
    if (tab === 'Admin Review') return bill.current_stage === 'admin_review';
    if (tab === 'Manager Review') return bill.current_stage === 'manager_review';
    if (tab === 'Completed') return bill.current_stage === 'completed';
    return true;
  }

  const filteredBills = bills.filter(b => getTabFilter(activeTab, b));

  // Stats calculation (converted to USD)
  const totalUsd = bills.reduce((s, b) => s + Number(b.converted_amount || 0), 0);
  const inProgress = bills.filter(b => b.current_stage !== 'completed').length;
  const approved = bills.filter(b => b.current_stage === 'completed' && b.manager_status === 'approved').length;
  const rejected = bills.filter(b => b.admin_status === 'rejected' || b.manager_status === 'rejected').length;

  const getOverallStatus = (bill) => {
    if (bill.admin_status === 'rejected' || bill.manager_status === 'rejected') return 'rejected';
    if (bill.current_stage === 'completed') return 'approved';
    return bill.current_stage;
  }

  const billColumns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-slate-800">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-600">{val || 'Other'}</span> },
    { key: 'created_at', label: 'Date', render: (val) => <span className="font-mono text-xs text-slate-500">{new Date(val).toLocaleDateString()}</span> },
    { key: 'amount', label: 'Amount', render: (_, row) => (
      <div className="flex flex-col">
        <span className="font-semibold font-mono">{currencies.find(c => c.code === row.currency)?.symbol}{Number(row.amount).toFixed(2)}</span>
        {row.currency !== 'USD' && <span className="text-[10px] text-slate-400">≈ ${Number(row.converted_amount).toFixed(2)} USD</span>}
      </div>
    )},
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={getOverallStatus(row)} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <Sidebar role="employee" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} title={activePage === 'submit' ? 'Submit Expense' : 'My Expenses'} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Success toast */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right">
              <FileCheck size={18} />
              <span className="text-sm font-semibold">Bill submitted successfully!</span>
            </div>
          )}

          {/* SUBMIT EXPENSE */}
          {activePage === 'submit' && (
            <div className="max-w-3xl mx-auto">
              <div className="card p-8 bg-white border-none shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">New Bill</h3>
                    <p className="text-sm text-slate-400">Fill in the details or auto-scan your receipt</p>
                  </div>
                  {/* OCR Button */}
                  <button
                    onClick={handleOCR}
                    disabled={scanning || !form.receipt_url}
                    className={`btn-secondary gap-2 border-none bg-slate-50 hover:bg-slate-100 ${scanning ? 'opacity-50' : ''}`}
                  >
                    {scanning ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-[#6C47FF]" />
                        <span className="text-[#6C47FF] font-semibold">Scanning…</span>
                      </>
                    ) : (
                      <>
                        <Scan size={16} />
                        Scan Receipt
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="label">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Flight to NYC or Lunch at Capital Grille"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="input"
                    />
                  </div>

                  {/* Amount & Currency */}
                  <div>
                    <label className="label">Amount *</label>
                    <div className="flex gap-2">
                      <select 
                        className="input w-24 bg-slate-50 border-none font-bold"
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      >
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          className="input"
                        />
                        {converting && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 size={14} className="animate-spin text-slate-300" /></div>}
                      </div>
                    </div>
                    {form.currency !== 'USD' && form.amount && (
                      <p className="text-[11px] text-[#6C47FF] font-semibold mt-1.5 flex items-center gap-1">
                        <Coins size={10} />
                        ≈ ${form.converted_amount_usd.toFixed(2)} USD (Live Rate)
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      placeholder="Brief description of the expense"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input min-h-[100px]"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="label">Attachment (Receipt)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#6C47FF]/50 transition-colors cursor-pointer relative group min-h-[160px]">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileUpload}
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        {form.receipt_name ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                              <FileCheck size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{form.receipt_name}</p>
                            <p className="text-xs text-slate-400">Click or drag to replace</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#6C47FF] group-hover:bg-[#6C47FF]/10 transition-colors">
                              <Upload size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">Upload receipt...</p>
                            <p className="text-xs text-slate-400">Accepted types: .jpg, .png, .pdf (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                  <button onClick={() => setForm({ ...form, title: '', amount: '', description: '', receipt_url: '', receipt_name: '', receipt_file: null })} className="btn-secondary">
                    Clear form
                  </button>
                  <button onClick={handleSubmit} disabled={loading || !form.title || !form.amount} className="btn-primary min-w-[160px]">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        <Plus size={18} />
                        Submit Bill
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MY BILLS */}
          {activePage === 'expenses' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Base (USD)', value: `$${totalUsd.toLocaleString()}`, icon: DollarSign, color: 'gradient-bg' },
                  { label: 'In Progress', value: inProgress, icon: Clock, color: 'bg-amber-400 shadow-amber-200' },
                  { label: 'Approved', value: approved, icon: CheckCircle, color: 'bg-emerald-400 shadow-emerald-200' },
                  { label: 'Rejected', value: rejected, icon: XCircle, color: 'bg-red-400 shadow-red-200' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5 flex items-center gap-4 hover:translate-y-[-2px] transition-all border-none shadow-sm">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${color} shadow-lg`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-xl font-bold text-slate-800 font-display">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Container */}
              <div className="card border-none shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">Bill History</h3>
                    <p className="text-xs text-slate-400">Tracking your claim lifecycle</p>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-1 p-1 bg-slate-50 rounded-full">
                    {tabs.map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full transition-all ${activeTab === t ? 'bg-[#6C47FF] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Table columns={billColumns} data={filteredBills} emptyMessage="No bills found in this stage" />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
