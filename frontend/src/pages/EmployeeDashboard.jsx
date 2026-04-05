import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import { categories } from '../data/mockData';
import { getMyBills, createBill, uploadReceipt, scanReceipt, convertCurrency } from '../api';
import { getFullFileUrl } from '../utils/fileUtils';
import { 
  Plus, Scan, Upload, DollarSign, Clock, CheckCircle, XCircle, 
  Loader2, FileCheck, Coins, Shield, ExternalLink, Inbox, Filter, FileText 
} from 'lucide-react';

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

  const totalUsd = bills.reduce((s, b) => s + Number(b.converted_amount || 0), 0);
  const inProgress = bills.filter(b => b.current_stage !== 'completed').length;
  const approved = bills.filter(b => b.current_stage === 'completed' && b.manager_status === 'approved').length;
  const rejected = bills.filter(b => b.admin_status === 'rejected' || b.manager_status === 'rejected').length;

  const getOverallStatus = (bill) => {
    if (bill.admin_status === 'rejected' || bill.manager_status === 'rejected') return 'rejected';
    if (bill.current_stage === 'completed') return 'approved';
    return bill.current_stage;
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card p-5 flex items-center gap-4 group cursor-default">
      <div className={`stat-card-icon ${color} text-white transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <Sidebar role="employee" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} title={activePage === 'submit' ? 'Submit Expense' : 'My Expenses'} />

        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6 space-y-6">
            {showSuccess && (
              <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right">
                <Plus size={18} className="rotate-45" />
                <span className="text-sm font-semibold">Claim successfully logged</span>
              </div>
            )}

            {activePage === 'submit' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Claim Submission</h3>
                      <p className="text-xs text-slate-400">Draft your reimbursement request for verification</p>
                  </div>
                  <button
                      onClick={handleOCR}
                      disabled={scanning || !form.receipt_url}
                      className={`btn-secondary h-10 px-4 gap-2 bg-indigo-600 text-white border-none hover:bg-slate-800 shadow-md transition-all ${scanning ? 'opacity-50' : ''}`}
                  >
                      {scanning ? (
                      <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="font-bold tracking-widest text-[10px] uppercase">Scanning…</span>
                      </>
                      ) : (
                      <>
                          <Scan size={16} />
                          <span className="font-bold tracking-widest text-[10px] uppercase">Auto-Detect</span>
                      </>
                      )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <div className="card p-6 bg-white space-y-6">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Purpose of Expense</label>
                              <input
                                  type="text"
                                  placeholder="e.g. Client Dinner, Travel to HQ"
                                  value={form.title}
                                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                                  className="input w-full px-4 text-sm"
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Monetary Value</label>
                                  <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all focus-within:bg-white">
                                      <select 
                                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black text-slate-700 focus:outline-none"
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
                                              className="w-full px-2 py-2 text-base font-bold text-slate-800 bg-transparent border-none focus:ring-0 placeholder:text-slate-300"
                                          />
                                          {converting && <div className="absolute right-2 top-1/2 -translate-y-1/2"><Loader2 size={14} className="animate-spin text-indigo-500" /></div>}
                                      </div>
                                  </div>
                                  {form.currency !== 'USD' && form.amount && (
                                  <p className="text-[9px] font-bold text-indigo-500 mt-2 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg w-fit flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                      <Coins size={10} />
                                      Swap: ${form.converted_amount_usd.toFixed(2)} USD
                                  </p>
                                  )}
                              </div>

                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Classification</label>
                                  <select
                                      value={form.category}
                                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                                      className="input w-full px-4 text-sm"
                                  >
                                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Supplementary Notes</label>
                              <textarea
                                  placeholder="Document business context…"
                                  value={form.description}
                                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all font-medium h-24 resize-none placeholder:text-slate-300"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="card p-6 bg-white">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1 text-center">Receipt Evidence</label>
                          <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-500/30 hover:bg-slate-50 transition-all cursor-pointer relative group min-h-[180px]">
                              <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  onChange={handleFileUpload}
                              />
                              <div className="flex flex-col items-center justify-center pointer-events-none text-center">
                                  {form.receipt_name ? (
                                  <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300">
                                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                      <FileCheck size={24} />
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest line-clamp-1 max-w-[120px] mb-0.5">{form.receipt_name}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Attached</p>
                                      </div>
                                  </div>
                                  ) : (
                                  <div className="flex flex-col items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white group-hover:shadow-md transition-all">
                                      <Upload size={24} />
                                      </div>
                                      <div>
                                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-0.5">Upload Receipt</p>
                                          <p className="text-[9px] text-slate-400 font-bold">Image or PDF</p>
                                      </div>
                                  </div>
                                  )}
                              </div>
                          </div>
                          <div className="mt-6 space-y-2">
                              <button 
                                  onClick={handleSubmit} 
                                  disabled={loading || !form.title || !form.amount} 
                                  className="w-full btn-primary h-11 rounded-xl uppercase tracking-widest font-black text-[11px] disabled:opacity-30"
                              >
                                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Claim'}
                              </button>
                              <button onClick={() => setForm({ ...form, title: '', amount: '', description: '', receipt_url: '', receipt_name: '', receipt_file: null })} className="w-full py-2 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                                  Discard Draft
                              </button>
                          </div>
                      </div>

                      <div className="p-5 bg-slate-800 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                          <div className="absolute -right-6 -bottom-6 p-10 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                              <Shield size={60} strokeWidth={1} />
                          </div>
                          <h4 className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Compliance Tip</h4>
                          <p className="text-[10px] font-medium leading-relaxed opacity-90">Auto-scan detects amounts for faster approval. Ensure image is clear.</p>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'expenses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between">
                  <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Reimbursement Ledger</h3>
                      <p className="text-xs text-slate-400">Register of all your submitted reimbursement claims</p>
                  </div>
                  <button onClick={() => setActivePage('submit')} className="btn-primary h-10 px-4 gap-2">
                      <Plus size={16} /> Submit New
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={DollarSign} label="Portfolio Value" value={`$${totalUsd.toLocaleString()}`} color="bg-indigo-600" />
                  <StatCard icon={Clock} label="In Pipeline" value={inProgress} color="bg-amber-500" />
                  <StatCard icon={CheckCircle} label="Settled" value={approved} color="bg-emerald-500" />
                  <StatCard icon={XCircle} label="Rejected" value={rejected} color="bg-rose-500" />
                </div>

                <div className="card overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                          <Filter size={14} className="text-indigo-600" />
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest text-shadow-sm">Filter Registry</span>
                      </div>
                      <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
                          {tabs.map(t => (
                          <button
                              key={t}
                              onClick={() => setActiveTab(t)}
                              className={`whitespace-nowrap px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              {t}
                          </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  
                  {filteredBills.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                            <Inbox size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">No matches</h4>
                        <p className="text-xs text-slate-400">No claims found in this category.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_1.5fr_1fr] px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <div>Description</div>
                        <div>Valuation</div>
                        <div>Submitted</div>
                        <div className="text-center">Lifecycle</div>
                        <div className="text-right pr-4">Evidence</div>
                      </div>

                      {filteredBills.map((bill) => (
                        <div key={bill.id} className="flex flex-col lg:grid lg:grid-cols-[2.5fr_1fr_1fr_1.5fr_1fr] px-6 py-4 hover:bg-slate-50/50 transition-colors items-center gap-4 lg:gap-0 group">
                          <div className="w-full lg:w-auto flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-indigo-200 transition-colors">
                                <FileText size={18} className="text-slate-300 group-hover:text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate">{bill.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{bill.category || 'General'}</p>
                            </div>
                          </div>

                          <div className="w-full lg:w-auto flex flex-col">
                              <span className="font-bold font-mono text-xs text-slate-700 tracking-tight">
                                {currencies.find(c => c.code === bill.currency)?.symbol}{Number(bill.amount).toFixed(2)}
                              </span>
                              {bill.currency !== 'USD' && (
                                <span className="text-[9px] font-bold text-indigo-500">≈ ${Number(bill.converted_amount).toFixed(2)} USD</span>
                              )}
                          </div>

                          <div className="w-full lg:w-auto font-mono text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {new Date(bill.created_at).toLocaleDateString()}
                          </div>

                          <div className="w-full lg:w-auto flex justify-start lg:justify-center">
                              <StatusBadge status={getOverallStatus(bill)} />
                          </div>

                          <div className="w-full lg:w-auto flex justify-start lg:justify-end lg:pr-4">
                            {bill.receipt_url ? (
                              <button 
                                onClick={() => window.open(getFullFileUrl(bill.receipt_url), '_blank')}
                                className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-bold text-[9px] uppercase tracking-widest"
                              >
                                <ExternalLink size={10} />
                                Receipt
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Missing</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
