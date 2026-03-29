import React from 'react';
import { Bell, Search } from 'lucide-react';

const Navbar = ({ user, title }) => {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="font-display text-base font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search…"
            className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold select-none">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 leading-tight capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
