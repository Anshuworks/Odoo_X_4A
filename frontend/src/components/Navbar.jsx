import React from 'react';
import { Bell, Search, Command, HelpCircle } from 'lucide-react';

const Navbar = ({ user, title }) => {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        <div className="hidden md:flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">
            Live
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden lg:block group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search tasks, bills..."
            className="pl-10 pr-12 py-2 text-xs bg-slate-100/50 border border-slate-200 rounded-xl w-60 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all h-9"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[9px] font-bold text-slate-400 shadow-sm">
            <Command size={9} />
            <span>K</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pr-4 border-r border-slate-200">
            {/* Help */}
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                <HelpCircle size={18} />
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full ring-2 ring-white" />
            </button>
        </div>

        {/* User Details */}
        <div className="flex items-center gap-3 select-none group cursor-pointer">
            <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{user?.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/5 group-hover:shadow-indigo-500/15 transition-all">
                {initials}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
