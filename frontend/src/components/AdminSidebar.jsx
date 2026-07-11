import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminSidebar({ activeTab, setActiveTab, pendingCount = 0 }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const menuItems = [
    { id: 'overview',      label: 'Tổng quan',             icon: '📊' },
    { id: 'tournaments',   label: 'Giải đấu',              icon: '🏆' },
    { id: 'races',         label: 'Cuộc đua',              icon: '🏇' },
    { id: 'horses',        label: 'Ngựa đua',              icon: '🐴' },
    { id: 'jockeys',       label: 'Nài ngựa',              icon: '🤠' },
    { id: 'registrations', label: 'Duyệt đăng ký',         icon: '📋', badge: pendingCount },
    { id: 'users',         label: 'Người dùng',            icon: '👥' },
    { id: 'results',       label: 'Nhập kết quả',          icon: '🏁' },
    { id: 'leaderboard',   label: 'Bảng xếp hạng',         icon: '🥇' },
    { id: 'finance',       label: 'Tài chính',             icon: '💰' },
    { id: 'settings',      label: 'Cài đặt hệ thống',      icon: '⚙️' },
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
      <nav className="flex-1 px-4 py-6 space-y-1">
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
              <span className="flex-1 text-left">{item.label}</span>

              {/* Badge for pending count */}
              {item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-5 border-t border-white/5 bg-slate-950/40 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-slate-950 text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-emerald-400">Administrator</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>

        <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/5">
          <p className="text-[10px] text-slate-500">Phiên bản</p>
          <p className="text-xs font-bold text-slate-300">v1.0.0 (Beta)</p>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
