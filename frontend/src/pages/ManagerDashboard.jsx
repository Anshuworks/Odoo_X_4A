import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { getManagerBills, managerBillAction } from '../api';
import { CheckCircle, XCircle, MessageSquare, Filter, DollarSign, Clock, Users } from 'lucide-react';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('approvals');
  const [filter, setFilter] = useState('All');
  const [bills, setBills] = useState([]);
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  useEffect(() => {
    fetchBills();
  }, [activePage]);

  const fetchBills = async () => {
    try {
      const res = await getManagerBills();
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending bills', err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await managerBillAction(id, { action, comment: comments[id] || '' });
      await fetchBills();
    } catch (err) {
      console.error(`Failed to ${action} bill`, err);
      alert(err.response?.data?.message || `Failed to ${action} bill`);
    } finally {
      setCommentOpen(null);
    }
  };

  const getTabFilter = (tab, bill) => {
      if (tab === 'All') return true;
      if (tab === 'Pending') return bill.current_stage === 'manager_review';
      if (tab === 'Approved') return bill.manager_status === 'approved';
      if (tab === 'Rejected') return bill.manager_status === 'rejected';
      return true;
  }

  const filtered = bills.filter(b => getTabFilter(filter, b));
  const pendingCount = bills.filter(b => b.current_stage === 'manager_review').length;
  const approvedCount = bills.filter(b => b.manager_status === 'approved').length;
  const totalPending = bills.filter(b => b.current_stage === 'manager_review').reduce((s, b) => s + Number(b.amount), 0);

  const filterBtns = ['All', 'Pending', 'Approved', 'Rejected'];

  const getOverallStatus = (bill) => {
      if (bill.manager_status === 'rejected') return 'rejected';
      if (bill.manager_status === 'approved') return 'approved';
      return 'manager_review';
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="manager" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} title={activePage === 'approvals' ? 'Final Approvals Queue' : 'Team Overview'} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {activePage === 'approvals' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Awaiting Final Approval', value: pendingCount, icon: Clock, color: 'bg-amber-400', accent: 'text-amber-600' },
                  { label: 'Approved This Month', value: approvedCount, icon: CheckCircle, color: 'bg-emerald-400', accent: 'text-emerald-600' },
                  { label: 'Pending Amount', value: `$${totalPending.toFixed(2)}`, icon: DollarSign, color: 'gradient-bg', accent: 'text-brand-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{label}</p>
                      <p className="text-xl font-bold text-slate-800 font-display">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter + Table */}
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">Filter by status</span>
                  </div>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                    {filterBtns.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {f}
                        {f === 'Pending' && pendingCount > 0 && (
                          <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <CheckCircle size={20} className="text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No bills in this category</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_2fr] px-4 py-3 bg-slate-50/50">
                      {['Employee', 'Category', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                        <div key={h} className="th py-0">{h}</div>
                      ))}
                    </div>

                    {filtered.map((bill) => (
                      <div key={bill.id} className="group">
                        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_2fr] px-4 py-3.5 hover:bg-slate-50/70 transition-colors items-center">
                          {/* Employee */}
                          <div className="td py-0 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {bill.employee_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{bill.employee_name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[140px]">{bill.title}</p>
                            </div>
                          </div>
                          {/* Category */}
                          <div className="td py-0">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-600">{bill.category || 'Other'}</span>
                          </div>
                          {/* Amount */}
                          <div className="td py-0 font-semibold font-mono">${Number(bill.amount).toFixed(2)}</div>
                          {/* Date */}
                          <div className="td py-0 font-mono text-xs text-slate-500">{new Date(bill.created_at).toLocaleDateString()}</div>
                          {/* Status */}
                          <div className="td py-0"><StatusBadge status={getOverallStatus(bill)} /></div>
                          {/* Actions */}
                          <div className="td py-0 flex items-center gap-1.5">
                            {bill.current_stage === 'manager_review' ? (
                              <>
                                <button
                                  onClick={() => handleAction(bill.id, 'approved')}
                                  className="btn-success py-1.5 px-3 text-xs"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button
                                  onClick={() => handleAction(bill.id, 'rejected')}
                                  className="btn-danger py-1.5 px-3 text-xs"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                                <button
                                  onClick={() => setCommentOpen(commentOpen === bill.id ? null : bill.id)}
                                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                  title="Add comment"
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </>
                            ) : (
                                <span className="text-xs text-slate-400 pl-2">Completed</span>
                            )}
                          </div>
                        </div>

                        {/* Comment Box */}
                        {commentOpen === bill.id && (
                          <div className="px-4 pb-4 bg-slate-50/50">
                            <div className="text-xs text-slate-500 py-2">
                               {bill.admin_comment && <div className="mb-1 text-blue-600 ">🛡️ Admin Comment: {bill.admin_comment}</div>}
                               {bill.description && <div>📝 Description: {bill.description}</div>}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                placeholder="Add manager comment (optional)…"
                                value={comments[bill.id] || ''}
                                onChange={(e) => setComments({ ...comments, [bill.id]: e.target.value })}
                                className="input text-xs py-2 flex-1"
                              />
                              <button onClick={() => handleAction(bill.id, 'approved')} className="btn-success text-xs py-2 px-3">Approve with comment</button>
                              <button onClick={() => handleAction(bill.id, 'rejected')} className="btn-danger text-xs py-2 px-3">Reject with comment</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activePage === 'team' && <div className="p-8 text-center text-slate-400">Team Overview (Placeholder)</div>}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
