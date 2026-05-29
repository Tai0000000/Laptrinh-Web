import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/jockey',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: 'Overview',
  },
  {
    to: '/jockey/schedule',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    label: 'Schedule',
  },
  {
    to: '/jockey/invitations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M11 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
        <path d="M14 2h6v6" />
        <path d="M20 2 9 13" />
      </svg>
    ),
    label: 'Invitations',
  },
  {
    to: '/jockey/performance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    label: 'Performance',
  },
];

export default function JockeyLayout() {
  const [goLivePulse, setGoLivePulse] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#131315] text-[#e4e2e4]">
      {/* ── Sidebar ── */}
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-[#3d4a3b] bg-[#0e0e10]">
        {/* Brand */}
        <div className="px-5 pt-6 pb-8">
          <p className="font-['Montserrat'] text-sm font-extrabold tracking-widest text-[#5bf06c] uppercase">
            Race Control
          </p>
          <p className="mt-0.5 font-['Inter'] text-[11px] text-[#869582] uppercase tracking-widest">
            Elite Division
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 font-["Inter"] text-sm transition-colors',
                  isActive
                    ? 'bg-[#1f1f21] text-[#5bf06c]'
                    : 'text-[#bccbb6] hover:bg-[#1b1b1d] hover:text-[#e4e2e4]',
                ].join(' ')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* GO LIVE */}
        <div className="px-3 pb-4">
          <button
            onClick={() => setGoLivePulse((p) => !p)}
            className={[
              'w-full rounded-sm py-2.5 font-["Montserrat"] text-xs font-extrabold tracking-widest text-black uppercase transition-all',
              goLivePulse
                ? 'bg-[#39d353] shadow-[0_0_12px_0_rgba(57,211,83,0.4)]'
                : 'bg-[#5bf06c] hover:bg-[#39d353] hover:shadow-[0_0_12px_0_rgba(57,211,83,0.4)]',
            ].join(' ')}
          >
            Go Live
          </button>
        </div>

        {/* Bottom links */}
        <div className="border-t border-[#3d4a3b] px-3 py-4 space-y-0.5">
          {[
            { label: 'Settings', icon: '⚙' },
            { label: 'Support', icon: '?' },
          ].map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2 font-['Inter'] text-sm text-[#869582] hover:bg-[#1b1b1d] hover:text-[#e4e2e4] transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#3d4a3b] bg-[#0e0e10] px-6">
          {/* Page title injected via context — tabs shown per page */}
          <div id="jockey-topbar-title" />

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notification bell */}
            <button className="relative text-[#869582] hover:text-[#e4e2e4] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#5bf06c]" />
            </button>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-[#2a2a2c] border border-[#3d4a3b] flex items-center justify-center text-xs font-bold text-[#5bf06c]">
              JK
            </div>
          </div>
        </header>

        {/* Page outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
