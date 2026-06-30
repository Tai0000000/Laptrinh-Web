import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminTopbar() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <header className="h-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Search Input bar */}
      <div className="relative w-80">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm thông tin giải đấu, nài ngựa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-2xl text-sm text-slate-200 outline-none transition-all duration-300 focus:border-emerald-400 focus:bg-slate-950/60 placeholder:text-slate-500"
        />
      </div>

      {/* Right controls: Notifications, Avatar */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 transition-all duration-300 border border-white/5 group">
          <span className="text-lg">🔔</span>
          {/* Animated red dot badge */}
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
        </button>

        {/* User Card Avatar */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right">
            <h4 className="text-sm font-semibold text-white">{user?.name || 'Quản trị viên'}</h4>
            <p className="text-xs text-emerald-400 font-medium">Administrator</p>
          </div>
          {/* Avatar circle */}
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
