import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { mockUsers, mockRules, roles as mockRoles, managers as mockManagers } from '../data/mockData';
import { getAdminBills, adminBillAction, getUsers, createUser } from '../api';
import { getFullFileUrl } from '../utils/fileUtils';
import {
  Plus, Users, DollarSign, Clock, CheckCircle, Shield,
  Trash2, MessageSquare, ArrowRight, Scan, Copy, ExternalLink,
  ChevronRight, Inbox, Filter, MoreHorizontal, FileText
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div className="card p-6 flex items-center gap-5 group cursor-default">
    <div className={`stat-card-icon ${color} text-white transition-transform group-hover:scale-110 duration-300`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
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
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [bills, setBills] = useState([]);
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  React.useEffect(() => {
    fetchBills();
    if (activePage === 'users') {
      fetchUsers();
    }
  }, [activePage]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

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

        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6 space-y-6">
            {/* DASHBOARD */}
            {activePage === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total Users" value={users.length} color="bg-indigo-500" />
                  <StatCard icon={Clock} label="Pending Review" value={pendingCount} color="bg-amber-500" />
                  <StatCard icon={CheckCircle} label="Admin Approved" value={approvedCount} color="bg-emerald-500" />
                  {user?.inviteCode ? (
                    <div className="card p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Shield size={50} className="text-indigo-600" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invite Code</p>
                      <div className="flex items-center justify-between mt-2">
                          <p className="text-xl font-mono font-bold text-slate-800 tracking-wider transition-colors group-hover:text-indigo-600">{user.inviteCode}</p>
                          <button 
                              onClick={handleCopyInvite}
                              className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm'}`}
                          >
                              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                      </div>
                    </div>
                  ) : (
                    <StatCard icon={DollarSign} label="Total Volume" value={`$${totalAmount.toLocaleString()}`} color="bg-violet-500" />
                  )}
                </div>

                {/* Action needed bills */}
                <div className="card overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <h3 className="font-bold text-slate-800 text-sm tracking-tight">Action Required</h3>
                    </div>
                    <button onClick={() => setActivePage('expenses')} className="group flex items-center gap-1.5 text-[11px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                      Review all <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                  
                  {bills.filter(b => b.current_stage === 'admin_review').length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                          <Inbox size={28} />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 mb-1">Queue Clear</h4>
                      <p className="text-xs text-slate-400">No pending bills require your attention.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                        {bills.filter(b => b.current_stage === 'admin_review').slice(0, 5).map(bill => (
                            <div key={bill.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px]">
                                      {bill.employee_name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-800 leading-none mb-1.5">{bill.title}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{bill.employee_name} • {new Date(bill.created_at).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-5">
                                  <span className="font-bold font-mono text-slate-700 text-xs">${Number(bill.amount).toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                      {bill.receipt_url && (
                                      <button 
                                          onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(getFullFileUrl(bill.receipt_url), '_blank');
                                          }}
                                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                                          title="View Receipt"
                                      >
                                          <Scan size={14} />
                                      </button>
                                      )}
                                      <button onClick={() => setActivePage('expenses')} className="btn-secondary h-8 px-3 text-[10px] font-bold">Review</button>
                                  </div>
                              </div>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* USERS */}
            {activePage === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">User Management</h3>
                    <p className="text-xs text-slate-400">Manage employees and roles in your company</p>
                  </div>
                  <button onClick={() => setShowAddUser(true)} className="btn-primary h-10 gap-2 px-4 text-xs">
                    <Plus size={16} /> Add User
                  </button>
                </div>

                <div className="card">
                  {loadingUsers && users.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading users...</div>
                  ) : (
                    <Table 
                      columns={[
                        {
                          key: 'name', label: 'Name', render: (val, row) => (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-[10px] font-bold">
                                {val.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-bold text-slate-700 text-xs">{val}</span>
                            </div>
                          )
                        },
                        {
                          key: 'role', label: 'Role', render: (val) => (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${val.toLowerCase() === 'admin' ? 'bg-purple-100/50 text-purple-600' : val.toLowerCase() === 'manager' ? 'bg-indigo-100/50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                              {val}
                            </span>
                          )
                        },
                        { key: 'email', label: 'Email', render: (val) => <span className="font-mono text-[11px] text-slate-400">{val}</span> },
                        {
                          key: 'id', label: 'Status', render: () => (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                              <div className="w-1 h-1 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )
                        },
                      ]} 
                      data={users} 
                    />
                  )}
                </div>
              </div>
            )}

            {activePage === 'rules' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Approval Rules</h3>
                    <p className="text-xs text-slate-400">Configure how expenses get approved</p>
                  </div>
                  <button onClick={() => setShowAddRule(true)} className="btn-primary h-10 gap-2 px-4 text-xs focus:ring-4 focus:ring-indigo-500/20">
                    <Plus size={16} /> Add Rule
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
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Review Pipeline</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{pendingCount} claims awaiting sign-off</p>
                  </div>
                </div>

                {bills.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">No records found.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                      {/* Header Row */}
                      <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1.5fr] px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <div>Entity Details</div>
                        <div>Valuation</div>
                        <div>Timestamp</div>
                        <div className="text-center">Lifecycle</div>
                        <div className="text-center">Evidence</div>
                        <div className="text-right pr-4">Oversight</div>
                      </div>

                      {bills.map((bill) => (
                        <div key={bill.id} className="group">
                          <div className="flex flex-col lg:grid lg:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1.5fr] px-6 py-4 hover:bg-slate-50/50 transition-colors items-center gap-4 lg:gap-0">
                            {/* Bill Details */}
                            <div className="w-full lg:w-auto flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-indigo-200 transition-colors">
                                  <FileText size={18} className="text-slate-300 group-hover:text-indigo-400" />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate">{bill.title}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{bill.employee_name}</p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-[10px] text-slate-300 font-medium">{bill.category || 'General'}</p>
                                  </div>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="w-full lg:w-auto font-bold font-mono text-xs text-slate-700 tracking-tight">
                                <span className="lg:hidden text-[10px] uppercase text-slate-400 mr-2">Value:</span>
                                ${Number(bill.amount).toFixed(2)}
                            </div>

                            {/* Date */}
                            <div className="w-full lg:w-auto font-mono text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                <span className="lg:hidden text-slate-400 mr-2">Date:</span>
                                {new Date(bill.created_at).toLocaleDateString()}
                            </div>

                            {/* Status */}
                            <div className="w-full lg:w-auto flex justify-start lg:justify-center">
                                <StatusBadge status={bill.current_stage} />
                            </div>

                            {/* Receipt */}
                            <div className="w-full lg:w-auto flex justify-start lg:justify-center">
                              {bill.receipt_url ? (
                                <button 
                                  onClick={() => window.open(getFullFileUrl(bill.receipt_url), '_blank')}
                                  className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-bold text-[9px] uppercase tracking-widest"
                                >
                                  <ExternalLink size={10} />
                                  Evidence
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-md border border-slate-100/50">Missing</span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="w-full lg:w-auto flex items-center justify-end gap-2">
                              {bill.current_stage === 'admin_review' ? (
                                <>
                                  <button onClick={() => handleAction(bill.id, 'approved')} className="btn-success h-8 px-3 text-[10px] font-black uppercase tracking-widest">OK</button>
                                  <button onClick={() => handleAction(bill.id, 'rejected')} className="btn-danger h-8 px-3 text-[10px] font-black uppercase tracking-widest">NO</button>
                                  <button
                                    onClick={() => setCommentOpen(commentOpen === bill.id ? null : bill.id)}
                                    className={`p-1.5 rounded-lg transition-all ${commentOpen === bill.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                                  >
                                    <MessageSquare size={14} />
                                  </button>
                                </>
                              ) : (
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest pr-2">
                                      <CheckCircle size={12} className="text-emerald-500/50" /> Audited
                                  </div>
                              )}
                            </div>
                          </div>

                          {/* Comment Box */}
                          {commentOpen === bill.id && (
                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-1 duration-200">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner">
                                  <div className="flex gap-4 items-end">
                                      <div className="flex-1 space-y-2">
                                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Review Notes</label>
                                          <textarea
                                              placeholder="Document rationale…"
                                              value={comments[bill.id] || ''}
                                              onChange={(e) => setComments({ ...comments, [bill.id]: e.target.value })}
                                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 h-16 resize-none transition-all placeholder:text-slate-300"
                                          />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                          <button onClick={() => handleAction(bill.id, 'approved')} className="bg-emerald-500 text-white h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-colors">Release</button>
                                          <button onClick={() => handleAction(bill.id, 'rejected')} className="bg-rose-500 text-white h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-rose-600 transition-colors">Block</button>
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
            )}
          </div>
        </main>
      </div>

      {showAddUser && (
        <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User">
          <form className="p-6 space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createUser(newUser);
              setShowAddUser(false);
              setNewUser({ name: '', email: '', role: 'employee', password: 'password123' });
              fetchUsers();
            } catch (err) {
              console.error('Failed to create user', err);
              alert(err.response?.data?.message || 'Failed to create user');
            }
          }}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
              <input 
                type="text" 
                className="input" 
                placeholder="John Doe" 
                required
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <input 
                type="email" 
                className="input" 
                placeholder="john@company.com" 
                required
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
              <select 
                className="input"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Temporary Password</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Initial password"
                required
                value={newUser.password || 'password123'}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create User</button>
            </div>
          </form>
        </Modal>
      )}
      {showAddRule && <Modal open={showAddRule} onClose={() => setShowAddRule(false)} title="Add Rule"><div className="p-4">Placeholder form</div></Modal>}
    </div>
  );
};

export default AdminDashboard;
