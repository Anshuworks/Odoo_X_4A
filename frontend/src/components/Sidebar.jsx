import React from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, Receipt,
  CheckSquare, FileText, LogOut, Zap
} from 'lucide-react';

const navItems = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'rules', label: 'Approval Rules', icon: ShieldCheck },
    { key: 'expenses', label: 'All Expenses', icon: Receipt },
  ],
  manager: [
    { key: 'approvals', label: 'Approvals', icon: CheckSquare },
    { key: 'team', label: 'Team Overview', icon: Users },
  ],
  employee: [
    { key: 'submit', label: 'Submit Expense', icon: FileText },
    { key: 'expenses', label: 'My Expenses', icon: Receipt },
  ],
};

const Sidebar = ({ role, activePage, onNavigate, onLogout }) => {
  const items = navItems[role] || [];

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col bg-white border-r border-slate-100 sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-slate-800 leading-none block">MoneyMatters</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {role === 'admin' ? 'Admin Portal' : role === 'manager' ? 'Manager' : 'Employee'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`w-full text-left ${activePage === key ? 'sidebar-link-active' : 'sidebar-link'}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <button
          onClick={onLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
