import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-slate-900 text-white shadow-glow'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
  ].join(' ');

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const role = user?.role?.value ?? user?.role;

  // Ẩn global navbar bên trong các portal có sidebar riêng
  const hideOn = ['/dashboard', '/admin', '/horse-owner', '/referee', '/jockey'];
  if (user && hideOn.some(p => location.pathname.startsWith(p))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            HR
          </span>
          <span className="hidden sm:block">
            Horse Racing
            <span className="block text-sm font-normal text-slate-500">Tournament System</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
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

        {/* Right: User / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Đăng nhập</NavLink>
              <NavLink to="/register"
                className="rounded-full px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 transition">
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/tournaments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Giải đấu</NavLink>
            <NavLink to="/predictions" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Dự đoán</NavLink>

            {user ? (
              <>
                {role === 'admin'       && <NavLink to="/dashboard"             className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Admin Portal</NavLink>}
                {role === 'horse_owner' && <NavLink to="/horse-owner/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Chủ ngựa</NavLink>}
                {(role === 'referee' || role === 'race_referee') && <NavLink to="/referee/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Trọng tài</NavLink>}
                {role === 'jockey'      && <NavLink to="/jockey"                className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Nài ngựa</NavLink>}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Đăng nhập</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
