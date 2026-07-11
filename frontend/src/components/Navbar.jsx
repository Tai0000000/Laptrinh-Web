import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ');

/* ── Wallet Dropdown (Spectator only) ─────────────────────── */
function WalletDropdown() {
  const [balance, setBalance] = useState(null);
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState('deposit');
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null);
  const ref = useRef(null);

  const VND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n ?? 0);

  const QUICK = [50000, 100000, 200000, 500000, 1000000];

  const loadBalance = async () => {
    try {
      const r = await api.get('/wallet');
      setBalance(r.data.balance);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadBalance(); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchTab = (t) => { setTab(t); setMsg(null); setAmount(''); };

  const handleSubmit = async () => {
    const num = Number(String(amount).replace(/\D/g, ''));
    if (!num || num < 10000) {
      setMsg({ ok: false, text: 'Tối thiểu 10.000 ₫' });
      return;
    }
    setLoading(true); setMsg(null);
    try {
      const r = await api.post(`/wallet/${tab}`, { amount: num });
      setBalance(r.data.new_balance);
      setAmount('');
      setMsg({ ok: true, text: r.data.message });
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || 'Thao tác thất bại.' });
    } finally { setLoading(false); }
  };

  const isDeposit = tab === 'deposit';

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => { setOpen(o => !o); setMsg(null); }}
        className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
      >
        <span className="text-base">💳</span>
        <span className="hidden sm:block">
          {balance !== null ? VND(balance) : 'Ví cá cược'}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 overflow-hidden">

          {/* Balance header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 px-5 py-5">
            {/* decorative blur */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Số dư ví</p>
            <p className="text-3xl font-black text-white tracking-tight">
              {balance !== null ? VND(balance) : '—'}
            </p>
            <p className="mt-1 text-xs text-indigo-300">Khán giả · Cá cược thể thao</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Tab switcher */}
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              <button
                onClick={() => switchTab('deposit')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  isDeposit
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>⬆️</span> Nạp tiền
              </button>
              <button
                onClick={() => switchTab('withdraw')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  !isDeposit
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>⬇️</span> Rút tiền
              </button>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Chọn nhanh</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all border ${
                      Number(amount) === q
                        ? isDeposit
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isDeposit ? 'Số tiền nạp' : 'Số tiền rút'}
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  placeholder="Nhập số tiền..."
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400 transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₫</span>
              </div>
              {Number(amount) >= 10000 && (
                <p className="mt-1 text-[11px] text-gray-500">
                  = {VND(Number(amount))}
                </p>
              )}
            </div>

            {/* Message */}
            {msg && (
              <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold border ${
                msg.ok
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <span>{msg.ok ? '✓' : '✕'}</span>
                <span>{msg.text}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !amount || Number(amount) < 10000}
              className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                isDeposit
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {loading
                ? 'Đang xử lý...'
                : isDeposit
                  ? '⬆️  Nạp tiền ngay'
                  : '⬇️  Rút tiền ngay'}
            </button>

            <p className="text-center text-[10px] text-gray-400">
              Giao dịch được xử lý tức thì · Hỗ trợ 24/7
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────── */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); setIsMenuOpen(false); };

  const role = user?.role?.value ?? user?.role;
  const isSpectator = role === 'spectator';

  // Ẩn global navbar bên trong các portal có sidebar riêng
  const hideOn = ['/dashboard', '/admin', '/horse-owner', '/referee', '/jockey'];
  if (user && hideOn.some(p => location.pathname.startsWith(p))) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">HR</span>
          <span className="hidden sm:block">
            Horse Racing
            <span className="block text-sm font-normal text-slate-500">Tournament System</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>Trang chủ</NavLink>
          <NavLink to="/tournaments" className={linkClass}>Giải đấu</NavLink>
          <NavLink to="/predictions" className={linkClass}>Dự đoán</NavLink>
          {user && (
            <>
              {role === 'admin'       && <NavLink to="/dashboard"             className={linkClass}>Admin</NavLink>}
              {role === 'horse_owner' && <NavLink to="/horse-owner/dashboard" className={linkClass}>Chủ ngựa</NavLink>}
              {(role === 'referee' || role === 'race_referee') && <NavLink to="/referee/dashboard" className={linkClass}>Trọng tài</NavLink>}
              {role === 'jockey'      && <NavLink to="/jockey"                className={linkClass}>Nài ngựa</NavLink>}
            </>
          )}
        </nav>

        {/* Right: Wallet (spectator) + User + Auth */}
        <div className="flex items-center gap-2.5">
          {/* Wallet widget — spectator only */}
          {user && isSpectator && <WalletDropdown />}

          {user ? (
            <>
              {/* User avatar + name */}
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className={linkClass}>Đăng nhập</NavLink>
              <NavLink to="/register" className="rounded-full px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 transition">
                Đăng ký
              </NavLink>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-slate-900 hover:bg-white/80"
          >
            {isMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <NavLink to="/" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/tournaments" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Giải đấu</NavLink>
            <NavLink to="/predictions" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Dự đoán</NavLink>
            {user ? (
              <>
                {role === 'admin'       && <NavLink to="/dashboard"             className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Admin Portal</NavLink>}
                {role === 'horse_owner' && <NavLink to="/horse-owner/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Chủ ngựa</NavLink>}
                {(role === 'referee' || role === 'race_referee') && <NavLink to="/referee/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Trọng tài</NavLink>}
                {role === 'jockey'      && <NavLink to="/jockey"                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Nài ngựa</NavLink>}
                {isSpectator && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Số dư ví</p>
                    <p className="text-lg font-black text-indigo-600">Xem trên desktop</p>
                  </div>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink to="/login" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Đăng nhập</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
