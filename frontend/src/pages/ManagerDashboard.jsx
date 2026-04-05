import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { getManagerBills, managerBillAction, getUsers } from '../api';
import { getFullFileUrl } from '../utils/fileUtils';
import { 
    CheckCircle, XCircle, MessageSquare, Filter, DollarSign, 
    Clock, Users, Mail, Shield, ChevronRight, Inbox, Search, ExternalLink, CheckSquare, FileText
} from 'lucide-react';

const ManagerDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('approvals');
  const [filter, setFilter] = useState('All');
  const [bills, setBills] = useState([]);
  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  useEffect(() => {
    fetchBills();
    if (activePage === 'team') {
      fetchTeam();
    }
  }, [activePage]);

  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      const res = await getUsers();
      // Only show employees in team overview
      setTeam(res.data.filter(u => u.role.toLowerCase() === 'employee'));
    } catch (err) {
      console.error('Failed to fetch team members', err);
    } finally {
      setLoadingTeam(false);
    }
  };

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

        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6 space-y-6">
            {activePage === 'approvals' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Approvals Done', value: approvedCount, icon: CheckSquare, color: 'bg-indigo-600' },
                    { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
                    { label: 'Team Members', value: team.length || '...', icon: Users, color: 'bg-emerald-500' },
                    { label: 'Pipeline Value', value: `$${totalPending.toLocaleString()}`, icon: DollarSign, color: 'bg-rose-500' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card p-5 flex items-center gap-4 group cursor-default">
                      <div className={`stat-card-icon ${color} text-white transition-transform group-hover:scale-110 duration-300`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-xl font-bold text-slate-800 tracking-tight">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                          <Filter size={14} className="text-indigo-500" />
                          <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Filter Portfolio</span>
                      </div>
                      <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
                          {filterBtns.map((f) => (
                          <button
                              key={f}
                              onClick={() => setFilter(f)}
                              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              {f}
                              {f === 'Pending' && pendingCount > 0 && (
                                <span className="ml-2 bg-indigo-500 text-white px-1.5 py-0.5 rounded-md text-[9px]">{pendingCount}</span>
                              )}
                          </button>
                          ))}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auto-OCR Enabled</span>
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                            <CheckSquare size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">Queue Empty</h4>
                        <p className="text-xs text-slate-400">No claims match your current filter criteria.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_1.5fr_1.2fr] px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <div>Entity Details</div>
                        <div>Valuation</div>
                        <div>Timestamp</div>
                        <div className="text-center">Evidence</div>
                        <div className="text-right pr-4">Review</div>
                      </div>

                      {filtered.map((bill) => (
                        <div key={bill.id} className="group">
                          <div className="flex flex-col lg:grid lg:grid-cols-[2.5fr_1fr_1fr_1.5fr_1.2fr] px-6 py-4 hover:bg-slate-50/50 transition-colors items-center gap-4 lg:gap-0">
                            <div className="w-full lg:w-auto flex items-start gap-4">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                  <FileText size={18} className="text-slate-300 group-hover:text-indigo-400" />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate">{bill.title}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{bill.employee_name}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <StatusBadge status={getOverallStatus(bill)} />
                                  </div>
                              </div>
                            </div>

                            <div className="w-full lg:w-auto font-bold font-mono text-xs text-slate-700 tracking-tight">
                                <span className="lg:hidden text-[10px] uppercase text-slate-400 mr-2">Value:</span>
                                ${Number(bill.amount).toFixed(2)}
                            </div>

                            <div className="w-full lg:w-auto font-mono text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                <span className="lg:hidden text-slate-400 mr-2">Date:</span>
                                {new Date(bill.created_at).toLocaleDateString()}
                            </div>

                            <div className="w-full lg:w-auto flex justify-start lg:justify-center">
                                {bill.receipt_url ? (
                                    <button 
                                        onClick={() => window.open(getFullFileUrl(bill.receipt_url), '_blank')}
                                        className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-bold text-[9px] uppercase tracking-widest border border-indigo-100/50"
                                    >
                                        <ExternalLink size={10} strokeWidth={3} />
                                        Evidence
                                    </button>
                                ) : (
                                    <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No Document</span>
                                )}
                            </div>

                            <div className="w-full lg:w-auto flex items-center justify-end gap-2">
                              {bill.current_stage === 'manager_review' ? (
                                <>
                                  <button onClick={() => handleAction(bill.id, 'approved')} className="bg-emerald-50 text-emerald-600 h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">Pass</button>
                                  <button onClick={() => handleAction(bill.id, 'rejected')} className="bg-rose-50 text-rose-600 h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Fail</button>
                                  <button
                                    onClick={() => setCommentOpen(commentOpen === bill.id ? null : bill.id)}
                                    className={`p-1.5 rounded-lg transition-all ${commentOpen === bill.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200'}`}
                                  >
                                    <MessageSquare size={14} />
                                  </button>
                                </>
                              ) : (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px] uppercase tracking-widest">
                                      <CheckCircle size={10} /> Verified
                                  </div>
                              )}
                            </div>
                          </div>

                          {commentOpen === bill.id && (
                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-1 duration-200">
                              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                  <div className="flex gap-4 items-end">
                                      <div className="flex-1 space-y-2">
                                          <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Manager Directives</label>
                                          <textarea
                                              placeholder="Enter internal reasoning for this decision…"
                                              value={comments[bill.id] || ''}
                                              onChange={(e) => setComments({ ...comments, [bill.id]: e.target.value })}
                                              className="w-full px-3 py-2 rounded-lg border border-indigo-200/50 text-xs bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 h-16 resize-none transition-all placeholder:text-indigo-300"
                                          />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                          <button onClick={() => handleAction(bill.id, 'approved')} className="bg-indigo-600 text-white h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-200">Submit Pass</button>
                                          <button onClick={() => handleAction(bill.id, 'rejected')} className="bg-white text-rose-500 h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest border border-rose-200 hover:bg-rose-50 transition-colors">Submit Fail</button>
                                      </div>
                                  </div>
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
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Executive Team</h3>
                    <p className="text-xs text-slate-400 font-medium">Direct reports and performance oversight</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingTeam && team.length === 0 ? (
                    <div className="col-span-full p-20 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 animate-pulse">
                          <Users size={24} />
                      </div>
                      <p className="text-slate-400 font-medium">Loading roster...</p>
                    </div>
                  ) : team.length === 0 ? (
                    <div className="col-span-full p-20 text-center flex flex-col items-center bg-white rounded-3xl border border-dashed border-slate-200">
                          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                              <Users size={32} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-1">Lone wolf?</h4>
                          <p className="text-sm text-slate-400">No employees are currently assigned to your management group.</p>
                      </div>
                  ) : (
                    team.map((member) => (
                      <div key={member.id} className="card p-6 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-base tracking-tight group-hover:text-indigo-600 transition-all">{member.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-lg border border-indigo-100">
                                    {member.role}
                                  </span>
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 py-4 border-y border-slate-50">
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 group-hover:text-slate-700 transition-colors">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                              <Mail size={12} />
                            </div>
                            <span className="font-medium truncate">{member.email}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Claims</p>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold text-slate-800 tracking-tighter">
                                      {bills.filter(b => b.user_id === member.id).length}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Claims</span>
                              </div>
                           </div>
                           <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Approved</p>
                               <div className="flex items-baseline gap-1 justify-end">
                                  <span className="text-lg font-bold text-emerald-500 tracking-tighter">
                                      {bills.filter(b => b.user_id === member.id && b.manager_status === 'approved').length}
                                  </span>
                               </div>
                           </div>
                        </div>

                        <button className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                            Insight Analytics <ChevronRight size={12} />
                        </button>
                      </div>
                    ))
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

export default ManagerDashboard;
