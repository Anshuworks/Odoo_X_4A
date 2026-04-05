import React from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, Receipt,
  CheckSquare, FileText, LogOut, Zap, ChevronRight
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

const Sidebar = ({ role, activePage, onNavigate, onLogout, user }) => {
  const items = navItems[role] || [];
  
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-white border-r border-slate-200/60 sticky top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/10 flex items-center justify-center bg-white border border-slate-100">
            <img src="/logo.png" alt="MoneyMatters" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-slate-800 leading-none block tracking-tight uppercase">MoneyMatters</span>
            <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-1 block">
              {role === 'admin' ? 'Enterprise' : 'Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Main Menu</div>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`w-full group relative ${activePage === key ? 'sidebar-link-active' : 'sidebar-link'}`}
          >
            <Icon size={16} className={`${activePage === key ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
            <span className="flex-1 text-left text-xs">{label}</span>
            {activePage === key && (
              <ChevronRight size={14} className="text-white/70" />
            )}
          </button>
        ))}
      </nav>

      {/* User Profile Summary */}
      <div className="px-4 py-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/60 shadow-sm mb-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium capitalize">{role}</p>
            </div>
        </div>
        
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
