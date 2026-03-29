import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { mockUsers, mockExpenses, mockRules, roles, managers, categories } from '../data/mockData';
import {
  Plus, Users, DollarSign, Clock, CheckCircle, Shield,
  Trash2, ChevronDown, ToggleLeft, ToggleRight, Edit
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

const AdminDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [users, setUsers] = useState(mockUsers);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [rules, setRules] = useState(mockRules);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Employee', manager: '' });
  const [newRule, setNewRule] = useState({ name: '', approvers: [], sequential: true, percentageRequired: 100 });

  const pageTitles = { dashboard: 'Dashboard Overview', users: 'User Management', rules: 'Approval Rules', expenses: 'All Expenses' };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { ...newUser, id: Date.now(), avatar: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase() }]);
    setNewUser({ name: '', email: '', role: 'Employee', manager: '' });
    setShowAddUser(false);
  };

  const handleAddRule = () => {
    if (!newRule.name) return;
    setRules([...rules, { ...newRule, id: Date.now() }]);
    setNewRule({ name: '', approvers: [], sequential: true, percentageRequired: 100 });
    setShowAddRule(false);
  };

  const handleOverride = (expenseId, status) => {
    setExpenses(expenses.map(e => e.id === expenseId ? { ...e, status } : e));
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

  const expenseColumns = [
    { key: 'employee', label: 'Employee', render: (val) => <span className="font-medium text-slate-800">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-600">{val}</span> },
    { key: 'description', label: 'Description', render: (val) => <span className="text-slate-500 truncate max-w-[200px] block">{val}</span> },
    { key: 'amount', label: 'Amount', render: (val) => <span className="font-semibold font-mono">${val.toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'id', label: 'Override', render: (val, row) => (
        <div className="flex gap-1.5">
          <button onClick={() => handleOverride(val, 'Approved')} disabled={row.status === 'Approved'} className="btn-success py-1.5 px-3 text-xs disabled:opacity-40">Approve</button>
          <button onClick={() => handleOverride(val, 'Rejected')} disabled={row.status === 'Rejected'} className="btn-danger py-1.5 px-3 text-xs disabled:opacity-40">Reject</button>
        </div>
      )
    },
  ];

  const pendingCount = expenses.filter(e => e.status === 'Pending').length;
  const approvedCount = expenses.filter(e => e.status === 'Approved').length;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" activePage={activePage} onNavigate={setActivePage} onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar user={user} title={pageTitles[activePage]} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={users.length} color="gradient-bg" />
                <StatCard icon={Clock} label="Pending" value={pendingCount} color="bg-amber-400" />
                <StatCard icon={CheckCircle} label="Approved" value={approvedCount} color="bg-emerald-400" />
                <StatCard icon={DollarSign} label="Total Claimed" value={`$${totalAmount.toLocaleString()}`} color="bg-violet-500" />
              </div>

              {/* Recent expenses quick view */}
              <div className="card">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Recent Expenses</h3>
                  <button onClick={() => setActivePage('expenses')} className="text-xs text-brand-500 font-semibold hover:text-brand-600">View all →</button>
                </div>
                <Table
                  columns={expenseColumns.slice(0, 5)}
                  data={expenses.slice(0, 5)}
                  emptyMessage="No expenses yet"
                />
              </div>
            </>
          )}

          {/* USERS */}
          {activePage === 'users' && (
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Team Members</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{users.length} total users</p>
                </div>
                <button onClick={() => setShowAddUser(true)} className="btn-primary">
                  <Plus size={15} /> Add User
                </button>
              </div>
              <Table columns={userColumns} data={users} emptyMessage="No users found" />
            </div>
          )}

          {/* APPROVAL RULES */}
          {activePage === 'rules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Approval Rules</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure how expenses get approved</p>
                </div>
                <button onClick={() => setShowAddRule(true)} className="btn-primary">
                  <Plus size={15} /> Add Rule
                </button>
              </div>
              <div className="grid gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="card p-5 hover:shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-800">{rule.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {rule.sequential ? 'Sequential approval' : 'Any approver'} · {rule.percentageRequired}% required
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${rule.sequential ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          {rule.sequential ? 'Sequential' : 'Parallel'}
                        </span>
                        <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">Approvers:</span>
                      {rule.approvers.map((a, i) => (
                        <div key={a} className="flex items-center gap-1.5">
                          {rule.sequential && i > 0 && <span className="text-slate-300 text-xs">→</span>}
                          <span className="bg-brand-50 text-brand-600 text-xs px-2 py-1 rounded-lg font-medium">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="card p-12 flex flex-col items-center gap-3">
                    <Shield size={28} className="text-slate-200" />
                    <p className="text-sm text-slate-400">No approval rules defined</p>
                    <button onClick={() => setShowAddRule(true)} className="btn-primary text-xs">Create your first rule</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL EXPENSES */}
          {activePage === 'expenses' && (
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">All Expenses</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{expenses.length} total expenses</p>
                </div>
                <div className="flex gap-2">
                  {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
                    <button key={s} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors">{s}</button>
                  ))}
                </div>
              </div>
              <Table columns={expenseColumns} data={expenses} emptyMessage="No expenses found" />
            </div>
          )}
        </main>
      </div>

      {/* Add User Modal */}
      <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Jane Smith" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="jane@company.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {newUser.role === 'Employee' && (
            <div>
              <label className="label">Reports To</label>
              <select className="input" value={newUser.manager} onChange={(e) => setNewUser({ ...newUser, manager: e.target.value })}>
                <option value="">Select manager</option>
                {managers.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAddUser(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddUser} className="btn-primary">Add User</button>
          </div>
        </div>
      </Modal>

      {/* Add Rule Modal */}
      <Modal open={showAddRule} onClose={() => setShowAddRule(false)} title="Create Approval Rule">
        <div className="space-y-4">
          <div>
            <label className="label">Rule Name</label>
            <input className="input" placeholder="e.g. Standard Approval" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Approvers</label>
            <div className="space-y-2 mt-1">
              {managers.map(m => (
                <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-brand-500"
                    checked={newRule.approvers.includes(m)}
                    onChange={(e) => {
                      if (e.target.checked) setNewRule({ ...newRule, approvers: [...newRule.approvers, m] });
                      else setNewRule({ ...newRule, approvers: newRule.approvers.filter(a => a !== m) });
                    }}
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Approval Mode</label>
            <div className="flex gap-2 mt-1">
              {[['Sequential', true], ['Parallel (any)', false]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setNewRule({ ...newRule, sequential: val })}
                  className={`flex-1 py-2 px-3 text-sm rounded-xl border font-medium transition-all ${newRule.sequential === val ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">% Approval Required</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="100"
                value={newRule.percentageRequired}
                onChange={(e) => setNewRule({ ...newRule, percentageRequired: Number(e.target.value) })}
                className="flex-1 accent-brand-500"
              />
              <span className="font-mono text-sm font-bold text-brand-500 w-12 text-right">{newRule.percentageRequired}%</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAddRule(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddRule} className="btn-primary">Create Rule</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
