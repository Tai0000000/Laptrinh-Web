import React from 'react';

function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'tournaments', label: 'Giải đấu', icon: '🏆' },
    { id: 'users', label: 'Người dùng', icon: '👥' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 text-slate-200 border-r border-white/10 flex flex-col min-h-screen transition-all duration-300">
      {/* Brand logo section */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 font-black shadow-lg">
          AD
        </span>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm">ADMIN PORTAL</h1>
          <p className="text-xs text-slate-500">Hệ Thống Đua Ngựa</p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform relative ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner translate-x-1'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r bg-emerald-400" />
              )}
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-6 border-t border-white/5 bg-slate-950/40">
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-500">Phiên bản</p>
          <p className="text-xs font-bold text-slate-300">v1.0.0 (Beta)</p>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
