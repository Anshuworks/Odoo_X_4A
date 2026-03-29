import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { mockExpenses } from '../data/mockData';
import { CheckCircle, XCircle, MessageSquare, Filter, DollarSign, Clock, Users } from 'lucide-react';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('approvals');
  const [filter, setFilter] = useState('Pending');
  const [expenses, setExpenses] = useState(
    mockExpenses.filter(e => ['Alex Morgan', 'Jordan Lee'].includes(e.employee))
  );
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  const handleAction = (id, status) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, status } : e));
    setCommentOpen(null);
  };

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.status === filter);
  const pendingCount = expenses.filter(e => e.status === 'Pending').length;
  const approvedCount = expenses.filter(e => e.status === 'Approved').length;
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);

  const filterBtns = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="manager" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} title={activePage === 'approvals' ? 'Approvals Queue' : 'Team Overview'} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {activePage === 'approvals' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Awaiting Approval', value: pendingCount, icon: Clock, color: 'bg-amber-400', accent: 'text-amber-600' },
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
                    <p className="text-sm text-slate-400 font-medium">No expenses in this category</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_2fr] px-4 py-3 bg-slate-50/50">
                      {['Employee', 'Category', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                        <div key={h} className="th py-0">{h}</div>
                      ))}
                    </div>

                    {filtered.map((expense) => (
                      <div key={expense.id} className="group">
                        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_2fr] px-4 py-3.5 hover:bg-slate-50/70 transition-colors items-center">
                          {/* Employee */}
                          <div className="td py-0 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {expense.employee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{expense.employee}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[140px]">{expense.description}</p>
                            </div>
                          </div>
                          {/* Category */}
                          <div className="td py-0">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-600">{expense.category}</span>
                          </div>
                          {/* Amount */}
                          <div className="td py-0 font-semibold font-mono">${expense.amount.toFixed(2)}</div>
                          {/* Date */}
                          <div className="td py-0 font-mono text-xs text-slate-500">{expense.date}</div>
                          {/* Status */}
                          <div className="td py-0"><StatusBadge status={expense.status} /></div>
                          {/* Actions */}
                          <div className="td py-0 flex items-center gap-1.5">
                            {expense.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleAction(expense.id, 'Approved')}
                                  className="btn-success py-1.5 px-3 text-xs"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button
                                  onClick={() => handleAction(expense.id, 'Rejected')}
                                  className="btn-danger py-1.5 px-3 text-xs"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                                <button
                                  onClick={() => setCommentOpen(commentOpen === expense.id ? null : expense.id)}
                                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                  title="Add comment"
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAction(expense.id, 'Pending')}
                                className="btn-ghost py-1.5 px-3 text-xs text-slate-400"
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comment Box */}
                        {commentOpen === expense.id && (
                          <div className="px-4 pb-4 bg-slate-50/50">
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                placeholder="Add a comment (optional)…"
                                value={comments[expense.id] || ''}
                                onChange={(e) => setComments({ ...comments, [expense.id]: e.target.value })}
                                className="input text-xs py-2 flex-1"
                              />
                              <button onClick={() => handleAction(expense.id, 'Approved')} className="btn-success text-xs py-2 px-3">Approve with comment</button>
                              <button onClick={() => handleAction(expense.id, 'Rejected')} className="btn-danger text-xs py-2 px-3">Reject with comment</button>
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

          {activePage === 'team' && (
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Team Overview</h3>
                <p className="text-xs text-slate-400 mt-0.5">Direct reports</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {['Alex Morgan', 'Jordan Lee'].map((name) => {
                  const empExpenses = expenses.filter(e => e.employee === name);
                  const total = empExpenses.reduce((s, e) => s + e.amount, 0);
                  const pending = empExpenses.filter(e => e.status === 'Pending').length;
                  return (
                    <div key={name} className="p-5 rounded-2xl border border-slate-100 hover:shadow-card-hover transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{name}</p>
                          <p className="text-xs text-slate-400">Employee</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-slate-50 rounded-xl">
                          <p className="text-lg font-bold text-slate-800 font-display">{empExpenses.length}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded-xl">
                          <p className="text-lg font-bold text-amber-600 font-display">{pending}</p>
                          <p className="text-[10px] text-amber-400 uppercase tracking-wider">Pending</p>
                        </div>
                        <div className="text-center p-2 bg-brand-50 rounded-xl">
                          <p className="text-lg font-bold text-brand-600 font-display">${total.toFixed(0)}</p>
                          <p className="text-[10px] text-brand-400 uppercase tracking-wider">Claimed</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
