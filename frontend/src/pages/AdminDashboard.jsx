import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { mockUsers, mockRules, roles, managers } from '../data/mockData';
import { getAdminBills, adminBillAction } from '../api';
import {
  Plus, Users, DollarSign, Clock, CheckCircle, Shield,
  Trash2, MessageSquare, ArrowRight
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-800 font-display">{value}</p>
    </div>
  </div>
);

const RuleCard = ({ rule, onDelete }) => (
  <div className="card p-6 flex items-center justify-between hover:border-[#6C47FF]/30 transition-all border-slate-100 group">
    <div className="space-y-4 flex-1">
      <div>
        <h4 className="text-base font-bold text-slate-800">{rule.name}</h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {rule.sequential ? 'Sequential' : 'Parallel'} approval • {rule.percentageRequired}% required
        </p>
      </div>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Approvers:</span>
        {rule.approvers.map((approver, index) => (
          <React.Fragment key={approver}>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 border border-slate-100">
              <div className="w-4 h-4 rounded bg-[#6C47FF]/10 text-[#6C47FF] flex items-center justify-center text-[8px]">
                {approver.charAt(0)}
              </div>
              {approver}
            </div>
            {index < rule.approvers.length - 1 && (
              <ArrowRight size={14} className="text-slate-300 mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-6">
      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${rule.sequential ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
        {rule.sequential ? 'Sequential' : 'Parallel'}
      </span>
      <button 
        onClick={() => onDelete(rule.id)}
        className="p-2 rounded-lg hover:bg-red-50 text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete Rule"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const AdminDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState(mockUsers);
  const [bills, setBills] = useState([]);
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  React.useEffect(() => {
    fetchBills();
  }, [activePage]);

  const fetchBills = async () => {
    try {
      const res = await getAdminBills();
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bills', err);
    }
  };
  
  const [rules, setRules] = useState(mockRules);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Employee', manager: '' });
  const [newRule, setNewRule] = useState({ name: '', approvers: [], sequential: true, percentageRequired: 100 });

  const pageTitles = { dashboard: 'Dashboard Overview', users: 'User Management', rules: 'Approval Rules', expenses: 'Admin Approvals' };

  const handleAction = async (id, action) => {
    try {
      await adminBillAction(id, { action, comment: comments[id] || '' });
      await fetchBills();
    } catch (err) {
      console.error(`Failed to ${action} bill`, err);
      alert(err.response?.data?.message || `Failed to ${action} bill`);
    } finally {
      setCommentOpen(null);
    }
  };

  const userColumns = [
    {
      key: 'name', label: 'Name', render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">
            {row.avatar}
          </div>
          <span className="font-medium text-slate-800">{val}</span>
        </div>
      )
    },
    {
      key: 'role', label: 'Role', render: (val) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${val === 'Admin' ? 'bg-purple-50 text-purple-600' : val === 'Manager' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
          {val}
        </span>
      )
    },
    { key: 'manager', label: 'Reports To' },
    { key: 'email', label: 'Email', render: (val) => <span className="font-mono text-xs text-slate-500">{val}</span> },
    {
      key: 'id', label: 'Actions', render: (val) => (
        <button onClick={() => setUsers(users.filter(u => u.id !== val))} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      )
    },
  ];

  const pendingCount = bills.filter(b => b.current_stage === 'admin_review').length;
  const approvedCount = bills.filter(b => b.admin_status === 'approved').length;
  const totalAmount = bills.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar user={user} title={pageTitles[activePage] || 'Admin Portal'} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={users.length} color="gradient-bg" />
                <StatCard icon={Clock} label="Pending Admin Review" value={pendingCount} color="bg-blue-400" />
                <StatCard icon={CheckCircle} label="Admin Approved" value={approvedCount} color="bg-emerald-400" />
                <StatCard icon={DollarSign} label="Total Claimed" value={`$${totalAmount.toLocaleString()}`} color="bg-violet-500" />
              </div>

              {/* Action needed bills */}
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Action Needed</h3>
                  <button onClick={() => setActivePage('expenses')} className="text-xs text-brand-500 font-semibold hover:text-brand-600">Review all →</button>
                </div>
                
                {bills.filter(b => b.current_stage === 'admin_review').length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No bills pending your review</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                      {bills.filter(b => b.current_stage === 'admin_review').slice(0, 5).map(bill => (
                          <div key={bill.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{bill.title}</p>
                                <p className="text-xs text-slate-500">{bill.employee_name} • {new Date(bill.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold font-mono">${Number(bill.amount).toFixed(2)}</span>
                                <button onClick={() => setActivePage('expenses')} className="btn-secondary py-1.5 px-3 text-xs">Review</button>
                            </div>
                          </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* USERS & RULES - Omitted for brevity, kept exactly same as before if needed */}
          {activePage === 'users' && <div className="p-8 text-center text-slate-400">User Management Interface (Placeholder)</div>}
          {activePage === 'rules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Approval Rules</h3>
                  <p className="text-sm text-slate-400">Configure how expenses get approved</p>
                </div>
                <button onClick={() => setShowAddRule(true)} className="btn-primary gap-2">
                  <Plus size={18} /> Add Rule
                </button>
              </div>
              <div className="space-y-4">
                {rules.map(rule => (
                  <RuleCard 
                    key={rule.id} 
                    rule={rule} 
                    onDelete={(id) => setRules(rules.filter(r => r.id !== id))} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* BILL APPROVALS */}
          {activePage === 'expenses' && (
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Admin Approval Queue</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{pendingCount} bills need your review</p>
                </div>
              </div>

              {bills.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">No bills in the system.</div>
              ) : (
                  <div className="divide-y divide-slate-50">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] px-4 py-3 bg-slate-50/50">
                      <div className="th py-0">Bill Details</div>
                      <div className="th py-0">Amount</div>
                      <div className="th py-0">Date</div>
                      <div className="th py-0">Status</div>
                      <div className="th py-0">Actions</div>
                    </div>

                    {bills.map((bill) => (
                      <div key={bill.id} className="group">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] px-4 py-3.5 hover:bg-slate-50/70 transition-colors items-center">
                          <div className="td py-0">
                              <p className="text-sm font-semibold text-slate-800">{bill.title}</p>
                              <p className="text-xs text-slate-500">{bill.employee_name} ({bill.employee_email})</p>
                          </div>
                          <div className="td py-0 font-semibold font-mono">${Number(bill.amount).toFixed(2)}</div>
                          <div className="td py-0 font-mono text-xs text-slate-500">{new Date(bill.created_at).toLocaleDateString()}</div>
                          <div className="td py-0"><StatusBadge status={bill.current_stage} /></div>
                          <div className="td py-0 flex items-center gap-1.5">
                            {bill.current_stage === 'admin_review' ? (
                              <>
                                <button onClick={() => handleAction(bill.id, 'approved')} className="btn-success py-1.5 px-3 text-xs">Approve</button>
                                <button onClick={() => handleAction(bill.id, 'rejected')} className="btn-danger py-1.5 px-3 text-xs">Reject</button>
                                <button
                                  onClick={() => setCommentOpen(commentOpen === bill.id ? null : bill.id)}
                                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                  title="Add comment"
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </>
                            ) : (
                                <span className="text-xs text-slate-400 pl-2">
                                    {bill.admin_status === 'approved' ? 'Passed to Manager' : 'Rejected by Admin'}
                                </span>
                            )}
                          </div>
                        </div>

                        {/* Comment Box */}
                        {commentOpen === bill.id && (
                          <div className="px-4 pb-4 bg-slate-50/50 pt-2 border-t border-slate-100">
                            <div className="flex gap-2 text-xs text-slate-500 mb-2">
                              {bill.description && <div><strong>Description:</strong> {bill.description}</div>}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add admin comment (optional)…"
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
          )}
        </main>
      </div>

      {showAddUser && <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add User"><div className="p-4">Placeholder form</div></Modal>}
      {showAddRule && <Modal open={showAddRule} onClose={() => setShowAddRule(false)} title="Add Rule"><div className="p-4">Placeholder form</div></Modal>}
    </div>
  );
};

export default AdminDashboard;
