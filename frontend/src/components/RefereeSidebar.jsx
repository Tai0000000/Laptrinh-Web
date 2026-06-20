import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const RefereeSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      label: 'Bảng điều khiển', 
      path: '/referee/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
        </svg>
      )
    },
    { 
      label: 'Cuộc đua', 
      path: '/referee/races',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      )
    },
    { 
      label: 'Báo cáo vi phạm', 
      path: '/referee/violations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      )
    },
    { 
      label: 'Lịch trình trọng tài', 
      path: '/referee/schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    { 
      label: 'Lịch sử biên bản', 
      path: '/referee/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 min-h-screen flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="p-6 relative z-10">
        {/* Brand Header */}
        <div className="mb-10 pb-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25">
            <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Cổng Trọng Tài</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Trọng tài giải đấu</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  active
                    ? 'bg-slate-800/80 text-amber-400 border border-slate-700/50 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white border border-transparent'
                }`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-300'}`}>
                  {item.icon}
                </div>
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Session End Footer */}
      <div className="p-6 border-t border-slate-800/80 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-rose-400 hover:text-white hover:bg-rose-500/90 hover:border-transparent transition-all duration-300 font-bold text-sm tracking-wide active:scale-[0.98] shadow-md shadow-rose-950/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Kết thúc phiên</span>
        </button>
      </div>
    </div>
  );
};

export default RefereeSidebar;
